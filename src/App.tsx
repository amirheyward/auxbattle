import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Lobby from "./pages/Lobby";
import Home from "./pages/Home";
import LobbyContext from "./context/LobbyContext";
import { useState } from "react";

function App() {
  const [lobbyId, setLobbyId] = useState(-1);

  return (
    <LobbyContext.Provider value={{lobbyId: lobbyId, setLobbyId: setLobbyId}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
        </Routes>
      </BrowserRouter>
    </LobbyContext.Provider>
  );
}

export default App;
