import React from "react";
import "./Loading.css";

////////////////////////////////////////////////////////////////////////////////

export const Loading = (props) => {
  return (
    <div className="App-loading">
      <div className="message">{props.message}</div>
      {props.message && props.message.length > 0 &&
        <div className="loading-animation">
          <div></div><div></div><div></div>
        </div>
      }
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////