import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import MarketPlace from '../abis/Marketplace.json';

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData();
  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = MarketPlace.networks[networkId];
    if (networkData) {
      const marketplace = web3.eth.Contract(MarketPlace.abi, networkData.address);
      this.setState({ marketplace });
      let productCount = await marketplace.methods.productCount().call();
      productCount = productCount.toString();
      console.log(productCount);
      this.setState({ productCount });
      for (let i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call();
        this.setState({ products: [...this.state.products, product] })
      }
      console.log(this.state.products);
      this.setState({ isLoading: false })
    } else {
      window.alert('Contract not deployed.')
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      isLoading: true
    };
  }

  createProduct = (name, price) => {
    this.setState({ isLoading: true });
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ isLoading: false });
    })
  }

  purchaseProduct = (id, price) => {
    this.setState({ isLoading: true });
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price }).once('receipt', (receipt) => {
      this.setState({ isLoading: false });
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Goutham Coins
          </a>
        </nav>
        <div className="container-fluid mt-5">
          {this.state.isLoading ?
            <h3>Loading....</h3> :
            <div>
              <form onSubmit={(event) => {
                event.preventDefault();
                const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether');
                this.createProduct(this.productName.value, price);
              }} >
                <input type="text" placeholder='name' name='name' ref={(value) => this.productName = value} />
                <input type="text" placeholder='price' name='price' ref={(value) => this.productPrice = value} />
                <button type="submit" >Submit</button>
              </form>
              <table>
                <tbody>
                  <tr>
                    <th>ID </th>
                    <th>Name </th>
                    <th>Price </th>
                    <th>Owner </th>
                  </tr>
                  {this.state.products.map((product, key) => {
                    return (
                      <tr key={"row" + key}>
                        <td> {product.id.toString()} </td>
                        <td> {product.name} </td>
                        <td> {window.web3.utils.fromWei(product.price.toString(), 'Ether')} ETH </td>
                        <td> {product.owner} </td>
                        <td>
                          {!product.purchased &&
                            <button
                              name={product.id}
                              value={product.price}
                              onClick={(event) => {
                                this.purchaseProduct(event.target.name, event.target.value);
                              }}
                            >
                              Buy
                            </button>
                          }
                        </td>
                      </tr>);
                  }
                  )}
                </tbody>
              </table>
            </div>

          }
        </div>
      </div>
    );
  }
}

export default App;
