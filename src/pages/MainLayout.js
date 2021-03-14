import React from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import PuzzleViewer from "./PuzzleViewer.js";
import Packs from "./Packs.js";
import Shard from "./Shard.js";
import About from "./About.js";

const Redirect = (props) => {
  let history = useHistory();
  const {to} = props;
  history.push(to);
  return <></>;
}

const MainLayout = (props) => {
  return (
    <Switch> 
      {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path="/">
        <Packs page="Home" {...props} />
      </Route>
      <Route exact path="/about">
        <About></About>
      </Route>
          
      {props.contractsLoaded &&
        <Route exact path="/scene/:sid/puzzle/:pid">
          <PuzzleViewer page="PuzzleViewer" {...props} />
        </Route>
      }
      {props.contractsLoaded &&
        <Route exact path="/shard/:id">
          <Shard page="Shard" {...props} />
        </Route>
      }
      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
  
export default MainLayout;