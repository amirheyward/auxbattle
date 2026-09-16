import { useRef } from "react";
import PlayerCard from "./PlayerCard";
import { Socket } from "socket.io-client";

function Pregame(props: { players: string[]; voters: string[] }) {
  const { players, voters } = props;
  return (
    <div className="mainContainer">
      <div className="playerContainer">
        {players.map((x) => (
          <PlayerCard username={x} />
        ))}
      </div>
      Voter Count: {voters.length}
    </div>
  );
}

function PlayerChoice(props: {
  socket: Socket;
  username: string;
  lobbyId: string;
}) {
  const { socket, lobbyId, username } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  function findSong() {
    const query = inputRef.current!.value;
    // send song request to lobby websocket, then broadcast order to download
    socket.emit("song", { lobbyId: lobbyId, username: username, query: query });
  }

  return (
    <div className="mainContainer">
      <input ref={inputRef} type="text" />
      <button onClick={() => findSong()}>Find Song</button>
    </div>
  );
}

function Waiting() {
  return (
    <div className="mainContainer">
      <em>waiting on player choice...</em>
    </div>
  );
}

function VideoPlayer(props: { url: string }) {
  const { url } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mainContainer">
      <div className="field">
        <PlayerCard />
        <div className="display">
          (
          <>
            <video
              ref={videoRef}
              src={url}
              autoPlay
              onLoadedMetadata={() => {
                videoRef.current!.volume = 0.05;
                rangeRef.current!.value = "20";
              }}
            />
            <div className="controlsContainer">
              <button
                onClick={() => {
                  videoRef.current!.muted = !videoRef.current!.muted;
                }}
              >
                Mute
              </button>
              <input
                ref={rangeRef}
                type="range"
                min={0}
                max={100}
                onChange={(e) => {
                  videoRef.current!.volume = Number(e.target.value) / 400;
                }}
              />
              <button>Vote Pause</button>
            </div>
          </>
          )
        </div>
        <PlayerCard />
      </div>
    </div>
  );
}

function VotePhase(props: { socket: Socket; lobbyId: string }) {
  const { socket, lobbyId } = props;
  return (
    <div className="mainContainer">
      <button
        onClick={() => socket.emit("Vote", { lobbyId: lobbyId, vote: "A" })}
      >
        A
      </button>
      <button
        onClick={() => socket.emit("Vote", { lobbyId: lobbyId, vote: "B" })}
      >
        B
      </button>
    </div>
  );
}

function Postgame(props: { winner: string }) {
  const { winner } = props;
  return (
    <div className="mainContainer">
      Winner: <PlayerCard username={winner} />
    </div>
  );
}

export { Pregame, PlayerChoice, Waiting, VideoPlayer, VotePhase, Postgame };
