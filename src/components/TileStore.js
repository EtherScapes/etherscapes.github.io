import React, {useEffect, useState} from "react";
import { useHistory } from "react-router";
import ReactTooltip from "react-tooltip";

import {Loading} from "./Loading.js";
import {packGifUri, getAllSceneInfo, getSceneInfo, tileImgUri } from "./contractHelpers.js";
import {BuyTilesModal} from "./Overlays.js";

import "./TileStore.css";

import BuySVG from "../svg/buy.svg";

////////////////////////////////////////////////////////////////////////////////

var Web3 = require("web3");

////////////////////////////////////////////////////////////////////////////////

const TileStore = (props) => {
  const {active, connected, user, estile, numScenes} = props;

  const history = useHistory();
  const [isLoading, setLoading] = useState(true);
  const [scenes, setScenes] = useState([]);
  const [buyTilesForSceneId, setBuyTilesForSceneId] = useState(0);

  //////////////////////////////////////////////////////////////////////////////

  const gotoScene = (sid, pid) => {
    history.push("/scene/" + sid + "/puzzle/" + (pid+1));
  }

  //////////////////////////////////////////////////////////////////////////////

  const updateSceneInfo = async (sidx) => {
    let desc = await getSceneInfo(estile, user, sidx);
    let found = false;
    let _scenes = scenes.map((sdesc) => {
      if (sdesc.sceneId === desc.sceneId) {
        found = true;
        return desc;
      }
      return sdesc;
    });
    if (found) {
      setScenes(_scenes);
    } else {
      setScenes(...scenes, desc);
    }
  }
  
  //////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!estile || !user || !numScenes) return;
    getAllSceneInfo(estile, user, numScenes.toNumber())
      .then((_scenes) => {
        setScenes(_scenes)
        setLoading(false);
      });
  }, [isLoading, estile, user, numScenes]);
  
  if (isLoading) {  
    return (
      <div className="info-main">
        <Loading message="Loading scenes" />
      </div>
    );
  } 

  //////////////////////////////////////////////////////////////////////////////
  const scenesDOM = scenes.map((scene, i) => {
    const np = scene.puzzleTokenEnd - scene.puzzleTokenStart + 1;
    const randomPuzzle = scene.puzzleTokenStart + Math.floor(Math.random() * np); 
    const sceneId = scene.sceneId;
    const costInEther = Web3.utils.fromWei(scene.ethCost.toString(), "ether");
    return (
      <div key={sceneId} className="TileStore-pack">
        <div className="scene-list">
          <div className="pack-holder">
            <div className="pack" 
                 onClick={()=>{gotoScene(1, 0)}}
                 data-tip data-for="packTooltip">
              <img className="static" src="https://raw.githubusercontent.com/EtherScapes/metadata/master/img/rift-seethru.png" alt={1} />
              <img className="active" src={packGifUri()} alt={sceneId} />
              <img className="bg" src={tileImgUri(randomPuzzle)} alt={sceneId} />
            </div>
          </div>
          <div className="scene-details">
            <div className="col">
              <div>rift #{scene.sceneId}</div>
              <div>{scene.tilesLeft.toString()} / {scene.maxTiles.toString()} shards left</div>
            </div>
            <div className="col">
              <div>shard cost:</div>
              <div>{costInEther} ETH / {scene.escCost.toString()} ESC</div>
            </div>
            {scene.tilesLeft.toNumber() > 0 && 
              <div className="col">
                <div className="grow"></div>
                <div className="buy-tiles clickable" onClick={()=>{setBuyTilesForSceneId(sceneId)}}>
                  <img src={BuySVG} alt="buy shards"></img> buy shards
                </div>
              </div>
            }
            {scene.tilesLeft.toNumber() === 0 && 
              <div>All sold out, trade shards to solve puzzles!</div>
            }
            <ReactTooltip id="packTooltip" place="bottom" arrowColor="var(--color-font)" >
              <div>Explore rift #{sceneId}</div>
            </ReactTooltip>
          </div>
        </div>
      </div>
    );
  });

  const newRiftComingSoon = (
    <div key={1} className="TileStore-pack">
      <div className="scene-list">
        <div className="pack-holder">
          <div className="pack">
            <img className="static" src="https://raw.githubusercontent.com/EtherScapes/metadata/master/img/rift-seethru.png" alt={1} />
            <img className="active" src={packGifUri()} alt={1} />
            <div className="bg">?</div>
          </div>
        </div>
        <div className="scene-details">
          <div className="col">
            <div></div>
            <div>new rift dropping soon!</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
        <BuyTilesModal
          {...props} 
          sceneId={buyTilesForSceneId}
          updateSceneInfo={updateSceneInfo} 
          close={() => {setBuyTilesForSceneId(0)}} />
        
        <div className="TileStore-list">
          <h4>Open rifts</h4>
          {scenesDOM}
          {newRiftComingSoon}
        </div>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////

export default TileStore;