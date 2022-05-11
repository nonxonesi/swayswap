#!/bin/sh

build_and_deploy_contracts() {
    npx nodemon --watch "../contracts" -e sw  --exec "yarn -s build-contracts && yarn -s deploy-contracts";
}

export -f build_and_deploy_contracts

npx concurrently \
    --kill-others \
    --names "CLIENT,CONTRACTS" -c "blue,green" \
    "yarn start" build_and_deploy_contracts
