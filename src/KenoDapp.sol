// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./RandomConsumerBase.sol";

struct Entry {
    address payable player;
    uint256[] picks;
    uint256 value;
}

struct Rate {
    uint256 mul;
    uint256 div;
}

contract Keno is Context, Ownable, RandomConsumerBase {
        event Result(uint256 round, uint256[20] draw);
        event NewEntry(uint256 indexed round, address indexed player);
        event EntryWins(uint256 indexed round, address player, uint256[] spots, bool[] hits, uint256 payout);
        
        //How many blocks before draw
        uint256 public constant DRAW_RATE = 1;
        uint256 public constant SPOTS = 5;
        
        //Fixed size game rules
        mapping(uint256 => Rate[]) payTable;

        Entry[] public entries;
        uint256 public currentRound;
        uint256 public roundStartTime;
        
		// https://masslottery.com/games/draw-and-instants/keno/how-to-play
        constructor() {
            // 1 Spot Payout, 1 = $2.5
            payTable[0].push(Rate(0,1));
            payTable[0].push(Rate(5,2));

            // 2 Spot Payout, 1 = $1 ; 2 = $5
            payTable[1].push(Rate(0,1));
            payTable[1].push(Rate(1,1));
            payTable[1].push(Rate(5,1));

            // 3 Spot Payout, 2 = $2.5 ; 3 = $25
            payTable[2].push(Rate(0,1));
            payTable[2].push(Rate(0,1));
            payTable[2].push(Rate(5,2));
            payTable[2].push(Rate(25,1));

            // 4 Spot Payout, 2 = $1 ; 3 = $4 ; 4 = $100
            payTable[3].push(Rate(0,1)); 
            payTable[3].push(Rate(0,1)); 
            payTable[3].push(Rate(1,1));
            payTable[3].push(Rate(4,1));
            payTable[3].push(Rate(100,1));

            // 5 Spot Payout, 3 = $1 ; 4 = $4 ; 5 = $100
            payTable[4].push(Rate(0,1)); 
            payTable[4].push(Rate(0,1)); 
            payTable[4].push(Rate(0,1));
            payTable[4].push(Rate(1,1));
            payTable[4].push(Rate(4,1));
            payTable[4].push(Rate(100,1));
        }

        function receiveRandomImpl(uint256, uint256 entropy) internal virtual override  {
            //#FIXME implement a minimum / maximum value for entry
            //#FIXME decide how to handle the forBlock variable
            
            // only draw results at the specified block draw rate
            if (block.number % DRAW_RATE != 0) return;
            
            uint256[20] memory drawing = draw(currentRound, entropy);
            
            //#FIXME naive implementation.  It would be nice to be able to return a drawing map, but
            // solidity doesn't support it.
            for(uint256 i = 0; i < entries.length; i++){
                Entry memory entry = entries[i];
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
                
                uint256 payout = calculatePayout(spots, hitsCounter, entry.value);
                if (payout > 0) {
                    entry.player.transfer(payout);
                    emit EntryWins(currentRound, entry.player, entry.picks, hits, payout);
                }
            }
            
            emit Result(currentRound, drawing);
            
            //reset states
            roundStartTime = block.timestamp;
            currentRound++;
            delete entries;
        }
        
        function calculatePayout(uint256 spotKind, uint256 hits, uint256 val) public view returns (uint256) {
            require(spotKind < SPOTS, "spots not supported");
			require(hits <= spotKind, "cannot have more hits than spots");
            
            Rate[] storage rates = payTable[spotKind - 1];
            uint256 total = 0;
            for (uint256 i = 0; i < hits + 1; i++) {
                Rate storage rate = rates[i];
                //#FIXME use safemath!
                total += (rate.mul * val) / rate.div;
            }
            return total;
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
        
        function play(uint256[] memory numbers) public payable {
            uint256 spotKind = numbers.length;
            require(spotKind > 0 && spotKind < SPOTS, "must have numbers to play and be a supported spot");
            require(potSufficientForSpot(spotKind, msg.value), "contract does not have enough balance to accept entry");
            
            for (uint256 i=0; i< numbers.length; i++) {
                uint256 number = numbers[i];
                require(number > 0 && number <= 80, "selected number is out of game range");
            }
            entries.push(Entry(payable(_msgSender()), numbers, msg.value));
            emit NewEntry(currentRound, _msgSender());
        }
        
        function potSufficientForSpot(uint256 spotKind, uint256 value) public view returns (bool) {
            return calculatePayout(spotKind, spotKind, value) <= address(this).balance;
        }
        
        function getPaytableFor(uint256 spotKind) public view returns (Rate[] memory) {
            require(spotKind <= SPOTS, "spots not supported");
            
            return payTable[spotKind];
        }
}
