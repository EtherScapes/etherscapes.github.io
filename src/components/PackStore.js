import React, { useState } from 'react';

var Web3 = require('web3');

const PackStore = (props) => {
  const buyPack = async (p, count=1) => {
    let packCost = Web3.utils.toWei("0.1", "ether");
    await props.estilewrap.buyPacksForETH(p, count, {
      value: packCost * count, 
      from: props.user
    });
  }

  const packs = props.packs.map((pack, i) => {
    const packId = i + 1;
    return (
      <div key={packId} className="PackStore-pack">
        <div>sceneId = {pack.sceneId}</div>
        <div>escapeCost = {pack.escapeCost}</div>
        <div>isPurchaseable = {pack.isPurchaseable?"Y":"N"}</div>
        <div>tilesPerPack = {pack.tilesPerPack}</div>
        <div>maxQuant = {pack.maxQuant}</div>
        <div>packsLeft = {pack.packsLeft}</div>
        <div>You own   = {pack.balance}</div>
        {pack.isPurchaseable && pack.packsLeft > 0 && 
          <div onClick={() => {buyPack(packId, 1);}}>BUY 0.1 ETH</div>
        }
      </div>
    );
  });

  return (
    <div className="PackStore-main">
      <h4>EtherScapes tile packs for sale: [{props.user}]</h4>
      <div className="PackStore-list">
        {packs}
      </div>
    </div>
  );
}

export default PackStore;