import PlayerCard from "../components/PlayerCard";
import "./Lobby.css";
import { useRef, useState } from "react";
import axios from "axios";
import ReactPlayer from "react-player";

function Lobby() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [displayOn, setDisplayOn] = useState(false);

  async function findSong() {
    const query = inputRef.current!.value;
    const sanQuery = query.trim().replace(/ /g, "%20");

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/find?q=${sanQuery}`,
        { responseType: "blob" },
      );
      const blob = response.data;

      setDisplayOn(true);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mainContainer">
      <PlayerCard />
      <input ref={inputRef} type="text" />
      <button onClick={async () => findSong()}></button>
      {displayOn && url && (
        <div className="display">
          <video src={url} controls />
        </div>
      )}
    </div>
  );
}

export default Lobby;
