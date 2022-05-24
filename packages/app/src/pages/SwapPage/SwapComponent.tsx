import { toBigInt } from "fuels";
import { useAtom, useAtomValue } from "jotai";
import { startTransition } from "react";

import {
  swapAssetsAtom,
  swapDirectionAtom,
  swapLoadingPreviewAtom,
  swapPreviewAmountAtom,
} from "./jotai";
import { Direction } from "./types";

import { CoinInput, useCoinInput } from "~/components/CoinInput";
import { InvertButton } from "~/components/InvertButton";
import { NETWORK_FEE } from "~/config";
import { CoinETH, ZERO } from "~/lib/constants";
import type { Coin } from "~/types";

const style = {
  switchDirection: `flex items-center justify-center -my-5`,
};

const createAsset = (coin: Coin | null | undefined, amount: bigint | null) => ({
  coin: coin || null,
  amount,
});

const toggleDirection = (direction: Direction) =>
  direction === Direction.from ? Direction.to : Direction.from;

export function SwapComponent() {
  const previewAmount = useAtomValue(swapPreviewAmountAtom);
  const [[assetFrom, assetTo], setAssets] = useAtom(swapAssetsAtom);
  const [direction, setDirection] = useAtom(swapDirectionAtom);
  const isLoading = useAtomValue(swapLoadingPreviewAtom);

  const handleInvertCoins = () => {
    startTransition(() => {
      setDirection(toggleDirection(direction));
      setAssets([assetTo, assetFrom]);
    });
  };

  const fromInput = useCoinInput({
    coin: assetFrom?.coin,
    amount:
      direction === Direction.from ? assetFrom?.amount : previewAmount?.amount,
    gasFee: assetFrom?.coin?.assetId === CoinETH ? toBigInt(NETWORK_FEE) : ZERO,
    onChange: (value) => {
      startTransition(() => {
        setDirection(Direction.from);
        setAssets([createAsset(assetFrom?.coin, value), assetTo]);
      });
    },
    onChangeCoin: (coin: Coin) => {
      setAssets([createAsset(coin, fromInput.amount), assetFrom]);
    },
  });

  const toInput = useCoinInput({
    coin: assetTo?.coin,
    amount:
      direction === Direction.to ? assetTo?.amount : previewAmount?.amount,
    onChange: (value) => {
      startTransition(() => {
        setDirection(Direction.to);
        setAssets([assetFrom, createAsset(assetTo?.coin, value)]);
      });
    },
    onChangeCoin: (coin: Coin) => {
      setAssets([assetFrom, createAsset(coin, toInput.amount)]);
    },
  });

  return (
    <>
      <div className="mt-4">
        <CoinInput
          {...fromInput.getInputProps()}
          {...(direction === Direction.to && { isLoading })}
          autoFocus={direction === Direction.from}
          coinSelectorDisabled={assetFrom?.coin?.assetId === CoinETH}
        />
      </div>
      <div className={style.switchDirection}>
        <InvertButton onClick={handleInvertCoins} />
      </div>
      <div className="mb-4">
        <CoinInput
          {...toInput.getInputProps()}
          {...(direction === Direction.from && { isLoading })}
          autoFocus={direction === Direction.to}
          coinSelectorDisabled={assetTo?.coin?.assetId === CoinETH}
        />
      </div>
    </>
  );
}
