const Marketplace = artifacts.require("Marketplace")

require("chai")
    .use(require("chai-as-promised"))
    .should()

contract("Marketplace", ([deployer, seller, buyer]) => {
    let marketplace

    before(async () => {
        marketplace = await Marketplace.deployed()
    })

    describe("deployment", async () => {
        it("deploys successfully", async () => {
            const address = await marketplace.address
            assert.notEqual(address, 0)
            assert.notEqual(address, "")
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it("has a name", async () => {
            const name = await marketplace.name()
            assert.equal(name, "Lens_r Marketplace, ig")
        })
    })

    describe("products", async () => {
        let result, productCount

        before(async () => {
            result = await marketplace.createProduct("CRAB GAME", web3.utils.toWei("25", "Ether"), { from: seller })
            productCount = await marketplace.productCount()
        })

        it("creates products", async () => {
            assert.equal(productCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct")
            assert.equal(event.name, "CRAB GAME", "name is correct")
            assert.equal(event.price, "25000000000000000000", "price is correct")
            assert.equal(event.seller, seller, "seller is correct")

            // FAILURE: Product must have a name
            await await marketplace.createProduct("", web3.utils.toWei("25", "Ether"), { from: seller }).should.be.rejected;
            // FAILURE: Product must have a price
            await await marketplace.createProduct("CRAB GAME", 0, { from: seller }).should.be.rejected;
        })

        it('sells products', async () => {
            // Track the seller balance before purchase
            let oldSellerBalance
            oldSellerBalance = await web3.eth.getBalance(seller)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)

            // SUCCESS: Buyer makes purchase
            result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei("25", "Ether")})

            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct")
            assert.equal(event.name, "CRAB GAME", "name is correct")
            assert.equal(event.price, "25000000000000000000", "price is correct")
            assert.equal(event.seller, seller, "seller is correct")
            assert.equal(event.buyer, buyer, "buyer is correct")

            // Check that seller received funds
            let newSellerBalance
            newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance)

            let price
            price = web3.utils.toWei("25", "Ether")
            price = new web3.utils.BN(price)

            const exepectedBalance = oldSellerBalance.add(price)
            assert.equal(newSellerBalance.toString(), exepectedBalance.toString())

            // FAILURE: Tries to buy a product that does not exist, i.e., product must have valid id
            await await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei("25", "Ether")}).should.be.rejected;      // FAILURE: Buyer tries to buy without enough ether
            // FAILURE: Buyer tries to buy without enough ether
            await await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei("0.5", "Ether") }).should.be.rejected;
        })
    })

})
