import React, {useState, useRef, useEffect, useCallback} from "react";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import web3 from "web3";

import {Loading} from "../components/Loading.js";
import {useInput} from "../components/Overlays.js";
import {ProgressBar} from "../components/ProgressBar.js";
import {getSceneInfo, getTokenBalance, nftId, prettyfyId, tileImgUri, tileDataUri} from "../components/contractHelpers.js";
import {BuyTilesModal, ShardPreviewModal} from "../components/Overlays.js";
import {PageInfoPanel} from "../components/PageInfoPanel.js";

import BuySVG from "../svg/buy.svg";

////////////////////////////////////////////////////////////////////////////////

const Tile = (props) => {
  const {estile, user, chainId, id, type, updateFn} = props;
  const [balance, setBalance] = useState("...");
  const [total, setTotal] = useState("...");

  // When the contract, user or tile id change, update its balance etc.
  useEffect(() => {
    getTokenBalance(estile, user, id)
      .then((result) => {
        setBalance(result.balance);
        setTotal(result.supply);
        if (updateFn) { 
          updateFn(id, {
            id: id, 
            balance: result.balance,
            total: result.supply,
          });
        }
      });
    }, [estile, chainId, user, id, updateFn, setBalance, setTotal]);

  return (
    <div className="th shard-row" onClick={()=>{props.preview(id)}}>
      <div><img src={tileImgUri(id)} alt="" width="42px" height="auto"></img> ({type})</div>
      <div>{balance.toString()}</div>
      <div>{total.toString()}</div>
      <div>{prettyfyId(nftId(id))}</div>
    </div>
  );
}
////////////////////////////////////////////////////////////////////////////////

const PuzzleViewer = (props) => {
  let history = useHistory();
  let {sid, pid} = useParams();
  const {namer, estile, user} = props;

  const sceneId = sid;
  const puzzleId = parseInt(pid) - 1; // 0-based
  const [sceneLoading, setSceneLoading] = useState(true);
  const [sceneDesc, setSceneDesc] = useState({});
  const [buyTilesForSceneId, setBuyTilesForSceneId] = useState(0);
  const [previewTokenId, setPreviewTokenId] = useState(0);

  const [ownedTokens, setOwnedTokens] = useState({});
  const [ownedTokensAllLoaded, setOwnedTokensAllLoaded] = useState(false);
  const resetOwnedTokenState = () => {
    setOwnedTokensAllLoaded(false);
    setOwnedTokens({});
  }

  const updateOwnedTokens = useCallback((id, tdesc) => {
    ownedTokens[id] = tdesc;
    setOwnedTokens(ownedTokens);
    if (Object.keys(ownedTokens).length == 12) { // HACK 
      setOwnedTokensAllLoaded(true);
    }
  }, [ownedTokens, setOwnedTokens, setOwnedTokensAllLoaded]);

  //////////////////////////////////////////////////////////////////////////////

  const canvasRef = useRef(null);

  const [puzzleToken, setPuzzleToken] = useState({});
  const updatePuzzleToken = useCallback((id, tdesc) => {
    if (canvasRef.current.hasBackground !== id) canvasRef.current.hasBackground = undefined;
    setPuzzleToken(tdesc);
  }, [canvasRef]);
  
  //////////////////////////////////////////////////////////////////////////////

  const ownsSolvedToken = puzzleToken && puzzleToken.balance && puzzleToken.balance.toNumber() > 0;

  //////////////////////////////////////////////////////////////////////////////

  const draw = useCallback(async (context, reset=false) => {
    if (sceneDesc.sceneId === undefined) return;
    const ptok = sceneDesc.puzzleTokenStart + puzzleId;
    const canvas = canvasRef.current;
    if (!canvas.hasBackground && puzzleToken.balance !== undefined) {
      var img = new Image();
      img.width = 1920;
      img.height = 1080;
      img.onload = async () => {
        context.drawImage(img, 0, 0);
        canvas.hasBackground = ptok;
        canvas.drawnTokens = {};
        draw(context);
      }
      img.src = tileImgUri(ptok, ownsSolvedToken === false); // enable bw mode for non owned tokens.
    }
    
    if (canvas.hasBackground) {
      for (let tok of Object.keys(ownedTokens)) {
        // Tokens with no ownership are not drawn.
        if (ownedTokens[tok].balance.toNumber() === 0) continue;

        // Tokens drawn after a clear are not updated if they have also been drawn.
        if (tok in canvas.drawnTokens) continue;
        canvas.drawnTokens[tok] = true;
        const tileJSON = tileDataUri(tok);
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
  }, [sceneDesc, puzzleToken, ownedTokens, ownsSolvedToken, puzzleId]);

  //////////////////////////////////////////////////////////////////////////////

  const [puzzleNamer, setPuzzleNamer] = useState("");
  const [puzzleName, setPuzzleName] = useState("Unnamed");
  const [showPuzzleNaming, setShowPuzzleNaming] = useState(false);
  const [puzzleNamingCost, setPuzzleNamingCost] = useState(0);
  const [newPuzzleName, newPuzzleNameInput] = useInput("text", "");

  const refreshPuzzleNameInfo = async (sid, pid) => {
    const result = await namer.getScenePuzzleInfo(sid, pid);
    setPuzzleNamingCost(result[0].toNumber());
    if (result[1] === "") setPuzzleName("Unnamed");
    else setPuzzleName(result[1]);
    setPuzzleNamer(result[2]);
  }

  const solvePuzzle = async (sid, pid) => {
    await estile.redeemPuzzle(sid, pid, {from: user});
  }

  const renamePuzzle = async (sid, pid, name) => {
    await namer.nameScenePuzzle(sid, pid, name, {from: user});
    refreshPuzzleNameInfo(sid, pid);
  }

  //////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    async function updateNamingInfo() {
      if (!namer) return;
      const result = await namer.getScenePuzzleInfo(sceneId, puzzleId);
      setPuzzleNamingCost(result[0].toNumber());
      if (result[1] === "") setPuzzleName("Unnamed");
      else setPuzzleName(result[1]);
      setPuzzleNamer(result[2]);
    }
    updateNamingInfo();
  }, [sceneId, puzzleId, namer]);

  // If the user changes, reload the scene.
  useEffect(() => {
    setSceneLoading(true);
  }, [user]);

  useEffect(() => {
    if (sceneLoading) return;
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    draw(context);
  }, [draw, sceneId, puzzleId, sceneLoading, ownedTokens, ownedTokensAllLoaded,
      puzzleToken, sceneDesc]);

  //////////////////////////////////////////////////////////////////////////////

  const gotoScene = async (_sid, _pid) => {
    setShowPuzzleNaming(false);
    if (_sid !== sceneId) setSceneLoading(true);
    if (_pid !== puzzleId) resetOwnedTokenState(); // reset - ing puzzles.
    history.push("/scene/" + _sid + "/puzzle/" + (_pid+1));
  }
  const prevScene = () => { if (sceneId > 1) gotoScene(sceneId - 1, 0); }
  const nextScene = () => { if (sceneId < props.numScenes.toNumber()) gotoScene(sceneId + 1, 0); }
  const prevPuzzle = () => { if (puzzleId > 0) gotoScene(sceneId, puzzleId - 1); }
  const nextPuzzle = () => { if (puzzleId < sceneDesc.numPuzzles - 1) gotoScene(sceneId, puzzleId + 1); }
  
  const prevSceneClass = (sceneId > 1) ? "clickable" : "invalid";
  const nextSceneClass = (props.numScenes && (sceneId < props.numScenes.toNumber()) ? "clickable" : "invalid") || "invalid";
  const prevPuzzleClass = (puzzleId > 0) ? "clickable" : "invalid";
  const nextPuzzleClass = (puzzleId < sceneDesc.numPuzzles - 1) ? "clickable" : "invalid";

  //////////////////////////////////////////////////////////////////////////////
  
  const [puzzleTokenRow, setPuzzleTokenRow] = useState(<></>);
  const [puzzleTileTokenRows, setPuzzleTileTokenRows] = useState(<></>);
  
  // Anytime the puzzle or scene change, update the tile table.
  useEffect(() => {
    if (sceneLoading) return;
    const puzzleTokenId = sceneDesc.puzzleTokenStart + puzzleId;
    const tileTokenOffset = puzzleId * sceneDesc.tilesPerPuzzle
    const tileTokenStart = sceneDesc.tileTokenStart + tileTokenOffset;
    setPuzzleTokenRow(<Tile {...props} 
                          updateFn={updatePuzzleToken}
                          preview={(id) => {setPreviewTokenId(id)}}
                          type="puzzle" id={puzzleTokenId} 
                          key={puzzleTokenId} />);
    let tileRows = [];
    for (var i = 0; i < sceneDesc.tilesPerPuzzle; i++) {
      tileRows.push(
        <Tile {...props} 
              preview={(id) => {setPreviewTokenId(id)}}
              updateFn={updateOwnedTokens} 
              type="tile" id={tileTokenStart+i} key={tileTokenStart+i} />
      );
    }
    setPuzzleTileTokenRows(tileRows);
  }, [puzzleId, sceneDesc, sceneLoading, props, 
      updateOwnedTokens, updatePuzzleToken]);

  const [uniqueTokensOwned, setUniqueTokensOwned] = useState(0);
  const [totalTokensLoaded, setTotalTokensLoaded] = useState(0);

  useEffect(() => {
    async function _() {
      if (!ownedTokensAllLoaded) return;
      let count = 0;
      for (var tok of Object.keys(ownedTokens)) {
        const desc = ownedTokens[tok];
        if (ownedTokens[tok].balance.gt(web3.utils.toBN(0))) {
          count += 1;
        }
      }
      const total = Object.keys(ownedTokens).length;
      setUniqueTokensOwned(count);
      setTotalTokensLoaded(total);
    }
    _();
  }, [ownedTokensAllLoaded, setUniqueTokensOwned, setUniqueTokensOwned]);

  //////////////////////////////////////////////////////////////////////////////

  if (!estile || !user || !namer) {
    return (
      <div className="Home-main">
        <PageInfoPanel {...props} />
      </div>
    );
  }

  if (sceneLoading && props.user && props.estile) {
    getSceneInfo(props.estile, props.user, sceneId)
      .then((scene) => {
        setSceneDesc(scene);
        setSceneLoading(false);
      });
  }

  //////////////////////////////////////////////////////////////////////////////
  

  return (
    <>
      <BuyTilesModal
              {...props} 
              sceneId={buyTilesForSceneId}
              updateSceneInfo={() => {setSceneLoading(false)}} 
              close={() => {setBuyTilesForSceneId(0)}} />
      <ShardPreviewModal 
              {...props}
              tokenId={previewTokenId}
              close={() => {setPreviewTokenId(0)}} />
      <div className="Home-main" style={{height: "100%", display: "flex", flexGrow: "1", justifyContent: "center"}}>
        {sceneLoading && <Loading message={"Scene "+ sceneId +" loading "}/>}
        {!sceneLoading && 
          <>
            <div className="title">
              <span>Scene</span>
              <span className={prevSceneClass} onClick={prevScene}>&lt;</span>
              {sceneId}
              <span className={nextSceneClass} onClick={nextScene}>&gt;</span>
              <span className="spacer" />
              Puzzle
              <span className={prevPuzzleClass} onClick={prevPuzzle}>&lt;</span>
              {puzzleId+1}
              <span className={nextPuzzleClass} onClick={nextPuzzle}>&gt;</span>
              <span className="spacer" />
              <span className="grow"></span>
              {puzzleToken && puzzleToken.balance && puzzleToken.balance.toNumber() > 0 &&
                <span style={{marginRight: "15px"}}>solved x{puzzleToken.balance.toString()}</span>
              }
            </div>

            <div className="puzzle-viewer">
              <div className="puzzle-name clickable">
                <div className="grow" style={{width: "100%"}} onClick={()=>{setShowPuzzleNaming(!showPuzzleNaming)}}>
                  "{puzzleName}"
                </div>
                {showPuzzleNaming && 
                  <div className="puzzle-name-details">
                    <div>This puzzle currently costs {puzzleNamingCost} ESCAPE to rename.</div>
                    <div>The last address to name the puzzle was {puzzleNamer}.</div>
                    {puzzleToken && puzzleToken.balance && puzzleToken.balance.toNumber() > 0 &&
                      <div className="puzzle-name-input">
                        {newPuzzleNameInput} 
                        <div className="clickable" onClick={()=>{renamePuzzle(sceneId, puzzleId, newPuzzleName)}}>Rename puzzle</div>
                      </div>
                    }
                    {puzzleToken && puzzleToken.balance && puzzleToken.balance.toNumber() === 0 &&
                      <div>You must first solve the puzzle to name it.</div>
                    }
                  </div>
                }
              </div>
              <canvas ref={canvasRef} className="canvas" width="1920" height="1080">
                Blocks: art on the blockchain.
              </canvas>
              <div className="puzzle-toolbar">
                {uniqueTokensOwned < sceneDesc.tilesPerPuzzle &&
                <>
                  <ProgressBar 
                    count={uniqueTokensOwned} 
                    total={sceneDesc.tilesPerPuzzle} >
                  </ProgressBar>
                  <div style={{marginLeft: "8px", fontSize: "10pt"}}>
                    shards collected
                  </div>
                </>
                }
                {uniqueTokensOwned === sceneDesc.tilesPerPuzzle &&
                <>
                  <div className="clickable" style={{marginLeft: "15px"}} 
                      onClick={()=>{solvePuzzle(sceneId, puzzleId)}}
                      data-tip data-for="solveTooltip">
                    solve puzzle
                  </div>
                  <ReactTooltip id="solveTooltip" arrowColor="var(--color-font)" place="bottom">
                    <p>Merge all shards in a puzzle to<br></br> 
                      solve it and mint a rare puzzle<br></br>
                      token.
                    </p>
                  </ReactTooltip>
                </>
                }
                <div className="grow"></div>
                <div className="col clickable" onClick={()=>{setBuyTilesForSceneId(sceneId)}}>
                  <img src={BuySVG} alt="buy shards"></img> buy shards
                </div>
              </div>
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
          </>
        }
      </div>
    </>
  );
}

export default PuzzleViewer;
  