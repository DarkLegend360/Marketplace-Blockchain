const MarketPlace = artifacts.require("MarketPlace");

module.exports = (deployer) => {
    deployer.deploy(MarketPlace);
};
