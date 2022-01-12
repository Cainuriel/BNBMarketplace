const NFTCollection = artifacts.require("NFTCollection");
const NFTMarketplace = artifacts.require("NFTMarketplace");

module.exports = async function (deployer) {
  await deployer.deploy(NFTCollection);

  const deployedNFT =  await NFTCollection.deployed();
  const NFTAddressCollection = deployedNFT.address;
  console.log('NFTcollection direccion: ', NFTAddressCollection);
  await deployer.deploy(NFTMarketplace, NFTAddressCollection);
  const deployedNFT2 =  await NFTCollection.deployed();
  const NFTAddressMarketplace = deployedNFT2.address;
  console.log('NFTMarketPlace direccion: ', NFTAddressMarketplace);
};