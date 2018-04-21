var dVPN = artifacts.require("./dVPN.sol");

contract('dVPN', function (accounts) {
    var testIp = 1, testPort = 2, testPrice = 3;

    it("should not have servers initially", function () {
        return dVPN.deployed().then(function (instance) {
            return instance.getServerCount.call();
        }).then(function (count) {
            assert.equal(count.valueOf(), 0, "some servers are present initially");
        });
    });

    it("should announce server", function () {
        var _instance, account = accounts[0];

        return dVPN.deployed().then(function (instance) {
            _instance = instance;
            return instance.serverAnnounced.call(account);
        }).then(function (result) {
            assert.equal(result.valueOf(), false, "server is announced initially");
        }).then(function () {
            return _instance.announceServer(testIp, testPort, testPrice, {from: account});
        }).then(function () {
            return _instance.serverAnnounced.call(account);
        }).then(function (result) {
            assert.equal(result.valueOf(), true, "server isn't announced");
        }).then(function () {
            return _instance.getServerCount.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 1, "server count isn't updated");
        }).then(function () {
            return _instance.getServer.call(0);
        }).then(function (result) {
            assert.equal(result[0].valueOf(), testIp, "server ip differs");
            assert.equal(result[1].valueOf(), testPort, "server port differs");
            assert.equal(result[2].valueOf(), testPrice, "server price differs");
        });
    });

    it("should deannounce server", function () {
        var _instance, account = accounts[0];

        return dVPN.deployed().then(function (instance) {
            _instance = instance;
            return instance.serverAnnounced.call(account);
        }).then(function (result) {
            assert.equal(result.valueOf(), true, "server is not announced initially");
        }).then(function () {
            return _instance.deannounceServer({from: account});
        }).then(function () {
            return _instance.serverAnnounced.call(account);
        }).then(function (result) {
            assert.equal(result.valueOf(), false, "server is still announced");
        });
    });
});
