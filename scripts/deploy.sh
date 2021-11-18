#!/usr/bin/env bash

# import the deployment helpers
. $(dirname $0)/common.sh

#export DAPP_VERIFY_CONTRACT=1 # FIXME: This breaks :( Can't figure out how to pass it in properly

# Deploy.
if [[ ! "$ContractAddr" ]]; then
  ContractAddr=$(deploy Keno)
  log "Keno deployed at:" $ContractAddr

  [[ $ETHERSCAN_API_KEY ]] && dapp verify-contract src/KenoDapp.sol:Keno $ContractAddr
else
  log "Keno already deployed, skipping: $ContractAddr"
fi
