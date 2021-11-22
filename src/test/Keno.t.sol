// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

import "./utils/KenoTest.sol";

contract KenoViewsTest is KenoTest {
    uint256 constant MAX_UINT = 2 ** 256 - 1;

    function testOneSpotPayout() public {
		uint256 payout = keno.calculatePayout(1, 1, 10);
		assertEq(payout, 25);
    }

    function testRounds() public {
		//move evm foward 12 minutes
		//hevm.warp(12 minutes); 
		//move evm forward 5 blocks
		//hevm.roll(5); 
    }
}

contract KenoTransactions is KenoTest {
    function testPlayMinimumNotMet() public {
	    payable(address(alice)).transfer(100 ether);

		uint256[] memory numbers = new uint256[](3);
		numbers[0] = 1;
		numbers[1] = 2;
		numbers[2] = 3;
		// try .1 ether
		try alice.play(1, numbers, 100000000 gwei) { fail(); } catch Error(string memory error) {
		    assertEq(error, "minimum play amount not met.");
		}
    }

	function testOwnerWithdraw() public {
		owner.withdraw(1 ether);
		assertEq(address(owner).balance, 1 ether);
		assertEq(address(keno).balance, 999 ether);
	}

	function testNonOwnerWithdraw() public {
		try alice.withdraw(1 ether) { fail(); } catch Error(string memory error) {
		    assertEq(error, "Ownable: caller is not the owner");
		}
	}
}
