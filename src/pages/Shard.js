import React, {useState} from "react";
import {useParams} from "react-router-dom";

import {Loading} from "../components/Loading.js";
import {tileDataUri, tileImgUri, nftId, prettyfyId, getTokenBalance} from "../components/contractHelpers.js";

import OpenSeaLogo from '../svg/opensea-logo.svg';

const getShardInfo = async (id) => {
  const tileJSON = tileDataUri(id);
  const rsp = await fetch(tileJSON); 
  return await rsp.json();
}

export const ShardInner = (props) => {
  const prettyId = prettyfyId(nftId(props.id));
  const [desc, setDesc] = useState();
  const [tokInfo, setTokInfo] = useState();

  if (!desc && props.user && props.estile) {
    getShardInfo(props.id)
      .then(setDesc);
  }
  if (!tokInfo && props.user && props.estile) {
    getTokenBalance(props.estile, props.user, props.id)
      .then(setTokInfo);
  }

  if (!desc || !tokInfo) {
    return (
      <div className="Shard-main">
        <Loading message="Fetching token details" />
      </div>
    );
  }

  return (
    <div className="shard-main">
      <div className="shard-header">
        {desc.name}
        <span className="grow" />
      </div>
      <div className="bg">
        <img src={tileImgUri(props.id)} alt={props.id} />
      </div>
      <p>{desc.description}</p>
      <p>The NFT id for this shard is {prettyId}.</p>
      {tokInfo.supply.toNumber() > 0 && <>
        <p>There are currently {tokInfo.supply.toString()} of these tokens in existence, and you own {tokInfo.balance.toString()} of them!</p>
        <div className="social-link">
          <div>View this NFT on: </div>
          <div>
            <a target="_blank" rel="noopener noreferrer" href={"https://opensea.io/assets/"+props.estile.address+"/"+props.id}>
              <img src={OpenSeaLogo} alt="OpenSea" /><span>OpenSea</span>
            </a>
          </div>
        </div>
      </>}
      {tokInfo.supply.toNumber() === 0 && <>
        <p>There are no copies of this token in existence! Once minted, it will be visible for trade on OpenSea etc.</p>
      </>}
    </div>
  );
}

/*
 *  If we end up rendering shards as a separate page, use this component to 
 *  wrap the `ShardInner` and parse the hex string etc from the URL params.
 */
export const Shard = (props) => {
  let {id} = useParams();
  const intId = parseInt(id, 16);
  return (
    <div className="shard-page">
      <ShardInner {...props} id={intId} />
    </div>
  );
}

export default Shard;