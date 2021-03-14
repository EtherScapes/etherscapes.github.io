/*
 *  Entry-point for the RedVsBlue application.
 */

// React and associated components.
import React, { useState, useCallback, useEffect } from "react";
import { NavLink } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import Web3 from "web3";

import MainLayout from "./pages/MainLayout.js";
import {Footer} from "./components/Footer.js";

// Contract ABIs.
import _EscapeToken from "./contract/EscapeToken.json";
import _ESTile from "./contract/ESTile.json";
import _ESTileWrapper from "./contract/ESTileWrapper.json";
import _NamingContract from "./contract/NamingContract.json";

import { injected } from './components/Connectors.ts';
import { useWeb3React } from "@web3-react/core";
// import {
//   InjectedConnector,
//   NoEthereumProviderError,
//   UserRejectedRequestError as UserRejectedRequestErrorInjected
// } from "@web3-react/injected-connector";
import { useEagerConnect, useInactiveListener } from "./components/Hooks.ts";
// import { Web3Provider } from "@ethersproject/providers";
// import { formatEther } from "@ethersproject/units";

////////////////////////////////////////////////////////////////////////////////

import "./App.css";

////////////////////////////////////////////////////////////////////////////////

const toBN = Web3.utils.toBN;

////////////////////////////////////////////////////////////////////////////////

const App = (props) => {
  const context = useWeb3React();
  const { connector, library, chainId, account, activate, deactivate, 
          active, error } = context;

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState();
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);
  const [contractsLoaded, setContractsLoaded] = useState(false);
  const [escapeBalance, setEscapeBalance] = useState(toBN(0));
  const [escapeClaimable, setEscapeClaimable] = useState(toBN(0));
  const [numScenes, setNumScenes] = useState(0);
  const [numClaims, setNumClaims] = useState(0);

  const [escape, setEscape] = useState(undefined);
  const [namer, setNamer] = useState(undefined);
  const [estile, setESTile] = useState(undefined);
  const [estilewrap, setESTileWrap] = useState(undefined);

  // Callback to claim reward.
  const claimReward = useCallback(async () => {
    console.log(estile, account);
    return await estile.claimReward({from: account});
  }, [estile, account])

  // Callback to setup contracts (assumes user is setup!)
  useEffect(() => {
    async function setupContracts() {
      const contract = require("@truffle/contract");
    
      let EscapeTokenABI = contract(_EscapeToken);
      let ESTileABI = contract(_ESTile);
      let ESTileWrapperABI = contract(_ESTileWrapper);
      let NamingContractABI = contract(_NamingContract);
  
      EscapeTokenABI.setProvider(window.web3.currentProvider);
      ESTileABI.setProvider(window.web3.currentProvider);
      ESTileWrapperABI.setProvider(window.web3.currentProvider);
      NamingContractABI.setProvider(window.web3.currentProvider);
  
      const cEscape = await EscapeTokenABI.deployed();
      const cESTile = await ESTileABI.deployed();
      const cESTileWrap = await ESTileWrapperABI.deployed();
      const cNamer = await NamingContractABI.deployed();
  
      setESTile(cESTile);
      setEscape(cEscape);
      setESTileWrap(cESTileWrap);
      setNamer(cNamer);
  
      setContractsLoaded(true);
    }
    setupContracts();
  }, [setNamer, setESTileWrap, setESTile, setEscape, setContractsLoaded]);

  useEffect(() => {
    async function setupBalances() {
      if (!(estile && escape && account)) return;
      
      setEscapeBalance(await escape.balanceOf(account));
      setEscapeClaimable(await estile.getClaimInfo({from: account}))
      setNumClaims(await estile.claimLength(account));
      
      /*
      *  Now we need to figure how many scenes there are and how many puzzles 
      *  in each scene. If we have tokens that correspond to a scene, we list 
      *  them here.
      */
      setNumScenes(await estile.sceneCount());
     
      estile.allEvents()
      .on("data", (e) => {
        console.log(e);
      })
      .on("error", (err) => {
        console.log("error", err);
      });
    }
    setupBalances();
  }, [account, estile, escape, 
      setNumScenes, setNumClaims, setEscapeBalance, setEscapeClaimable])

  const connectInjectedWallet = useCallback(() => {
    setActivatingConnector(injected)
    activate(injected);
  }, [setActivatingConnector, activate]);

  // Activating - the wallet is attempting to open.
  const activating = injected === activatingConnector;
  // Connected - the account is connected.
  const connected = injected === connector;

  ////////////////////////////////////////////////////////////////////////////
  return (
    <div className="App">
      <div className="App-header">
        <NavLink exact activeClassName="isActive" to="/">EtherScapes</NavLink>
        <NavLink exact activeClassName="isActive" to="/about">FAQ</NavLink>
        <div className="grow"></div>
        <div className="balance" data-tip data-for="balanceTooltip">
          {escapeBalance.toString()} ESC
        </div>
        {escapeClaimable !== undefined && escapeClaimable.toNumber() > 0 && 
          <div className="balance clickable" 
                onClick={claimReward} 
                data-tip data-for="claimTooltip">
            ({escapeClaimable.toString()}, +{numClaims.toString()} per day)
          </div>
        }
        {escapeClaimable !== undefined && escapeClaimable.toNumber() === 0 && 
          <div className="balance" data-tip data-for="claimTooltip">
            ({escapeClaimable.toString()}, +{numClaims.toString()} per day)
          </div>
        }
        <ReactTooltip id="claimTooltip" arrowColor="var(--color-font)" place="bottom">
          <p>Claimable ESCAPE, <br></br>
              earnings per day.
          </p>
        </ReactTooltip>   
        <ReactTooltip id="balanceTooltip" arrowColor="var(--color-font)" place="bottom">
          <p>Your current ESCAPE balance.</p>
        </ReactTooltip>   
      </div>
      <div className="App-body">
        <div className="App-scroll">
          <div style={{flexGrow: 1}}>
            <MainLayout 
              connectWallet={connectInjectedWallet}
              connected={connected}
              activating={activating}
              active={active}
              contractsLoaded={contractsLoaded}
              user={account}
              balance={escapeBalance}
              claim={escapeClaimable}
              numScenes={numScenes}
              escape={escape}
              estile={estile}
              namer={namer}
              estilewrap={estilewrap} 
              error={error}
            />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////

export default App;

////////////////////////////////////////////////////////////////////////////////
