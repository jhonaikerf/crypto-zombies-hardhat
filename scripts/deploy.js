async function main() {
  const [deployer] = await ethers.getSigners();
  
  const ContractFactory = await ethers.getContractFactory("CryptoZombie");
  await ContractFactory.deploy();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
