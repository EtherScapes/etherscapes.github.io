import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom";

import {ShardInner} from "../pages/Shard.js";

////////////////////////////////////////////////////////////////////////////////

var Web3 = require("web3");
const toBN = Web3.utils.toBN;

////////////////////////////////////////////////////////////////////////////////

export const Modal = (props) => {
  return ReactDOM.createPortal(
    <div className="modal" onClick={()=>{props.doClose && props.doClose()}}>
      <div className="modal-body" onClick={(e)=>{e.stopPropagation()}}>
        {props.children}
      </div>
    </div>,
    document.querySelector("#modal"));
}


////////////////////////////////////////////////////////////////////////////////

export const useInput = (type, def) => {
  const [value, setValue] = useState(def);
  const input = <input value={value} 
                        onChange={e => setValue(e.target.value)} 
                        type={type} />;
  return [value, input];
}

////////////////////////////////////////////////////////////////////////////////

export const useEscapeKey = (onEscape) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) 
        onEscape();
      };
      window.addEventListener("keydown", handleEsc);

      return () => {
        window.removeEventListener("keydown", handleEsc);
      };
    }, [onEscape]);
}

////////////////////////////////////////////////////////////////////////////////

export const BuyTilesModal = (props) => {
  const [numToBuy, numToBuyInput] = useInput("number", 1);
  const [isTxPending, setTxPending] = useState(false);
  const [tx, setTx] = useState(undefined);
  const [err, setErr] = useState(undefined);

  //////////////////////////////////////////////////////////////////////////////

  const buyTilesETH = async () => {
    setTx(undefined);
    setTxPending(true);

    let cost = Web3.utils.toWei("0.02", "ether");
    const rsp = await props.estilewrap.buyTilesForETH(props.sceneId, numToBuy, {
      value: cost * numToBuy, 
      from: props.user
    }).catch((err) => {
      setErr(err)
    });

    if (rsp) {
      setTx(rsp.tx);
      setTxPending(false);
      props.updateSceneInfo(props.sceneId);
    }
  }

  const buyTilesEscape = async () => {
    setTx(undefined);
    setTxPending(true);

    const rsp = await props.estilewrap.buyTilesForEscape(props.sceneId, numToBuy, {
      from: props.user
    }).catch((err) => {
      setErr(err);
    });

    if (rsp) {
      setTx(rsp.tx);
      setTxPending(false);
      props.updateSceneInfo(props.sceneId);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  
  const closeModal = () => {
    setErr(undefined);
    setTxPending(false);
    setTx(undefined);
    props.close();
  }

  useEscapeKey(() => closeModal());
  
  const ethTileCost = toBN(Web3.utils.toWei("0.02", "ether").toString());
  const escTileCost = toBN(Web3.utils.toWei("5", "wei").toString());
  const bnNumToBuy = toBN(numToBuy.toString());
  const ethCostWei = ethTileCost.mul(bnNumToBuy);
  const escCost = (escTileCost.mul(bnNumToBuy)).toString();
  const ethCost = Web3.utils.fromWei(ethCostWei, "ether").toString();

  return (
    <>
      {props.sceneId > 0 &&
        <Modal doClose={()=>{closeModal()}}>
          <div className="tilestore-modal">
            <h1>Buying tiles for rift {props.sceneId}</h1>
            <br></br>
            {!isTxPending && !tx && 
              <>
                <div className="col">
                  <div>Number of shards to purchase:</div>
                </div>
                <div className="col input-div">
                  {numToBuyInput}
                </div>
              </>}
              {isTxPending && !tx &&
                <div className="col">
                  <div>Transaction pending ...</div>
                </div>
              }
              {!isTxPending && tx && 
                <div className="col">
                  <div><a className="clickable" href={"https://etherscan.io/tx/"+tx}>view tx etherscan</a></div>
                </div>
              }
              <>
                <br></br>
                <div className="col">
                  {!isTxPending && !tx && <>
                    <div className="clickable" onClick={() => {buyTilesEscape();}}>Use {escCost} ESC</div>
                    <span className="spacer"></span>
                    <div className="clickable" onClick={() => {buyTilesETH();}}>Use {ethCost} ETH</div>
                  </>}
                  {err &&
                    <div className="col">
                      <div>Uh oh, thats an error ...</div>
                    </div>
                  }
                  <div className="grow"></div>
                  <div className="clickable" onClick={() => {closeModal()}}>CLOSE</div>
                </div>
              </>
          </div>
        </Modal>
      }
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////

export const ShardPreviewModal = (props) => {
  
  useEscapeKey(() => props.close());

  return (
    <>
      {props.tokenId > 0 &&
        <Modal>
          <div className="tilestore-modal">
            <ShardInner {...props} id={props.tokenId} />
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