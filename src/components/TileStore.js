import React, {useState} from "react";
import { useHistory } from "react-router";

import {Loading} from "./Loading.js";
import {packImgUri, packGifUri, getAllSceneInfo, getSceneInfo } from "./contractHelpers.js";
import {BuyTilesModal} from "./Overlays.js";

import "./TileStore.css";

import CollectSVG from "../svg/collect.svg";
import SolveSVG from "../svg/puzzle.svg";
import EarnSVG from "../svg/salary.svg";
import BuySVG from "../svg/buy.svg";

////////////////////////////////////////////////////////////////////////////////

const TileStore = (props) => {
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
    let desc = await getSceneInfo(props.estile, props.user, sidx);
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

  if (!props.estile || !props.user) {
    return <Loading message="Talking to contract" />;
  }

  if (props.estile && props.user && props.numScenes && isLoading) {
    getAllSceneInfo(props.estile, props.user, props.numScenes.toNumber())
      .then((_scenes) => {
        setScenes(_scenes)
        setLoading(false);
      });
    return <Loading message="Loading scenes" />;
  } 

  //////////////////////////////////////////////////////////////////////////////

  const scenesDOM = scenes.map((scene, i) => {
    const sceneId = scene.sceneId;
    return (
      <div key={sceneId} className="TileStore-pack">
        <div className="scene-list">
          <div className="pack-holder">
            <div className="pack" onClick={()=>{gotoScene(1, 0)}}>
              <img className="static" src={packImgUri(sceneId)} alt={sceneId} />
              <img className="active" src={packGifUri(sceneId)} alt={sceneId} />
            </div>
          </div>
          <div className="scene-details">
            <div className="col">
              <div>rift #{scene.sceneId}</div>
              <div>{scene.tilesLeft.toString()} tiles left</div>
            </div>
            <div className="buy-tiles clickable" onClick={()=>{setBuyTilesForSceneId(sceneId)}}>
              <img src={BuySVG} alt="buy shards"></img> buy shards
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="TileStore-main">
      <BuyTilesModal
        {...props} 
        sceneId={buyTilesForSceneId}
        updateSceneInfo={updateSceneInfo} 
        close={() => {setBuyTilesForSceneId(0)}} />
      <div className="TileStore-blurb">
        <div>
          <img src={CollectSVG} alt="collect" />
          <div>collect shards</div>
        </div>
        <div>
          <img src={SolveSVG} alt="solve" />
          <div>solve puzzles</div>
        </div>
        <div>
          <img src={EarnSVG} alt="earn" />
          <div>earn ESCAPE</div>
        </div>
      </div>
      <div className="TileStore-blurb">
        <p>1. Use ESCAPE to buy shards from any scene.</p>
        <p>2. Use ESCAPE to set the name of a solved puzzle.</p>
        <p>3. New rifts drop every month!</p>
      </div>
      <br></br>
      <div className="TileStore-list">
        <h4>Open rifts</h4>
        {scenesDOM}
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////

export default TileStore;