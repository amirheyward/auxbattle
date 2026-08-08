import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Lobby from "./pages/Lobby";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
