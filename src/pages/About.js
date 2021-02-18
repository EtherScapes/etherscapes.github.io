import React from "react";

const About = () => {
  return (
    <div className="About-main">
      <h3>What are EtherScapes?</h3>
      <p>
        EtherScapes is a procedurally generated jig-saw puzzle collectable. 
      </p>
      <p>
        Each scene in our collection is broken up into puzzle pictures.
        Each picture makes up a puzzle broken into JigSaw tiles. The tiles 
        themselves and the solved puzzles are collectable and tradeable on markets
        like opensea and rarible (they are tradeable ERC1155 tokens).
      </p>

      <h3>How does it work?</h3>
      <p>
        Purchase packs with ETH or ESCAPE tokens. Each pack is associated with a 
        scene and will mint puzzle tiles from the scene at random. 
      </p>
      <p>
        Some packs are special and cannot be purchased for ETH at the contract 
        exchange rate.
      </p>
      
      <h3>ESCAPEs? What are these?</h3>
      <p>
        ESCAPEs are a tradeable ERC20 token that is minted by the EtherScapes contract
        anytime a puzzle in a scene is solved. To solve a puzzle, collect and trade-in
        all tokens for a single picture (this will burn the induvidual tiles!). However,
        this will also release a fixed percent of the ESCAPE locked up in the scene's 
        reward pool!
      </p>
      <p>
        ESCAPEs can also be used to give each picture in each scene a name of your 
        choosing. To assign a name to a picture, you must have at-least one token 
        that represents the completed picture. Each time a picture is named, the 
        naming cost for the picture doubles.
      </p>

      <h3>Other market integration</h3>
      <p>
        The puzzle packs, the tiles, and the solved puzzles are all tradeable 
        ERC1155 tokens. This means you can sell / trade the packs without ever
        opening them! Trade tokens with friends to complete pictures and earn 
        ESCAPE!
      </p>
    </div>
  );
}

export default About;
  