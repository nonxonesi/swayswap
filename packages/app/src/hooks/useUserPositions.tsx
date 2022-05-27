import { useBalances } from "./useBalances";
import { usePoolInfo } from "./usePoolInfo";

import { DECIMAL_UNITS } from "~/config";
import CoinsMetadata from "~/lib/CoinsMetadata";
import {
  ZERO,
  divideFnValidOnly,
  parseToFormattedNumber,
  toBigInt,
  multiplyFn,
  toFixed,
} from "~/lib/math";

export function useUserPositions() {
  const { data: info } = usePoolInfo();
  const { data: balances } = useBalances();

  const lpToken = CoinsMetadata.find((c) => c.symbol === "ETH/DAI");

  const poolTokens = balances?.find(
    (coin) => coin.assetId === lpToken?.assetId
  )?.amount;
  const poolTokensNum = poolTokens || ZERO;

  // info?.token_reserve
  const totalLiquidity = toBigInt(info?.lp_token_supply || ZERO);
  const tokenReserve = toBigInt(info?.token_reserve || ZERO);
  const ethReserve = toBigInt(info?.eth_reserve || ZERO);

  const formattedTokenReserve = toFixed(
    parseToFormattedNumber(tokenReserve, DECIMAL_UNITS),
    3
  );
  const formattedEthReserve = toFixed(
    parseToFormattedNumber(ethReserve, DECIMAL_UNITS),
    3
  );

  const pooledDAI = divideFnValidOnly(
    multiplyFn(poolTokensNum, tokenReserve),
    totalLiquidity
  );
  const pooledETH = divideFnValidOnly(
    multiplyFn(poolTokensNum, ethReserve),
    totalLiquidity
  );
  const formattedPooledDAI = toFixed(
    parseToFormattedNumber(BigInt(pooledDAI), DECIMAL_UNITS),
    3
  );
  const formattedPooledETH = toFixed(
    parseToFormattedNumber(BigInt(pooledETH), DECIMAL_UNITS),
    3
  );
  const formattedPoolTokens = toFixed(
    poolTokensNum ? parseToFormattedNumber(poolTokensNum, DECIMAL_UNITS) : "0",
    3
  );

  const poolShare = divideFnValidOnly(poolTokensNum, totalLiquidity);
  const formattedPoolShare = parseFloat((poolShare * 100).toFixed(6));
  const hasPositions = poolTokensNum > ZERO;

  return {
    pooledDAI,
    pooledETH,
    poolShare,
    poolTokens,
    poolTokensNum,
    formattedPooledDAI,
    formattedPooledETH,
    formattedPoolShare,
    formattedPoolTokens,
    formattedTokenReserve,
    formattedEthReserve,
    hasPositions,
    totalLiquidity,
    tokenReserve,
    ethReserve,
  };
}
