import type { SwapState } from '../types';
import { ActiveInput } from '../types';

import { COIN_ETH, getDeadline } from '~/systems/Core';
import type { TransactionCost } from '~/systems/Core/utils/gas';
import { getOverrides } from '~/systems/Core/utils/gas';
import type { ExchangeContractAbi } from '~/types/contracts';

export enum SwapQueries {
  SwapPreview = 'SwapPage-SwapPreview',
  NetworkFee = 'SwapPage-NetworkFee',
}

const getSwapWithMaximumRequiredAmount = async (
  contract: ExchangeContractAbi,
  assetId: string,
  amount: bigint
) => {
  const requiredAmount = await contract.dryRun.get_swap_with_maximum(amount, {
    forward: [0, assetId],
  });
  return requiredAmount;
};

const getSwapWithMinimumMinAmount = async (
  contract: ExchangeContractAbi,
  assetId: string,
  amount: bigint
) => {
  const minAmount = await contract.dryRun.get_swap_with_minimum(amount, {
    forward: [0, assetId],
  });
  return minAmount;
};

export const queryPreviewAmount = async (
  contract: ExchangeContractAbi,
  { amount, direction, coinFrom }: SwapState
) => {
  if (direction === ActiveInput.to && amount) {
    const previewAmount = await getSwapWithMaximumRequiredAmount(
      contract,
      coinFrom.assetId,
      amount
    );
    return previewAmount;
  }
  if (amount) {
    const previewAmount = await getSwapWithMinimumMinAmount(contract, coinFrom.assetId, amount);
    return previewAmount;
  }
  return null;
};

export const swapTokens = async (
  contract: ExchangeContractAbi,
  { coinFrom, direction, amount }: SwapState,
  txCost: TransactionCost
) => {
  const deadline = await getDeadline(contract);

  if (direction === ActiveInput.to && amount) {
    const forwardAmount = await getSwapWithMaximumRequiredAmount(
      contract,
      coinFrom.assetId,
      amount
    );
    if (!forwardAmount.has_liquidity) {
      throw new Error('Not enough liquidity on pool');
    }
    return contract.submitResult.swap_with_maximum(
      amount,
      deadline,
      getOverrides({
        forward: [forwardAmount.amount, coinFrom.assetId],
        gasLimit: txCost.total,
        variableOutputs: 2,
      })
    );
  }
  if (direction === ActiveInput.from && amount) {
    const minValue = await getSwapWithMinimumMinAmount(contract, coinFrom.assetId, amount);
    if (!minValue.has_liquidity) {
      throw new Error('Not enough liquidity on pool');
    }

    return contract.submitResult.swap_with_minimum(
      minValue.amount,
      deadline,
      getOverrides({
        forward: [amount, coinFrom.assetId],
        gasLimit: txCost.total,
        variableOutputs: 2,
      })
    );
  }
};

export const queryNetworkFee = async (contract: ExchangeContractAbi, direction?: ActiveInput) => {
  const directionValue = direction || ActiveInput.from;
  const deadline = await getDeadline(contract);

  if (directionValue === ActiveInput.to) {
    return contract.prepareCall.swap_with_maximum(1, deadline, {
      forward: [1, COIN_ETH],
      variableOutputs: 2,
      gasLimit: 1000000,
    });
  }
  return contract.prepareCall.swap_with_minimum(1, deadline, {
    forward: [1, COIN_ETH],
    variableOutputs: 1,
    gasLimit: 1000000,
  });
};
