import axios from "axios";
import { useContext, useRef } from "react";
import LobbyContext from "../context/LobbyContext";
import { useNavigate } from "react-router";
useNavigate;

function Home() {
  const navigate = useNavigate();
  const { setLobbyId } = useContext(LobbyContext);
  const inputRef = useRef<HTMLInputElement>(null);

  async function createLobby() {
    try {
      const response = await axios.post("http://127.0.0.1:8080/createlobby");
      console.log(response.data);
      setLobbyId(response.data.lobbyId);
      navigate("/lobby");
    } catch (e) {
      console.error(e);
    }
  }

  async function joinLobby() {
    const lobbyId = Number(inputRef.current!.value);
    try {
      const response = await axios.post("http://127.0.0.1:8080/joinlobby", {
        lobbyId: lobbyId,
      });
      setLobbyId(lobbyId);
      navigate("/lobby");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error(e.response?.data);
      }
    }
  }

  return (
    <div className="mainContainer">
      <button onClick={async () => createLobby()}>Create Lobby</button>
      <div>
        <button onClick={async () => joinLobby()}>Join Lobby</button>
        <input ref={inputRef} type="text" />
      </div>
    </div>
  );
}

export default Home;
