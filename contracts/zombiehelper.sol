// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "./zombiefeeding.sol";

contract ZombieHelper is ZombieFeeding {
    uint256 public levelUpFee = 0.001 ether;

    modifier aboveLevel(uint256 _level, uint256 _zombieId) {
        require(
            zombies[_zombieId].level >= _level,
            "Must meet the level requirement"
        );
        _;
    }

    function withdraw(address payable _address) external onlyOwner {
        _address.transfer(address(this).balance);
    }

    function setLevelUpFee(uint256 _fee) external onlyOwner {
        levelUpFee = _fee;
    }

    function levelUp(uint256 _zombieId) external payable {
        require(msg.value == levelUpFee);
        zombies[_zombieId].level++;
    }

    function changeName(uint256 _zombieId, string memory _newName)
        external
        aboveLevel(2, _zombieId)
        onlyOwnerOf(_zombieId)
    {
        zombies[_zombieId].name = _newName;
    }

    function changeDna(uint256 _zombieId, uint256 _newDna)
        external
        aboveLevel(20, _zombieId)
        onlyOwnerOf(_zombieId)
    {
        zombies[_zombieId].dna = _newDna;
    }

    function getZombiesByOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory result = new uint256[](balanceOf(_owner));
        uint256 counter = 0;
        for (uint256 i = 0; i < zombies.length; i++) {
            if (ownerOf(i) == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }
}
