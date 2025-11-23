const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('PriceBet', function () {
  let priceBet;
  let owner;
  let bettor1;
  let mockPyth;

  beforeEach(async function () {
    [owner, bettor1] = await ethers.getSigners();

    // Deploy mock Pyth contract for testing
    // In real tests, you'd use a proper mock or testnet
    const MockPyth = await ethers.getContractFactory('MockPyth');
    mockPyth = await MockPyth.deploy();
    await mockPyth.waitForDeployment();

    const priceFeedId = ethers.id('ETH/USD');

    const PriceBet = await ethers.getContractFactory('PriceBet');
    priceBet = await PriceBet.deploy(
      await mockPyth.getAddress(),
      priceFeedId
    );
    await priceBet.waitForDeployment();
  });

  it('Should allow placing a bet', async function () {
    const betAmount = ethers.parseEther('0.001');
    await expect(
      priceBet.connect(bettor1).placeBet(true, { value: betAmount })
    ).to.emit(priceBet, 'BetPlaced');
  });

  it('Should reject bets below minimum', async function () {
    const betAmount = ethers.parseEther('0.0001');
    await expect(
      priceBet.connect(bettor1).placeBet(true, { value: betAmount })
    ).to.be.revertedWith('Bet too small');
  });
});
