import React from "react";
import { Switch, Route } from "react-router-dom";

import PuzzleViewer from "./PuzzleViewer.js";
import Packs from "./Packs.js";
import Shard from "./Shard.js";
import About from "./About.js";


const MainLayout = (props) => {
  return (
    <Switch> {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path="/">
        <Packs page="Home" {...props} />
      </Route>
      <Route exact path="/scene/:sid/puzzle/:pid">
        <PuzzleViewer page="PuzzleViewer" {...props} />
      </Route>
      <Route exact path="/shard/:id">
        <Shard page="Shard" {...props} />
      </Route>
      <Route exact path="/about">
        <About></About>
      </Route>
      <Route path="*">
        <h3>Not sure what you are looking for ... 404!</h3>
      </Route>
    </Switch>
  );
}
  
export default MainLayout;