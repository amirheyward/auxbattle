import express from "express";
import cors from "cors";
import Game from "./game.js";

let currGame = null;

const app = express();
app.use(express.json());
app.use(
  cors({
    origins: ["http://127.0.0.1:8080", "http://127.0.0.1:5173"],
  })
);

app.post("/startgame", (req, res) => {
  currGame = new Game();
  res.status(200).json({ success: 1 });
});

app.post("/vote", (req, res) => {
  const vote = req.body.vote;
  if ( currGame instanceof Game) {
    currGame.castVote(vote);
    res.status(200).json({ success: 1 });
  } else {
    res.status(400).json({ error: "No game active" });
  }
});

app.get("/vote", (req, res) => {
  if (currGame instanceof Game) {
    const votes = currGame.getVotes();
    res.status(200).json({ votes: votes });
  } else {
    res.status(400).json({ error: "No game active" });
  }
});

app.post("/endvote", (req, res) => {
  if (currGame instanceof Game) {
    const winner = currGame.endVote();
    res.status(200).json({ winner: winner });
  } else {
    res.status(400).json({ error: "No game active" });
  }
});

app.listen(8080, () => console.log("http://127.0.0.1:8080"));
