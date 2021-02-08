/*
 *  Entry-point for the RedVsBlue application.
 */

// React and associated components.
import React, { Component } from "react";
import Web3 from "web3";

import PackStore from "./components/PackStore.js";

// Contract ABIs.
import _EscapeToken from "./contract/EscapeToken.json";
import _ESTile from "./contract/ESTile.json";
import _ESTilePack from "./contract/ESTilePack.json";
import _ESTileWrapper from "./contract/ESTileWrapper.json";


import "./App.css";

////////////////////////////////////////////////////////////////////////////////

class App extends Component {
	// App constructor - sets up default state.
	constructor(props) {
    super(props);
      
    this.updateAccounts = this.updateAccounts.bind(this);

    this.web3 = null;
    this.contracts = {};
    this.contracts_abi = {};
    this.accounts = [];

    this.state = {
      // Number of ESCAPE credit balance for user.
      escape_balance: 0,

      // Number of packs minted so far.
      total_packs: 0, 
      packs: [],
    };
	}

	// mounted ::
	componentDidMount() {
		return this.initWeb3();
  }

	////////////////////////////////////////////////////////////////////////////
	// Helpers.
	////////////////////////////////////////////////////////////////////////////

	resolve_promise = (f, args=[]) => {
		return new Promise((resolve, reject) => {
			f(...args, (err, result) => {
				if (err !== null) reject(err);
				else resolve(result);
			});
		});
	}

	////////////////////////////////////////////////////////////////////////////
	//  Contract basics.
	////////////////////////////////////////////////////////////////////////////

  initWeb3 = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        this.updateAccounts(accounts);
        window.ethereum.on("accountsChanged", this.updateAccounts);
        window.ethereum.enable();
      } catch (err) {
        console.log("User denied web3 account access");
        return;
      }
      this.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.error("No web3 provider detected!");
      return;
    }

    return this.instantiateContracts();
  }

  updateAccounts = async (accounts) => {
    const firstTime = !(this.accounts && this.accounts[0]);
    this.accounts = accounts || await this.web3.eth.getAccounts();
    if (!firstTime) {
      this.updateApp();
    }
  }

	instantiateContracts = async () => {
		const contract = require("@truffle/contract");
		
		this.contracts_abi.EscapeToken = contract(_EscapeToken);
		this.contracts_abi.ESTile = contract(_ESTile);
		this.contracts_abi.ESTilePack = contract(_ESTilePack);
		this.contracts_abi.ESTileWrapper = contract(_ESTileWrapper);

		this.contracts_abi.EscapeToken.setProvider(window.web3.currentProvider);
		this.contracts_abi.ESTile.setProvider(window.web3.currentProvider);
		this.contracts_abi.ESTilePack.setProvider(window.web3.currentProvider);
		this.contracts_abi.ESTileWrapper.setProvider(window.web3.currentProvider);

    this.contracts.escape = await this.contracts_abi.EscapeToken.deployed();
    this.contracts.estile = await this.contracts_abi.ESTile.deployed();
    this.contracts.estilepack = await this.contracts_abi.ESTilePack.deployed();
    this.contracts.estilewrap = await this.contracts_abi.ESTileWrapper.deployed();

    // Figure out how many packs we have available for sale.
    const _np = await this.contracts.estilepack.numPacksCreated();
    const totalPacks = _np.toNumber();
    
    // All pack token ids start at 1, query stats for each one.
    let packs = [];
    for (var pidx = 1; pidx <= totalPacks; pidx++) {
      const _desc = await this.contracts.estilepack.getPackInfo(pidx);
      const _bal  = await this.contracts.estilepack.balanceOf(this.accounts[0], pidx);
      packs.push({
        sceneId: _desc[0].toNumber(),
        escapeCost: _desc[1].toNumber(),
        isPurchaseable: _desc[2],
        tilesPerPack: _desc[3].toNumber(),
        maxQuant: _desc[4].toNumber(),
        packsLeft: _desc[5].toNumber(),
        balance: _bal.toNumber(),
      });
    }

    // 
    this.setState({
      total_packs: totalPacks,
      packs: packs,
    });

    // console.log(x);
    // this.updateApp();
	}

	subscribeToEvents = async () => {
	}

	////////////////////////////////////////////////////////////////////////////
	//  Accounts and other web3.eth stuff.
	////////////////////////////////////////////////////////////////////////////


	////////////////////////////////////////////////////////////////////////////
	//  Round updates for totals, percentages UI etc as well as refresh logic.
	////////////////////////////////////////////////////////////////////////////

	updateApp = async() => {    
    // console.log("Account0      = ", this.accounts[0]);
    // console.log("EscapeToken   = ", this.contracts["EscapeToken"].address);
    // console.log("ESTile        = ", this.contracts["ESTile"].address);
    // console.log("ESTilePack    = ", this.contracts["ESTilePack"].address);
    // console.log("ESTileWrapper = ", this.contracts["ESTileWrapper"].address);
    this.setState({
      // TODO
    });
	}

	////////////////////////////////////////////////////////////////////////////
	// Contract interaction.
	////////////////////////////////////////////////////////////////////////////

	
	////////////////////////////////////////////////////////////////////////////
	// User Interaction.
	////////////////////////////////////////////////////////////////////////////

	render() {
		return (
		  <div className="App">
				<div className="App-header">
					EtherScapes
				</div>
        <div className="App-body">
          <div>Packs={this.state.total_packs}</div>
          <div>ESCAPE={this.state.escape_balance}</div>
          <PackStore 
            packs={this.state.packs} 
            estilewrap={this.contracts.estilewrap} 
            estilepack={this.contracts.estilepack} 
            user={this.accounts[0]} />
        </div>
      </div>
		);
	}
}

////////////////////////////////////////////////////////////////////////////////

export default App;

////////////////////////////////////////////////////////////////////////////////
