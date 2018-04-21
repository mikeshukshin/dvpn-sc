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

	function getServer(uint index) public view returns(address serverAddress, uint ip, uint port, uint256 pricePerHour){
		assert(index < serverAddresses.length); // index out of boundaries
		return (serverAddresses[index], servers[serverAddresses[index]].ip, servers[serverAddresses[index]].port, servers[serverAddresses[index]].pricePerHour); // simplier?
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


	// connections stuff

	struct Connection {
		uint256 id;
		address clientAddress;
		address serverAddress;
		uint256 pricePerHour;
		uint startedAt;
		uint endedAt;
	}

	mapping(uint256 => Connection) private connections;

	function isConnected(uint256 connectionId) public view returns(bool){
		return connections[connectionId].id != 0 && connections[connectionId].endedAt == 0;
	}

	function startConnection(uint256 connectionId, address serverAddress) public{
		assert(serverAnnounced(serverAddress)); // server isn't announced
		assert(!isConnected(connectionId)); // connection exists

		connections[connectionId] = Connection(
			connectionId,
			tx.origin,
			serverAddress,
			servers[serverAddress].pricePerHour,
			block.timestamp,
			0
		);
	}

	function stopConnection(uint256 connectionId) public returns (uint){
		assert(isConnected(connectionId)); // connection doesn't exist
		assert(connections[connectionId].endedAt == 0); //connection has not ended
		assert(connections[connectionId].clientAddress == tx.origin || connections[connectionId].serverAddress == tx.origin); //connection owned by 3rd party

		connections[connectionId].endedAt = block.timestamp;
		return connections[connectionId].endedAt - connections[connectionId].startedAt;
	}
}
