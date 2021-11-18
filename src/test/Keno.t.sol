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
//        hevm.warp(12 minutes); 
//        hevm.roll(5); 
    }

}

contract KenoTransactions is KenoTest {
    function testPlay() public {

        // Overflows/underflows
//        try keno.play(MAX_UINT, "mul", 2) { fail(); } catch Panic(uint) {} // mul overflow
//        try keno.play(5, "sub", 6) { fail(); } catch Panic(uint) {} // sub underflow
//        try keno.play(MAX_UINT, "add", 42) { fail(); } catch Panic(uint) {} // add overflow
    }
}
