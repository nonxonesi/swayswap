import { useAtomValue } from 'jotai';

import { calculatePriceWithSlippage, hasBalance } from './helpers';
import { swapAssetsAtom, swapDirectionAtom, swapPreviewAmountAtom } from './jotai';
import { Direction, ValidationStateEnum } from './types';

import { useBalances } from '~/hooks/useBalances';
import { useSlippage } from '~/hooks/useSlippage';
import { isSwayInfinity } from '~/lib/utils';

export const useUserGuidedStates = () => {
  const { data: balances } = useBalances();
  const [assetFrom, assetTo] = useAtomValue(swapAssetsAtom);
  const previewInfo = useAtomValue(swapPreviewAmountAtom);
  const direction = useAtomValue(swapDirectionAtom);
  const slippage = useSlippage();

  if (!assetFrom?.coin || !assetTo?.coin) {
    return ValidationStateEnum.SelectToken;
  }
  if (direction === Direction.to && !previewInfo?.amount) {
    return ValidationStateEnum.EnterAmount;
  }
  if (direction === Direction.from && !assetFrom?.amount) {
    return ValidationStateEnum.EnterAmount;
  }
  if (
    direction === Direction.to &&
    !hasBalance(
      balances,
      assetFrom,
      calculatePriceWithSlippage(previewInfo?.amount, slippage.value, direction)
    )
  ) {
    return ValidationStateEnum.InsufficientBalance;
  }
  if (
    direction === Direction.from &&
    !hasBalance(
      balances,
      assetFrom,
      calculatePriceWithSlippage(assetFrom?.amount, slippage.value, direction)
    )
  ) {
    return ValidationStateEnum.InsufficientBalance;
  }
  if (!previewInfo?.has_liquidity || isSwayInfinity(previewInfo.amount)) {
    return ValidationStateEnum.InsufficientLiquidity;
  }
  return ValidationStateEnum.Swap;
};
