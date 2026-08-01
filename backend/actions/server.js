import express from "express";
import cors from "cors";
import { Game } from "./game.js";

const lobbiesMap = {}; // { id : game }
let lobbyCount = 0;

const app = express();
app.use(express.json());
app.use(
  cors({
    origins: ["http://127.0.0.1:8080", "http://127.0.0.1:5173"],
  }),
);

app.post("/createlobby", (req, res) => {
  const lobbyId = lobbyCount++;
  lobbiesMap[lobbyId] = new Game();
  res.status(200).json({ lobbyId: lobbyId });
});

app.post("/joinlobby", (req, res) => {
  const lobbyId = req.body.lobbyId;
  if (lobbiesMap[lobbyId]) {
    res.status(200).json({ success: 1 });
  } else {
    res.status(400).json({ message: "Lobby not found" });
  }
});

app.post("/vote", (req, res) => {
  const lobbyId = req.body.lobbyId;
  const vote = req.body.vote;

  const game = lobbiesMap[lobbyId];
  if (game && game instanceof Game) {
    game.castVote(vote);
    res.status(200).json({ success: 1 });
  } else {
    res.status(400).json({ message: "Lobby not found" });
  }
});

app.get("/vote", (req, res) => {
  const lobbyId = req.query.lobbyId;

  const game = lobbiesMap[lobbyId];
  if (game && game instanceof Game) {
    const votes = game.getVotes();
    res.status(200).json({ votes: votes });
  } else {
    res.status(400).json({ message: "Lobby not found" });
  }
});

app.post("/endvote", (req, res) => {
  const lobbyId = req.body.lobbyId;

  const game = lobbiesMap[lobbyId];
  if (game && game instanceof Game) {
    const winner = game.endVote();
    res.status(200).json({ winner: winner });
  } else {
    res.status(400).json({ message: "Lobby not found" });
  }
});

app.listen(8080, () => console.log("http://127.0.0.1:8080"));
