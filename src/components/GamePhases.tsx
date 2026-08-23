import { useRef } from "react";
import PlayerCard from "./PlayerCard";

function Pregame({ players = [], voters = [] }) {
  return (
    <div className="mainContainer">
      <div className="playerContainer">
        <PlayerCard username={players[0]} />
        <PlayerCard username={players[1]} />
      </div>
      Voter Count: {voters.length}
    </div>
  );
}

function PlayerChoice({ players = [] }) {
  const songInputRef = useRef(null);

  return (
    <div className="mainContainer">
      <input ref={songInputRef} type="text" />
      <button onClick={async () => {}}>Find Song</button>
    </div>
  );
}

function VotePhase() {
    return (
        <div className="mainContainer">
            <button>A</button>
            <button>b</button>
        </div>
    )
}

function Postgame({player = ""}) {
  return (
    <div className="maincontainer">
      Winner: <PlayerCard username={player} />
    </div>
  );
}

export { Pregame, PlayerChoice, VotePhase, Postgame };
