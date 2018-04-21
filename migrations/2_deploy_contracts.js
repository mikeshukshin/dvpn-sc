// var ConvertLib = artifacts.require("./ConvertLib.sol");
let dVPN = artifacts.require("./dVPN.sol");
let Money = artifacts.require("./Money.sol");

module.exports = function(deployer) {
  // deployer.deploy(ConvertLib);
  // deployer.link(ConvertLib, dVPN);
  deployer.deploy(dVPN);
  deployer.deploy(Money);
};
