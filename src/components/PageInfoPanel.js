
import React from "react";

import {Loading} from "./Loading.js";

import { UnsupportedChainIdError } from "@web3-react/core"
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from "@web3-react/injected-connector"

const decodeError = (err) => {
  if (err instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile."
  } else if (err instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  } else if (err instanceof UserRejectedRequestErrorInjected) {
    return "Please authorize this website to access your Ethereum account."
  } else if (err !== undefined) {
    console.error(err)
    return "An unknown error occurred. Check the console for more details."
  }
  return undefined;
}

export const ConnectWallet = (props) => {
  return (
    <div className="info">
      <p onClick={()=>{props.connect()}}>Connect your metamask wallet to continue.</p>
      <p>Check out our <a className="clickable" href="/#/about">FAQ</a> to learn more.</p>
  </div>
  )
}

export const PageInfoPanel = (props) => {
  const {error, activating, connected, connectWallet, active, contractsLoaded} = props;
  const errMsg = decodeError(error);
  return (
    <div className="info-main">
      {error && errMsg && 
        <div className="err">
          {errMsg}
        </div>
      }
      {!activating && !connected && 
        <ConnectWallet connect={connectWallet} />
      }
      {activating && !connected && 
        <Loading message="Connecting to wallet" />
      }
      {active && connected && !contractsLoaded && 
        <Loading message="Loading contracts" />
      }
    </div>
  )
}