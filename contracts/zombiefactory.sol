// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "hardhat/console.sol";

contract ZombieFactory is ERC721Enumerable {
    constructor() ERC721("CryptoZombie", "CZYT") {}

    event NewZombie(uint256 zombieId, string name, uint256 dna);

    uint256 dnaDigits = 16;
    uint256 dnaModulus = 10**dnaDigits;
    uint256 cooldownTime = 1 days;

    struct Zombie {
        string name;
        uint256 dna;
        uint32 level;
        uint32 readyTime;
        uint16 winCount;
        uint16 lossCount;
    }

    Zombie[] public zombies;

    function _createZombie(string memory _name, uint256 _dna) internal {
        zombies.push(Zombie(_name, _dna, 1, uint32(block.timestamp), 0, 0));
        uint256 id = zombies.length - 1;
        _mint(msg.sender, id);
        emit NewZombie(id, _name, _dna);
    }

    function _generateRandomDna(string memory _str)
        private
        view
        returns (uint256)
    {
        uint256 rand = uint256(keccak256(abi.encodePacked(_str)));
        return rand % dnaModulus;
    }

    function createRandomZombie(string memory _name) public {
        require(balanceOf(msg.sender) == 0, "Cannot create more zombies");
        uint256 randDna = _generateRandomDna(_name);
        randDna = randDna - (randDna % 100);
        _createZombie(_name, randDna);
    }
}
