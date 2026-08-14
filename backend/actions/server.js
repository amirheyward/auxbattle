import express from "express";
import cors from "cors";
import { Lobby, Game } from "./game.js";
import { Server } from "socket.io";
import http from "node:http";

const lobbiesMap = {}; // { id : Lobby }
let lobbyCount = 0;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:8080", "http://127.0.0.1:5173"],
  },
}); // socket.io.Server

// HTTP endpoints
app.use(express.json());
app.use(
  cors({
    origins: ["http://127.0.0.1:8080", "http://127.0.0.1:5173"],
  }),
);

app.post("/createlobby", (req, res) => {
  const lobbyId = lobbyCount++;
  const username = req.body.username;
  const lobby = new Lobby();
  lobby.setAdmin(username);
  lobby.addPlayer(username);
  lobbiesMap[lobbyId] = lobby;
  res.status(200).json({ lobbyId: lobbyId });
});

app.post("/joinlobby", (req, res) => {
  const lobbyId = req.body.lobbyId;
  const username = req.body.username;
  const lobby = lobbiesMap[lobbyId];
  if (lobby) {
    if (!lobby.addPlayer(username)) {
      lobby.addVoter(username);
    }
    res.status(200).json({ success: 1 });
  } else {
    res.status(400).json({ message: `Lobby ${lobbyId} not found` });
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
    res.status(400).json({ message: `Lobby ${lobbyId} not found` });
  }
});

app.get("/vote", (req, res) => {
  const lobbyId = req.query.lobbyId;

  const game = lobbiesMap[lobbyId];
  if (game && game instanceof Game) {
    const votes = game.getVotes();
    res.status(200).json({ votes: votes });
  } else {
    res.status(400).json({ message: `Lobby ${lobbyId} not found` });
  }
});

app.post("/endvote", (req, res) => {
  const lobbyId = req.body.lobbyId;

  const game = lobbiesMap[lobbyId];
  if (game && game instanceof Game) {
    const winner = game.endVote();
    res.status(200).json({ winner: winner });
  } else {
    res.status(400).json({ message: `Lobby ${lobbyId} not found` });
  }
});

app.post("/song", (req, res) => {
  const lobbyId = req.body.lobbyId;
  const query = req.body.q;
  // handle empty query
  if (query.trim() == "") {
    res.status(400).json({ message: "Empty queries not allowed" });
  }
  console.log("Before emitting " + query);
  io.to(lobbyId).emit("lobbyDownload", { query: query });
  console.log(`Broadcasting "${query}" to lobby ${lobbyId}`);
  res.status(200).json({ success: 1 });
});

// WebSocket Server
// on(ev) adds an event listener for ev
io.on("connection", (socket) => {
  console.log(`New connection! ${socket.id}`);

  // for comms
  socket.on("message", (data) => {
    console.log(`Recieved: ${data} (${socket.id})`);
    socket.emit("message", `The server recieved ${data}`);
  });

  // joining lobbies
  socket.on("join", ({ lobbyId }) => {
    if (!socket.rooms.has(lobbyId)) {
      socket.join(lobbyId);
      console.log(`(${socket.id}) rooms: ${Array.from(socket.rooms)}`);
    }
  });
});

server.listen(8080, () => console.log("http://127.0.0.1:8080"));
