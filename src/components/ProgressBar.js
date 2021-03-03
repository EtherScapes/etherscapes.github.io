import React from "react";

export const ProgressBar = (props) => {
  if (!props.total) return (<>...</>);
  const count = props.count || 0;
  const barStyle = {
    width: props.width || "120px",
    height: props.height || "24px",
    marginLeft: "10px",
    marginRight: "10px",
    marginTop: "4px",
    background: "black",
    display: "flex",
    justifyContent: "flex-start",
    border: "1px solid var(--color-background)",
  };
  const progressStyle = {
    background: "var(--color-special)",
    border: "1px solid var(--color-font)",
    width: (100*(count / props.total))+"%",
  };
  const statusStyle = {
    height: "24px",
    display: "flex",
    alignItems: "center",
    fontSize: "10pt",
    position: "absolute",
    left: "50%",
    top: "5px",
  };
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    position: "relative",
  }

  return (
    <div className="progressbar-container" style={containerStyle}>
      <div className="progressbar" style={barStyle}>
        <div className="progress" style={progressStyle}>
        </div>
      </div>
      <div className="status" style={statusStyle}>
        {count} / {props.total}
      </div>
    </div>
  )
}