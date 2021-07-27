require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("@nomiclabs/hardhat-solhint");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.5",
  settings: {
    outputSelection: {
      "*": {
        "*": ["storageLayout"],
      },
    },
  },
};
