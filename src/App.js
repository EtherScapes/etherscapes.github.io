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
import _ESTileWrapper from "./contract/ESTileWrapper.json";
import _NamingContract from "./contract/NamingContract.json";


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
      escapeBalance: 0,
      escapeClaimable: 0,

      // Total scene info stuff.
      numScenes: 0,

      // Number of solved puzzle tokens.
      numClaims: 0,
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

  getEscapeBalance = async () => {
    return await this.contracts.escape.balanceOf(this.accounts[0]);
  }

  getEscapeClaimable = async () => {
    return await this.contracts.estile.getClaimInfo({from: this.accounts[0]});
  }

  claimReward = async () => {
    return await this.contracts.estile.claimReward({from: this.accounts[0]});
  }

  getNumClaims = async () => {
    return await this.contracts.estile.claimLength(this.accounts[0]);
  }

  instantiateContracts = async () => {
    const contract = require("@truffle/contract");
    
    this.contracts_abi.EscapeToken = contract(_EscapeToken);
    this.contracts_abi.ESTile = contract(_ESTile);
    this.contracts_abi.ESTileWrapper = contract(_ESTileWrapper);
    this.contracts_abi.NamingContract = contract(_NamingContract);

    this.contracts_abi.EscapeToken.setProvider(window.web3.currentProvider);
    this.contracts_abi.ESTile.setProvider(window.web3.currentProvider);
    this.contracts_abi.ESTileWrapper.setProvider(window.web3.currentProvider);
    this.contracts_abi.NamingContract.setProvider(window.web3.currentProvider);

    this.contracts.escape = await this.contracts_abi.EscapeToken.deployed();
    this.contracts.estile = await this.contracts_abi.ESTile.deployed();
    this.contracts.estilewrap = await this.contracts_abi.ESTileWrapper.deployed();
    this.contracts.namer = await this.contracts_abi.NamingContract.deployed();

    await this.subscribeToEvents();    

    let escapeBalance = await this.getEscapeBalance();
    let escapeClaimable = await this.getEscapeClaimable();
    let numClaims = await this.getNumClaims();
    
    /*
     *  Now we need to figure how many scenes there are and how many puzzles 
     *  in each scene. If we have tokens that correspond to a scene, we list 
     *  them here.
     */
    let numScenes = await this.contracts.estile.sceneCount();

    /*
     *  Update app state!
     */
    this.setState({
      numClaims: numClaims,
      numScenes: numScenes,
      escapeBalance: escapeBalance,
      escapeClaimable: escapeClaimable,
    });
  }

  subscribeToEvents = async () => {
    console.log("subscribe...");
    this.contracts.estile.allEvents()
      .on("data", (e) => {
        console.log(e);
      })
      .on("error", (err) => {
        console.log("error", err);
      });
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
          <NavLink exact activeClassName="isActive" to="/">EtherScapes</NavLink>
          <NavLink exact activeClassName="isActive" to="/packs">Packs</NavLink>
          <NavLink exact activeClassName="isActive" to="/about">About</NavLink>
          <div className="grow"></div>
          <div className="balance">{this.state.escapeBalance.toString()} ESC</div>
          <div className="balance" onClick={()=> {this.claimReward()}}>({this.state.escapeClaimable.toString()}, +{this.state.numClaims.toString()} per day)</div>
        </div>
        <div className="App-body">
          <MainLayout 
            balance={this.state.escapeBalance}
            claim={this.state.escapeClaimable}
            numScenes={this.state.numScenes}
            numPacks={this.state.numPacks}
            estile={this.contracts.estile}
            namer={this.contracts.namer}
            estilewrap={this.contracts.estilewrap} 
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
