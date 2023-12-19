import ReactDOM from 'react-dom';
import 'bootswatch/dist/vapor/bootstrap.min.css';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { BinanceTestnet } from "@thirdweb-dev/chains";
import Web3Provider from './store/Web3Provider';
import CollectionProvider from './store/CollectionProvider';
import MarketplaceProvider from './store/MarketplaceProvider';
import App from './App';
const CLIENT_ID = process.env.CLIENT_ID;
ReactDOM.render(
  <ThirdwebProvider activeChain={BinanceTestnet} clientId={CLIENT_ID}>
  <Web3Provider>
    <CollectionProvider>
      <MarketplaceProvider>
        <App />
      </MarketplaceProvider>
    </CollectionProvider>
  </Web3Provider>
  </ThirdwebProvider>
  , 
  document.getElementById('root')
);