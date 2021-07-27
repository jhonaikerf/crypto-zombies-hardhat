const { ethers } = require("hardhat");
const { expect } = require("chai");
const { smockit } = require("@eth-optimism/smock");

const time = require("./helpers/time");

const zombieNames = ["Zombie 1", "Zombie 2"];
const zombieDna = 8229335091878300;
const kittyDna = 1525635091878300;

describe("CryptoZombie", async () => {
  const [owner, addr1] = await ethers.getSigners();
  let myContract;
  beforeEach(async () => {
    const MyContract = await ethers.getContractFactory("CryptoZombie");
    myContract = await MyContract.deploy();
    await myContract.deployed();
  });

  describe("Factory", async () => {
    it("should be able to create a new zombie", async () => {
      await myContract.createRandomZombie(zombieNames[0]);
      expect(await myContract.balanceOf(owner.address)).to.equal(1);
    });
    it("should not allow to create two zombies", async () => {
      await myContract.createRandomZombie(zombieNames[0]);
      await expect(
        myContract.createRandomZombie(zombieNames[1])
      ).to.be.revertedWith("Cannot create more zombies");
    });
  });

  describe("Owner", async () => {
    it("owner should be able to withdraw funds", async () => {
      await myContract.withdraw(owner.address);
    });
    it("should not allow to withdraw funds not owner", async () => {
      await expect(
        myContract.connect(addr1).withdraw(addr1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("owner should be able to set level up fee", async () => {
      await myContract.setLevelUpFee(ethers.utils.parseEther("0.002"));
    });
  });

  describe("Helpers", async () => {
    it("should be able to level up", async () => {
      const result = await myContract.createRandomZombie(zombieNames[0]);
      const wait = await result.wait();
      const zombieId = wait.events[1].args.zombieId.toNumber();
      const oldZombie = await myContract.zombies(zombieId);

      await myContract.levelUp(zombieId, {
        value: ethers.utils.parseEther("0.001"),
      });
      const newZombie = await myContract.zombies(zombieId);

      expect(newZombie.level).to.equal(oldZombie.level + 1);
    });
    it("should be able to change name above level 2", async () => {
      const result = await myContract.createRandomZombie(zombieNames[0]);
      const wait = await result.wait();
      const zombieId = wait.events[1].args.zombieId.toNumber();

      await myContract.levelUp(zombieId, {
        value: ethers.utils.parseEther("0.001"),
      });

      await myContract.changeName(zombieId, zombieNames[1]);
      const zombie = await myContract.zombies(zombieId);

      expect(zombie.name).to.equal(zombieNames[1]);
    });
    it("should not allow to change name below level 2", async () => {
      const result = await myContract.createRandomZombie(zombieNames[0]);
      const wait = await result.wait();
      const zombieId = wait.events[1].args.zombieId.toNumber();

      await expect(
        myContract.changeName(zombieId, zombieNames[1])
      ).to.be.revertedWith("Must meet the level requirement");
    });
    it("should be able to change dna above level 20", async () => {
      const result = await myContract.createRandomZombie(zombieNames[0]);
      const wait = await result.wait();
      const zombieId = wait.events[1].args.zombieId.toNumber();

      for (let i = 0; i < 19; i++) {
        await myContract.levelUp(zombieId, {
          value: ethers.utils.parseEther("0.001"),
        });
      }

      await myContract.changeDna(zombieId, zombieDna);
      const zombie = await myContract.zombies(zombieId);

      expect(zombie.dna.toNumber()).to.equal(zombieDna);
    });
    it("should not allow to change dna below level 20", async () => {
      const result = await myContract.createRandomZombie(zombieNames[0]);
      const wait = await result.wait();
      const zombieId = wait.events[1].args.zombieId.toNumber();

      await expect(
        myContract.changeDna(zombieId, zombieDna)
      ).to.be.revertedWith("Must meet the level requirement");
    });
  });

  describe("Kitty Contract", async () => {
    it("owner should be able to change cryptokitty contract address", async () => {
      await myContract.setKittyContractAddress(addr1.address);
    });
    it("should be able to feed kitty", async () => {
      const kittyContract = await ethers.getContractAt(
        "KittyInterface",
        addr1.address
      );

      const kittyMockContract = await smockit(kittyContract);
      await myContract.setKittyContractAddress(kittyMockContract.address);

      kittyMockContract.smocked.getKitty.will.return.with([
        false,
        false,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        kittyDna,
      ]);

      const result = await myContract.createRandomZombie(zombieNames[0]);
      const wait = await result.wait();
      const zombieId = wait.events[1].args.zombieId.toNumber();

      await time.increase(time.duration.days(1));
      await myContract.feedOnKitty(zombieId, 0);
    });
  });

  describe("List Zombies", async () => {
    it("should be able to get list of zombies by owner", async () => {
      await myContract.createRandomZombie(zombieNames[0]);
      const result = await myContract.getZombiesByOwner(owner.address);

      expect(result.length).to.equal(1);
    });
  });

  describe("Attack", async () => {
    it("zombies should be able to attack another zombie", async () => {
      let result, wait;

      result = await myContract.createRandomZombie(zombieNames[0]);
      wait = await result.wait();
      const firstZombieId = wait.events[1].args.zombieId.toNumber();

      result = await myContract
        .connect(addr1)
        .createRandomZombie(zombieNames[1]);
      wait = await result.wait();
      const secondZombieId = wait.events[1].args.zombieId.toNumber();

      const oldZombie = await myContract.zombies(firstZombieId);

      await time.increase(time.duration.days(1));
      await myContract.attack(firstZombieId, secondZombieId);
      const newZombie = await myContract.zombies(firstZombieId);

      expect(newZombie.readyTime).to.greaterThan(oldZombie.readyTime);
    });
  });
});
