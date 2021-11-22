// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;
import "ds-test/test.sol";

import "../../Keno.sol";
import "./Hevm.sol";

contract User {
    Keno internal keno;

    constructor(address _keno) {
        keno = Keno(_keno);
    }

    function mint(uint256 num) public {
//       keno.play{ value: price }(address(this), num);
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

        owner = new User(address(keno));
        alice = new User(address(keno));
        bob = new User(address(keno));

        keno.transferOwnership(address(owner));
    }
}
