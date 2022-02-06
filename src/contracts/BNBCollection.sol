//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * dev: https://cainuriel.github.io/
 /$$      /$$           /$$                      /$$$$$$   /$$                    /$$           /$$                              
| $$$    /$$$          | $$                     /$$__  $$ | $$                   | $$          |__/                              
| $$$$  /$$$$  /$$$$$$ | $$  /$$$$$$  /$$$$$$$ | $$  \__//$$$$$$   /$$$$$$$  /$$$$$$$  /$$$$$$  /$$ /$$$$$$$   /$$$$$$   /$$$$$$ 
| $$ $$/$$ $$ |____  $$| $$ |____  $$| $$__  $$| $$$$   |_  $$_/  /$$_____/ /$$__  $$ /$$__  $$| $$| $$__  $$ /$$__  $$ /$$__  $$
| $$  $$$| $$  /$$$$$$$| $$  /$$$$$$$| $$  \ $$| $$_/     | $$   |  $$$$$$ | $$  | $$| $$  \__/| $$| $$  \ $$| $$$$$$$$| $$  \__/
| $$\  $ | $$ /$$__  $$| $$ /$$__  $$| $$  | $$| $$       | $$ /$$\____  $$| $$  | $$| $$      | $$| $$  | $$| $$_____/| $$      
| $$ \/  | $$|  $$$$$$$| $$|  $$$$$$$| $$  | $$| $$       |  $$$$//$$$$$$$/|  $$$$$$$| $$      | $$| $$  | $$|  $$$$$$$| $$      
|__/     |__/ \_______/|__/ \_______/|__/  |__/|__/        \___/ |_______/  \_______/|__/      |__/|__/  |__/ \_______/|__/      
 * 
 **/

 // 0x4B456694bd5c992E0A669586f3d33b5c15794Ebb in testnet 

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract BNBCollection is ERC721Enumerable, Ownable  
{   
    

    mapping(address => bool) private  _minters;
    string[] public tokenURIs; // to listing
    mapping(uint => string) _tokenIdToTokenURI;
    uint256 public alreadySold;
    uint256 public onSale;
    bool public saleIsActive;
     uint256 public tokenPrice = 300000000000000000; //0.3 BNB

    
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
   * @param id of token minted
   */
  event Mint(
    address indexed minter,
    uint256 id,
    uint256 date
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
    
    constructor() 
    ERC721("Malanftdriner Collection", "MLNFT") 
    {
        _minters[msg.sender] = true;

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
          
        require(saleIsActive, "Sale must be active to buy Tokens");
        require(onSale != 0, "There are no tokens to buy");
        require(msg.value >= tokenPrice, "value sent needs to be atleast sale price");
         uint256[] memory tokenId = tokensOfOwner(owner());
        _transfer(owner(), buyer, tokenId[0]);
        onSale = onSale - 1;
        alreadySold = alreadySold + 1;

       emit TokenPurchase(owner(), buyer, msg.value, tokenId[0]);
    }


        function safeMint(string memory _tokenURI) public  
        {
        require(_minters[msg.sender] || balanceOf(msg.sender) != 0, "You don't are allowed for minting");
        uint256 supply = totalSupply();
         tokenURIs.push(_tokenURI);
        uint _id = supply + 1;
        _tokenIdToTokenURI[_id] = _tokenURI;

        _safeMint(msg.sender, _id);

        emit Mint(msg.sender, _id, block.timestamp);

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
    
     function setTokenPrice(uint256 _tokenPrice) public onlyOwner 
    {
        tokenPrice = _tokenPrice;
    }

    function getBalance() public view onlyOwner returns(uint256)  
    {
        return address(this).balance;
    }
    

    function tokenURI(uint256 tokenId) public view override returns (string memory) 
    {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

            return _tokenIdToTokenURI[tokenId];
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
        _tokenIdToTokenURI[_tokenId] = _tokenURI;
    }
    
      /*
    * Pause sale if active, make active if paused
    */
    function flipSaleState() public onlyOwner 
    {
        saleIsActive = !saleIsActive;
    }

    /*
    *  Preparation amount of Tokens for sale in malandriner app. Only owner can sale.
    */
    function prepareSale() public onlyOwner 
    {   onSale = balanceOf(owner());
        
    }

}