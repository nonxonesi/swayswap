import { toNumber } from "fuels";

import { DECIMAL_UNITS, ONE_ASSET } from "~/config";
import { parseToFormattedNumber, toFixed } from "~/lib/math";
import type { Coin } from "~/types";

export interface AddLiquidityPoolPriceProps {
  coinFrom: Coin;
  coinTo: Coin;
  reservesFromToRatio: number;
}

export const AddLiquidityPoolPrice = ({
  coinFrom,
  coinTo,
  reservesFromToRatio,
}: AddLiquidityPoolPriceProps) => {
  const oneAssetAmount = toNumber(ONE_ASSET);
  // If reservers ratio is 0 then user
  // is creating pool and the ratio is 1:1
  const reservesRatio = reservesFromToRatio || 0.5;
  const daiPrice = toFixed(
    parseToFormattedNumber(
      Math.floor(oneAssetAmount / reservesRatio),
      DECIMAL_UNITS
    ),
    3
  );
  const ethPrice = toFixed(
    parseToFormattedNumber(
      Math.floor(oneAssetAmount * reservesRatio),
      DECIMAL_UNITS
    ),
    3
  );
  return (
    <div>
      <h4 className="ml-2 mb-2 text-gray-200 text-sm">Pool price</h4>
      <div className="mb-4 text-sm border border-dashed border-gray-500 py-3 px-4 rounded-lg">
        <div className="flex flex-col font-mono text-gray-300">
          <span>
            1 {coinFrom.name} = {daiPrice} {coinTo.name}
          </span>
          <span>
            1 {coinTo.name} = {ethPrice} {coinFrom.name}
          </span>
        </div>
      </div>
    </div>
  );
};
