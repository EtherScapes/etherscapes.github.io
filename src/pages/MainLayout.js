import React from "react";
import { Switch, Route } from "react-router-dom";

import Home from "./Home.js";
import Packs from "./Packs.js";
import About from "./About.js";

const MainLayout = (props) => {
  return (
    <Switch> {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path="/">
        <Home 
          user={props.user} 
          balance={props.balance}
          numScenes={props.numScenes}
          estile={props.estile} 
          estilewrap={props.estilewrap} 
          estilepack={props.estilepack} />
      </Route>
      <Route exact path="/packs">
        <Packs
          user={props.user}
          packs={props.packs} 
          estilewrap={props.estilewrap} 
          estilepack={props.estilepack} />
      </Route>
      <Route exact path="/about">
        <About></About>
      </Route>
    </Switch>
  );
}
  
export default MainLayout;