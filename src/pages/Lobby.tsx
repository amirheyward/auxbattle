import PlayerCard from "../components/PlayerCard";
import "./Lobby.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { socket } from "../socket";

function Lobby() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [displayOn, setDisplayOn] = useState(false);
  const { lobbyId } = useParams();

  function sendMessage() {
    socket.emit("message", "Hello");
  }

  /*
  note: in Strict Mode, js intentionally mounts twice to ensure you properly
  handle side effects. this means ANYTHING inside a useEffect will run twice in strict mode.
  for socket.io, this means (1) cleanup when possible in the front end and (2) handle multiple calls
  on the server side.
  */
 
  // on initial render only
  useEffect(() => {
    // join room on server side
    socket.emit("join", { lobbyId: lobbyId });
  }, []);

  // Socket.io events
  useEffect(() => {
    const handleMessage = (msg: string) => {
      console.log(msg);
    };

    const handleLobbyDownload = async ({ query }: { query: string }) => {
      try {
        const sanQuery = query.trim().replace(/ /g, "%20");
        const response = await axios.get(
          `http://127.0.0.1:8000/song?q=${sanQuery}&id=${lobbyId}`,
          { responseType: "blob" },
        );
        const blob = response.data;

        setDisplayOn(true);
        setUrl(URL.createObjectURL(blob));
      } catch (e) {
        if (axios.isAxiosError(e)) {
          console.error(e.response?.data);
        }
      }
    };

    // for comms
    socket.on("message", handleMessage);

    // order to download (all lobby users recieve simultaneously)
    socket.on("lobbyDownload", handleLobbyDownload);

    // useEffect treats the return value as a cleanup function
    return () => {
      socket.off("message", handleMessage);
      socket.off("lobbyDownload", handleLobbyDownload);
    };
  }, [socket]);

  async function findSong() {
    const query = inputRef.current!.value;

    // send song request to lobby websocket, then broadcast order to download
    try {
      const response = await axios.post("http://127.0.0.1:8080/song", {
        q: query,
        lobbyId: lobbyId,
      });
      console.log(response.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error(e.response?.data);
      }
    }
  }

  async function castVote(vote: string) {
    try {
      const response = await axios.post("http://127.0.0.1:8080/vote", {
        vote: vote,
        lobbyId: lobbyId,
      });
      console.log(response.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error(e.response?.data);
      }
    }
  }

  async function endVote() {
    try {
      const response = await axios.post("http://127.0.0.1:8080/endvote", {
        lobbyId: lobbyId,
      });
      console.log(response.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error(e.response?.data);
      }
    }
  }

  async function getVotes() {
    try {
      const response = await axios.get("http://127.0.0.1:8080/vote", {
        params: {
          lobbyId: lobbyId,
        },
      });
      console.log(response.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error(e.response?.data);
      }
    }
  }

  return (
    <div className="mainContainer">
      <div className="field">
        <PlayerCard />
        <div className="display">
          {displayOn && (
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
          )}
        </div>
        <PlayerCard />
      </div>

      <input ref={inputRef} type="text" />
      <button onClick={async () => findSong()}>Find Song</button>
      <button onClick={async () => castVote("A")}>Vote</button>
      <button onClick={async () => endVote()}>End Vote</button>
      <button onClick={async () => getVotes()}>Get Votes</button>
      <button onClick={() => sendMessage()}>Send Message</button>
    </div>
  );
}

export default Lobby;
