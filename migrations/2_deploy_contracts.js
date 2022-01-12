const BNBCollection = artifacts.require("BNBCollection");
const NFTMarketplace = artifacts.require("NFTMarketplace");

module.exports = async function (deployer) {
  await deployer.deploy(BNBCollection);

  const deployedNFT =  await BNBCollection.deployed();
  const BNBAddressCollection = deployedNFT.address;
  console.log('BNBcollection direccion: ', BNBAddressCollection);
  await deployer.deploy(NFTMarketplace, BNBAddressCollection);
  const deployedNFT2 =  await NFTMarketplace.deployed();
  const NFTAddressMarketplace = deployedNFT2.address;
  console.log('NFTMarketPlace direccion: ', NFTAddressMarketplace);
};