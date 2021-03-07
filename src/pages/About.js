import React, {useState} from "react";

const FAQSection = (props) => {
  const [show, setShow] = useState(false);
  return (
    <div className="faq-section">
      <div className="faq-question" onClick={() => {setShow(!show)}}>{props.question}</div>
      {show && <div className="faq-body">{props.children}</div>}
    </div>
  );
}

const About = () => {
  return (
    <div className="faq-main">
      <FAQSection question="What are EtherScapes?">
        <p>
          EtherScapes are procedurally generated NFT puzzles. 
        </p>
        <p>
          Each rift in our collection is made up puzzle pictures. Each puzzle is 
          made of puzzle shards. Solve puzzles by collecting all the relevant 
          shard pieces and trading them in for a super-rare puzzle NFT. 
        </p>
      </FAQSection>

      <FAQSection question="How does it work?">
        <p>
          Purchase shards from open rifts with Ether or ESCAPE tokens. Each rift
          has a limited number of shards available - grab yours today!
        </p>
        <p>
          Each shard is minted at random by the rift, once you have all the shards
          in a puzzle, you can trade them in for the solved puzzle NFT. This NFT
          is special and earns you 1 ESCAPE per day per solved NFT you own!
        </p>
      </FAQSection>
      
      <FAQSection question="ESCAPEs? What are these?">
        <p>
          ESCAPEs are a tradeable ERC20 token that is minted by the EtherScapes contract
          anytime a puzzle in a rift is solved. 
        </p>
        <p>
          Use ESCAPE to purchase tiles from open rifts. 
        </p>
        <p>
          ESCAPEs can also be used to give each rift puzzle a unique name of your 
          choosing. To assign a name to a puzzle, you must own the NFT for the puzzle
          you are trying to name. Each time a picture is named, the naming cost 
          for the picture doubles.
        </p>
      </FAQSection>

      <FAQSection question="Other market integration?">
        <p>
          The EtherScape shards and solved puzzles are all tradeable NFTs (ERC1155
          tokens). This means you can sell or trade the shards or puzzles on markets
          like OpenSea and Rarible. 
        </p>
        <p>
          Find the pieces you are missing and trade duplicates to solve puzzles and 
          earn ESCAPE today!
        </p>
      </FAQSection>

      <FAQSection question="Can I see the code?">
        <p>
          All of the code involved in this project is available on GitHub and is 
          100% open source. Check out our 
          <a href="https://github.com/etherscapes">GitHub project page</a> for more info.
        </p>
        <p>
          The contract was developed using Solidity, with tests implemented to boot.
          The website is a React app hosted on GitHub pages, with the NFT metadata 
          currently hosted also via a public GitHub metadata project. Additionally,
          this project uses a simple python project to cut up puzzle images into 
          N number of shards based on SVG cutouts that we generate.
        </p>
        <p>
          We love feedback, and would appreciate your thoughts either in our 
          <a href="https://discord.gg/kTmmeB6bes">Discord</a>, 
          <a href="https://reddit.com/r/etherscapes">Reddit</a>,
          <a href="https://github.com/etherscapes">GitHub</a> channels.
        </p>
      </FAQSection>
    </div>
  );
}

export default About;
  