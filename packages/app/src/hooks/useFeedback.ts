import { useWalletWidgetOpener } from '~/components/WalletWidget';
import { queryClient } from '~/lib/queryClient';
import { Queries } from '~/types/queries';

export function useFeedback() {
  const { pulse } = useWalletWidgetOpener();

  function refreshBalances(params?: { showWallet: boolean }) {
    queryClient.fetchQuery(Queries.UserQueryBalances);
    if (params?.showWallet !== false) pulse();
  }

  return {
    refreshBalances,
  };
}
