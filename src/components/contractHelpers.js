
export const prettyfyId = (strId) => {
  let s = "0x";
  let zs = strId.length;
  let ze = 0;
  for (var i = 0; i < strId.length; i++) {
    if (strId[i] === '0' && i < zs) zs = i;
    if (strId[i] === '0' && i > ze) ze = i;
  }
  if (zs < 4) zs = 4;
  let lenLeft = 64 - ze;
  if (lenLeft < 5) {
    ze -= (5 - lenLeft);
  }
  for (i = 0; i < strId.length; i++) {
    if (i === zs) { s += "..."; }
    if (i <= ze && i >= zs) continue;
    s += strId[i];
  }
  return s;
}

export const nftId = (id) => {
  return id.toString(16).padStart(64, 0);
}

export const tileImgUri = (id, useBW=false) => {
  if (useBW) {
    return "https://raw.githubusercontent.com/EtherScapes/metadata/master/tile/"+nftId(id)+"_bw.png"
  }
  return "https://raw.githubusercontent.com/EtherScapes/metadata/master/tile/"+nftId(id)+".png";
}

export const tileDataUri = (id) => {
  return "https://raw.githubusercontent.com/EtherScapes/metadata/master/tile/"+nftId(id)+".json";
}

export const packImgUri = (id) => {
  return "https://raw.githubusercontent.com/EtherScapes/metadata/master/pack/"+nftId(id)+".png";
}

export const packGifUri = () => {
  return "https://raw.githubusercontent.com/EtherScapes/metadata/master/img/rift-seethru.gif";
}

////////////////////////////////////////////////////////////////////////////////

export const getAllSceneInfo = async (estile, user, numScenes) => {
  /*
   *  All pack token ids start at 1, query stats for each one so we know how 
   *  many are left, if they can be purchased and our personal count for them.
   * 
   *  The `TileStore` component is how we open / purchase / see our packs.
   */
  let scenes = [];
  for (var sidx = 1; sidx <= numScenes; sidx++) {
    scenes.push(await getSceneInfo(estile, user, sidx));
  }
  return scenes;
}


export const getAllSceneSaleInfo = async (estile, user, numScenes) => {
    /*
     *  All pack token ids start at 1, query stats for each one so we know how 
     *  many are left, if they can be purchased and our personal count for them.
     * 
     *  The `TileStore` component is how we open / purchase / see our scenes.
     */
    let scenes = [];
    for (var sidx = 1; sidx <= numScenes; sidx++) {
      scenes.push(await getSceneSaleInfo(estile, user, sidx));
    }
    return scenes;
  }

////////////////////////////////////////////////////////////////////////////////

export const getTokenBalance = async (estile, user, tokenId) => {
  const _b = await estile.balanceOf(user, tokenId);
  const _t = await estile.totalSupply(tokenId);
  return {
    balance: _b,
    supply: _t,
  }
}

/*
 *  Load scene will fetch a scene and all its tokens (tiles + puzzles)
 *  and compute their balances so that the renderer can fetch the needed
 *  metadata and render our website correctly.
 */
export const getSceneInfo = async (estile, user, sceneId) => {
  const _tokRange = await estile.tokenRangeForScene(sceneId);
  const tilesPerPuzzle = _tokRange[1].toNumber();
  const numPuzzles = _tokRange[2].toNumber();
  const numTiles = tilesPerPuzzle * numPuzzles;
  const _tileInfo = await estile.sceneShardInfo(sceneId);
  
  // Ranges for the tokens in this scene. 
  const start_tile_range = _tokRange[0].toNumber();
  const end_tile_range = start_tile_range + numTiles - 1;
  const start_puzzle_range = end_tile_range + 1;
  const end_puzzle_range = start_puzzle_range + numPuzzles - 1;

  return {
    sceneId: sceneId,
    tileTokenStart: start_tile_range,
    tileTokenEnd: end_tile_range,
    puzzleTokenStart: start_puzzle_range,
    puzzleTokenEnd: end_puzzle_range,
    numTiles: numTiles,
    tilesLeft: _tileInfo[0],
    ethCost: _tileInfo[1],
    escCost: _tileInfo[2],
    numPuzzles: numPuzzles,
    tilesPerPuzzle: tilesPerPuzzle,
  };
}

export const getPuzzleTokensAndBalances = async (estile, user, sceneId, puzzleId) => {
  const _tokRange = await estile.tokenRangeForScene(sceneId);
  const tilesPerPuzzle = _tokRange[1].toNumber();
  const numPuzzles = _tokRange[2].toNumber();
  const numTiles = tilesPerPuzzle * numPuzzles;

  // Ranges for the tokens in this scene. 
  const start_tile_range = _tokRange[0].toNumber() + (puzzleId * tilesPerPuzzle);
  const end_tile_range = start_tile_range + tilesPerPuzzle - 1;
  const puzzleToken = start_tile_range + (numTiles);
  
  let tileTokenBalances = [];
  let tileTokenTotalBalances = [];
  for (var ttok = start_tile_range; ttok <= end_tile_range; ttok++) {
    const tokInfo = await getTokenBalance(estile, user, ttok);
    tileTokenBalances.push(tokInfo.balance.toNumber());
    tileTokenTotalBalances.push(tokInfo.supply.toNumber());
  }
  
  let puzzleTokenBalance;
  let puzzleTokenTotalBalance;
  const tokInfo = await getTokenBalance(estile, user, puzzleToken);
  puzzleTokenBalance = tokInfo.balance.toNumber();
  puzzleTokenTotalBalance = tokInfo.supply.toNumber();
  let canRedeem = true;
  for (var i = 0; i < tilesPerPuzzle; i++) {
    if (tileTokenBalances[i] <= 0) canRedeem = false;
  }

  return {
    sceneId: sceneId,
    tileTokenBalances: tileTokenBalances,
    tileTokenTotalBalances: tileTokenTotalBalances,
    puzzleTokenBalance: puzzleTokenBalance,
    puzzleTokenTotalBalance: puzzleTokenTotalBalance,
    puzzleRedeemable: canRedeem,
  };
}

export const getSceneSaleInfo = async (estile, user, sceneId) => {
    const _tokRange = await estile.tokenRangeForScene(sceneId);
    const tilesPerPuzzle = _tokRange[1];
    const numPuzzles = _tokRange[2];
    const tilesLeft = await estile.sceneShardInfo(sceneId);
  
    return {
      sceneId: sceneId,
      tilesLeft: tilesLeft,
      numPuzzles: numPuzzles,
      tilesPerPuzzle: tilesPerPuzzle,
    };
  }

////////////////////////////////////////////////////////////////////////////////
