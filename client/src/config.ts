import { parseUnits } from 'ethers/lib/utils';

let envs = process.env;
if (
  process.env.NODE_ENV === 'development' &&
  !envs.REACT_APP_CONTRACT_ID &&
  !envs.REACT_APP_TOKEN_ID
) {
  try {
    Object.assign(envs, require('./envs.json'));
  } catch (err) {}
}

console.log(envs.REACT_APP_CONTRACT_ID);

export const FUEL_PROVIDER_URL = envs.REACT_APP_FUEL_PROVIDER_URL || 'https://node.swayswap.io/graphql';
export const CONTRACT_ID = envs.REACT_APP_CONTRACT_ID!;
export const TOKEN_ID = envs.REACT_APP_TOKEN_ID!;
export const DECIMAL_UNITS = 3;
export const FAUCET_AMOUNT = parseUnits('0.5', DECIMAL_UNITS);
export const MINT_AMOUNT = parseUnits('2000', DECIMAL_UNITS);
export const ONE_ASSET = parseUnits('1', DECIMAL_UNITS).toNumber();
