import React, { Component } from "react";
import Navbar from "./Navbar"
import Main from "./Main"
import Marketplace from "../abis/Marketplace.json"
import "./App.css";
import Web3 from "web3";

class App extends Component {
    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!")
        }
    }

    // Update "products" in state to the products available from the Marketplace smart contract.
    async update_products() {
        const productCount = await this.state.marketplace.methods.productCount().call()
        this.setState({ productCount })
        this.setState({ products: [] }) // clear products array
        for (var i = 1; i <= productCount; i++) {
            const product = await this.state.marketplace.methods.products(i).call()
            this.setState({
                products: [...this.state.products, product]
            })
        }
    }

    async loadBlockchainData() {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        // Save first account in React state
        this.setState({ account: accounts[0] })
        // Connect smart contract
        const networkId = await web3.eth.net.getId()
        const networkData = Marketplace.networks[networkId]
        if(networkData) {
            const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address)
            this.setState({ marketplace })
            await this.update_products()
        } else {
            window.alert('Lens_r Marketplace contract not deployed to detected network.')
        }
    }

    async componentWillMount() {
        this.setState({ loading: true })
        await this.loadWeb3()
        await this.loadBlockchainData()
        this.setState({ loading: false })
    }

    createProduct(name, price) {
        this.setState({ loading: true })
        // This calls the smart contract function.
        this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
            .on("error", console.error)
            // This one works!
            .once("confirmation", (number, receipt, latestBlockHash) => {
                this.update_products()
            })
            /* This gets called too early.
            .once("transactionHash", (hash) => {
                console.log("Created product (TX HASH)!")
                console.log(hash)
                this.update_products()
            })
            */
            /* This never gets called.
            .then((receipt) => {
                console.log("Created product (THEN)!")
                console.log(receipt)
                this.update_products()
                window.location.reload()
              })
            */
            /* This never gets called.
            .on("receipt", (receipt) => {
                console.log("Created product (RECEIPT)!")
                console.log(receipt)
                this.update_products()
                window.location.reload()
              })
              */
        this.setState({ loading: false })
    }

    purchaseProduct(id, price) {
        this.setState({ loading: true })
        // This calls the smart contract function.
        this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
            .on("error", console.error)
            .once("confirmation", (number, receipt, latestBlockHash) => {
                console.log("Purchased product!")
            })
        this.setState({ loading: false })
    }

    constructor(props) {
        super(props)
        this.state = {
            account: "",
            productCount: 0,
            products: [],
            loading: false
        }
        this.createProduct = this.createProduct.bind(this)
        this.purchaseProduct = this.purchaseProduct.bind(this)
    }

    render() {
        return (
            <div>
                <Navbar account={this.state.account}/>
                    <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            { this.state.loading
                                ? <div id="loader" className="text-center"><p className="text-center">Loading</p></div>
                                : <Main
                                      products={this.state.products}
                                      createProduct={this.createProduct}
                                      purchaseProduct={this.purchaseProduct}
                                  />
                            }
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
