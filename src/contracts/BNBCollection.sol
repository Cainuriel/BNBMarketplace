// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BNBCollection is ERC721, ERC721Enumerable, Ownable {

  string[] public tokenURIs;
  mapping(string => bool) _tokenURIExists;
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
  }
//
  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }
//
  function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
//
  function tokenURI(uint256 tokenId) public override view returns (string memory) {
    require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');
    return _tokenIdToTokenURI[tokenId];
  }
//
  function safeMint(string memory _tokenURI) public onlyOwner {
    require(!_tokenURIExists[_tokenURI], 'The token URI should be unique');
    tokenURIs.push(_tokenURI);    
    uint _id = tokenURIs.length;
    _tokenIdToTokenURI[_id] = _tokenURI;
    _safeMint(msg.sender, _id);
    _tokenURIExists[_tokenURI] = true;
  }

      function saleMintToken(address buyer) public payable 
    {
          
    require(saleIsActive, "Sale must be active to buy Tokens");
    require(onSale != 0, "There are no tokens to buy");
    require(msg.value >= tokenPrice, "value sent needs to be atleast sale price");
        uint256 id = totalSupply() - onSale;
        _transfer(owner(), buyer, id + 1);
        emit TokenPurchase(owner(), buyer, msg.value, id + 1);
        onSale = onSale - 1;
        alreadySold = alreadySold + 1;
    }

          /*
    * Pause sale if active, make active if paused
    */
    function flipSaleState() public onlyOwner 
    {   
        saleIsActive = !saleIsActive;
    }

          /*
    *  calculation of NFTs that will be for sale
    */
    function prepareSale() public onlyOwner 
    {   uint256 supply = tokenURIs.length;
        onSale = supply - alreadySold;
    }

        function withdraw() public onlyOwner 
    {
        uint256 amount = address(this).balance;
        payable(msg.sender).transfer(amount);
        flipSaleState();
        emit WithdrawTime(amount, block.timestamp);
        
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
    
}