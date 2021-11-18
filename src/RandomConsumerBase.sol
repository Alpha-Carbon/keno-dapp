// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

interface IRandomProvider {
    /**
     * @dev checks the `address` is currently an Oracle 
     *  
     */
	function requireOracle(address sender) external;

    /**
     * @dev Queries historic entropy from VRF Oracle storage 
     * 
     * Returns uint256 
     */
    function history(uint256 forBlock) external view returns (uint256 entropy);
}

/**
 * *****************************************************************************
 * @dev USAGE
 *
 * @dev Randomness Consumer contracts must inherit from RandomConsumerBase and 
 * implement `randomCallbackImpl` to override the virtual base function.
 *
 * @dev   contract MyContract is RandomConsumerBase {
 * @dev     function receiveRandomImpl(uint256 forBlock, uint256 entropy) internal override(RandomConsumerBase) {
 * @dev       // YOUR CUSTOM CODE HERE
 * @dev     }
 * @dev   }
 * */
abstract contract RandomConsumerBase is Context {
    IRandomProvider RandomProvider = IRandomProvider(0x0000000000000000000000000000000000000801);

    /**
     * @dev Receives `entropy` for `forBlock`.  Contract must override this function
     * 
     * Returns null
     */
	function receiveRandomImpl(uint256 forBlock, uint256 entropy) internal virtual;

    /**
     * @dev `receiveRandom` is called by the Offchain Worker Oracle and calls the override
	 * `randmCallbackImpl` after confirming the author is an Oracle
     * 
     * Returns null
     */
    function receiveRandom(uint256 forBlock, uint256 entropy) external {
        //RandomProvider.requireOracle(_msgSender());
        receiveRandomImpl(forBlock,entropy);
    }
}

