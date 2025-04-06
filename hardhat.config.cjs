require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.28",
  /** @type import('hardhat/config').HardhatUserConfig */
  networks: {
    sepolia: {
      url: process.env.VITE_API,
      accounts: [process.env.VITE_DEPLOYING_ADDRESS],
    },
  },
};