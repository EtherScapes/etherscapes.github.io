import React, {useState} from "react";
import {useParams} from "react-router-dom";

import {tileDataUri, tileImgUri, nftId, prettyfyId, getTokenBalance} from "../components/contractHelpers.js";

import OpenSeaLogo from '../svg/opensea-logo.svg';

const getShardInfo = async (id) => {
  const tileJSON = tileDataUri(id);
  const rsp = await fetch(tileJSON); 
  return await rsp.json();
}

export const ShardInner = (props) => {
  const tokId = parseInt(props.id, 16);
  const prettyId = prettyfyId(nftId(props.id));
  console.log(tokId, prettyId, props.id);
  return (
    <div className="Shard-main">
      {props.name && props.estile && 
        <div className="shard-header">
          {props.name}
          <span className="grow" />
          {props.estile && 
            <a href={"https://testnets.opensea.io/assets/"+props.estile.address+"/"+tokId}>
              <img src={OpenSeaLogo} alt="OpenSea" />
            </a>
          }
        </div>
      }
      <div className="bg">
        <img src={tileImgUri(props.id)} alt={props.id} />
      </div>
      <div className="col">
        <div>Token ID</div>
        <div>{prettyId}</div>
      </div>
      {!props.balance || !props.supply && 
        <div>Loading balances...</div>
      }
      {props.balance && props.supply &&
        <>
          <div className="col">
            <div>Your balance</div>
            <div>{props.balance}</div>
          </div>
          <div className="col">
            <div>Total supply</div>
            <div>{props.supply}</div>
          </div>
        </>
      }
    </div>
  );
}

export const Shard = (props) => {
  let {id} = useParams();
  const tokId = parseInt(id, 16);
  const prettyId = prettyfyId(id);
  const [desc, setDesc] = useState();
  const [tokInfo, setTokInfo] = useState();

  if (!desc && props.user && props.estile) {
    getShardInfo(id)
      .then(setDesc);
  }
  if (!tokInfo && props.user && props.estile) {
    getTokenBalance(props.estile, props.user, tokId)
      .then(setTokInfo);
  }
  return (
    <ShardInner
      {...props}
      name={(desc && desc.name) || "loading ..."}
      id={id}
      balance={(tokInfo && tokInfo.balance.toString()) || "loading ..."}
      supply={(tokInfo && tokInfo.supply.toString()) || "loading ..."} />
  );
}

export default Shard;