// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

import "./utils/KenoTest.sol";

contract KenoViewsTest is KenoTest {
    uint256 constant MAX_UINT = 2 ** 256 - 1;

	function testContractCreationBlock() public {
        assertEq(keno.startBlock(), 5);
	}

    function testOneSpotPayout() public {
        uint256 payout = keno.calculatePayout(1, 0, 3);
        assertEq(payout, 0);

        payout = keno.calculatePayout(1, 1, 1);
        // Fixme maybe some problem here
        assertEq(payout, 2);
    }

    function testTwoSpotPayout() public {
        uint256 payout = keno.calculatePayout(2, 0, 3);
        assertEq(payout, 0);

        payout = keno.calculatePayout(2, 1, 3);
        assertEq(payout, 3);

        payout = keno.calculatePayout(2, 2, 3);
        assertEq(payout, 15);
    }

    function testThreeSpotPayout() public {
        uint256 payout = keno.calculatePayout(3, 0, 3);
        assertEq(payout, 0);

        payout = keno.calculatePayout(3, 1, 3);
        assertEq(payout, 0);

        // Fixme maybe some problem with discarding decimal
        payout = keno.calculatePayout(3, 2, 3);
        assertEq(payout, 7);

        payout = keno.calculatePayout(3, 3, 3);
        assertEq(payout, 75);
    }


    function testFourSpotPayout() public {
        uint256 payout = keno.calculatePayout(4, 0, 3);
        assertEq(payout, 0);

        payout = keno.calculatePayout(4, 1, 3);
        assertEq(payout, 0);

        payout = keno.calculatePayout(4, 2, 3);
        assertEq(payout, 3);

        payout = keno.calculatePayout(4, 3, 3);
        assertEq(payout, 12);

        payout = keno.calculatePayout(4, 4, 3);
        assertEq(payout, 300);
    }


    function testFiveSpotNonePayout() public {
        uint256 payout = keno.calculatePayout(5, 0, 3);
        assertEq(payout, 0);

        payout = keno.calculatePayout(5, 1, 3);
        assertEq(payout, 0);

        payout = keno.calculatePayout(5, 2, 3);
        assertEq(payout, 0);

        payout = keno.calculatePayout(5, 3, 3);
        assertEq(payout, 3);

        payout = keno.calculatePayout(5, 4, 3);
        assertEq(payout, 12);

        payout = keno.calculatePayout(5, 5, 3);
        assertEq(payout, 300);
    }
}

contract KenoTransactions is KenoTest {
    function testPlayMinimumNotMet() public {
	    payable(address(alice)).transfer(100 ether);

		uint256 forBlock = keno.startBlock() + 1;
		uint256[] memory numbers = new uint256[](3);
		numbers[0] = 1;
		numbers[1] = 2;
		numbers[2] = 3;
		// try .1 ether
		try alice.play(forBlock, numbers, 100000000 gwei) { 
			fail(); 
		} catch Error(string memory error) {
		    assertEq(error, "minimum play amount not met.");
		}
    }

    function testPlayForBlockPriorToStartBlock() public {
		assertTrue(false, "UNIMPLEMENTED!");
    }

	function testOwnerWithdraw() public {
		owner.withdraw(1 ether);
		assertEq(address(owner).balance, 1 ether);
		assertEq(address(keno).balance, 999 ether);
	}

	function testNonOwnerWithdraw() public {
		try alice.withdraw(1 ether) { 
			fail(); 
		} catch Error(string memory error) {
		    assertEq(error, "Ownable: caller is not the owner");
		}
	}

    function _testPlayWithInvalidForBlock() public {
        payable(address(alice)).transfer(100 ether);

        uint256[] memory betInfo = new uint256[](3);
        for (uint256 i = 0;  i < 4; i++) {
            betInfo[i] = i + 1;
        }

        try alice.play(0, betInfo, 1 ether) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "invalid round number.");
        }
    }

    function testPlayWithInvalidSpotKind() public {
        payable(address(alice)).transfer(100 ether);

		uint256 forBlock = keno.startBlock() + 32;
        uint256[] memory betInfo = new uint256[](6);
        for (uint256 i = 0;  i < 6; i++) {
            betInfo[i] = i + 1;
        }

        try alice.play(forBlock, betInfo, 1 ether) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "unsupported spot kind.");
        }
    }

    function testReExecuteEntropy() public {
        payable(address(alice)).transfer(100 ether);

		uint256 forBlock = keno.startBlock() + 2;
        uint256[] memory betInfo = new uint256[](4);
        for (uint256 i = 0;  i < 4; i++) {
            betInfo[i] = i + 1;
        }

        alice.play(forBlock, betInfo, 1 ether);
        hevm.roll(2);
        keno.executeEntropyForTest(forBlock, 2758876867868697);

        try keno.executeEntropyForTest(forBlock, 2758876867868697) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "round has ended.");
        }
    }

    function testBet() public {
        payable(address(alice)).transfer(100 ether);

		uint256 forBlock = keno.startBlock() + 2;
        uint256[] memory betInfo = new uint256[](4);
        for (uint256 i = 0;  i < 4; i++) {
            betInfo[i] = i + 1;
        }

        uint256 cur_balance = address(keno).balance;
        alice.play(forBlock, betInfo, 1 ether);
        assertEq(address(keno).balance, cur_balance + 1 ether);
    }


    function testMultiBet() public {
        payable(address(keno)).transfer(10000 ether);
        payable(address(alice)).transfer(2000 ether);

		uint256 forBlock = keno.startBlock() + 3;
        uint256 balance = address(keno).balance;

        for (uint256 j = 0;  j < 1000; j++) {
            uint256[] memory betInfo = new uint256[](1);
            betInfo[0] = j % 80 + 1;

            alice.play(forBlock, betInfo, 1 ether);
        }

        assertEq(address(keno).balance, 1000 ether + balance);
    }


    function testPayout() public {
        payable(address(alice)).transfer(100 ether);

		uint256 forBlock = keno.startBlock() + 2;
        uint256[] memory betInfo = new uint256[](3);
        betInfo[0] = 30;
        betInfo[1] = 48;
        betInfo[2] = 26;

        alice.play(forBlock, betInfo, 1 ether);
        hevm.roll(2);
        keno.executeEntropyForTest(forBlock, 2758876867868697);

        assertEq(address(alice).balance, 99 ether);
    }


    function testMultiPlayerPayout() public{
        uint256 vault_before = address(keno).balance;
        uint256 vault_expect = vault_before;

        uint256 testCount = 40;
		uint256 forBlock = keno.startBlock() + 2;
        User[] memory testUsers = new User[](testCount);

        for(uint256 i = 0; i < testCount; i++) {
            User ano = new User(payable(keno));
            payable(address(ano)).transfer(2 ether);

            testUsers[i] = ano;

            uint256[] memory betInfo = new uint256[](3);
            betInfo[0] = 68;
            betInfo[1] = 44;
            betInfo[2] = 10;

            ano.play(forBlock, betInfo, 1 ether);
            vault_expect = vault_expect + 1 ether;
        }

        hevm.roll(2);
        keno.executeEntropyForTest(forBlock, 2758876867868697);

        for (uint256 j = 0; j < testCount; j++) {
            vault_expect = vault_expect - 25 ether;
            assertEq(address(testUsers[j]).balance, 26 ether);
        }

        assertEq(address(keno).balance, vault_expect);
    }

    function testExceedPayout() public {
        payable(address(alice)).transfer(100 ether);
        uint256 keno_balance = address(keno).balance;
        uint256 bet_amount = keno_balance / 25 + 2 ether;

		uint256 forBlock = keno.startBlock() + 3;
        uint256[] memory betInfo = new uint256[](3);
        betInfo[0] = 30;
        betInfo[1] = 48;
        betInfo[2] = 26;

        try alice.play(forBlock, betInfo, bet_amount) {
            emit log("test exceed payout failed");
            fail();
        } catch Error(string memory error) {
            assertEq(error, "contract does not have enough free balance to accept entry.");
        }

        assertEq(address(keno).balance, keno_balance);
        assertEq(address(alice).balance, 100 ether);
    }
}
