import React from 'react';

var Web3 = require('web3');


const imgUri = (id) => {
  const strId = id.toString(16).padStart(64, 0);
  return "https://raw.githubusercontent.com/EtherScapes/metadata/master/pack/"+strId+".png";
}


const PackStore = (props) => {
  const buyPackETH = async (p, count=1) => {
    let packCost = Web3.utils.toWei("0.1", "ether");
    await props.estilewrap.buyPacksForETH(p, count, {
      value: packCost * count, 
      from: props.user
    });
  }

  const buyPackEscape = async (p, cost, count=1) => {
    await props.estilewrap.buyPacksForCredits(p, count, {
      from: props.user
    });
  }

  const openPack = async (p, count=1) => {
    await props.estilepack.open(p, count, {from: props.user});
  }

  const packs = props.packs.map((pack, i) => {
    const packId = i + 1;
    return (
      <div key={packId} className="PackStore-pack">
        <div className="col">
          <div>scene #{pack.sceneId}</div>
          <div>{pack.packsLeft} / {pack.maxQuant} left</div>
        </div>
        <br></br>
        <div className="pack">
          <img src={imgUri(packId)} alt={packId+1}/>
          <div className="col">
            <div className="col">
              <div></div>
              <div className="float">{pack.tilesPerPack} x <span role="img" aria-label="puzzle">🧩</span></div>
            </div>
          </div>    
        </div>
        <br></br>
        <div className="col">
          <div>Buy: </div>
          <div className="button" onClick={() => {buyPackEscape(packId, pack.escapeCost, 1);}}>{pack.escapeCost} ESC</div>
          {pack.isPurchaseable && pack.packsLeft > 0 && 
            <div className="button" onClick={() => {buyPackETH(packId, 1);}}>0.1 ETH</div>}
        </div>
        <br></br>
        {pack.balance <= 0 && <div>You own no packs.</div>}
        {pack.balance > 0 && 
          <div className="col">
            <div>x{pack.balance}</div>
            <div className="button" onClick={()=>{openPack(packId, 1);}}>open pack</div>
            <div className="button" onClick={()=>{openPack(packId, pack.balance);}}>open all ({pack.balance})</div>
          </div>}
      </div>
    );
  });

  return (
    <div className="PackStore-main">
      <br></br>
      <div className="PackStore-list">
        {packs}
      </div>
    </div>
  );
}

export default PackStore;