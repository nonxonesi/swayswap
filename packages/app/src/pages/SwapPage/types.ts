import type { Coin } from '~/types';
import type { PoolInfo } from '~/types/contracts/ExchangeContractAbi';

export enum ActiveInput {
  'from' = 'from',
  'to' = 'to',
}

export enum Direction {
  'from' = 'from',
  'to' = 'to',
}

export type Asset = {
  coin: Coin | null;
  amount: bigint | null;
};

export type SwapState = {
  direction: Direction;
  coinFrom: Coin;
  coinTo: Coin;
  amount: bigint | null;
  amountFrom: bigint | null;
  hasBalance: boolean;
};

export type SwapInfo = Partial<
  SwapState &
    PoolInfo & {
      previewAmount: bigint | null;
    }
>;

export enum ValidationStateEnum {
  SelectToken = 0,
  EnterAmount = 1,
  InsufficientBalance = 2,
  InsufficientAmount = 3,
  InsufficientLiquidity = 4,
  Swap = 5,
}
