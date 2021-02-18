import React from "react";

import PackStore from "../components/PackStore.js";

const Packs = (props) => {
  return (
    <div className="Packs-main">
      <PackStore 
        packs={props.packs} 
        estilewrap={props.estilewrap} 
        estilepack={props.estilepack} 
        user={props.user} />
    </div>
  );
}

export default Packs;
  