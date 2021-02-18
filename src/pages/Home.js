import React, {useState, useRef, useEffect} from "react";

////////////////////////////////////////////////////////////////////////////////

const prettyfyId = (strId) => {
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

const nftId = (id) => {
  return id.toString(16).padStart(64, 0);
}

const imgUri = (id, useBW=false) => {
  if (useBW) {
    return "https://raw.githubusercontent.com/EtherScapes/metadata/master/tile/"+nftId(id)+"_bw.png"
  }
  return "https://raw.githubusercontent.com/EtherScapes/metadata/master/tile/"+nftId(id)+".png";
}

const dataUri = (id) => {
  return "https://raw.githubusercontent.com/EtherScapes/metadata/master/tile/"+nftId(id)+".json";
}

////////////////////////////////////////////////////////////////////////////////
var cache = {};

/*
 *  Load scene will fetch a scene and all its tokens (tiles + puzzles)
 *  and compute their balances so that the renderer can fetch the needed
 *  metadata and render our website correctly.
 */
const loadScene = async (user, estile, sceneId) => {
  const _tokRange = await estile.tokenRangeForScene(sceneId);
  const tilesPerPuzzle = _tokRange[1].toNumber();
  const numPuzzles = _tokRange[2].toNumber();
  const numTiles = tilesPerPuzzle * numPuzzles;
  
  // Ranges for the tokens in this scene. 
  const start_tile_range = _tokRange[0].toNumber();
  const end_tile_range = start_tile_range + numTiles - 1;
  const start_puzzle_range = end_tile_range + 1;
  const end_puzzle_range = start_puzzle_range + numPuzzles - 1;
  
  let tileTokenBalances = [];
  let tileTokenTotalBalances = [];
  for (var ttok = start_tile_range; ttok <= end_tile_range; ttok++) {
    // var img = new Image();
    // img.src = imgUri(ttok);
    const _b = await estile.balanceOf(user, ttok);
    tileTokenBalances.push(_b.toNumber());
    const _t = await estile.totalSupply(ttok);
    tileTokenTotalBalances.push(_t.toNumber());
  }
  
  let puzzleTokenBalances = [];
  let puzzleTokenTotalBalances = [];
  let puzzleRedeemable = [];
  let balOffset = 0;
  for (var ptok = start_puzzle_range; ptok <= end_puzzle_range; ptok++) {
    // img = new Image();
    // img.src = imgUri(ptok);
    const _b = await estile.balanceOf(user, ptok);
    puzzleTokenBalances.push(_b.toNumber());
    const _t = await estile.totalSupply(ptok);
    puzzleTokenTotalBalances.push(_t.toNumber());
    let canRedeem = true;
    for (var i = 0; i < tilesPerPuzzle; i++) {
      if (tileTokenBalances[balOffset] <= 0) canRedeem = false;
      balOffset += 1;
    }
    puzzleRedeemable.push(canRedeem);
  }

  return {
    sceneId: sceneId,
    tileTokenStart: start_tile_range,
    tileTokenEnd: end_tile_range,
    puzzleTokenStart: start_puzzle_range,
    puzzleTokenEnd: end_puzzle_range,
    numTiles: numTiles,
    numPuzzles: numPuzzles,
    tilesPerPuzzle: tilesPerPuzzle,
    tileTokenBalances: tileTokenBalances,
    tileTokenTotalBalances: tileTokenTotalBalances,
    puzzleTokenBalances: puzzleTokenBalances,
    puzzleTokenTotalBalances: puzzleTokenTotalBalances,
    puzzleRedeemable: puzzleRedeemable,
  };
}

////////////////////////////////////////////////////////////////////////////////

const Tile = (props) => {
  return (
    <div className="th">
      <div><img src={imgUri(props.id)} width="42px" height="42px"></img> ({props.type})</div>
      <div>{props.count}</div>
      <div>{props.total}</div>
      <div>{prettyfyId(nftId(props.id))}</div>
    </div>
  );
}
////////////////////////////////////////////////////////////////////////////////

const Home = (props) => {
  /*
   *  Scenes cannot be 0, 1 is the first and then on till `numScenes` 
   *  (inclusive).
   */
  const [sceneId, setSceneId] = useState(1);
  const [puzzleId, setPuzzleId] = useState(0);
  const [sceneLoading, setSceneLoading] = useState(true);
  const [sceneDesc, setSceneDesc] = useState({});

  const prevScene = () => { if (sceneId > 1) setSceneId(sceneId - 1); }
  const nextScene = () => { if (sceneId < props.numScenes) setSceneId(sceneId + 1); }
  
  const prevPuzzle = () => { if (puzzleId > 0) setPuzzleId(puzzleId - 1); }
  const nextPuzzle = () => { if (puzzleId < 5 - 1) setPuzzleId(puzzleId + 1); }

  //////////////////////////////////////////////////////////////////////////////
  
  const canvasRef = useRef(null);

  const draw = async (context) => {
    if (!sceneDesc.sceneId) return;
    
    const puzzleToken = sceneDesc.puzzleTokenStart + puzzleId;
    const puzzleTokenBalance = sceneDesc.puzzleTokenBalances[puzzleId];
    const tileTokenOffset = puzzleId * sceneDesc.tilesPerPuzzle
    const tileTokenStart = sceneDesc.tileTokenStart + tileTokenOffset;
  
    // Draw the appropriate image, use the _bw.png if the balance is 0.
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    var img = new Image();
    img.width = 1920;
    img.height = 1080;
    img.onload = async () => {
      // TODO: Debounce if pid / sid changed for the inner draws.
      context.drawImage(img, 0, 0);

      for (var i = 0; i < sceneDesc.tilesPerPuzzle; i++) {
        const tileTokenId = tileTokenStart + i;
        const tokenBalanceOffset = tileTokenOffset + i; 
        if (sceneDesc.tileTokenBalances[tokenBalanceOffset] === 0) continue;
        
        const tileJSON = dataUri(tileTokenId);
        const rsp = await fetch(tileJSON); 
        const tileMeta = await rsp.json();
        
        var timg = new Image();
        timg.th = tileMeta.attributes[0]["value"];
        timg.tw = tileMeta.attributes[1]["value"];
        timg.tx = tileMeta.attributes[2]["value"];
        timg.ty = tileMeta.attributes[3]["value"];
        timg.width = timg.tw;
        timg.height = timg.th; 
        timg.onload = function() {
          context.drawImage(this, this.tx - this.tw / 2, this.ty - this.th / 2);
        }
        timg.src = tileMeta.image;        
      }
    }
    img.src = imgUri(puzzleToken, puzzleTokenBalance <= 0);
  }

  //////////////////////////////////////////////////////////////////////////////

  const [puzzleNamer, setPuzzleNamer] = useState("");
  const [puzzleName, setPuzzleName] = useState("Unnamed");
  const [puzzleNamingCost, setPuzzleNamingCost] = useState(0);

  const refreshPuzzleNameInfo = async (sid, pid) => {
    const result = await props.estile.getScenePuzzleInfo(sid, pid);
    setPuzzleNamingCost(result[0].toNumber());
    if (result[1] === "") setPuzzleName("Unnamed");
    else setPuzzleName(result[1]);
    setPuzzleNamer(result[2]);
  }

  const solvePuzzle = async (sid, pid) => {
    await props.estile.redeemPuzzle(sid, pid, {from: props.user});
  }

  const renamePuzzle = async (sid, pid, name) => {
    await props.estile.nameScenePuzzle(sid, pid, name, {from: props.user});
    refreshPuzzleNameInfo(sceneId, puzzleId);
  }
  
  //////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (sceneLoading) return;
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    draw(context)
    refreshPuzzleNameInfo(sceneId, puzzleId);
  }, [draw, refreshPuzzleNameInfo]);

  //////////////////////////////////////////////////////////////////////////////

  if (sceneLoading && props.estile) {
    loadScene(props.user, props.estile, sceneId)
      .then((scene) => {
        setSceneDesc(scene);
        setSceneLoading(false);
      });
  }

  //////////////////////////////////////////////////////////////////////////////

  const isRedeemable = !sceneLoading && sceneDesc.puzzleRedeemable[puzzleId];
  const isRenameable  = !sceneLoading && sceneDesc.puzzleTokenBalances[puzzleId] > 0;
  
  let puzzleTileTokenRows;
  let puzzleTokenRow;
  if (sceneLoading) {
    puzzleTokenRow = (<></>);
    puzzleTileTokenRows = (<></>);
  } else {
    const puzzleTokenId = sceneDesc.puzzleTokenStart + puzzleId;
    const puzzleTokenBal = sceneDesc.puzzleTokenBalances[puzzleId];
    const puzzleTokenTotalBal = sceneDesc.puzzleTokenTotalBalances[puzzleId];
    const tileTokenOffset = puzzleId * sceneDesc.tilesPerPuzzle
    const tileTokenStart = sceneDesc.tileTokenStart + tileTokenOffset;
    
    puzzleTokenRow = <Tile type="puzzle" id={puzzleTokenId} 
                           count={puzzleTokenBal} 
                           total={puzzleTokenTotalBal}/>;
    puzzleTileTokenRows = [];
    for (var i = 0; i < sceneDesc.tilesPerPuzzle; i++) {
      puzzleTileTokenRows.push(
        <Tile type="tile" id={tileTokenStart+i} 
              count={sceneDesc.tileTokenBalances[tileTokenOffset + i]}
              total={sceneDesc.tileTokenTotalBalances[tileTokenOffset + i]} />
      );
    }
  }

  return (
    <div className="Home-main">
      {sceneLoading && 
        <h3>Scene {sceneId} loading ...</h3>}
      {!sceneLoading && 
        <h3>
          Scene 
          <span onClick={prevScene}>&lt;</span>
          {sceneId}
          <span onClick={nextScene}>&gt;</span>
          <span className="spacer" />
          Puzzle
          <span onClick={prevPuzzle}>&lt;</span>
          {puzzleId+1}
          <span onClick={nextPuzzle}>&gt;</span>
          <span className="spacer" />
          {isRedeemable && <span onClick={()=>{solvePuzzle(sceneId, puzzleId);}}>Solve Puzzle</span>}
          <span className="spacer" />
          {puzzleName} 
          <span className="spacer"></span>
          {isRenameable && <span onClick={()=>{renamePuzzle(sceneId, puzzleId, "foobar");}}>RENAME ({puzzleNamingCost})</span>}
        </h3>}
      
      {!sceneLoading && 
        <div>
          <canvas ref={canvasRef} className="canvas" width="1920" height="1080">
            Blocks: art on the blockchain.
          </canvas>
          <div className="token-table">
            <div className="th underline">
              <div></div>
              <div>Balance</div>
              <div>Supply</div>
              <div>Token ID</div>
            </div>
            {puzzleTokenRow}
            {puzzleTileTokenRows}
          </div>
        </div>
      }
    </div>
  );
}

export default Home;
  