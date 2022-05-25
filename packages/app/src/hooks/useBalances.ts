import type { UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';

import { useWallet } from '~/hooks/useWallet';

export function useBalances(opts: UseQueryOptions = {}) {
  const wallet = useWallet();
  return useQuery('AssetsPage-balances', () => wallet?.getBalances(), opts as any); // eslint-disable-line @typescript-eslint/no-explicit-any
}
