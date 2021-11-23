// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;
import "ds-test/test.sol";

import "../../Keno.sol";
import "./Hevm.sol";

contract User {
    Keno internal keno;

    constructor(address payable _keno) {
        keno = Keno(_keno);
    }

    function play(uint256 forBlock, uint256[] memory numbers, uint256 price) public {
		keno.play{ value: price }(forBlock, numbers);
    }

	function withdraw(uint256 amount) public {
		keno.withdraw(payable(this), amount);
	}

    receive() external payable {}
}

contract KenoTest is DSTest {
	//to move evm foward 12 minutes:
	//hevm.warp(12 minutes);
	//to move evm forward 5 blocks: 
	//hevm.roll(5);
    Hevm internal constant hevm = Hevm(HEVM_ADDRESS);

    // contracts
    Keno internal keno;

    // users
    User internal owner;
    User internal alice;
    User internal bob;

    function setUp() public virtual {
		// start at a random block, so we can test exploit of
		// trying to resolve games before contract creation
		hevm.roll(5);

        keno = new Keno();

		(bool success,) = payable(keno).call{value: 1000 ether}("");
		assertTrue(success);

        owner = new User(payable(keno));
        alice = new User(payable(keno));
        bob = new User(payable(keno));

        keno.transferOwnership(address(owner));

		// advance chain by 1 block, the soonest possible 
		// `play` is after the contract's `startBlock`
		hevm.roll(1);
    }
}
