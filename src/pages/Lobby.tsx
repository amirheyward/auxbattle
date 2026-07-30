import PlayerCard from "../components/PlayerCard";
import "./Lobby.css";
import { useContext, useRef, useState } from "react";
import axios from "axios";
import LobbyContext from "../context/LobbyContext";

function Lobby() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [displayOn, setDisplayOn] = useState(false);
  const {lobbyId, setLobbyId} = useContext(LobbyContext)

  async function findSong() {
    const query = inputRef.current!.value;
    const sanQuery = query.trim().replace(/ /g, "%20");

    try {
      const response = await axios.get(
        `http://127.0.0.1:8080/find?q=${sanQuery}`,
        { responseType: "blob" },
      );
      const blob = response.data;

      setDisplayOn(true);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
    }
  }

  async function startVote() {
    // try {
    //   const response = await axios.post("http://127.0.0.1:8080/createlobby");
    //   lobbyId = response.data.lobbyId;
    //   console.log(response.data);
    // } catch (e) {
    //   console.error(e);
    // }
  }

  async function castVote(vote: string) {
    try {
      const response = await axios.post("http://127.0.0.1:8080/vote", {
        vote: vote,
        lobbyId: lobbyId,
      });
      console.log(response.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function endVote() {
    try {
      const response = await axios.post("http://127.0.0.1:8080/endvote", {
        lobbyId: lobbyId,
      });
      console.log(response.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function getVotes() {
    try {
      const response = await axios.get("http://127.0.0.1:8080/vote",
        {params: {
          lobbyId: lobbyId
        }}
      );
      console.log(response.data);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mainContainer">
      <div className="field">
        <PlayerCard />
        <div className="display">
          {displayOn && <video src={url} controls />}
        </div>
        <PlayerCard />
      </div>

      <input ref={inputRef} type="text" />
      <button onClick={async () => findSong()}>Find Song</button>
      <button onClick={async () => startVote()}>Start Vote</button>
      <button onClick={async () => castVote("A")}>Vote</button>
      <button onClick={async () => endVote()}>End Vote</button>
      <button onClick={async () => getVotes()}>Get Votes</button>
    </div>
  );
}

export default Lobby;
