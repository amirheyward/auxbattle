import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Lobby from "./pages/Lobby";
import Home from "./pages/Home";
import Login from "./pages/Login";
import UserContext from "./context/UserContext";
import { useState } from "react";

function App() {
  const [username, setUsername] = useState("");

  return (
    <UserContext.Provider
      value={{ username: username, setUsername: setUsername }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />}></Route>
          <Route path="/lobby/:lobbyId" element={<Lobby />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
