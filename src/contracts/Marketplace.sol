pragma solidity ^0.5.0;

contract Marketplace {
    struct Product {
        uint id;
        string name;
        uint price;
        address payable seller;
    }

    event ProductCreated (
        uint id,
        string name,
        uint price,
        address payable seller
    );

    event ProductPurchased (
        uint id,
        string name,
        uint price,
        address payable seller,
        address buyer
    );

    string public name;
    uint public productCount;
    mapping(uint => Product) public products;

    constructor() public {
        name = "Lens_r Marketplace, ig";
    }

    function createProduct(string memory _name, uint _price) public {
        require(bytes(_name).length > 0);
        require(_price > 0);
        productCount++;
        // Create the product
        products[productCount] = Product(productCount, _name, _price, msg.sender);
        // Trigger an event
        emit ProductCreated(productCount, _name, _price, msg.sender);
    }

    function purchaseProduct(uint _id) public payable {
        Product memory _product = products[_id];
        address payable _seller = _product.seller;
        require(_product.id > 0 && _product.id <= productCount);
        require(msg.value >= _product.price);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);
        // Update the product
        products[_id] = _product;
        // Pay the seller by sending them Ether
        _seller.transfer(msg.value);
        // Trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, _seller, msg.sender);
    }
}
