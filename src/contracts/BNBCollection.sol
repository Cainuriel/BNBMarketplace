//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * dev: https://cainuriel.github.io/
 * 
 * 
 * 
 *      /$$$$$$$$ /$$           /$$                                               /$$$$$$$  /$$                      /$$              
 *     | $$_____/|__/          | $$                                              | $$__  $$|__/                     | $$              
 *     | $$       /$$  /$$$$$$$| $$$$$$$   /$$$$$$   /$$$$$$  /$$    /$$ /$$$$$$$| $$  \ $$ /$$  /$$$$$$  /$$$$$$  /$$$$$$    /$$$$$$ 
 *     | $$$$$   | $$ /$$_____/| $$__  $$ /$$__  $$ /$$__  $$|  $$  /$$//$$_____/| $$$$$$$/| $$ /$$__  $$|____  $$|_  $$_/   /$$__  $$
 *     | $$__/   | $$|  $$$$$$ | $$  \ $$| $$$$$$$$| $$  \__/ \  $$/$$/|  $$$$$$ | $$____/ | $$| $$  \__/ /$$$$$$$  | $$    | $$$$$$$$
 *     | $$      | $$ \____  $$| $$  | $$| $$_____/| $$        \  $$$/  \____  $$| $$      | $$| $$      /$$__  $$  | $$ /$$| $$_____/
 *     | $$      | $$ /$$$$$$$/| $$  | $$|  $$$$$$$| $$         \  $/   /$$$$$$$/| $$      | $$| $$     |  $$$$$$$  |  $$$$/|  $$$$$$$
 *     |__/      |__/|_______/ |__/  |__/ \_______/|__/          \_/   |_______/ |__/      |__/|__/      \_______/   \___/   \_______/
 * 
 * 
 * 
 * 
 **/

//import "./ERC721Enumerable.sol";
//import "./Ownable.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// File: contracts/FishervsPirate.sol

contract FishervsPirate is ERC721Enumerable, Ownable  
{   
    
    string public baseURI;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => bool) private  _minters;
    
    
    bool public saleIsActive = true; // activado desde su deployado
    uint256 public _tokenPrice = 10000000000000000; //0.01 BNB
    
      /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param idToken NFT purchased
   */
  event TokenPurchase(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 idToken
  );
  
   /**
   * Event for token purchase logging
   * @param minter who minted tokens
   * @param numberOfTokens number of tokens minted
   */
  event MultipleMint(
    address indexed minter,
    uint256 numberOfTokens,
    uint256 supply
  );
  
   /**
   * Event for token purchase logging
   * @param amount total sale balance
   * @param date collection date
   */
  event WithdrawTime(
    uint256 amount,
    uint256 date
  );
    
    constructor(string memory name, string memory symbol, string memory baseUri) 
    ERC721(name, symbol) 
    {
        setBaseURI(baseUri);
        _minters[msg.sender] = true;

    }

         /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overriden in child contracts.
     */
    function _baseURI() internal view virtual override returns (string memory) 
    {
        return baseURI;
    }

    function withdraw() public onlyOwner 
    {
        uint256 amount = address(this).balance;
        payable(msg.sender).transfer(amount);
        flipSaleState();
        emit WithdrawTime(amount, block.timestamp);
        
    }
    
    function saleMintToken(address buyer) public payable 
    {
    require(saleIsActive, "Salemint must be active to buy Tokens");
    require(msg.value >= _tokenPrice, "value sent needs to be atleast sale price");
    
        uint256 supply = totalSupply();
        _safeMint(buyer, supply + 1);
        emit TokenPurchase(owner(), buyer, msg.value, supply + 1);
     
    }
    
     function mintToken(uint256 tokensNumber) public  
     {
        require(_minters[msg.sender], "You don't are allowed for minting");

        uint256 supply = totalSupply();

        for (uint256 i = 0; i < tokensNumber; i++) {
            _safeMint(owner(), supply + 1);
            supply++;
        }
        
        emit MultipleMint(msg.sender, tokensNumber, supply);
    }
           /**
         * @dev approve an account for mint
         */
         function setMinterApproved(address minter) public onlyOwner 
    {   require(!_minters[minter], "address minter allowed for minting");
        _minters[minter] = true;
    }
    
        /**
         * @dev disapprove an account for mint
         */
         function setMinterDisapproved(address minter) public onlyOwner 
    {
         require(_minters[minter], "address minter not allowed for minting");
        _minters[minter] = false;
    }
    
      /**
     * @dev show all the tokens of the owner.
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);

        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner 
    {
        baseURI = newBaseURI;
    }
    
     function setTokenPrice(uint256 tokenPrice) public onlyOwner 
    {
        _tokenPrice = tokenPrice;
    }

    function getBalance() public view onlyOwner returns(uint256)  
    {
        return address(this).balance;
    }
    
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) 
    {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    /**
     * @dev Sets `tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenURI(uint256 _tokenId, string memory _tokenURI) public onlyOwner
    {
        require(_exists(_tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[_tokenId] = _tokenURI;
    }
    
      /*
    * Pause sale if active, make active if paused
    */
    function flipSaleState() public onlyOwner 
    {
        saleIsActive = !saleIsActive;
    }
    
}