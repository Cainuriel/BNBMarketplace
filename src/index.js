
import React from "react";
import ReactDOM from "react-dom/client";
import 'bootswatch/dist/vapor/bootstrap.min.css';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { BinanceTestnet } from "@thirdweb-dev/chains";
import Web3Provider from './store/Web3Provider';
import CollectionProvider from './store/CollectionProvider';
import MarketplaceProvider from './store/MarketplaceProvider';
import App from "./App";
import reportWebVitals from "./reportWebVitals";
const CLIENT_ID = process.env.CLIENT_ID;
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThirdwebProvider activeChain={BinanceTestnet} clientId={CLIENT_ID}>
  <Web3Provider>
    <CollectionProvider>
      <MarketplaceProvider>
        <App />
      </MarketplaceProvider>
    </CollectionProvider>
  </Web3Provider>
  </ThirdwebProvider>
);

reportWebVitals();