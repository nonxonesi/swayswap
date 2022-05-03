import React, { PropsWithChildren, useContext, useMemo } from "react";
import { Wallet, ScriptTransactionRequest, TransactionResult } from "fuels";
import { CoinETH } from "src/lib/constants";
import { randomBytes } from "ethers/lib/utils";
import { CONTRACT_ID, FAUCET_AMOUNT, FUEL_PROVIDER_URL } from "src/config";
import { atom, useRecoilState } from "recoil";
import { persistEffect } from "src/lib/recoilEffects";
import {
  SwayswapContractAbi,
  SwayswapContractAbi__factory,
} from "src/types/contracts";

interface AppContextValue {
  wallet: Wallet | null;
  contract: SwayswapContractAbi | null;
  createWallet: () => void;
  faucet: () => Promise<TransactionResult>;
}

const walletPrivateKeyState = atom<string | null>({
  key: "privateKey",
  default: null,
  effects_UNSTABLE: [persistEffect],
});

export const AppContext = React.createContext<AppContextValue | null>(null);

export const useAppContext = () => useContext(AppContext)!;

export const useWallet = () => {
  const { wallet } = useContext(AppContext)!;
  return wallet;
};

export const useContract = () => {
  const { contract } = useContext(AppContext)!;
  return contract;
};

export const AppContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [privateKey, setPrivateKey] = useRecoilState(walletPrivateKeyState);

  const wallet = useMemo(() => {
    if (!privateKey) return null;
    return new Wallet(privateKey, FUEL_PROVIDER_URL);
  }, [privateKey]);

  const contract = useMemo(() => {
    if (!wallet) return null;
    return SwayswapContractAbi__factory.connect(CONTRACT_ID, wallet);
  }, [wallet]);

  return (
    <AppContext.Provider
      value={{
        wallet,
        contract,
        createWallet: () => {
          const wallet = Wallet.generate({
            provider: FUEL_PROVIDER_URL,
          });
          setPrivateKey(wallet.privateKey);
          return wallet;
        },
        faucet: async () => {
          const transactionRequest = new ScriptTransactionRequest({
            gasPrice: 0,
            gasLimit: "0x0F4240",
            script: "0x24400000",
            scriptData: randomBytes(32),
          });
          // @ts-ignore
          transactionRequest.addCoin({
            id: "0x000000000000000000000000000000000000000000000000000000000000000000",
            assetId: CoinETH,
            amount: FAUCET_AMOUNT,
            owner:
              "0xf1e92c42b90934aa6372e30bc568a326f6e66a1a0288595e6e3fbd392a4f3e6e",
          });
          transactionRequest.addCoinOutput(
            wallet!.address,
            FAUCET_AMOUNT,
            CoinETH
          );
          const submit = await wallet!.sendTransaction(transactionRequest);

          return submit.wait();
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
