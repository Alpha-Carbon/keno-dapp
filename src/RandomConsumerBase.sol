// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

//#NOTE this is here for convenience.  Use this for REMIX IDE
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.3.2/contracts/utils/Context.sol";

import "@openzeppelin/contracts/utils/Context.sol";

interface IRandomProvider {
    /**
     * @dev Queries historic entropy from VRF Oracle storage 
     * 
     * Returns uint256 
     */
    function getEntropy(uint256 forBlock) external view returns (uint256 entropy);
    
    /**
     * @dev checks the `address` is currently an Oracle 
     *  
     */
	function requireOracle(address sender) external;
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
	function executeImpl(uint256 forBlock, uint256 entropy) internal virtual;

    /**
     * @dev `executeEntropy` attempts to query the stored entropy in the chain `forBlock`
	 * and delegates the data to the `executeImpl`
     * 
     * Returns null
     */
    function executeEntropy(uint256 forBlock) external {
		uint256 entropy = RandomProvider.getEntropy(forBlock);
        executeImpl(forBlock, entropy);
    }

    function executeEntropyForTest(uint256 forBlock, uint256 entropy) external {
        executeImpl(forBlock, entropy);
    }
}
