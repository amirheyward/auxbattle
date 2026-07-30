import axios from "axios";
import { useContext } from "react";
import LobbyContext from "../context/LobbyContext";
import { useNavigate } from "react-router";
useNavigate;

function Home() {
  const navigate = useNavigate();
  const { lobbyId, setLobbyId } = useContext(LobbyContext);

  async function createLobby() {
    try {
      const response = await axios.post("http://127.0.0.1:8080/createlobby");
      console.log(response.data)
      setLobbyId(response.data.lobbyId);
      navigate("/lobby");
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <div className="mainContainer">
      <button onClick={async () => createLobby()}>Create Lobby</button>
      <button>Join Lobby</button>
    </div>
  );
}

export default Home;
