import React, {useState} from "react";

import {packImgUri, packGifUri, getSceneInfo, getAllSceneInfo} from "./contractHelpers.js";

var Web3 = require("web3");

const TileStore = (props) => {
  const [isLoading, setLoading] = useState(true);
  const [scenes, setScenes] = useState([]);

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

  const buyTilesETH = async (sceneId, count=10) => {
    let cost = Web3.utils.toWei("0.02", "ether");
    await props.estilewrap.buyTilesForETH(sceneId, count, {
      value: cost * count, 
      from: props.user
    }).catch((err) => {
      console.log("Something went wrong,", err);
    });
    await updateSceneInfo(sceneId);
  }

  const buyTilesEscape = async (sceneId, cost, count=1) => {
    await props.estilewrap.buyTilesForEscape(sceneId, count, {
      from: props.user
    }).catch((err) => {
      console.log("Something went wrong,", err);
    });
    await updateSceneInfo(sceneId);
  }
  
  if (props.estile && props.user && props.numScenes && isLoading) {
    setLoading(false);
    getAllSceneInfo(props.estile, props.user, props.numScenes.toNumber())
      .then((_scenes) => {
        setScenes(_scenes)
      });
    return <div>Loading ...</div>;
  } 

  const scenesDOM = scenes.map((scene, i) => {
    console.log(scene, i);
    const sceneId = scene.sceneId;
    return (
      <div key={sceneId} className="TileStore-pack">
        <div className="col">
          <div>scene #{scene.sceneId}</div>
          <div>{scene.tilesLeft.toString()} tiles left</div>
        </div>
        <br></br>
        <div className="pack">
          <img className="static" src={packImgUri(sceneId)} alt={sceneId} />
          <img className="active" src={packGifUri(sceneId)} alt={sceneId} />
          <div className="col">
            <div className="col">
              <div></div>
              <div className="float">{scene.tilesLeft.toString()} x <span role="img" aria-label="puzzle">🧩</span></div>
            </div>
          </div>    
        </div>
        <br></br>
        <div className="col">
          <div>Buy tiles: </div>
          <div className="button" onClick={() => {buyTilesEscape(sceneId, 5, 1);}}>{5} ESC</div>
          {scene.tilesLeft.toNumber() > 0 && 
            <div className="button" onClick={() => {buyTilesETH(sceneId, 10);}}>0.02 ETH</div>}
        </div>
        <br></br>
        {/* {pack.balance <= 0 && <div>You own no packs.</div>}
        {pack.balance > 0 && 
          <div className="col">
            <div>x{pack.balance}</div>
            <div className="button" onClick={()=>{openPack(sceneId, 1);}}>open pack</div>
            <div className="button" onClick={()=>{openPack(sceneId, pack.balance);}}>open all ({pack.balance})</div>
          </div>} */}
      </div>
    );
  });

  return (
    <div className="TileStore-main">
      <br></br>
      <div className="TileStore-list">
        {scenesDOM}
      </div>
    </div>
  );
}

export default TileStore;