let dVPN = artifacts.require("./dVPN.sol");

const BigNumber = web3.BigNumber;

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('dVPN', function (accounts) {
    let testIp = 1, testPort = 2, testConnectionId = 4;
    let serverAddress = accounts[0], clientAddress = accounts[1], thirdPartyAddress = accounts[2];
    const value = new web3.BigNumber(web3.toWei(2, 'ether'));
    const transferValue = new web3.BigNumber(web3.toWei(1, 'ether'));
    const testPrice = new web3.BigNumber(web3.toWei(0.01, 'ether'));
    const testTime = new BigNumber(3600 * 200);
    const rate = new BigNumber(1);
    let instance;

    beforeEach(async function () {
        instance = await dVPN.deployed();
    });

    it("should not have servers initially", function () {
        return dVPN.deployed().then(async function (instance) {
            let count = await instance.getServerCount.call();
            assert.equal(count.valueOf(), 0, "some servers are present initially");
        });
    });

    it("should announce server", async function () {
        let result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), false, "server is announced initially");

        await instance.announceServer(testIp, testPort, testPrice, {from: serverAddress});
        result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), true, "server isn't announced");

        result = await instance.getServerCount.call();
        assert.equal(result.valueOf(), 1, "server count isn't updated");

        result = await instance.getServer.call(0);
        assert.equal(result[0].valueOf(), serverAddress, "server address differs");
        assert.equal(result[1].valueOf(), testIp, "server ip differs");
        assert.equal(result[2].valueOf(), testPort, "server port differs");
        assert.equal(result[3].valueOf(), testPrice, "server price differs");
    });

    it("should start connection", async function () {
        let result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), true, "server is not announced");

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), false, "connection is initially activated");

        await instance.startConnection(testConnectionId, serverAddress, {from: clientAddress});

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), true, "connection is not activated");
    });

    it("should stop connection from client", async function () {
        let result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), true, "connection is not initially activated");

        await instance.stopConnection(testConnectionId, {from: clientAddress});

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), false, "connection is still activated");
    });

    it("should stop connection from server", async function () {
        let testConnectionId = Math.round(Math.random() * 1e9 + 1e9);
        let result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), true, "server is not announced");

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), false, "connection is initially activated");

        await instance.startConnection(testConnectionId, serverAddress, {from: clientAddress});

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), true, "connection is not activated");


        await instance.stopConnection(testConnectionId, {from: serverAddress});

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), false, "connection is still activated");
    });

    it("should deannounce server", async function () {
        let result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), true, "server is not announced");

        await instance.deannounceServer({from: serverAddress});

        result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), false, "server is still announced");
    });

    it("should getConnectionInfo", async function () {
        await await instance.sendTransaction({ value: value, from: clientAddress });
        const moneyAddress = await dVPN.address;
        await instance.announceServer(testIp, testPort, testPrice, {from: serverAddress});
        await instance.startConnection(testConnectionId, serverAddress, {from: clientAddress});
        let result = await instance.getConnectionInfo.call(testConnectionId);
        result.should.be.an('array');
        result[1].should.be.bignumber.equal(testTime);
        await instance.withdraw({from: clientAddress});
    });


    it('should accept payments', async function () {
        await instance.sendTransaction({ value: value, from: clientAddress });
        let balance = await instance.balanceOf.call(clientAddress);
        const expectedValue = rate.mul(value);
        const moneyAddress = await dVPN.address;
        let contractBalance = web3.eth.getBalance(moneyAddress).toNumber();
        balance.should.be.bignumber.equal(expectedValue);
        contractBalance.should.be.bignumber.equal(expectedValue);
    });

    it('should withdraw payments', async function () {
        await instance.withdraw({from: clientAddress});
        let balance = await instance.balanceOf.call(clientAddress);
        const moneyAddress = await dVPN.address;
        let contractBalance = web3.eth.getBalance(moneyAddress);
        balance.should.be.bignumber.equal(0);
        contractBalance.should.be.bignumber.equal(0);
    });

    it('should transfer funds to another address', async function () {
        const instance = await dVPN.deployed();
        await instance.sendTransaction({ value: value, from: clientAddress });
        await instance.transfer(thirdPartyAddress, transferValue, {from: clientAddress});
        let clientBalance = await instance.balanceOf.call(clientAddress);
        const moneyAddress = await dVPN.address;
        let contractBalance = web3.eth.getBalance(moneyAddress);
        let thirdPartyBalance = await instance.balanceOf.call(thirdPartyAddress);
        clientBalance.should.be.bignumber.equal(rate.mul(transferValue));
        contractBalance.should.be.bignumber.equal(rate.mul(value));
        thirdPartyBalance.should.be.bignumber.equal(rate.mul(transferValue));
    });

    it('should transfer funds from one address to another address', async function () {
        await instance.transferFrom(clientAddress, thirdPartyAddress, transferValue, {from: serverAddress});
        let clientBalance = await instance.balanceOf.call(clientAddress);
        const moneyAddress = await dVPN.address;
        let contractBalance = web3.eth.getBalance(moneyAddress);
        let thirdPartyBalance = await instance.balanceOf.call(thirdPartyAddress);
        clientBalance.should.be.bignumber.equal(0);
        contractBalance.should.be.bignumber.equal(rate.mul(value));
        thirdPartyBalance.should.be.bignumber.equal(rate.mul(value));
    });

    it('balanceOf should return balance of user', async function () {
        let thirdPartyBalance = await instance.balanceOf.call(thirdPartyAddress);
        thirdPartyBalance.should.be.bignumber.equal(rate.mul(value));
    });
});
