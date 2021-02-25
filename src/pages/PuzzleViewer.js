import React, {useState, useRef, useEffect} from "react";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";

import {getSceneInfo, nftId, prettyfyId, tileImgUri, tileDataUri} from "../components/contractHelpers.js";

////////////////////////////////////////////////////////////////////////////////

const Tile = (props) => {
  const solved = props.solved || false;
  return (
    <div className="th">
      <div><img src={tileImgUri(props.id)} width="42px" height="42px"></img> ({props.type})</div>
      <div>{props.count}</div>
      <div>{props.total}</div>
      {solved && 
        <div><a href={"/puzzle/"+nftId(props.id)}>{prettyfyId(nftId(props.id))}</a></div>
      }
      {!solved && 
        <div><a href={"/shard/"+nftId(props.id)}>{prettyfyId(nftId(props.id))}</a></div>
      }
      
    </div>
  );
}
////////////////////////////////////////////////////////////////////////////////

const PuzzleViewer = (props) => {
  let history = useHistory();
  let {sid, pid} = useParams();

  const sceneId = sid;
  const puzzleId = parseInt(pid) - 1; // 0-based
  const [sceneLoading, setSceneLoading] = useState(true);
  const [sceneDesc, setSceneDesc] = useState({});

  const gotoScene = (sid, pid) => {
    history.push("/scene/" + sid + "/puzzle/" + (pid+1));
  }
  const prevScene = () => { if (sceneId > 1) gotoScene(sceneId - 1, 0); }
  const nextScene = () => { if (sceneId < props.numScenes.toNumber()) gotoScene(sceneId + 1, 0); }
  const prevPuzzle = () => { if (puzzleId > 0) gotoScene(sceneId, puzzleId - 1); }
  const nextPuzzle = () => { if (puzzleId < 5 - 1) gotoScene(sceneId, puzzleId + 1); }

  //////////////////////////////////////////////////////////////////////////////
  
  const canvasRef = useRef(null);

  const draw = async (context) => {
    if (sceneDesc.sceneId === undefined) return;
    
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
        
        const tileJSON = tileDataUri(tileTokenId);
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
    img.src = tileImgUri(puzzleToken, puzzleTokenBalance <= 0);
  }

  //////////////////////////////////////////////////////////////////////////////

  const [puzzleNamer, setPuzzleNamer] = useState("");
  const [puzzleName, setPuzzleName] = useState("Unnamed");
  const [puzzleNamingCost, setPuzzleNamingCost] = useState(0);

  const refreshPuzzleNameInfo = async (sid, pid) => {
    const result = await props.namer.getScenePuzzleInfo(sid, pid);
    setPuzzleNamingCost(result[0].toNumber());
    if (result[1] === "") setPuzzleName("Unnamed");
    else setPuzzleName(result[1]);
    setPuzzleNamer(result[2]);
  }

  const solvePuzzle = async (sid, pid) => {
    await props.estile.redeemPuzzle(sid, pid, {from: props.user});
  }

  const renamePuzzle = async (sid, pid, name) => {
    await props.namer.nameScenePuzzle(sid, pid, name, {from: props.user});
    refreshPuzzleNameInfo(sid, pid);
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

  if (sceneLoading && props.user && props.estile) {
    getSceneInfo(props.estile, props.user, sceneId)
      .then((scene) => {
        console.log(scene);
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
                           solved={true}
                           count={puzzleTokenBal} 
                           total={puzzleTokenTotalBal}/>;
    puzzleTileTokenRows = [];
    for (var i = 0; i < sceneDesc.tilesPerPuzzle; i++) {
      puzzleTileTokenRows.push(
        <Tile type="tile" id={tileTokenStart+i} key={tileTokenStart+i}
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

export default PuzzleViewer;
  