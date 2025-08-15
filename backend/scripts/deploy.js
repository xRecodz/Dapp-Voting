const { ethers } = require("hardhat");

async function main() {
  const candidateNames = ["Tarik Tambang", "Balap Karung", "Panjat Pinang"]; // Tema 17 Agustus

  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(candidateNames);

  await voting.waitForDeployment();

  console.log("Voting contract deployed to:", voting.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });