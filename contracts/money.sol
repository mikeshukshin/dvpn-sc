pragma solidity ^0.4.21;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract Money {
    using SafeMath for uint256;

    mapping(address => uint256) balances;

    function () external payable {
        buyTokens(msg.sender);
    }


    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

}