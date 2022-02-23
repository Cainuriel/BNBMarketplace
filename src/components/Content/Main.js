import { useContext, useState  } from 'react';

import MintForm from './MintNFT/MintForm';
import NFTCollection from './NFTCollection/NFTCollection';
import CollectionContext from '../../store/collection-context';
import MarketplaceContext from '../../store/marketplace-context';
import Spinner from '../Layout/Spinner';
import logo from '../../img/malanftdriners.png';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import MoneyCheckDollarIcon from '../icons/MoneyCheckDollarIcon'
import AddressCardIcon from '../icons/AddressCardIcon'
import WalletIcon from '../icons/WalletIcon'

const filterOptions = [
  { type: 'ALL', label: 'Todos', Icon: ({color}) => <AddressCardIcon width={24} color={color} /> },
  { type: 'FOR_SALE', label: 'A la venta', Icon: ({color}) => <MoneyCheckDollarIcon width={24} color={color} /> },
  { type: 'MY_NFTS', label: 'Mis NFTs', Icon: ({color}) => <WalletIcon width={20} color={color} /> }
];

const Main = () => {
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);
  const collectionLoaded = collectionCtx.collection.length === parseInt(collectionCtx.totalSupply);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const handleFilterChange = (event) => setSelectedFilter(event.target.value); 

  return(
    <div className="container-fluid mt-2">
      <div className="row">
        <main role="main" className="col-lg-12 justify-content-center text-center">
          <div className="content mr-auto ml-auto">
            <img src={logo} alt="logo" width="50%" className="mb-2"/>
            {!collectionCtx.nftIsLoading && <MintForm />}
            {collectionCtx.nftIsLoading && <Spinner />}
          </div>
        </main>
      </div>
      <hr/>
      <div className="d-flex align-items-center justify-content-center">
        <ButtonGroup onClick={handleFilterChange}>
          {
            filterOptions.map((filter, idx) => 
              <Button 
                key={'filter_' + idx}
                value={filter.type}
                variant={filter.type === selectedFilter ? 'light' : 'secondary'}
              >                
                <filter.Icon color={filter.type === selectedFilter ? 'black' : 'white'} /> {' '} 
                {filter.label}
              </Button>
            )
          }            
        </ButtonGroup>          
      </div>
      {!collectionLoaded && 
        <div className="d-flex align-items-center justify-content-center m-2">
          <div className="spinner-border mr-5 pr-5" role="status" aria-hidden="true"></div>
          <strong>&nbsp;Buscando en el mercado de NFTs...{collectionCtx.collection.length}/{collectionCtx.totalSupply}</strong>
        </div>
      }
      {!marketplaceCtx.mktIsLoading && <NFTCollection showImages={collectionLoaded} filterType={selectedFilter} />}
      {marketplaceCtx.mktIsLoading && <Spinner />}
    </div>
  );
};

export default Main;