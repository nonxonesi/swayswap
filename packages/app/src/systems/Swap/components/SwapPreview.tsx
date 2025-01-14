import { BsArrowDown } from "react-icons/bs";

import { useValueIsTyping } from "../state";
import type { SwapInfo } from "../types";
import { ActiveInput } from "../types";
import { calculatePriceWithSlippage, calculatePriceImpact } from "../utils";

import {
  PreviewItem,
  PreviewTable,
  useSlippage,
  ZERO,
  parseToFormattedNumber,
  NetworkFeePreviewItem,
} from "~/systems/Core";

type SwapPreviewProps = {
  swapInfo: SwapInfo;
  isLoading: boolean;
  networkFee?: bigint | null;
};

export function SwapPreview({
  swapInfo,
  networkFee,
  isLoading,
}: SwapPreviewProps) {
  const { amount, previewAmount, direction, coinFrom, coinTo } = swapInfo;
  const isTyping = useValueIsTyping();
  const slippage = useSlippage();

  if (
    !coinFrom ||
    !coinTo ||
    !previewAmount ||
    !direction ||
    !amount ||
    isLoading ||
    isTyping
  ) {
    return null;
  }

  // Expected amount of tokens to be received
  const nextAmount =
    direction === ActiveInput.from ? previewAmount : amount || ZERO;

  const outputAmount = parseToFormattedNumber(nextAmount);
  const priceWithSlippage = calculatePriceWithSlippage(
    previewAmount,
    slippage.value,
    direction
  );
  const inputAmountWithSlippage = parseToFormattedNumber(priceWithSlippage);

  return (
    <div aria-label="Preview Swap Output">
      <div className="flex justify-center">
        <BsArrowDown size={20} className="text-gray-400" />
      </div>
      <PreviewTable title="Expected output:" className="my-2">
        <PreviewItem
          title={"You'll receive:"}
          value={`${outputAmount} ${coinTo.symbol}`}
        />
        <PreviewItem
          title={"Price impact: "}
          value={`${calculatePriceImpact(swapInfo)}%`}
        />
        <PreviewItem
          title={`${
            direction === ActiveInput.from
              ? "Min. received after slippage"
              : "Max. sent after slippage"
          } (${slippage.formatted}):`}
          value={`${inputAmountWithSlippage} ${
            direction === ActiveInput.from ? coinTo.symbol : coinFrom.symbol
          }`}
        />
        <NetworkFeePreviewItem networkFee={networkFee} />
      </PreviewTable>
    </div>
  );
}
