// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

//#NOTE this is here for convenience.  Use this for REMIX IDE
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.3.2/contracts/access/Ownable.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.3.2/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./RandomConsumerBase.sol";

struct Entry {
    address payable player;
    uint256[] picks;
    uint256 value;
    uint256 maxPayout;
}

struct Rate {
    uint256 mul;
    uint256 div;
}

struct Round {
    Entry[] entries;
    bool resolved;
}

contract Keno is Context, Ownable, RandomConsumerBase {
    event Result(uint256 round, uint256[20] draw);
    event NewEntry(uint256 indexed round, address indexed player);
    event EntryWins(uint256 indexed round, address player, uint256[] spots, bool[] hits, uint256 payout);
        
    //How many blocks before draw
    uint256 public constant DRAW_RATE = 1;
    uint256 public constant SPOTS = 5;
	uint256 public constant MINIMUM_PLAY = 1 ether;
        
    //Fixed size game rules
    mapping(uint256 => Rate[]) _payTable;

    mapping(uint256 => Round) _rounds;
    uint256 public totalLiabilities;
        
	// https://masslottery.com/games/draw-and-instants/keno/how-to-play
    constructor() {
        // 1 Spot Payout, 1 = $2.5
        _payTable[0].push(Rate(0,1));
        _payTable[0].push(Rate(5,2));

        // 2 Spot Payout, 1 = $1 ; 2 = $5
        _payTable[1].push(Rate(0,1));
        _payTable[1].push(Rate(1,1));
        _payTable[1].push(Rate(5,1));

        // 3 Spot Payout, 2 = $2.5 ; 3 = $25
        _payTable[2].push(Rate(0,1));
        _payTable[2].push(Rate(0,1));
        _payTable[2].push(Rate(5,2));
        _payTable[2].push(Rate(25,1));

        // 4 Spot Payout, 2 = $1 ; 3 = $4 ; 4 = $100
        _payTable[3].push(Rate(0,1)); 
        _payTable[3].push(Rate(0,1)); 
        _payTable[3].push(Rate(1,1));
        _payTable[3].push(Rate(4,1));
        _payTable[3].push(Rate(100,1));

        // 5 Spot Payout, 3 = $1 ; 4 = $4 ; 5 = $100
        _payTable[4].push(Rate(0,1)); 
        _payTable[4].push(Rate(0,1)); 
        _payTable[4].push(Rate(0,1));
        _payTable[4].push(Rate(1,1));
        _payTable[4].push(Rate(4,1));
        _payTable[4].push(Rate(100,1));
    }
        
    receive() external payable { }

    function executeImpl(uint256 forBlock, uint256 entropy) internal virtual override  {
        // only draw results at the specified block draw rate
        if (forBlock % DRAW_RATE != 0) return;
        uint256 roundNumber = forBlock / DRAW_RATE;
            
        uint256[20] memory drawing = draw(forBlock, entropy);
            
        Round storage currentRound = _rounds[roundNumber];
        require(!currentRound.resolved, "round has ended.");

        //#FIXME naive implementation.  It would be nice to be able to return a drawing map, but
        // solidity doesn't support it.
        for(uint256 i = 0; i < currentRound.entries.length; i++){
            Entry memory entry = currentRound.entries[i];
            uint256 spots = entry.picks.length;
            bool[] memory hits = new bool[](spots);
			uint256 hitsCounter;
			
            for(uint256 j = 0; j < spots; j++){
                uint256 pick = entry.picks[j];
        
                for(uint256 k = 0; k < drawing.length; k++) {
                    uint256 drawNumber = drawing[k];
					if (drawNumber == pick) {
						hits[j] = true;
						hitsCounter++;
					}
                }
            }
                
            uint256 payout;
            if (hitsCounter == spots) {
                // save some gas
                payout = entry.maxPayout;
            } else {
                payout = calculatePayout(spots, hitsCounter, entry.value);
            }
            if (payout > 0) {
                // https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/
                (bool success, ) = entry.player.call{value: payout}("");
                require(success, "payout failed.");
                //update liabilities
                totalLiabilities -= payout;
                emit EntryWins(roundNumber, entry.player, entry.picks, hits, payout);
            }
        }
            
        emit Result(roundNumber, drawing);
    }
        
    function calculatePayout(uint256 spotKind, uint256 hits, uint256 value) public view returns (uint256) {
        require(spotKind < SPOTS, "spots not supported.");
		require(hits <= spotKind, "cannot have more hits than spots.");
        
        Rate[] storage rates = _payTable[spotKind - 1];
        Rate storage rate = rates[hits];
        return (rate.mul * value) / rate.div;
    }
        
    //#NOTE this is not audited!
    function draw(uint256 roundNumber, uint256 entropy) public pure returns (uint256[20] memory) {
        //seed the number set
        uint256[80] memory numbers;
        for(uint256 i = 0; i < numbers.length; i++) {
            numbers[i]=i+1;
        }

        //Fisher-Yate's shuffle
        uint256[20] memory picks;
        for (uint256 i = 0; i < 20; i++) {
            uint256 n = i + uint256(keccak256(abi.encodePacked(roundNumber,entropy,i))) % (numbers.length - i);
            picks[i] = numbers[n];
            numbers[n] = numbers[i];
        }
        return picks;
    }

    function play(uint256 forBlock, uint256[] memory numbers) public payable {
        require(forBlock % DRAW_RATE == 0, "invalid round number.");
        require(msg.value >= MINIMUM_PLAY, "minimum play value not met.");
        require(numbers.length > 0 && numbers.length < SPOTS, "unsupported spot kind.");
        
        uint256 roundNumber = forBlock / DRAW_RATE;
        Round storage round = _rounds[roundNumber / DRAW_RATE];
        require(!round.resolved, "round has ended.");

        uint256 maxPayout = calculatePayout(numbers.length, numbers.length, msg.value);
        require(maxPayout < address(this).balance - totalLiabilities, "contract does not have enough free balance to accept entry.");
        
        for (uint256 i=0; i< numbers.length; i++) {
            uint256 number = numbers[i];
            require(number > 0 && number <= 80, "selected number is out of game range");
        }
        round.entries.push(Entry(payable(_msgSender()), numbers, msg.value, maxPayout));
        totalLiabilities += maxPayout;
        emit NewEntry(roundNumber, _msgSender());
    }
        
    function getPaytableFor(uint256 spotKind) public view returns (Rate[] memory) {
        require(spotKind <= SPOTS, "spots not supported.");
        return _payTable[spotKind];
    }
        
    function withdraw(address payable to, uint256 amount) public onlyOwner {
        // This forwards all available gas. Be sure to check the return value!
        require(amount > 0, "invalid withdraw amount.");
        (bool success, ) = to.call{value: amount}("");
        require(success, "withdraw failed.");
    }
}
