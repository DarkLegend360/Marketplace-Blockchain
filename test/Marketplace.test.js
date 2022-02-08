const { assert } = require("chai");
require('chai').use(require('chai-as-promised')).should();
const MarketPlace = artifacts.require('./Marketplace.sol');

contract('.Marketplace', ([deployer, seller, buyer]) => {
    let marketplace;

    before(async () => {
        marketplace = await MarketPlace.deployed();
    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await marketplace.address;
            assert.notEqual(address, 0x0);
        });

        it('has a name', async () => {
            const name = await marketplace.name();
            assert.equal(name, 'Blockchain University');
        })
    })

    describe('products', async () => {
        let result, productCount;

        before(async () => {
            result = await marketplace.createProduct('iPhone 13', web3.utils.toWei('1', 'Ether'), { from: seller });
            productCount = await marketplace.productCount();
        });

        it('creates products', async () => {
            assert.equal(productCount, 1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(),
                productCount.toNumber(),
                'id is correct');
            assert.equal(event.owner,
                seller,
                'Seller is correct');
        });

        it('lists products', async () => {
            const product =
                await marketplace.products(productCount);
            assert.equal(product.id.toNumber(),
                productCount.toNumber());
        });

        it('sells product', async () => {
            let oldSellerBalance = await web3.eth.getBalance(seller);
            oldSellerBalance = new web3.utils.BN(oldSellerBalance);
            result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') });
            const event = result.logs[0].args;
            assert(event.id.toNumber(), productCount.toNumber(), 'id is correct');
            assert(event.purchased, true, 'purchase is correct');

            let newSellerBalance = await web3.eth.getBalance(seller);
            newSellerBalance = new web3.utils.BN(newSellerBalance);

            let price = web3.utils.toWei('1', 'Ether');
            price = new web3.utils.BN(price);

            const expectedBalance = oldSellerBalance.add(price);

            assert(newSellerBalance.toString(), expectedBalance.toString(), 'Seller Received');

            await marketplace.purchaseProduct(100, {
                from: buyer,
                value: web3.utils.toWei('1', 'Ether')
            }).should.be.rejected
        });
    })
})