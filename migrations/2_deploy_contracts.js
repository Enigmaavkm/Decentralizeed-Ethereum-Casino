var CastYourVote = artifacts.require("./CastYourVote.sol");

module.exports = function(deployer) {
  deployer.deploy(CastYourVote,"User1");
  
};
