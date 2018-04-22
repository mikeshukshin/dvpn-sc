// var ConvertLib = artifacts.require("./ConvertLib.sol");
let dVPN = artifacts.require("./dVPN.sol");

module.exports = function(deployer) {
  // deployer.deploy(ConvertLib);
  // deployer.link(ConvertLib, dVPN);
  deployer.deploy(dVPN);
};
