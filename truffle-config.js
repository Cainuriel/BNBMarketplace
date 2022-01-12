require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const privateKey = [process.env.PRIVATE_KEY];
const apiUrl = process.env.API_URL;
module.exports = {

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" //match any network id
    },
    // rinkeby: {
    //   provider: function() {
    //     return new HDWalletProvider(
    //       privateKeys.split(','), // array of private keys
    //       `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}` // Url to an Ethereum node
    //     )
    //   },
    //   gas: 5000000,
    //   gasPrice: 25000000000,
    //   network_id: 4
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
     testnet: {
      provider: () => new HDWalletProvider(privateKey, `${apiUrl}`),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis',

  // Configure your compilers
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      version: "^0.8.0" 
    }
  }
};