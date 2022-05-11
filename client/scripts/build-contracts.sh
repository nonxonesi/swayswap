#!/bin/sh

CLIENT_DIR=$(realpath ../)
SWAYSWAP_CONTRACT=$CLIENT_DIR/contracts/swayswap_contract
TOKEN_CONTRACT=$CLIENT_DIR/contracts/token_contract

echo $SWAYSWAP_CONTRACT
echo $TOKEN_CONTRACT

echo "Build SwaySwap contract"
forc build --silent -p $SWAYSWAP_CONTRACT &
echo "Build Token contract"
forc build --silent -p $TOKEN_CONTRACT &

# Waiting contracts build
wait

echo "Build Types for contract"
npx typechain --target fuels --out-dir=./src/types/contracts '../contracts/**/out/debug/**.json'
echo "Prettify codes"
npx prettier --write src/types