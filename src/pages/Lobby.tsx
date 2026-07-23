import PlayerCard from "../components/PlayerCard";
import "./Lobby.css";
import { useRef, useState } from "react";
import axios from "axios";

function Lobby() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [displayOn, setDisplayOn] = useState(false);

  async function findSong() {
    const query = inputRef.current!.value;
    const sanQuery = query.trim().replace(/ /g, "%20");
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/find?q=${sanQuery}`,
      );

      setDisplayOn(true);
      const url = response.data.url;
      setContent(url);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mainContainer">
      <PlayerCard />
      <input ref={inputRef} type="text" />
      <button onClick={async () => findSong()}></button>
      {displayOn && <div className="display">{content}</div>}
    </div>
  );
}

export default Lobby;
