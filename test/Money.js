const Money = artifacts.require("./Money.sol");

const BigNumber = web3.BigNumber;

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('Money', function (accounts) {
    let serverAddress = accounts[0], clientAddress = accounts[1], thirdPartyAddress = accounts[2];
    const value = new web3.BigNumber(web3.toWei(2, 'ether'));
    let instance;


    beforeEach(async function () {
        instance = await Money.deployed();
    });

    it('should accept payments', async function () {
        await instance.sendTransaction({ value: value, from: clientAddress });
        let balance = await instance.balanceOf.call(clientAddress);
        const rate = new BigNumber(1000);
        const expectedValue = rate.mul(value);
        balance.should.be.bignumber.equal(expectedValue);
    });


    // it('should accept payments', async function () {
    //     await instance.sendTransaction({from: serverAddress, value: valueWei});
    //     const MoneyAddress = await Money.address;
    //     assert.equal(web3.eth.getBalance(MoneyAddress).toNumber(), 2e+18);
    //     let result = await instance.balanceOf.call(serverAddress);
    //     console.log(result.toNumber(), value);
    //     assert.equal(result.toNumber(), value, 'balance of sender is equal to value');
    // });
    //
    // it("should not have servers initially", function () {
    //     return dVPN.deployed().then(async function (instance) {
    //         let count = await instance.getServerCount.call();
    //         assert.equal(count.valueOf(), 0, "some servers are present initially");
    //     });
    // });

    // it("should announce server", async function () {
    //     let instance = await dVPN.deployed();
    //     let result = await instance.serverAnnounced.call(serverAddress);
    //     assert.equal(result.valueOf(), false, "server is announced initially");
    //
    //     await instance.announceServer(testIp, testPort, testPrice, {from: serverAddress});
    //     result = await instance.serverAnnounced.call(serverAddress);
    //     assert.equal(result.valueOf(), true, "server isn't announced");
    //
    //     result = await instance.getServerCount.call();
    //     assert.equal(result.valueOf(), 1, "server count isn't updated");
    //
    //     result = await instance.getServer.call(0);
    //     assert.equal(result[0].valueOf(), serverAddress, "server address differs");
    //     assert.equal(result[1].valueOf(), testIp, "server ip differs");
    //     assert.equal(result[2].valueOf(), testPort, "server port differs");
    //     assert.equal(result[3].valueOf(), testPrice, "server price differs");
    // });
    //
    // it("should start connection", async function () {
    //     let instance = await dVPN.deployed();
    //     let result = await instance.serverAnnounced.call(serverAddress);
    //     assert.equal(result.valueOf(), true, "server is not announced");
    //
    //     result = await instance.isConnected.call(testConnectionId);
    //     assert.equal(result.valueOf(), false, "connection is initially activated");
    //
    //     await instance.startConnection(testConnectionId, serverAddress, {from: clientAddress});
    //
    //     result = await instance.isConnected.call(testConnectionId);
    //     assert.equal(result.valueOf(), true, "connection is not activated");
    // });
    //
    // it("should stop connection from client", async function () {
    //     let instance = await dVPN.deployed();
    //     let result = await instance.isConnected.call(testConnectionId);
    //     assert.equal(result.valueOf(), true, "connection is not initially activated");
    //
    //     await instance.stopConnection(testConnectionId, {from: clientAddress});
    //
    //     result = await instance.isConnected.call(testConnectionId);
    //     assert.equal(result.valueOf(), false, "connection is still activated");
    // });
    //
    // it("should stop connection from server", async function () {
    //     let testConnectionId = Math.round(Math.random() * 1e9 + 1e9);
    //     let instance = await dVPN.deployed();
    //     let result = await instance.serverAnnounced.call(serverAddress);
    //     assert.equal(result.valueOf(), true, "server is not announced");
    //
    //     result = await instance.isConnected.call(testConnectionId);
    //     assert.equal(result.valueOf(), false, "connection is initially activated");
    //
    //     await instance.startConnection(testConnectionId, serverAddress, {from: clientAddress});
    //
    //     result = await instance.isConnected.call(testConnectionId);
    //     assert.equal(result.valueOf(), true, "connection is not activated");
    //
    //
    //     await instance.stopConnection(testConnectionId, {from: serverAddress});
    //
    //     result = await instance.isConnected.call(testConnectionId);
    //     assert.equal(result.valueOf(), false, "connection is still activated");
    // });
    //
    // it("should deannounce server", async function () {
    //     let instance = await dVPN.deployed();
    //     let result = await instance.serverAnnounced.call(serverAddress);
    //     assert.equal(result.valueOf(), true, "server is not announced");
    //
    //     await instance.deannounceServer({from: serverAddress});
    //
    //     result = await instance.serverAnnounced.call(serverAddress);
    //     assert.equal(result.valueOf(), false, "server is still announced");
    // });
});
