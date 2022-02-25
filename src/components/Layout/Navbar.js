import { useContext, useState } from 'react';
import '../../app.css';
import Web3Context from '../../store/web3-context';
import MarketplaceContext from '../../store/marketplace-context';
import web3 from '../../connection/web3';
import { formatPrice } from '../../helpers/utils';

const Navbar = () => {
  const [fundsLoading, setFundsLoading] = useState(false);
  
  const web3Ctx = useContext(Web3Context);
  const marketplaceCtx = useContext(MarketplaceContext);
  
  const connectWalletHandler = async() => {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch(error) {
      console.error(error);
    }

    // Load accounts
    web3Ctx.loadAccount(web3);
  };

  const claimFundsHandler = () => {
    marketplaceCtx.contract.methods.claimFunds().send({ from: web3Ctx.account })
    .on('transactionHash', (hash) => {
      setFundsLoading(true);
    })
    .on('receipt', (receipt) => {
      marketplaceCtx.loadUserFunds(marketplaceCtx.contract, web3Ctx.account);
      setFundsLoading(false);
    })
    .on('error', (error) => {
      window.alert('Something went wrong when pushing to the blockchain');
      setFundsLoading(false);
    });
  };

  // TODO: revisar porque las subscripciones a eventos no se lanzan...de momento lo tratamos directamente en el callback del send de la transacción
  // Event ClaimFunds subscription 
  marketplaceCtx.contract.events.ClaimFunds()
  .on('data', (event) => {
    marketplaceCtx.loadUserFunds(marketplaceCtx.contract, web3Ctx.account);
    setFundsLoading(false);
  })
  .on('error', (error) => {
    console.log(error);
  });

  let etherscanUrl;

  if(web3Ctx.networkId === 3) {
    etherscanUrl = 'https://ropsten.etherscan.io'
  } else if(web3Ctx.networkId === 4) {
    etherscanUrl = 'https://rinkeby.etherscan.io'
  } else if(web3Ctx.networkId === 5) {
    etherscanUrl = 'https://goerli.etherscan.io'
  } else {
    etherscanUrl = 'https://testnet.bscscan.com/'
  }
  
  return (
  <nav className="navbar navbar-dark bg-dark">
    <div className="container-fluid">  
        {web3Ctx.account && 
        <div className="navbar-brand">
          <h3 className="text-white">¡Bienvenido Malandriner! </h3>
        </div> }
        {marketplaceCtx.userFunds > 0 &&
          <div className="navbar-toggler">
            {!fundsLoading &&
              <button 
                type="button" 
                className="btn btn-danger btn-block navbar-btn text-white" 
                onClick={claimFundsHandler}
              >          
                {`RECOJA SU DINERO: ${formatPrice(marketplaceCtx.userFunds)} BNB`}
              </button>}
            {fundsLoading &&
              <div className="d-flex justify-content-center text-info">
                <div className="spinner-border" role="status">
                  <span className="sr-only"></span>
                </div>
            </div>}          
          </div>
        }
        <div className="navbar-toggler">
          {web3Ctx.account && 
            <a 
              className="nav-link small" 
              href="https://testnet.binance.org/faucet-smart"
              target="blank"
              rel="noopener noreferrer">
            <button 
              type="button" 
              className="btn btn-success text-white" 
            > 
              Faucet de BNBs
            </button>
            </a>}
        </div>
        <div className="navbar-toggler">
          {web3Ctx.account && 
            <a 
              className="nav-link small" 
              href={`${etherscanUrl}/address/${web3Ctx.account}`}
              target="blank"
              rel="noopener noreferrer"
            > {`${web3Ctx.account.substr(0,7)}...${web3Ctx.account.substr(web3Ctx.account.length - 7)}`}
            </a>}
          {!web3Ctx.account && 
            <button 
              type="button" 
              className="btn btn-info text-white" 
              onClick={connectWalletHandler} 
            > 
              Connect your wallet
            </button>}
        </div>
    </div>  
  </nav>
  
  );  
};

export default Navbar;