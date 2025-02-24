const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactory.deploy();
  await campaignFactory.waitForDeployment();

  console.log("CampaignFactory deployed to:", campaignFactory.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });