// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

//#NOTE this is here for convenience.  Use this for REMIX IDE
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.3.2/contracts/access/Ownable.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.3.2/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "./RandomConsumerBase.sol";

import "ds-test/test.sol";

    struct Entry {
        address payable player;
        uint256[15] betInfo;
    }

    struct Round {
        bool resolved;
        uint256 roundId;
        uint256 startBlock;
        Entry[] entries;
        uint256[] result;
    }

contract Forest is Context, Ownable, RandomConsumerBase {
    event Result(uint256 indexed round, uint256[] draw);
    event NewEntry(uint256 indexed round, address indexed player, uint256[15] betInfo);
    event EntryWins(uint256 indexed round, address player, uint256 payout);
    event PayoutError(address player, uint256 payout);

    uint256[15] _payTable;
    uint256[15] _betLimit;
    uint256[15] _probability;
    uint256 _animalCount = 12;

    // how many blocks after _startBlock people can bet
    uint256 _betBlocks;
    // how many blocks after _startBlock payout
    uint256 _payoutBlocks;
    // the minimum amount for every bet action
    uint256 _minBetAmount;

    uint256 public roundId;
    mapping(uint => Round) public history;
    uint256 public totalLiabilities;

    uint8 private entranceCounter = 0;

    constructor(uint256[15] memory payTable, uint256[15] memory probability, uint256[15] memory betLimit, uint256 betBlocks, uint256 payoutBlocks, uint256 minBet) {
        _betBlocks = betBlocks;
        _payoutBlocks = payoutBlocks;
        _minBetAmount = minBet;

        _payTable = payTable;
        _betLimit = betLimit;
        _probability = probability;
    }

    receive() external payable {}


    modifier entranceGuard() {
        entranceCounter += 1;
        require(entranceCounter == 1, "That is not allowed");
        _;
        entranceCounter = 0;
    }


    function executeImpl(uint256 forBlock, uint256 entropy) internal virtual override entranceGuard() {
        require(roundId > 0, "game are not start.");
        Round storage currentRound = history[roundId];
        require(!currentRound.resolved, "round has ended.");
        require(block.number > currentRound.startBlock + _payoutBlocks, "too early to payout.");

        uint animalId;
        uint normalId;
        (animalId, normalId) = draw(forBlock, entropy);

        for (uint256 i = 0; i < currentRound.entries.length; i++) {
            Entry memory entry = currentRound.entries[i];

            uint256 payout = entry.betInfo[animalId] * _payTable[animalId];
            payout += entry.betInfo[normalId] * _payTable[normalId];

            if (payout > 0) {
                emit EntryWins(currentRound.roundId, entry.player, payout);
                if (!entry.player.send(payout)) {
                    emit PayoutError(address(entry.player), payout);
                }
            }
        }

        currentRound.resolved = true;
        currentRound.result = [animalId, normalId];
        totalLiabilities = 0;
        emit Result(currentRound.roundId, currentRound.result);
    }


    function calculatePayout(uint256[15] memory betInfo) public view returns (uint256) {
        uint256 animalPayout = 0;
        uint normalPayout = 0;
        for (uint256 i = 0; i < _payTable.length; i++) {
            if (betInfo[i] > 0) {
                uint256 payout = betInfo[i] * _payTable[i];
                if (i < _animalCount) {
                    if (payout > animalPayout) {
                        animalPayout = payout;
                    }
                } else {
                    if (payout > normalPayout) {
                        normalPayout = payout;
                    }
                }
            }
        }

        return animalPayout + normalPayout;
    }


    //#NOTE this is not audited!
    function draw(uint256 forBlock, uint256 entropy) public view returns (uint256 animalId, uint256 normalId){
        uint256 sum = 0;
        uint256 randomNum = uint256(keccak256(abi.encodePacked(forBlock, entropy))) % 10000;
        for (uint256 i = 0; i < _animalCount; i++) {
            sum += _probability[i];
            if (randomNum < sum) {
                animalId = i;
                break;
            }
        }

        sum = 0;
        randomNum = uint256(keccak256(abi.encodePacked(entropy, entropy + forBlock, forBlock))) % 10000;
        for (uint256 j = _animalCount; j < _probability.length; j++) {
            sum += _probability[j];
            if (randomNum < sum) {
                normalId = j;
                break;
            }
        }

        return (animalId, normalId);
    }


    function bet(uint256[15] memory betInfo) public payable {
        require(roundId > 0, "game are not start.");
        require(msg.value >= _minBetAmount, "not meet minimum bet amount.");

        Round storage currentRound = history[roundId];
        require(!currentRound.resolved, "round has ended.");
        require(block.number > currentRound.startBlock && block.number <= currentRound.startBlock + _betBlocks, "not bet time.");

        uint256 planBetAmount = 0;
        for (uint256 i = 0; i < _betLimit.length; i++) {
            require(betInfo[i] <= _betLimit[i] * 1 ether, "exceed limit.");
            planBetAmount += betInfo[i];
        }

        require(planBetAmount == msg.value, "bet amount not match pay amount.");
        uint256 maxPayout = calculatePayout(betInfo);

        require(maxPayout < address(this).balance - totalLiabilities,
            "contract does not have enough free balance to accept entry.");

        currentRound.entries.push(Entry(payable(_msgSender()), betInfo));
        totalLiabilities += maxPayout;
        emit NewEntry(currentRound.roundId, _msgSender(), betInfo);
    }


    function startNewRound() public onlyOwner {
        if (roundId > 0) {
            require(history[roundId].resolved, "current round has not end yet.");
        }

        roundId += 1;
        Round storage currentRound = history[roundId];
        currentRound.roundId = roundId;
        currentRound.startBlock = block.number;
    }


    function withdraw(address payable to, uint256 amount) public onlyOwner {
        // This forwards all available gas. Be sure to check the return value!
        require(amount > 0, "invalid withdraw amount.");
        (bool success,) = to.call{value : amount}("");
        require(success, "withdraw failed.");
    }
}
