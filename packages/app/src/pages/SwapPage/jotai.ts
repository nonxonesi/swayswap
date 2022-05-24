import { atom, useSetAtom } from 'jotai';
import { useRef } from 'react';

import type { Asset } from './types';
import { Direction } from './types';

import assets from '~/lib/CoinsMetadata';
import type { PreviewInfo } from '~/types/contracts/ExchangeContractAbi';

export const swapIsTypingAtom = atom<boolean>(false);
export const useSetTyping = () => {
  const setTyping = useSetAtom(swapIsTypingAtom);
  const timeout = useRef<number>(0);

  return (typing: boolean) => {
    setTyping(typing);
    if (typing) {
      clearTimeout(timeout.current);
      timeout.current = Number(
        setTimeout(() => {
          setTyping(false);
        }, 600)
      );
    }
  };
};

export const swapAssetsAtom = atom<[Asset | null, Asset | null]>([
  {
    coin: assets[0],
    amount: null,
  },
  null,
]);
export const swapDirectionAtom = atom<Direction>(Direction.from);
export const swapLoadingPreviewAtom = atom<boolean>(false);
export const swapPreviewAmountAtom = atom<PreviewInfo | null>(null);
