import { useContext, useRef, createRef } from 'react';

import web3 from '../../../connection/web3';
import Web3Context from '../../../store/web3-context';
import CollectionContext from '../../../store/collection-context';
import MarketplaceContext from '../../../store/marketplace-context';
import { formatPrice } from '../../../helpers/utils';
import eth from '../../../img/bnb.png';

const nftURL = (nft) => `https://ipfs.infura.io/ipfs/${nft.img}`

const NFTCollection = ({ showImages = true, filterType = 'ALL' }) => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

  const priceRefs = useRef([]);
  if (priceRefs.current.length !== collectionCtx.collection.length) {
    priceRefs.current = Array(collectionCtx.collection.length).fill().map((_, i) => priceRefs.current[i] || createRef());
  }

  const filteredNFTS = collectionCtx.collection.map((NFT, key) => {
    return { key, NFT } // mantenemos el indice 'key' original
  }).filter(({ key, NFT }) => {
    if (filterType === 'FOR_SALE') {
      const index = marketplaceCtx.offers ? marketplaceCtx.offers.findIndex(offer => offer.id === NFT.id) : -1;
      return index !== -1 // if found, for sale
    }
    if (filterType === 'MY_NFTS') {
      const index = marketplaceCtx.offers ? marketplaceCtx.offers.findIndex(offer => offer.id === NFT.id) : -1;
      const owner = index === -1 ? NFT.owner : marketplaceCtx.offers[index].user;
      return owner === web3Ctx.account  // compare owner with current account
    }
    return true // show all by default, filterType 'ALL'
  })
  
  const makeOfferHandler = (event, id, key) => {
    event.preventDefault();

    const enteredPrice = web3.utils.toWei(priceRefs.current[key].current.value, 'ether');

    collectionCtx.contract.methods.approve(marketplaceCtx.contract.options.address, id).send({ from: web3Ctx.account })
    .on('transactionHash', (hash) => {
      marketplaceCtx.setMktIsLoading(true);
    })
    .on('receipt', (receipt) => {      
      marketplaceCtx.contract.methods.makeOffer(id, enteredPrice).send({ from: web3Ctx.account })
      .on('error', (error) => {
        window.alert('Something went wrong when pushing to the blockchain');
        marketplaceCtx.setMktIsLoading(false);
      }); 
    });
  };
  
  const buyHandler = (event) => {    
    const buyIndex = parseInt(event.target.value);      
    marketplaceCtx.contract.methods.fillOffer(marketplaceCtx.offers[buyIndex].offerId).send({ from: web3Ctx.account, value: marketplaceCtx.offers[buyIndex].price })
    .on('transactionHash', (hash) => {
      marketplaceCtx.setMktIsLoading(true);
    })
    .on('error', (error) => {
      window.alert('Something went wrong when pushing to the blockchain');
      marketplaceCtx.setMktIsLoading(false);
    });            
  };

  const cancelHandler = (event) => {    
    const cancelIndex = parseInt(event.target.value);
    marketplaceCtx.contract.methods.cancelOffer(marketplaceCtx.offers[cancelIndex].offerId).send({ from: web3Ctx.account })
    .on('transactionHash', (hash) => {
      marketplaceCtx.setMktIsLoading(true);
    })
    .on('error', (error) => {
      window.alert('Something went wrong when pushing to the blockchain');
      marketplaceCtx.setMktIsLoading(false);
    });    
  };
 
  return(
    <div className="row text-center">
     
      {filteredNFTS.map(({NFT, key}) => {
        const index = marketplaceCtx.offers ? marketplaceCtx.offers.findIndex(offer => offer.id === NFT.id) : -1;
        const owner = index === -1 ? NFT.owner : marketplaceCtx.offers[index].user;
        const price = index !== -1 ? formatPrice(marketplaceCtx.offers[index].price).toFixed(2) : null;
        console.log('objeto NFT', NFT);
        return(
          <div key={key} className="col-xxl-2 col-xl-3 col-lg-4 col-md-6 py-3 px-3 ">
            <div className="card border-info h-100 p-3">
              <div className='d-flex justify-content-between align-items-baseline'>
                <h5>
                  <span className="badge bg-warning text-dark">{NFT.id}</span>
                </h5>
                <small className="">Rareza: {NFT.rarity}</small>
              </div>
              <div className={"card-body"}>       
                <h3 className="card-title">{NFT.title}</h3>
                
                <p className="">{NFT.description}</p>
              </div>
              <div className='d-flex justify-content-center'>
                {showImages && NFT.filetype === "Imagen" &&
                  <img src={nftURL(NFT)} className="card-img-bottom rounded" alt={`${NFT.title}`} width="100%" /> 
                }
                {showImages && NFT.filetype === "MP4" &&
                  <video className="rounded" width="100%" autoPlay loop muted>
                    <source src={nftURL(NFT)} type="video/mp4"/>
                  </video> 
                }
              </div>
              <label>Propietario:</label>
              <p className="fw-light fs-6"> {`${owner.substr(0,7)}...${owner.substr(owner.length - 7)}`}</p>
              {index !== -1 ?
                  <div className="d-flex">
                    <div className="d-grid gap-2 col-5 mx-auto">
                      { owner !== web3Ctx.account ?
                        <button onClick={buyHandler} value={index} className="btn btn-success">COMPRAR</button>
                        :
                        <button onClick={cancelHandler} value={index} className="btn btn-danger">CANCELAR</button>
                      }
                    </div>
                    <div className="col-7 d-flex justify-content-end align-items-center gap-1">
                      <img src={eth} width="25" height="25" className="align-center float-start" alt="price icon" ></img>                
                      <strong>{`${price}`}</strong>
                    </div>
                  </div> :
                owner === web3Ctx.account ?              
                  <form className="row g-2" onSubmit={(e) => makeOfferHandler(e, NFT.id, key)}>                
                    <div className="col-5 d-grid gap-2">
                      <button type="submit" className="btn btn-secondary">VENDER</button>
                    </div>
                    <div className="col-7">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="BNB..."
                        className="form-control"
                        ref={priceRefs.current[key]}
                      />
                    </div>                                  
                  </form> :
                  <p><br/></p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NFTCollection;