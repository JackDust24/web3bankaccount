const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const BankAccount = await hre.ethers.getContractFactory("BankAccount");
  const bankAccount = await BankAccount.deploy();

  await bankAccount.deployed();
  await writeDeploymentInfo(bankAccount);
}

async function writeDeploymentInfo(contract) {
  const data = {
    contract: {
      address: contract.address,
      signerAddress: contract.signer.address,
      abi: contract.interface.format(ethers.utils.FormatTypes.json).toString(),
    },
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile("deployment.json", JSON.stringify(data));
  //   async function updateAbi() {
  //     const nftMarketplace = await ethers.getContract('NftMarketPlace')
  //     fs.writeFileSync(
  //       `${frontEndAbiLocation}NftMarketplace.json`,
  //       nftMarketplace.interface.format(ethers.utils.FormatTypes.json).toString()
  //     )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
