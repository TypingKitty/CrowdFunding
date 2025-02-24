require("@nomicfoundation/hardhat-toolbox");
module.exports = {
  solidity: "0.8.28",
  /** @type import('hardhat/config').HardhatUserConfig */
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/0458a02975ce40f9a7fcbef386f09292",
      accounts: ["3a1c5d5fe1c02fabad8ab48614159692b9273c496610a4df15a3b4ef1ae98dd0"],
    },
  },


};
