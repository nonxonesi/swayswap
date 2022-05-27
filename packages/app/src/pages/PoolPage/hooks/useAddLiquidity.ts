import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';
import type { UseQueryResult } from 'react-query';

import type { UseCoinInput } from '~/components/CoinInput';
import { DEADLINE } from '~/config';
import { useContract } from '~/context/AppContext';
import { useFeedback } from '~/hooks/useFeedback';
import type { Coin } from '~/types';
import type { PoolInfo } from '~/types/contracts/Exchange_contractAbi';

export interface UseAddLiquidityProps {
  fromInput: UseCoinInput;
  toInput: UseCoinInput;
  poolInfoQuery: UseQueryResult<PoolInfo | undefined, unknown>;
  coinFrom: Coin;
  coinTo: Coin;
  reservesFromToRatio: number;
}

export function useAddLiquidity({
  fromInput,
  toInput,
  poolInfoQuery,
  coinFrom,
  coinTo,
  reservesFromToRatio,
}: UseAddLiquidityProps) {
  const [errorsCreatePull, setErrorsCreatePull] = useState<string[]>([]);
  const contract = useContract()!;
  const [stage, setStage] = useState(0);
  const { refreshBalances } = useFeedback();

  const mutation = useMutation(
    async () => {
      const fromAmount = fromInput.amount;
      const toAmount = toInput.amount;
      if (!fromAmount || !toAmount) return;

      // TODO: Combine all transactions on single tx leverage by scripts
      // https://github.com/FuelLabs/swayswap-demo/issues/42

      // Deposit coins from
      await contract.functions.deposit({
        forward: [fromAmount, coinFrom.assetId],
      });
      setStage((s) => s + 1);
      // Deposit coins to
      await contract.functions.deposit({
        forward: [toAmount, coinTo.assetId],
      });
      setStage((s) => s + 1);
      // Create liquidity pool
      const liquidityTokens = await contract.functions.add_liquidity(1, DEADLINE, {
        variableOutputs: 2,
      });
      setStage((s) => s + 1);

      return liquidityTokens;
    },
    {
      onSuccess: (liquidityTokens) => {
        if (liquidityTokens) {
          toast.success(reservesFromToRatio ? 'Added liquidity to the pool.' : 'New pool created.');
        } else {
          toast.error(
            `Error when trying to ${reservesFromToRatio ? 'add liquidity to' : 'create'} this pool.`
          );
        }
        fromInput.setAmount(BigInt(0));
        toInput.setAmount(BigInt(0));
        refreshBalances();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (e: any) => {
        const errors = e?.response?.errors;

        if (errors?.length) {
          if (errors[0].message === 'enough coins could not be found') {
            toast.error(
              `Not enough balance in your wallet to ${
                reservesFromToRatio ? 'add liquidity to' : 'create'
              } this pool.`
            );
          }
        } else {
          toast.error(
            `Error when trying to ${reservesFromToRatio ? 'add liquidity to' : 'create'} this pool.`
          );
        }
        refreshBalances({
          showWallet: false,
        });
      },
      onSettled: async () => {
        await poolInfoQuery.refetch();
        setStage(0);
      },
    }
  );

  const validateCreatePool = () => {
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
  };

  useEffect(() => {
    setErrorsCreatePull(validateCreatePool());
  }, [
    fromInput.amount,
    toInput.amount,
    fromInput.hasEnoughBalance,
    toInput.hasEnoughBalance,
    reservesFromToRatio,
  ]);

  return {
    stage,
    mutation,
    errorsCreatePull,
  };
}