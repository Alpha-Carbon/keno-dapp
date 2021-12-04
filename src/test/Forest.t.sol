// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;
import "ds-test/test.sol";

import "./utils/Hevm.sol";
import "../Forest.sol";

contract User is DSTest{
    Forest forest;
    uint256 exeTimes = 0;

    constructor(Forest slwh) {
        forest = slwh;
    }

    function notifyStartRound() public {
        forest.startNewRound();
    }

    function bet(uint256[15] memory betInfo) public {
        uint256 amount = 0;
        for (uint256 i = 0; i < betInfo.length; i++) {
            unchecked {amount += betInfo[i];}
        }

        forest.bet{value: amount}(betInfo);
    }

    function betWithValue(uint256[15] memory betInfo, uint256 value) public {
        forest.bet{value: value}(betInfo);
    }

    receive() external payable {}
}


contract AbnormalUser is DSTest{
    Forest forest;
    uint256 exeTimes = 0;

    constructor(Forest slwh) {
        forest = slwh;
    }

    function notifyStartRound() public {
        forest.startNewRound();
    }

    function bet(uint256[15] memory betInfo) public {
        uint256 amount = 0;
        for (uint256 i = 0; i < betInfo.length; i++) {
        unchecked {amount += betInfo[i];}
        }

        forest.bet{value: amount}(betInfo);
    }

    function betWithValue(uint256[15] memory betInfo, uint256 value) public {
        forest.bet{value: value}(betInfo);
    }

    receive() external payable {
        if (msg.sender == address(forest) && exeTimes < 5) {
            exeTimes += 1;
            forest.executeEntropyForTest(block.number, 20202020200342);
        } else {
            exeTimes = 0;
        }
    }
}



contract ForestTest is DSTest {
    Hevm internal constant hevm = Hevm(HEVM_ADDRESS);
    // contracts
    Forest internal forest;
    User internal owner;
    User internal alice;

    function setUp() public virtual {
        uint256[15] memory payTable = [uint256(4), 6, 8, 9, 12, 15, 18, 21, 24, 28, 36, 50, 2, 8, 2];
        uint256[15] memory betLimit = [uint256(25), 16, 12, 8, 6, 5, 4, 3, 3, 3, 2, 2, 50, 12, 50];
        uint256[15] memory probability = [uint256(2424), 1616, 1212, 1077, 808, 646, 538, 461, 404, 346, 269, 193, 4444, 1112, 4444];

        forest = new Forest(payTable, probability, betLimit, 3, 5, 1 ether);

        (bool success,) = payable(forest).call{value: 1000 ether}("");
        assertTrue(success);

        owner = new User(forest);
        alice = new User(forest);
        (bool success1,) = payable(alice).call{value: 1000 ether}("");
        assertTrue(success1);

        forest.transferOwnership(address(owner));

        hevm.roll(1);
    }

    function test_start_round() public {
        owner.notifyStartRound();

        hevm.roll(block.number + 1);

        uint roundId;
        bool resolved;
        uint startBlock;

        (resolved, roundId, startBlock) = forest.history(1);

        assertEq(forest.roundId(), 1);
        assertEq(roundId, 1);
        assertTrue(!resolved);
        assertEq(startBlock, block.number - 1);
    }


    function test_restart_round() public {
        owner.notifyStartRound();
        hevm.roll(block.number + 1);

        try owner.notifyStartRound() {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "current round has not end yet.");
        }
    }


    function test_bet() public {
        owner.notifyStartRound();

        hevm.roll(block.number + 1);

        uint256[15] memory betInfo;
        for (uint256 i = 0; i < 15; i++) {
            betInfo[i] = 1 ether;
        }

        alice.bet(betInfo);

        hevm.roll(block.number + 1);

        assertEq(address(alice).balance, (1000 - 15) * 1 ether);
        assertEq(address(forest).balance, (1000 + 15) * 1 ether);
    }


    function test_bet_after_bet_time() public {
        test_bet();

        hevm.roll(block.number + 3);

        uint256[15] memory betInfo;
        for (uint256 i = 0; i < 15; i++) {
            betInfo[i] = 1 ether;
        }

        try alice.bet(betInfo) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "not bet time.");
        }
    }


    function test_payout() public {
        test_bet();

        hevm.roll(block.number + 5);
        forest.executeEntropyForTest(block.number, 20202020200342);

        assertEq(address(alice).balance, 996 ether);

        hevm.roll(block.number + 1);

        bool resolved;
        (resolved, , ) = forest.history(1);

        assertTrue(resolved);
    }


    function test_overflow() public {
        owner.notifyStartRound();

        hevm.roll(block.number + 1);

        uint256[15] memory betInfo;
        for (uint256 i = 0; i < 15; i++) {
            betInfo[i] = 1 ether;
        }

        betInfo[0] = 2 ** 256 - 12 * 1 ether;

        try alice.bet(betInfo) {
            emit log("overflow need to fix");
            fail();
        } catch Error(string memory error) {
            assertEq(error, "exceed limit.");
        }
    }


    function test_totalLiabilities() public {
        test_bet();

        assertGt(forest.totalLiabilities(), 0);

        hevm.roll(block.number + 5);

        forest.executeEntropyForTest(block.number, 20202020200342);

        assertEq(forest.totalLiabilities(), 0);
    }


    function test_multi_player() public {
        uint256 testCount = 10;
        User[] memory players = new User[](testCount);
        for (uint256 i = 0; i < testCount; i++) {
            players[i] = new User(forest);
            payable(address(players[i])).transfer(1000 ether);
        }

        owner.notifyStartRound();
        hevm.roll(block.number + 1);

        uint256[15] memory betInfo;
        for(uint256 i = 0; i < 15; i++) {
            betInfo[i] = 1 ether;
        }

        for (uint256 i = 0; i < testCount; i++) {
            players[i].bet(betInfo);
        }

        assertEq(address(forest).balance, (15 * testCount + 1000) * 1 ether);
    }


    function test_over_total_liability() public {
        owner.notifyStartRound();
        hevm.roll(block.number + 1);

        uint256[15] memory betInfo;
        betInfo[11] = 2 ether;

        for (uint i = 0; i < 10; i++) {
            alice.bet(betInfo);
        }

        try alice.bet(betInfo) {
            assertEq(forest.totalLiabilities(), address(forest).balance);
            fail();
        } catch Error(string memory error) {
            assertEq(error, "contract does not have enough free balance to accept entry.");
        }
    }


    function test_with_insufficient_value() public {
        owner.notifyStartRound();
        hevm.roll(block.number + 1);

        uint256[15] memory betInfo;
        betInfo[11] = 2 ether;

        try alice.betWithValue(betInfo, 1 ether) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "bet amount not match pay amount.");
        }
    }


    function test_replay_attack() public {
        AbnormalUser bob = new AbnormalUser(forest);
        (bool success, ) = payable(address(bob)).call{value: 1000 ether}("");
        assertTrue(success);

        owner.notifyStartRound();
        hevm.roll(block.number + 1);

        uint256[15] memory betInfo;
        betInfo[3] = 2 ether;
        bob.bet(betInfo);
        alice.bet(betInfo);

        hevm.roll(block.number + 6);

        forest.executeEntropyForTest(block.number, 20202020200342);

        assertEq(address(alice).balance, 1016 ether);
        assertEq(address(bob).balance, 998 ether);
    }


    function test_roll_round() public {
        for (uint256 i = 0; i < 10; i++) {
            owner.notifyStartRound();
            hevm.roll(block.number + 1);

            uint[15] memory betInfo;
            betInfo[3] = 2 ether;
            alice.bet(betInfo);

            hevm.roll(block.number + 5);
            forest.executeEntropyForTest(block.number, 20202020200342);

            hevm.roll(block.number + 1);

            uint256 curRoundId = forest.roundId();
            (bool resolved, uint256 roundId,) = forest.history(curRoundId);
            assertTrue(resolved);
            assertEq(roundId, curRoundId);
            assertEq(roundId, i + 1);
        }
    }

}