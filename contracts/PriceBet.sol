// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

/**
 * @title PriceBet
 * @notice A simple price prediction betting contract using Pyth Network price feeds
 * @dev Users can bet on whether a price will go up or down within a time window
 */
contract PriceBet {
    IPyth public immutable pyth;
    bytes32 public immutable priceFeedId;
    
    struct Bet {
        address bettor;
        bool prediction; // true = up, false = down
        uint256 amount;
        uint256 timestamp;
        uint256 targetPrice;
        bool resolved;
        bool won;
    }
    
    mapping(uint256 => Bet) public bets;
    mapping(address => uint256[]) public userBets;
    uint256 public betCounter;
    uint256 public constant BET_DURATION = 5 minutes; // 5 minute betting window
    uint256 public constant MIN_BET = 0.001 ether;
    
    event BetPlaced(
        uint256 indexed betId,
        address indexed bettor,
        bool prediction,
        uint256 amount,
        uint256 targetPrice
    );
    
    event BetResolved(
        uint256 indexed betId,
        address indexed bettor,
        bool won,
        uint256 payout
    );
    
    constructor(address _pyth, bytes32 _priceFeedId) {
        pyth = IPyth(_pyth);
        priceFeedId = _priceFeedId;
    }
    
    /**
     * @notice Place a bet on price direction
     * @param _prediction true for up, false for down
     */
    function placeBet(bool _prediction) external payable {
        require(msg.value >= MIN_BET, "Bet too small");
        require(msg.value <= 1 ether, "Bet too large");
        
        // Get current price from Pyth
        PythStructs.Price memory currentPrice = pyth.getPriceNoOlderThan(
            priceFeedId,
            BET_DURATION
        );
        
        uint256 currentPriceValue = uint256(uint64(currentPrice.price));
        
        uint256 betId = betCounter++;
        bets[betId] = Bet({
            bettor: msg.sender,
            prediction: _prediction,
            amount: msg.value,
            timestamp: block.timestamp,
            targetPrice: currentPriceValue,
            resolved: false,
            won: false
        });
        
        userBets[msg.sender].push(betId);
        
        emit BetPlaced(betId, msg.sender, _prediction, msg.value, currentPriceValue);
    }
    
    /**
     * @notice Resolve a bet after the time window
     * @param _betId The bet ID to resolve
     * @param _priceUpdateData Pyth price update data
     */
    function resolveBet(uint256 _betId, bytes[] calldata _priceUpdateData) external {
        Bet storage bet = bets[_betId];
        require(!bet.resolved, "Bet already resolved");
        require(
            block.timestamp >= bet.timestamp + BET_DURATION,
            "Bet window not closed"
        );
        
        // Update Pyth price
        uint256 fee = pyth.getUpdateFee(_priceUpdateData);
        pyth.updatePriceFeeds{value: fee}(_priceUpdateData);
        
        // Get new price
        PythStructs.Price memory newPrice = pyth.getPriceNoOlderThan(
            priceFeedId,
            BET_DURATION
        );
        uint256 newPriceValue = uint256(uint64(newPrice.price));
        
        // Determine if bet won
        bool priceWentUp = newPriceValue > bet.targetPrice;
        bet.won = (bet.prediction == priceWentUp);
        bet.resolved = true;
        
        // Payout if won (2x for now, simple implementation)
        if (bet.won) {
            uint256 payout = bet.amount * 2;
            require(address(this).balance >= payout, "Insufficient contract balance");
            payable(bet.bettor).transfer(payout);
            emit BetResolved(_betId, bet.bettor, true, payout);
        } else {
            emit BetResolved(_betId, bet.bettor, false, 0);
        }
    }
    
    /**
     * @notice Get user's active bets
     */
    function getUserBets(address _user) external view returns (uint256[] memory) {
        return userBets[_user];
    }
    
    /**
     * @notice Get bet details
     */
    function getBet(uint256 _betId) external view returns (Bet memory) {
        return bets[_betId];
    }
    
    /**
     * @notice Get current price from Pyth
     */
    function getCurrentPrice() external view returns (uint256) {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            priceFeedId,
            BET_DURATION
        );
        return uint256(uint64(price.price));
    }
    
    // Allow contract to receive ETH for Pyth updates
    receive() external payable {}
}

