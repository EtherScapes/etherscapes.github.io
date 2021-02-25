import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom";

import {ShardInner} from "../pages/Shard.js";

////////////////////////////////////////////////////////////////////////////////

var Web3 = require("web3");

////////////////////////////////////////////////////////////////////////////////

export const Modal = (props) => {
  return ReactDOM.createPortal(
    <div className="modal">
      <div className="modal-body">
        {props.children}
      </div>
    </div>,
    document.querySelector("#modal"));
}


////////////////////////////////////////////////////////////////////////////////

export const useInput = ({ type }) => {
  const [value, setValue] = useState("");
  const input = <input value={value} 
                        onChange={e => setValue(e.target.value)} 
                        type={type} />;
  return [value, input];
}

////////////////////////////////////////////////////////////////////////////////

export const useEscape = (onEscape) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) 
        onEscape();
      };
      window.addEventListener('keydown', handleEsc);

      return () => {
        window.removeEventListener('keydown', handleEsc);
      };
    }, []);
}

////////////////////////////////////////////////////////////////////////////////

export const BuyTilesModal = (props) => {
  const [numToBuy, numToBuyInput] = useInput(0);

  //////////////////////////////////////////////////////////////////////////////

  const buyTilesETH = async () => {
    let cost = Web3.utils.toWei("0.02", "ether");
    await props.estilewrap.buyTilesForETH(props.sceneId, numToBuy, {
      value: cost * numToBuy, 
      from: props.user
    }).catch((err) => {
      console.log("Something went wrong,", err);
    });
    await props.close();
    await props.updateSceneInfo(props.sceneId);
  }

  const buyTilesEscape = async () => {
    await props.estilewrap.buyTilesForEscape(props.sceneId, numToBuy, {
      from: props.user
    }).catch((err) => {
      console.log("Something went wrong,", err);
    });
    await props.close();
    await props.updateSceneInfo(props.sceneId);
  }

  //////////////////////////////////////////////////////////////////////////////

  useEscape(() => props.close());

  return (
    <>
      {props.sceneId > 0 &&
        <Modal>
          <div className="tilestore-modal">
            <h1>Buying tiles for scene {props.sceneId}</h1>
            <br></br>
            <div className="col">
              <div>Number of shards:</div>
              {numToBuyInput}
            </div> 
            <br></br>
            <div className="col">
              <div className="clickable" onClick={() => {buyTilesEscape();}}>Use ESC</div>
              <span className="spacer"></span>
              <div className="clickable" onClick={() => {buyTilesETH();}}>Use ETH</div>
              <div className="grow"></div>
              <div className="clickable" onClick={() => {props.close()}}>CLOSE</div>
            </div>
          </div>
        </Modal>
      }
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////

export const ShardPreviewModal = (props) => {
  
  useEscape(() => props.close());

  // TODO: Look up balances based on tokenId similar to shard here.
  console.log(props.tokenId);
  return (
    <>
      {props.tokenId > 0 &&
        <Modal>
          <div className="tilestore-modal">
          <ShardInner
            {...props}
            name={props.name || "loading ..."}
            id={props.tokenId}
            balance={0}
            supply={0} />
            <br></br>
            <div className="col">
              <div className="grow"></div>
              <div className="clickable" onClick={() => {props.close()}}>CLOSE</div>
            </div>
          </div>
        </Modal>
      }
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////