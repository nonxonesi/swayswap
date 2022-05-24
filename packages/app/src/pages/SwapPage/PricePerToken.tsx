import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { AiOutlineSwap } from "react-icons/ai";

import { getPricePerToken } from "./helpers";
import {
  swapAssetsAtom,
  swapLoadingPreviewAtom,
  swapPreviewAmountAtom,
} from "./jotai";
import type { Asset } from "./types";

import { Button } from "~/components/Button";
import type { PreviewInfo } from "~/types/contracts/ExchangeContractAbi";

const style = {
  wrapper: `flex items-center gap-3 my-4 px-2 text-sm text-gray-400`,
};

const createTokenPair = (
  assetFrom: Asset | null,
  assetTo: Asset | null,
  previewInfo: PreviewInfo | null
): [Asset | null, Asset | null] => [
  {
    coin: assetFrom?.coin || null,
    amount: assetFrom?.amount || previewInfo?.amount || null,
  },
  {
    coin: assetTo?.coin || null,
    amount: assetTo?.amount || previewInfo?.amount || null,
  },
];

export function PricePerToken() {
  const isLoadingPreview = useAtomValue(swapLoadingPreviewAtom);
  const [assetFrom, assetTo] = useAtomValue(swapAssetsAtom);
  const previewInfo = useAtomValue(swapPreviewAmountAtom);
  const [[tokenA, tokenB], setTokens] = useState<[Asset | null, Asset | null]>([
    null,
    null,
  ]);

  const pricePerToken = getPricePerToken(tokenB?.amount, tokenA?.amount);

  function toggle() {
    setTokens([tokenB, tokenA]);
  }

  useEffect(() => {
    setTokens(createTokenPair(assetFrom, assetTo, previewInfo));
  }, [assetFrom, assetTo, previewInfo]);

  if (isLoadingPreview) return null;
  if (!tokenA?.amount || !tokenB?.amount) return null;

  return (
    <div className={style.wrapper}>
      <div>
        <span className="text-gray-200">1</span> {tokenA?.coin?.symbol} ={" "}
        <span className="text-gray-200">{pricePerToken}</span>{" "}
        {tokenB?.coin?.symbol}
      </div>
      <Button size="sm" className="h-auto p-0 border-none" onPress={toggle}>
        <AiOutlineSwap size={20} />
      </Button>
    </div>
  );
}
