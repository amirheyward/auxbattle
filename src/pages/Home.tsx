import axios from "axios";
import { useContext, useRef } from "react";
import { useNavigate } from "react-router";
import UserContext from "../context/UserContext";
useNavigate;

function Home() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { username } = useContext(UserContext);

  async function createLobby() {
    try {
      const response = await axios.post("http://127.0.0.1:8080/createlobby",
        {username: username}
      );
      console.log(response.data);
      navigate(`/lobby/${response.data.lobbyId}`);
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

      navigate(`/lobby/${lobbyId}`);
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
