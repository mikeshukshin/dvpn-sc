pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract dVPN is Ownable{
	struct Server {
		uint ip;
		uint port;
		uint256 pricePerHour;
		uint listPointer;
	}

	modifier whenNoOpenConnections (address client) {
		//require(msg.sender == owner);
		uint arrayLength = connectionIds.length;
		for (uint i=0; i<arrayLength; i++) {
			if (connections[connectionIds[i]].clientAddress == client){
				require(!isConnected(connectionIds[i]));
			}
		}
		_;
	}

	using SafeMath for uint256;

	mapping(address => Server) private servers;
	address[] private serverAddresses;
	uint256[] private connectionIds;

	function serverAnnounced(address serverAddress) public view returns(bool) {
		if(serverAddresses.length == 0) return false;
		return (serverAddresses[servers[serverAddress].listPointer] == serverAddress);
	}



	function getServerCount() public view returns(uint){
		return serverAddresses.length;
	}

	function getServer(uint index) public view returns(address serverAddress, uint ip, uint port, uint256 pricePerHour){
		require(index < serverAddresses.length); // index out of boundaries
		return (serverAddresses[index], servers[serverAddresses[index]].ip, servers[serverAddresses[index]].port, servers[serverAddresses[index]].pricePerHour); // simplier?
	}

	function announceServer(uint ip, uint port, uint256 pricePerHour) public returns (uint){
		require(!serverAnnounced(tx.origin)); // server already announced
		servers[tx.origin] = Server(ip, port, pricePerHour, serverAddresses.push(tx.origin) - 1);
		return serverAddresses.length;
	}

	function deannounceServer() public{
		require(serverAnnounced(tx.origin)); // server isn't announced

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

	function getConnectionInfo(uint256 connectionId) public view returns(uint startedAt, uint affordableTime){
		require(isConnected(connectionId)); // connection is finished or does not exist
		Connection connection = connections[connectionId];
		require(connection.clientAddress != address(0));
		uint256 balance = balanceOf(connection.clientAddress);
		affordableTime = balance / connection.pricePerHour * 3600;
		return ( connection.startedAt, affordableTime);
	}

	function startConnection(uint256 connectionId, address serverAddress) public{
		require(serverAnnounced(serverAddress)); // server isn't announced
		require(!isConnected(connectionId)); // connection exists
		connectionIds.push(connectionId);
		connections[connectionId] = Connection(
			connectionId,
			tx.origin,
			serverAddress,
			servers[serverAddress].pricePerHour,
			block.timestamp,
			0
		);
	}

	function stopConnection(uint256 connectionId) public{
		require(isConnected(connectionId)); // connection doesn't exist
		require(connections[connectionId].endedAt == 0); //connection has not ended
		require(connections[connectionId].clientAddress == tx.origin || connections[connectionId].serverAddress == tx.origin); //connection owned by 3rd party
		Connection connection = connections[connectionId];
		connection.endedAt = block.timestamp;

		uint256 timeSpent = connection.endedAt.sub(connection.startedAt);
		uint256 moneyRaised = timeSpent.mul(connection.pricePerHour).div(3600);

		//transferFrom(connection.clientAddress, connection.serverAddress, moneyRaised);
		address _from = connection.clientAddress;
		address _to = connection.serverAddress;
		uint256 _value = moneyRaised;
		require(_to != address(0));
		require(_from != address(0));
		require(_value <= balances[_from]);

		balances[_from] = balances[_from].sub(_value);
		balances[_to] = balances[_to].add(_value);
		emit Transfer(_from, _to, _value);
		//return (timeSpent, moneyRaised, balance);
	}


	//money stuff


	mapping(address => uint256) balances;
	event Transfer(address indexed from, address indexed to, uint256 value);

	function () payable {
		balances[msg.sender] = balances[msg.sender].add(msg.value);
	}

	function withdraw ()  whenNoOpenConnections(msg.sender) public {
		address payee = msg.sender;
		uint256 payment = balances[payee];

		require(payment != 0);
		require(address(this).balance >= payment);

		balances[payee] = 0;
		payee.transfer(payment);
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		require(_to != address(0));
		require(_value <= balances[msg.sender]);

		balances[msg.sender] = balances[msg.sender].sub(_value);
		balances[_to] = balances[_to].add(_value);
		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) onlyOwner public {
		require(_to != address(0));
		require(_from != address(0));
		require(_value <= balances[_from]);

		balances[_from] = balances[_from].sub(_value);
		balances[_to] = balances[_to].add(_value);
		emit Transfer(_from, _to, _value);
	}

	function balanceOf(address _owner) public view returns (uint256) {
		return balances[_owner];
	}

}
