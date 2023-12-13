import { useState, useContext } from 'react';
import '../../../app.css';
import Web3Context from '../../../store/web3-context';
import CollectionContext from '../../../store/collection-context';
import { ThirdwebStorage } from "@thirdweb-dev/storage";

// const ipfsClient = require('ipfs-http-client');
// const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const IFPS_API_KEY = process.env.IFPS_API_KEY;
  const storage = new ThirdwebStorage({
    secretKey: IFPS_API_KEY, // You can get one from dashboard settings
  });
const MintForm = () => {  
  
  const [enteredName, setEnteredName] = useState('');
  const [descriptionIsValid, setDescriptionIsValid] = useState(true);

  const [enteredDescription, setEnteredDescription] = useState('');
  const [nameIsValid, setNameIsValid] = useState(true);

  const [enteredRarity, setEnteredRarity] = useState('');
  const [rarityIsValid, setRarityIsValid] = useState(true);

  const [enteredFiletype, setEnteredFiletype] = useState('Imagen');
  const [FiletypeIsValid, setFiletypeIsValid] = useState(true);

  const [capturedFileBuffer, setCapturedFileBuffer] = useState(null);
  const [fileIsValid, setFileIsValid] = useState(true);

  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);

  const enteredNameHandler = (event) => {
    setEnteredName(event.target.value);
  };
  
  const enteredDescriptionHandler = (event) => {
    setEnteredDescription(event.target.value);
  };

  const enteredRarityHandler = (event) => {
    setEnteredRarity(event.target.value);
  };

  const enteredFiletypeHandler = (event) => {
    setEnteredFiletype(event.target.value);
  };
  
  const captureFile = (event) => {
    event.preventDefault();

    const file = event.target.files[0];

    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setCapturedFileBuffer(Buffer(reader.result));     
    }
  };
  
  const submissionHandler = (event) => {
    event.preventDefault();

    enteredName ? setNameIsValid(true) : setNameIsValid(false);
    enteredDescription ? setDescriptionIsValid(true) : setDescriptionIsValid(false);
    enteredRarity ? setRarityIsValid(true) : setRarityIsValid(false);
    capturedFileBuffer ? setFileIsValid(true) : setFileIsValid(false);
    enteredFiletype ? setFiletypeIsValid(true) : setFiletypeIsValid(false);
    const formIsValid = enteredName && enteredDescription && enteredRarity && enteredFiletype && capturedFileBuffer;

    // Upload file to IPFS and push to the blockchain
    const mintNFT = async() => {
      collectionCtx.setNftIsLoading(true); // block button
        // Add file to the IPFS
        const fileAdded = await storage.upload(capturedFileBuffer);
        // This will log a URL like ipfs://QmWgbcjKWCXhaLzMz4gNBxQpAHktQK6MkLvBkKXbsoWEEy/0
        console.info(fileAdded);
      // const fileAdded = await ipfs.add(capturedFileBuffer);
      if(!fileAdded) {
        window.alert('Something went wrong when updloading the file');
        collectionCtx.setNftIsLoading(false);
        return;
      }

      const metadata = {
        title: "Asset Metadata",
        type: "object",
        properties: {
          name: {
            type: "string",
            description: enteredName
          },
          description: {
            type: "string",
            description: enteredDescription
          },
          rarity: {
            type: "string",
            description: enteredRarity
          },
          filetype: {
            type: "string",
            description: enteredFiletype
          },
          image: {
            type: "string",
            description: fileAdded.path
          },
          video: {
            type: "string",
            description: fileAdded.path
          }
        }
      };

      const metadataAdded = await storage.upload(metadata);
      console.info(metadataAdded);
      // const metadataAdded = await ipfs.add(JSON.stringify(metadata));
      if(!metadataAdded) {
        window.alert('Something went wrong when updloading the file');
        collectionCtx.setNftIsLoading(false);
        return;
      }
      
      collectionCtx.contract.methods.safeMint(metadataAdded.path).send({ from: web3Ctx.account })
      .on('transactionHash', (hash) => {
        collectionCtx.setNftIsLoading(true);
      })
      .on('receipt', (receipt) => {
        const transfer = receipt.events.Transfer.returnValues
        collectionCtx.updateCollection(collectionCtx.contract, transfer.tokenId, transfer.to);
        collectionCtx.setNftIsLoading(false);
      })
      .on('error', (e) =>{
        window.alert('Something went wrong when pushing to the blockchain');
        collectionCtx.setNftIsLoading(false);  
      })      
    };

    formIsValid && mintNFT();
  };

  const nameClass = nameIsValid? "form-control" : "form-control is-invalid";
  const descriptionClass = descriptionIsValid? "form-control" : "form-control is-invalid";
  const rarityClass = rarityIsValid? "form-control" : "form-control is-invalid";
  const fileTypeClass = FiletypeIsValid? "form-control" : "form-control is-invalid";
  const fileClass = fileIsValid? "form-control" : "form-control is-invalid";

  return(
    <form onSubmit={submissionHandler}>
      <div className="row justify-content-center m-3">
        <div className="col-md-2">
          <input
            type='text'
            className={`${nameClass} mb-1`}
            placeholder='Nombre del NFT...'
            value={enteredName}
            onChange={enteredNameHandler}
          />
        </div>
        <div className="col-md-6">
          <input
            type='text'
            className={`${descriptionClass} mb-1`}
            placeholder='Descripción breve del NTF...'
            value={enteredDescription}
            onChange={enteredDescriptionHandler}
          />
        </div>
        <div className="col-md-4">
          <input
            type='text'
            className={`${rarityClass} mb-1`}
            placeholder='Nº de serie. Ejem: #4 de 10, Único... '
            value={enteredRarity}
            onChange={enteredRarityHandler}
          />
        </div>
        <div className="col-md-2">
        <label>Seleccione el tipo de archivo</label>
        <select className={`${fileTypeClass} mb-1`} onChange={enteredFiletypeHandler} value={enteredFiletype}>
                  <option value="Imagen">Imagen</option>
                  <option value="MP4">MP4</option>
        </select>
        </div>
        <div className="col-md-2">
        <label>{enteredFiletype}</label>
          <input
            type='file'
            className={`${fileClass} mb-1`}
            onChange={captureFile}
          />
        </div>        
      </div>
      <button type='submit' disabled={collectionCtx.nftIsLoading} className='btn btn-lg btn-secondary btn-block m-2'>MINT</button>
    </form>
    // <>
    //   <h2 className='text-center'>Deshabilitada la creación de NFTs</h2>
    // </>
  );
};

export default MintForm;