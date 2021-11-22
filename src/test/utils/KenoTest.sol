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
    Hevm internal constant hevm = Hevm(HEVM_ADDRESS);

    // contracts
    Keno internal keno;

    // users
    User internal owner;
    User internal alice;
    User internal bob;

    function setUp() public virtual {
        keno = new Keno();

		(bool success,) = payable(keno).call{value: 1000 ether}("");
		assertTrue(success);

        owner = new User(payable(keno));
        alice = new User(payable(keno));
        bob = new User(payable(keno));

        keno.transferOwnership(address(owner));
    }
}
