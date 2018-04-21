var dVPN = artifacts.require("./dVPN.sol");

contract('dVPN', function (accounts) {
    var testIp = 1, testPort = 2, testPrice = 3, testConnectionId = 4;
    var serverAddress = accounts[0], clientAddress = accounts[1], thirdPartyAddress = accounts[2];

    it("should not have servers initially", function () {
        return dVPN.deployed().then(async function (instance) {
            let count = await instance.getServerCount.call();
            assert.equal(count.valueOf(), 0, "some servers are present initially");
        });
    });

    it("should announce server", async function () {
        let instance = await dVPN.deployed();
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
        let instance = await dVPN.deployed();
        let result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), true, "server is not announced");

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), false, "connection is initially activated");

        await instance.startConnection(testConnectionId, serverAddress, {from: clientAddress});

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), true, "connection is not activated");
    });

    it("should stop connection from client", async function () {
        let instance = await dVPN.deployed();
        let result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), true, "connection is not initially activated");

        await instance.stopConnection(testConnectionId, {from: clientAddress});

        result = await instance.isConnected.call(testConnectionId);
        assert.equal(result.valueOf(), false, "connection is still activated");
    });

    it("should stop connection from server", async function () {
        let testConnectionId = Math.round(Math.random() * 1e9 + 1e9);
        let instance = await dVPN.deployed();
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
        let instance = await dVPN.deployed();
        let result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), true, "server is not announced");

        await instance.deannounceServer({from: serverAddress});

        result = await instance.serverAnnounced.call(serverAddress);
        assert.equal(result.valueOf(), false, "server is still announced");
    });
});
