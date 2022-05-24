import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { MdSwapCalls } from "react-icons/md";

import { PricePerToken } from "./PricePerToken";
import { SwapComponent } from "./SwapComponent";
import { SwapPreview } from "./SwapPreview";
import { useUserGuidedStates } from "./hooks";
import { swapLoadingPreviewAtom, swapPreviewAmountAtom } from "./jotai";
import { useQueryMaximum, useQueryMinimum } from "./queries";
import { ValidationStateEnum } from "./types";

import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import { isSwayInfinity } from "~/lib/utils";
import type { PreviewInfo } from "~/types/contracts/ExchangeContractAbi";

const getValidationText = (
  state: ValidationStateEnum,
  coinSymbol: string | null
) => {
  switch (state) {
    case ValidationStateEnum.SelectToken:
      return "Select token";
    case ValidationStateEnum.EnterAmount:
      return "Enter amount";
    case ValidationStateEnum.InsufficientBalance:
      return `Insufficient ${coinSymbol || ""} balance`;
    case ValidationStateEnum.InsufficientAmount:
      return `Insufficient amount to swap`;
    case ValidationStateEnum.InsufficientLiquidity:
      return "Insufficient liquidity";
    default:
      return "Swap";
  }
};

export default function SwapPage() {
  const [isLoadingPreview, setLoadingPreview] = useAtom(swapLoadingPreviewAtom);
  const setPreviewAmount = useSetAtom(swapPreviewAmountAtom);
  const userState = useUserGuidedStates();

  const handleSuccess = (previewInfo: PreviewInfo | null) => {
    if (isSwayInfinity(previewInfo?.amount || 0)) {
      return setPreviewAmount(null);
    }
    setPreviewAmount(previewInfo);
  };

  const { isLoading: isLoadingMaximum } = useQueryMaximum({
    onSuccess: handleSuccess,
  });
  const { isLoading: isLoadingMinimum } = useQueryMinimum({
    onSuccess: handleSuccess,
  });

  useEffect(() => {
    setLoadingPreview(isLoadingMaximum || isLoadingMinimum);
  }, [isLoadingMaximum, isLoadingMinimum]);

  return (
    <Card className="self-start min-w-[450px] mt-24">
      <Card.Title>
        <MdSwapCalls className="text-primary-500" />
        Swap
      </Card.Title>
      <SwapComponent />
      <SwapPreview />
      <PricePerToken />
      <Button
        isFull
        size="lg"
        variant="primary"
        isLoading={isLoadingPreview}
        isDisabled={userState !== ValidationStateEnum.Swap}
        // onPress={() => swap()}
      >
        {getValidationText(userState, null)}
      </Button>
    </Card>
  );
}
