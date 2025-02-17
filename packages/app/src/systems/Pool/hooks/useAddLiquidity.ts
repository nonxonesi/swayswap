/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { useUserPositions } from './useUserPositions';

import type { UseCoinInput } from '~/systems/Core';
import { getDeadline, useContract, toBigInt } from '~/systems/Core';
import { txFeedback } from '~/systems/Core/utils/feedback';
import { getOverrides } from '~/systems/Core/utils/gas';
import type { Coin } from '~/types';

export interface UseAddLiquidityProps {
  fromInput: UseCoinInput;
  toInput: UseCoinInput;
  coinFrom: Coin;
  coinTo: Coin;
  onSettle?: () => void;
}

export function useAddLiquidity({
  fromInput,
  toInput,
  coinFrom,
  coinTo,
  onSettle,
}: UseAddLiquidityProps) {
  const contract = useContract()!;
  const [stage, setStage] = useState(0);
  const navigate = useNavigate();
  const { poolRatio } = useUserPositions();

  // Add liquidity is a multi step process
  // Trying to calculate gas fee on add_liquidity
  // is a very inaccurate without the two deposits
  // to have this in a better way we should first have
  // multi-call on fuels-ts for now we are using
  // the local tx measures with a + 50% margin to avoid issues
  // TODO: https://github.com/FuelLabs/swayswap-demo/issues/42
  const networkFee = toBigInt(10);
  const successMsg = poolRatio ? 'Added liquidity to the pool.' : 'New pool created.';

  useEffect(() => {
    fromInput.setGasFee(networkFee);
  }, []);

  const mutation = useMutation(
    async () => {
      const fromAmount = fromInput.amount;
      const toAmount = toInput.amount;
      if (!fromAmount || !toAmount) return;

      // TODO: Combine all transactions on single tx leverage by scripts
      // https://github.com/FuelLabs/swayswap-demo/issues/42

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Deposit coins from
      await contract.submit.deposit(
        getOverrides({
          forward: [fromAmount, coinFrom.assetId],
          gasLimit: toBigInt(30000),
        })
      );
      setStage(1);
      // Deposit coins to
      await contract.submit.deposit(
        getOverrides({
          forward: [toAmount, coinTo.assetId],
          gasLimit: toBigInt(30000),
        })
      );
      setStage(2);
      // Create liquidity pool
      const deadline = await getDeadline(contract);
      return contract.submitResult.add_liquidity(
        1,
        deadline,
        getOverrides({
          variableOutputs: 2,
          gasLimit: toBigInt(1500000),
        })
      );
    },
    {
      onSuccess: txFeedback(successMsg, handleSuccess),
      onError: handleError,
      onSettled: handleSettled,
    }
  );

  function handleSuccess() {
    fromInput.setAmount(null);
    toInput.setAmount(null);
    // Clean state before navigate to next
    // screen
    setTimeout(() => {
      navigate('../');
    });
  }

  function handleError(e: any) {
    const errors = e?.response?.errors;

    if (errors?.length) {
      if (errors[0].message === 'enough coins could not be found') {
        toast.error(
          `Not enough balance in your wallet to ${
            poolRatio ? 'add liquidity to' : 'create'
          } this pool.`
        );
      }
    } else {
      toast.error(`Error when trying to ${poolRatio ? 'add liquidity to' : 'create'} this pool.`);
    }
  }

  async function handleSettled() {
    onSettle?.();
    setStage(0);
  }

  const errorsCreatePull = useMemo(() => {
    const errors = [];

    if (!fromInput.amount) {
      errors.push(`Enter ${coinFrom.name} amount`);
    }
    if (!toInput.amount) {
      errors.push(`Enter ${coinTo.name} amount`);
    }
    if (!fromInput.hasEnoughBalance) {
      errors.push(`Insufficient ${coinFrom.name} balance`);
    }
    if (!toInput.hasEnoughBalance) {
      errors.push(`Insufficient ${coinTo.name} balance`);
    }

    return errors;
  }, [
    fromInput.amount,
    toInput.amount,
    fromInput.hasEnoughBalance,
    toInput.hasEnoughBalance,
    poolRatio,
  ]);

  return {
    mutation,
    errorsCreatePull,
    networkFee,
    stage,
  };
}
