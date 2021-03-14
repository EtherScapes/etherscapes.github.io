import React from "react";

import RedditSVG from "../svg/reddit.svg";
import DiscordSVG from "../svg/discord.svg";
import GitHubSVG from "../svg/github.svg";
import TwitterSVG from "../svg/twitter.svg";

export const Footer = (props) => {
  return (
    <div className="footer">
      <span>© EtherScapes Inc</span>
      <span className="grow"></span>
      <a target="_blank" rel="noopener noreferrer" className="reddit" href="https://www.reddit.com/r/Etherscapes"><span><img src={RedditSVG} alt="github"></img></span></a>
      <a target="_blank" rel="noopener noreferrer" className="discord" href="https://discord.gg/kTmmeB6bes"><span><img src={DiscordSVG} alt="github"></img></span></a>
      <a target="_blank" rel="noopener noreferrer" className="twitter" href="https://twitter.com/etherscapes"><span><img src={TwitterSVG} alt="twitter"></img></span></a>
      <a target="_blank" rel="noopener noreferrer" className="github" href="https://github.com/etherscapes/contract"><span><img src={GitHubSVG} alt="github"></img></span></a>
    </div>
  );
}