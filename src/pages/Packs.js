import React, {useState} from "react";
import ReactTooltip from "react-tooltip";

import TileStore from "../components/TileStore.js";
import {PageInfoPanel} from "../components/PageInfoPanel.js";


import CollectSVG from "../svg/collect.svg";
import SolveSVG from "../svg/puzzle.svg";
import EarnSVG from "../svg/salary.svg";


const Packs = (props) => {
  const {active, connected, contractsLoaded, user} = props;
  const [showTip, setShowTip] = useState(true);

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
          <p><span role="img" aria-label="earn">💰</span> Earn rare NFTs, and ESCAPE.</p>
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
        {showTip && 
          <div className="TileStore-blurb-tip">
            (Hint: Anything <span className="clickable">green</span> can be interacted with.)
            <span className="grow"></span>
            <span className="clickable" onClick={() => {setShowTip(false)}}>[x]</span>
          </div>
        }
        <br></br>
        {!(active && connected && user && contractsLoaded) &&
          <PageInfoPanel {...props} />
        }
        {active && connected && user && contractsLoaded &&
          <TileStore {...props} />
        }
      </div>
    </div>
  );
}

export default Packs;
  