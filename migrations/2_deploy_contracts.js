// var ConvertLib = artifacts.require("./ConvertLib.sol");
var dVPN = artifacts.require("./dVPN.sol");

module.exports = function(deployer) {
  // deployer.deploy(ConvertLib);
  // deployer.link(ConvertLib, dVPN);
  deployer.deploy(dVPN);
};
