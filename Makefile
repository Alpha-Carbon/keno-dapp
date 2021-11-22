# Setup some project vars
ROOT_DIR := $(CURDIR)
OUTPUT_DIR := ${ROOT_DIR}/out
TESTNET_DIR := ${OUTPUT_DIR}/testnet
TEST_ADDR := 0x003533CD36aC980768B510F5C57E00CE4c0229D5
TEST_KEY := 0x9cbc61f079e82f0d9d3989a99f5cfe4aef68cbec8063b821fd41e994ea131c79 
$(shell mkdir -p ${OUTPUT_DIR})

# include .env file and export its env vars
# (-include to ignore error if it does not exist)
-include .env

install: update npm solc

# dapp deps
update:; dapp update

# npm deps for linting etc.
npm:; yarn install

# install solc version
# example to install other versions: `make solc 0_8_2`
SOLC_VERSION := 0_8_6
solc:; nix-env -f https://github.com/dapphub/dapptools/archive/master.tar.gz -iA solc-static-versions.solc_${SOLC_VERSION}

# Build & test
build  :; dapp build
test   :; dapp test # --ffi # enable if you need the `ffi` cheat code on HEVM
clean  :; dapp clean
lint   :; yarn run lint
estimate :; ./scripts/estimate-gas.sh ${contract}
size   :; ./scripts/contract-size.sh ${contract}
abi-out :; jq '.contracts."src/Keno.sol".Keno.abi' ./out/dapp.sol.json > ./out/KenoAbi.json

testnet: export DAPP_TESTNET_CHAINID=1337
testnet: export DAPP_TESTNET_PERIOD=0
testnet:
	rm -rf out/testnet
	dapp testnet --dir ${TESTNET_DIR}

# Deployment helpers
deploy:; @./scripts/deploy.sh

# local testnet, funding TEST_ADDR with 1000 eth
deploy-testnet: export ETH_FROM=$(shell seth ls --keystore ${TESTNET_DIR}/8545/keystore | cut -f1)
deploy-testnet: export ETH_RPC_ACCOUNTS=true
deploy-testnet: deploy
# deploy-testnet:; seth send --value 1000000000000000000000 ${TEST_ADDR}
