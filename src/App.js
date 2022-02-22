import React, { useContext, useEffect, useState } from 'react';
import web3 from './connection/web3';
import Navbar from './components/Layout/Navbar';
import Main from './components/Content/Main';
import Web3Context from './store/web3-context';
import CollectionContext from './store/collection-context';
import MarketplaceContext from './store/marketplace-context'
import NFTCollection from './abis/BNBCollection.json';
import NFTMarketplace from './abis/NFTMarketplace.json';
import './app.css';
const App = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);
  const [showInstallNetwork, setshowInstallNetwork] = useState(false);
  useEffect(() => {
    // Check if the user has Metamask active
    if(!web3) {
      window.alert('No tiene instalada una billetera Metamask. Viaje a la tienda de chrome para instalarsela');
      return;
    }    
    // Function to fetch all the blockchain data
    const loadBlockchainData = async() => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });  
      } catch(error) {
        console.error(error);
      }
      
      // Load account
      const account = await web3Ctx.loadAccount(web3);

      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);

      // Load Contracts      
      const nftDeployedNetwork = NFTCollection.networks[networkId];
      const nftContract = collectionCtx.loadContract(web3, NFTCollection, nftDeployedNetwork);

      const mktDeployedNetwork = NFTMarketplace.networks[networkId];
      const mktContract = marketplaceCtx.loadContract(web3, NFTMarketplace, mktDeployedNetwork);

      if(nftContract) {        
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);
        
        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply);       

        // Event subscription
        nftContract.events.Transfer()
        .on('data', (event) => {
          collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
          collectionCtx.setNftIsLoading(false);
        })
        .on('error', (error) => {
          console.log(error);
        });
        
      } else {
        setshowInstallNetwork(true);
        window.alert('Tiene que estar en la red de pruebas de Binance Smart Chain.')
      }

      if(mktContract) {
        // Load offer count
        const offerCount = await marketplaceCtx.loadOfferCount(mktContract);
        
        // Load offers
        marketplaceCtx.loadOffers(mktContract, offerCount); 
        
        // Load User Funds
        account && marketplaceCtx.loadUserFunds(mktContract, account);

        // Event OfferFilled subscription 
        mktContract.events.OfferFilled()
        .on('data', (event) => {
          marketplaceCtx.updateOffer(event.returnValues.offerId);
          collectionCtx.updateOwner(event.returnValues.id, event.returnValues.newOwner);
          marketplaceCtx.setMktIsLoading(false);
        })
        .on('error', (error) => {
          console.log(error);
        });

        // Event Offer subscription 
        mktContract.events.Offer()
        .on('data', (event) => {
          marketplaceCtx.addOffer(event.returnValues);
          marketplaceCtx.setMktIsLoading(false);
        })
        .on('error', (error) => {
          console.log(error);
        });

        // Event offerCancelled subscription 
        mktContract.events.OfferCancelled()
        .on('data', (event) => {
          marketplaceCtx.updateOffer(event.returnValues.offerId);
          collectionCtx.updateOwner(event.returnValues.id, event.returnValues.owner);
          marketplaceCtx.setMktIsLoading(false);
        })
        .on('error', (error) => {
          console.log(error);
        });
        
      } else {

        window.alert('A continuación podrá cambiar a la red de pruebas de Binance, o si usted me da permiso, se la instalaré apretando al botón');
        
      }

      collectionCtx.setNftIsLoading(false);
      marketplaceCtx.setMktIsLoading(false);

      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        web3Ctx.loadAccount(web3);
        accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0]);
      });

      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    };
    
    loadBlockchainData();
  }, []);

      // Function for change or installing network
      const changeOrInstalingNetwork = async() =>{

        let networkData = [{
                chainId: "0x61",
                chainName: "BSCTESTNET",
                rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
                nativeCurrency: {
                  name: "BINANCE COIN",
                  symbol: "BNB",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://testnet.bscscan.com/"],
              },
            ];
    
          // agregar red o cambiar red
          return window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: networkData,
          });
      }

  const showNavbar = web3 && collectionCtx.contract && marketplaceCtx.contract;
  const showContent = web3 && collectionCtx.contract && marketplaceCtx.contract && web3Ctx.account;

  return(

    <React.Fragment>
       {showInstallNetwork && <div className="networkDiv">
                                <button 
                                  onClick={changeOrInstalingNetwork}
                                  className="btn-network btn-network-primary btn-network-ghost btn-network-shine">
                                  INSTALAR O CAMBIAR A BSC TESTNET 
                                </button> 
                              </div>}
      {showNavbar && <Navbar />}
      {showContent && <Main />}
    </React.Fragment>
  );
};

export default App;