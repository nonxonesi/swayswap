import { BigNumber } from 'ethers';
import type { CoinQuantity } from 'fuels';
import { toBigInt, toNumber } from 'fuels';

import type { Asset, SwapInfo } from './types';
import { Direction } from './types';

import { ONE_ASSET } from '~/config';
import { CoinETH, ZERO } from '~/lib/constants';

export function getPriceImpact(
  outputAmount: bigint,
  inputAmount: bigint,
  reserveInput: bigint,
  reserveOutput: bigint
) {
  const exchangeRateAfter = toNumber(inputAmount) / toNumber(outputAmount);
  const exchangeRateBefore = toNumber(reserveInput) / toNumber(reserveOutput);
  return ((exchangeRateAfter / exchangeRateBefore - 1) * 100).toFixed(2);
}

export function getAssetBalance(balances: CoinQuantity[] | undefined, asset: Asset) {
  return balances?.find((coin) => coin.assetId === asset.coin?.assetId);
}

export function hasBalance(
  balances: CoinQuantity[] | undefined,
  asset: Asset,
  amount: bigint | null | undefined
) {
  const assetBalance = toNumber(getAssetBalance(balances, asset)?.amount || 0);
  return assetBalance > toNumber(amount || 0);
}

// export function addSlippage()

export const calculatePriceImpact = ({
  direction,
  amount,
  coinFrom,
  previewAmount,
  token_reserve,
  eth_reserve,
}: SwapInfo) => {
  // If any value is 0 return 0
  if (!previewAmount || !amount || !token_reserve || !eth_reserve) return '0';

  if (direction === Direction.from) {
    if (coinFrom?.assetId !== CoinETH) {
      return getPriceImpact(previewAmount, amount, token_reserve, eth_reserve);
    }
    return getPriceImpact(previewAmount, amount, eth_reserve, token_reserve);
  }
  if (coinFrom?.assetId !== CoinETH) {
    return getPriceImpact(amount, previewAmount, token_reserve, eth_reserve);
  }
  return getPriceImpact(amount, previewAmount, eth_reserve, token_reserve);
};

export const calculatePriceWithSlippage = (
  amount: bigint | null | undefined,
  slippage: number,
  direction: Direction
) => {
  let total = 0;
  if (direction === Direction.from) {
    total = toNumber(amount || ZERO) * (1 - slippage);
  } else {
    total = toNumber(amount || ZERO) * (1 + slippage);
  }
  return toBigInt(Math.trunc(total));
};

export function getPricePerToken(tokenA?: bigint | null, tokenB?: bigint | null) {
  if (!tokenA || !tokenB) return '';
  const ratio = BigNumber.from(tokenA || 0).toNumber() / BigNumber.from(tokenB || 0).toNumber();
  const price = ratio * toNumber(ONE_ASSET);
  return (price / toNumber(ONE_ASSET)).toFixed(6);
}
