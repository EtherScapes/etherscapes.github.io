import React from "react";
import ReactTooltip from "react-tooltip";

import TileStore from "../components/TileStore.js";
import {Loading} from "../components/Loading.js";


import CollectSVG from "../svg/collect.svg";
import SolveSVG from "../svg/puzzle.svg";
import EarnSVG from "../svg/salary.svg";

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

const Packs = (props) => {
  const {activating, error, active, connected, contractsLoaded, user} = props;
  const errMsg = decodeError(error);
  return (
    <div className="TileStore-main">
      <div className="tooltips">
        <ReactTooltip id="infoEscapeTooltip" arrowColor="var(--color-font)">
          <p><span role="img" aria-label="burn">🔥</span> Burn ESCAPE (ERC20) for shards from open rifts.</p>
          <p><span role="img" aria-label="burn">🔥</span> Burn ESCAPE to (re)name solved puzzles.</p>
        </ReactTooltip>
        <ReactTooltip id="infoShardTooltip" arrowColor="var(--color-font)">
          <p><span role="img" aria-label="tile">🧩</span> Shards are puzzle pieces from EtherScape rifts.</p>
          <p><span role="img" aria-label="contract">📰</span> Each shard is a NFT (ERC1155) with limited supply.</p>
          <p><span role="img" aria-label="factory">🚧</span> Rifts mint random shards until they run out.</p>
          <p><span role="img" aria-label="earn">💰</span> Trade shard tokens on 3rd party markets.</p>
        </ReactTooltip>
        <ReactTooltip id="infoPuzzleTooltip" arrowColor="var(--color-font)">
          <p><span role="img" aria-label="tile">🧩</span> Each rift contains a set number of puzzles to solve.</p>
          <p><span role="img" aria-label="burn">🔥</span> Burn all shards from a puzzle to solve it.</p>
          <p><span role="img" aria-label="earn">💰</span> Solved puzzles reward even rarer NFTs and earn 1 ESCAPE per day.</p>
          <p><span role="img" aria-label="earn">💰</span> Trade completed puzzle tokens on 3rd party markets.</p>
        </ReactTooltip>
      </div>
      <div className="Packs-main">
        <div className="TileStore-blurb">
          <div className="clickable" data-tip data-for="infoShardTooltip" data-effect="solid" data-place="bottom">
            <img src={CollectSVG} alt="collect" />
            <div>collect shards</div>
          </div>
          <div className="clickable" data-tip data-for="infoPuzzleTooltip" data-effect="solid" data-place="bottom">
            <img src={SolveSVG} alt="solve" />
            <div>solve puzzles</div>
          </div>
          <div className="clickable" data-tip data-for="infoEscapeTooltip" data-effect="solid" data-place="bottom">
            <img src={EarnSVG} alt="earn" />
            <div>earn ESCAPE</div>
          </div>
        </div>
        <br></br>
        {!(active && connected && user && contractsLoaded) &&
          <div className="info-main">
            {error && errMsg && 
              <div className="err">
                {errMsg}
              </div>
            }
            {!activating && !connected && 
              <div className="info">
                <p onClick={()=>{props.connectWallet()}}>Connect your metamask wallet to continue.</p>
                <p>Check out our <a className="clickable" href="/#/about">FAQ</a> to learn more.</p>
              </div>
            }
            {activating && !connected && 
              <Loading message="Connecting to wallet" />
            }
            {active && connected && !contractsLoaded && 
              <Loading message="Loading contracts" />
            }
          </div>
        }
        {active && connected && user && contractsLoaded &&
          <TileStore {...props} />
        }
      </div>
    </div>
  );
}

export default Packs;
  