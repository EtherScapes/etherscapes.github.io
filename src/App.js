/*
 *  Entry-point for the RedVsBlue application.
 */

// React and associated components.
import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import Web3 from "web3";

import MainLayout from "./pages/MainLayout.js";

// Contract ABIs.
import _EscapeToken from "./contract/EscapeToken.json";
import _ESTile from "./contract/ESTile.json";
import _ESTilePack from "./contract/ESTilePack.json";
import _ESTileWrapper from "./contract/ESTileWrapper.json";


import "./App.css";

////////////////////////////////////////////////////////////////////////////////

const UniswapABI = [{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"minter_","type":"address"},{"internalType":"uint256","name":"mintingAllowedAfter_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"address","name":"fromDelegate","type":"address"},{"indexed":true,"internalType":"address","name":"toDelegate","type":"address"}],"name":"DelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegate","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBalance","type":"uint256"}],"name":"DelegateVotesChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"address","name":"newMinter","type":"address"}],"name":"MinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DELEGATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DOMAIN_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint32","name":"","type":"uint32"}],"name":"checkpoints","outputs":[{"internalType":"uint32","name":"fromBlock","type":"uint32"},{"internalType":"uint96","name":"votes","type":"uint96"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"delegatee","type":"address"}],"name":"delegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"delegateBySig","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"delegates","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getCurrentVotes","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"getPriorVotes","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minimumTimeBetweenMints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"mintCap","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"mintingAllowedAfter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"numCheckpoints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"minter_","type":"address"}],"name":"setMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];


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
      escapeBalance: 0,

      // Number of packs minted so far.
      totalPacks: 0, 
      packs: [],

      // Total scene info stuff
      numScenes: 0,
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

  updatePacks = async () => {
    const _np = await this.contracts.estilepack.numPacksCreated();
    const totalPacks = _np.toNumber();

    /*
     *  All pack token ids start at 1, query stats for each one so we know how 
     *  many are left, if they can be purchased and our personal count for them.
     * 
     *  The `PackStore` component is how we open / purchase / see our packs.
     */
    let packs = [];
    for (var pidx = 1; pidx <= totalPacks; pidx++) {
      const _desc = await this.contracts.estilepack.getPackInfo(pidx);
      const _bal  = await this.contracts.estilepack.balanceOf(this.accounts[0], pidx);
      packs.push({
        packId: pidx,
        sceneId: _desc[0].toNumber(),
        escapeCost: _desc[1].toNumber(),
        isPurchaseable: _desc[2],
        tilesPerPack: _desc[3].toNumber(),
        maxQuant: _desc[4].toNumber(),
        packsLeft: _desc[5].toNumber(),
        balance: _bal.toNumber(),
      });
    }

    return {
      totalPacks: totalPacks, 
      packs: packs,
    };
  }

  updateEscapeBalance = async () => {
    const _b = await this.contracts.escape.balanceOf(this.accounts[0]);
    return _b.toNumber();
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

    

    /*
     *  Figure out how many packs we have available for sale.
     */
    
    let packsDesc = await this.updatePacks();

    let escapeBalance = await this.updateEscapeBalance();
    
    /*
     *  Now we need to figure how many scenes there are and how many puzzles 
     *  in each scene. If we have tokens that correspond to a scene, we list 
     *  them here.
     */
    let _scenes = await this.contracts.estile.sceneCount();
    const numScenes = _scenes.toNumber();
    
    // let scenes = [];
    // for (var sidx = 1; sidx <= numScenes; sidx++) {
    //   const _tokRange = await this.contracts.estile.tokenRangeForScene(sidx);
    //   const numTiles   = _tokRange[1].toNumber();
    //   const numPuzzles = _tokRange[2].toNumber();
      
    //   // Ranges for the tokens in this scene. 
    //   const start_tile_range = _tokRange[0].toNumber();
    //   const end_tile_range = start_tile_range + numTiles - 1;
    //   const start_puzzle_range = end_tile_range + 1;
    //   const end_puzzle_range = start_puzzle_range + numPuzzles - 1;
      
    //   let tileTokens = [];
    //   for (var ttok = start_tile_range; ttok <= end_tile_range; ttok++) {
    //     const _b = await this.contracts.estile.balanceOf(this.accounts[0], ttok);
    //     tileTokens.push(_b.toNumber());
    //   }
      
    //   let puzzleTokens = [];
    //   for (var ptok = start_puzzle_range; ptok <= end_puzzle_range; ptok++) {
    //     const _b = await this.contracts.estile.balanceOf(this.accounts[0], ptok);
    //     puzzleTokens.push(_b.toNumber());
    //   }

    //   let sceneDesc = {
    //     sceneId: sidx,
    //     tileTokenStart: start_tile_range,
    //     tileTokenEnd: end_tile_range,
    //     puzzleTokenStart: start_puzzle_range,
    //     puzzleTokenEnd: end_puzzle_range,
    //     numTiles: numTiles,
    //     numPuzzles: numPuzzles,
    //     tileTokens: tileTokens,
    //     puzzleTokens: puzzleTokens,
    //   };
    //   scenes.push(sceneDesc);
    // }

    /*
     *  Update app state!
     */
    this.setState({
      totalPacks: packsDesc.totalPacks,
      packs: packsDesc.packs,
      numScenes: numScenes,
      // scenes: scenes,
      escapeBalance: escapeBalance,
    });
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
					<NavLink to="/">EtherScapes</NavLink>
          <NavLink activeClassName="isActive" to="/packs">Packs</NavLink>
          <NavLink activeClassName="isActive" to="/about">About</NavLink>
          <div className="grow"></div>
          <div className="balance">{this.state.escapeBalance} ESC</div>
				</div>
        <div className="App-body">
          <MainLayout 
            balance={this.state.escapeBalance}
            packs={this.state.packs} 
            scenes={this.state.scenes}
            estile={this.contracts.estile}
            estilewrap={this.contracts.estilewrap} 
            estilepack={this.contracts.estilepack} 
            user={this.accounts[0]}
          />
        </div>
      </div>
		);
	}
}

////////////////////////////////////////////////////////////////////////////////

export default App;

////////////////////////////////////////////////////////////////////////////////
