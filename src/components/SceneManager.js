import React, { useState } from 'react';

var Web3 = require('web3');

const imgUri = (id) => {
  const strId = id.toString(16).padStart(64, 0);
  return "https://raw.githubusercontent.com/EtherScapes/metadata/master/tile/"+strId+".png";
}

const Tile = (props) => {
  return (
    <div className="Tile">
      <img src={imgUri(props.id)} width="200" height="200"></img>
      <div>Count={props.count}</div>
    </div>
  );
}

const SceneManager = (props) => {

  if (!props.scenes) return (<div>Loading...</div>);

  const scenes = props.scenes.map((scene, i) => {
    const sceneId = i + 1;
    const numTilesPerPuzzle = scene.numTiles / scene.numPuzzles;
    let puzzles = [];
    let tt = scene.tileTokens;
    for (var p = 0; p < scene.numPuzzles; p++) {
      let _tiles = [];
      for (var t = 0; t < numTilesPerPuzzle; t++) {
        _tiles.push({
          tokenId: scene.tileTokenStart + t + (p * numTilesPerPuzzle),
          count: tt.shift(),
        });
      }
      const tiles = _tiles.map((tileDesc) => {
        return (<Tile key={tileDesc.tokenId} id={tileDesc.tokenId} count={tileDesc.count} />);
      })
      puzzles.push((
        <div className="SceneManager-puzzle">
          <div>Puzzle number = {p + 1}</div>
            {tiles}
          <hr></hr>
        </div>
      ));
    }

    return (
      <div key={sceneId} className="SceneManager-scene">
        <div>sceneId = {scene.sceneId}</div>
        <div>numPuzzles = {scene.numPuzzles}</div>
        <div>numTiles = {scene.numTiles}</div>
        <hr></hr>
        {puzzles}   
      </div>
    );
  });

  return (
    <div className="SceneManager-main">
      <h4>EtherScapes scenes:</h4>
      <div className="SceneManager-list">
        {scenes}
      </div>
    </div>
  );
}

export default SceneManager;