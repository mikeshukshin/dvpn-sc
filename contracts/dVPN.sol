pragma solidity ^0.4.18;

//import "./ConvertLib.sol";

contract dVPN {
	struct Server {
		uint ip;
		uint port;
		uint256 pricePerHour;
		uint listPointer;
	}

	mapping(address => Server) private servers;
	address[] private serverAddresses;

	function serverAnnounced(address entityAddress) public view returns(bool) {
		if(serverAddresses.length == 0) return false;
		return (serverAddresses[servers[entityAddress].listPointer] == entityAddress);
	}

	function getServerCount() public view returns(uint){
		return serverAddresses.length;
	}

	function getServer(uint index) public view returns(uint ip, uint port, uint256 pricePerHour){
		assert(index < serverAddresses.length); // index out of boundaries
		return (servers[serverAddresses[index]].ip, servers[serverAddresses[index]].port, servers[serverAddresses[index]].pricePerHour); // simplier?
	}

	function announceServer(uint ip, uint port, uint256 pricePerHour) public returns (uint){
		assert(!serverAnnounced(tx.origin)); // server already announced
		servers[tx.origin] = Server(ip, port, pricePerHour, serverAddresses.push(tx.origin) - 1);
		return serverAddresses.length;
	}

	function deannounceServer() public{
		assert(serverAnnounced(tx.origin)); // server isn't announced

		uint indexToDelete = servers[tx.origin].listPointer;
		address keyToMove = serverAddresses[serverAddresses.length-1];

		delete servers[tx.origin];
		serverAddresses[indexToDelete] = keyToMove;
		servers[keyToMove].listPointer = indexToDelete;
		serverAddresses.length--;
	}
}
