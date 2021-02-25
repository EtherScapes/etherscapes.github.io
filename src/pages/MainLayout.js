import React from "react";
import { Switch, Route } from "react-router-dom";

import Home from "./Home.js";
import PuzzleViewer from "./PuzzleViewer.js";
import Packs from "./Packs.js";
import Shard from "./Shard.js";
import Puzzle from "./Puzzle.js";
import About from "./About.js";


const MainLayout = (props) => {
  return (
    <Switch> {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path="/">
        <Home page="Home" {...props}/>
      </Route>
      <Route exact path="/scene/:sid/puzzle/:pid">
        <PuzzleViewer page="PuzzleViewer" {...props}/>
      </Route>
      <Route exact path="/packs">
        <Packs page="Packs" {...props}/>
      </Route>
      <Route exact path="/shard/:id">
        <Shard page="Shard" {...props}/>
      </Route>
      <Route exact path="/puzzle/:id">
        <Puzzle page="Puzzle" {...props}/>
      </Route>
      <Route exact path="/about">
        <About></About>
      </Route>
    </Switch>
  );
}
  
export default MainLayout;