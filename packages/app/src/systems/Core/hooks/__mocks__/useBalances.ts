import type { CoinQuantity } from 'fuels';

import { COIN_ETH, parseUnits } from '../../utils';
import * as useBalances from '../useBalances';

import { DECIMAL_UNITS } from '~/config';

const FAKE_BALANCE = [{ amount: parseUnits('3', DECIMAL_UNITS).toBigInt(), assetId: COIN_ETH }];

export function mockUseBalances(balances?: CoinQuantity[]) {
  const mock = {
    data: balances || FAKE_BALANCE,
    loading: false,
    refetch: () => undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  return jest.spyOn(useBalances, 'useBalances').mockImplementation(() => mock);
}
