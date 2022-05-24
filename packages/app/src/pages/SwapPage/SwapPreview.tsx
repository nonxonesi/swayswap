import { formatUnits } from "ethers/lib/utils";
import { useAtomValue } from "jotai";
import { BsArrowDown } from "react-icons/bs";

import { calculatePriceImpact, calculatePriceWithSlippage } from "./helpers";
import {
  swapAssetsAtom,
  swapDirectionAtom,
  swapLoadingPreviewAtom,
  swapPreviewAmountAtom,
} from "./jotai";
import { Direction } from "./types";

import { PreviewItem, PreviewTable } from "~/components/PreviewTable";
import { DECIMAL_UNITS, NETWORK_FEE } from "~/config";
import { usePoolInfo } from "~/hooks/usePoolInfo";
import { useSlippage } from "~/hooks/useSlippage";
import { ZERO } from "~/lib/constants";

export function SwapPreview() {
  const isLoadingPreview = useAtomValue(swapLoadingPreviewAtom);
  const [assetFrom, assetTo] = useAtomValue(swapAssetsAtom);
  const previewInfo = useAtomValue(swapPreviewAmountAtom);
  const direction = useAtomValue(swapDirectionAtom);
  const slippage = useSlippage();
  const { data: poolInfo } = usePoolInfo();

  if (
    !assetFrom?.coin ||
    !assetTo?.coin ||
    !previewInfo?.amount ||
    !direction ||
    !assetFrom.amount ||
    isLoadingPreview
  ) {
    return null;
  }
  // Expected amount of tokens to be received
  const outputAmount = formatUnits(
    direction === Direction.from
      ? previewInfo.amount
      : assetFrom.amount || ZERO,
    DECIMAL_UNITS
  );

  return (
    <div>
      <div className="flex justify-center">
        <BsArrowDown size={24} />
      </div>
      <PreviewTable title="Expected out:" className="my-2">
        <PreviewItem
          title={"You'll receive:"}
          value={`${outputAmount} ${assetTo.coin.symbol}`}
        />
        <PreviewItem
          title={"Price impact: "}
          value={`${calculatePriceImpact({
            direction,
            coinFrom: assetFrom.coin,
            amount: assetFrom.amount || assetTo.amount,
            previewAmount: previewInfo.amount,
            eth_reserve: poolInfo?.eth_reserve,
            token_reserve: poolInfo?.token_reserve,
          })}%`}
        />
        <PreviewItem
          title={`${
            direction === Direction.from
              ? "Minimum received after slippage"
              : "Maximum sent after slippage"
          } (${slippage.formatted}):`}
          value={`${formatUnits(
            calculatePriceWithSlippage(
              previewInfo.amount,
              slippage.value,
              direction
            ),
            DECIMAL_UNITS
          )} ${
            direction === Direction.from
              ? assetTo.coin.symbol
              : assetFrom.coin.symbol
          }`}
        />
        <PreviewItem
          className="text-gray-300"
          title={`Network Fee`}
          value={`${formatUnits(NETWORK_FEE, DECIMAL_UNITS)} ETH`}
        />
      </PreviewTable>
    </div>
  );
}
