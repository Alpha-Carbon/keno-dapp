// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.6;

import "ds-test/test.sol";

import "./KenoDapp.sol";

contract KenoDappTest is DSTest {
    Keno dapp;

    function setUp() public {
        dapp = new Keno();
    }

    function testFail_basic_sanity() public {
        assertTrue(false);
    }

    function test_basic_sanity() public {
        assertTrue(true);
    }
}
