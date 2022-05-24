import { useAtomValue } from 'jotai';
import { useQuery } from 'react-query';

import { swapAssetsAtom, swapDirectionAtom } from './jotai';
import { Direction } from './types';

import { useContract } from '~/context/AppContext';
import useDebounce from '~/hooks/useDebounce';
import type { ExchangeContractAbi } from '~/types/contracts';
import type { PreviewInfo } from '~/types/contracts/ExchangeContractAbi';

export const getSwapWithMaximumRequiredAmount = async (
  contract: ExchangeContractAbi,
  assetId: string,
  amount: bigint
) => {
  const requiredAmount = await contract.callStatic.get_swap_with_maximum(amount, {
    forward: [0, assetId],
  });
  return requiredAmount;
};

export const getSwapWithMinimumMinAmount = async (
  contract: ExchangeContractAbi,
  assetId: string,
  amount: bigint
) => {
  const minAmount = await contract.callStatic.get_swap_with_minimum(amount, {
    forward: [0, assetId],
  });
  return minAmount;
};

type QueryParams = {
  onSuccess: (preview: PreviewInfo | null) => void;
};

export const useQueryMaximum = ({ onSuccess }: QueryParams) => {
  const contract = useContract()!;
  const [assetFrom, assetTo] = useAtomValue(swapAssetsAtom);
  const direction = useAtomValue(swapDirectionAtom);
  const debouncedAssetFrom = useDebounce(assetFrom, 500);
  const debouncedAssetTo = useDebounce(assetTo, 500);

  return useQuery(
    ['get_swap_with_maximum', debouncedAssetTo?.coin, debouncedAssetTo?.amount?.toString()],
    async () => {
      if (
        !debouncedAssetFrom ||
        !debouncedAssetTo ||
        debouncedAssetTo.amount === null ||
        debouncedAssetTo.coin === null ||
        direction !== Direction.to
      ) {
        return null;
      }
      return getSwapWithMinimumMinAmount(
        contract,
        debouncedAssetTo.coin.assetId,
        debouncedAssetTo.amount
      );
    },
    {
      onSuccess,
    }
  );
};

export const useQueryMinimum = ({ onSuccess }: QueryParams) => {
  const contract = useContract()!;
  const [assetFrom, assetTo] = useAtomValue(swapAssetsAtom);
  const direction = useAtomValue(swapDirectionAtom);
  const debouncedAssetFrom = useDebounce(assetFrom, 500);
  const debouncedAssetTo = useDebounce(assetTo, 500);

  return useQuery(
    ['get_swap_with_minimum', debouncedAssetFrom?.coin, debouncedAssetFrom?.amount?.toString()],
    async () => {
      if (
        !debouncedAssetTo ||
        !debouncedAssetFrom ||
        debouncedAssetFrom.amount === null ||
        debouncedAssetTo.coin === null ||
        direction !== Direction.from
      ) {
        return null;
      }
      return getSwapWithMaximumRequiredAmount(
        contract,
        debouncedAssetTo.coin.assetId,
        debouncedAssetFrom.amount
      );
    },
    {
      onSuccess,
    }
  );
};

// export const swapTokens = async (
//   contract: ExchangeContractAbi,
//   { coinFrom, direction, amount }: SwapState
// ) => {
//   const DEADLINE = 1000;
//   if (direction === ActiveInput.to && amount) {
//     const forwardAmount = await getSwapWithMaximumRequiredAmount(
//       contract,
//       coinFrom.assetId,
//       amount
//     );
//     if (!forwardAmount.has_liquidity) {
//       throw new Error('Not enough liquidity on pool');
//     }
//     await contract.functions.swap_with_maximum(amount, DEADLINE, {
//       forward: [forwardAmount.amount, coinFrom.assetId],
//       variableOutputs: 1,
//     });
//   } else if (direction === ActiveInput.from && amount) {
//     const minValue = await getSwapWithMinimumMinAmount(contract, coinFrom.assetId, amount);
//     if (!minValue.has_liquidity) {
//       throw new Error('Not enough liquidity on pool');
//     }
//     await contract.functions.swap_with_minimum(minValue.amount, DEADLINE, {
//       forward: [amount, coinFrom.assetId],
//       variableOutputs: 1,
//     });
//   }
// };
