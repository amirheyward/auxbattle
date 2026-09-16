import PlayerCard from "../components/PlayerCard";
import "./Lobby.css";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { redirect, useParams } from "react-router";
import { socket } from "../socket";
import {
  Pregame,
  PlayerChoice,
  VotePhase,
  Postgame,
  Waiting,
  VideoPlayer,
} from "../components/GamePhases";
import UserContext from "../context/UserContext";

function Lobby() {
  let { lobbyId } = useParams();
  lobbyId = lobbyId ?? "";
  const { username } = useContext(UserContext);
  const [renderStage, setRenderStage] = useState(0); // [Pregame, PAChoice, PAVideo, PBChoice, PBVideo, VotePhase, Postgame]
  const [url, setUrl] = useState("");

  type gameStateType = {
    voters: string[];
    admins: string[];
    players: string[];
    stage: number;
    winner: string;
    votes: undefined | string[];
  };

  let gameState: gameStateType = {
    voters: [],
    admins: [],
    players: [],
    stage: 0, // [Pregame, PAChoice, PAVideo, PBChoice, PBVideo, VotePhase, Postgame]
    winner: "",
    votes: undefined,
  };

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

        setUrl(URL.createObjectURL(blob));
      } catch (e) {
        if (axios.isAxiosError(e)) {
          console.error(e.response?.data);
        }
      }
    };

    const handleGameUpdate = (newGameState: gameStateType) => {
      gameState = newGameState;
      setRenderStage(gameState.stage);
    };

    // for comms
    socket.on("message", handleMessage);

    // order to download (all lobby users recieve simultaneously)
    socket.on("lobbyDownload", handleLobbyDownload);

    // for updating game state
    socket.on("gameUpdate", handleGameUpdate);

    // useEffect treats the return value as a cleanup function
    return () => {
      socket.off("message", handleMessage);
      socket.off("lobbyDownload", handleLobbyDownload);
      socket.off("gameUpdate", handleGameUpdate);
    };
  }, [socket]);

  if (renderStage == 0) {
    return <Pregame players={gameState.players} voters={gameState.voters} />;
  } else if (renderStage == 1 && gameState.players[0] == username) {
    return (
      <PlayerChoice socket={socket} username={username} lobbyId={lobbyId} />
    );
  } else if (renderStage == 1) {
    return <Waiting />;
  } else if (renderStage == 2) {
    return <VideoPlayer url={url} />;
  } else if (renderStage == 3 && gameState.players[1] == username) {
    return (
      <PlayerChoice socket={socket} username={username} lobbyId={lobbyId} />
    );
  } else if (renderStage == 3) {
    return <Waiting />;
  } else if (renderStage == 4) {
    return <VideoPlayer url={url} />;
  } else if (renderStage == 5) {
    return <VotePhase socket={socket} lobbyId={lobbyId} />;
  } else if (renderStage == 6) {
    return <Postgame winner={gameState.winner} />;
  } else {
    return;
  }
}

export default Lobby;
