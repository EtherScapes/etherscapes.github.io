import React, {useState} from "react";
import {useParams} from "react-router-dom";

import {tileDataUri, tileImgUri, prettyfyId, getTokenBalance} from "../components/contractHelpers.js";

const getShardInfo = async (id) => {
  const tileJSON = tileDataUri(id);
  const rsp = await fetch(tileJSON); 
  return await rsp.json();
}

const Shard = (props) => {
  console.log("SHARD PROPS");
  console.log(props);
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
    <div className="Shard-main">
      <div className="bg">
        <img src={tileImgUri(id)} alt={id} />
      </div>
      <div className="col">
        <div>Token ID</div>
        <div>{prettyId}</div>
      </div>
      {desc === undefined && 
        <div>Loading metadata...</div>
      }
      {desc && props.estile &&
        <>
          <div className="col">
            <div>Name</div>
            <div>{desc.name}</div>
          </div>
          <a href={"https://testnets.opensea.io/assets/"+props.estile.address+"/"+tokId}>View in OpenSEA</a>
        </>
      }
      {tokInfo === undefined && 
        <div>Loading balances...</div>
      }
      {tokInfo &&
        <>
          <div className="col">
            <div>Your balance</div>
            <div>{tokInfo.balance.toString()}</div>
          </div>
          <div className="col">
            <div>Total supply</div>
            <div>{tokInfo.supply.toString()}</div>
          </div>
        </>
      }
    </div>
  );
}

export default Shard;
