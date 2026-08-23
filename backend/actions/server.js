import express from "express";
import cors from "cors";
import { Lobby, Game } from "./game.js";
import { Server } from "socket.io";
import http from "node:http";
import { emit } from "node:cluster";

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
  if (lobby instanceof Lobby) {
    if (!lobby.addPlayer(username)) {
      lobby.addVoter(username);
    }
    io.to(lobbyId).emit("gameUpdate", lobby.gameState);
    res.status(200).json({ success: 1 });
  } else {
    res.status(400).json({ message: `Lobby ${lobbyId} not found` });
  }
});

app.post("/startGame", (req, res) => {
  const lobbyId = req.body.lobbyId;
  const lobby = lobbiesMap[lobbyId];
  const username = req.body.username;
  if (lobby.admins.contains(username)) {
    const nextStage = [0, 1, 0, 0];
    lobby.startGame();
    io.to(lobbyId).emit("startGame", { lobbyId: lobbyId });
    // update game state
    lobbiesMap[lobbyId].setStage(nextStage);
    io.to(lobbyId).emit("stage", nextStage);
    res.status(200).json({ success: 1 });
  } else {
    res.status(400).json({ message: `${username} is not an admin` });
  }
});

app.post("/endvote", (req, res) => {
  const lobbyId = req.body.lobbyId;
  const lobby = lobbiesMap[lobbyId];
  if (lobby instanceof Lobby) {
    const winner = lobby.game.endVote();
    const nextStage = [0, 0, 0, 1];
    // update game state
    lobbiesMap[lobbyId].setStage(nextStage);
    io.to(lobbyId).emit("winner", winner);
    io.to(lobbyId).emit("stage", nextStage);
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
    return;
  }
  const nextStage = [0, 0, 0, 0];
  console.log("Before emitting " + query);
  io.to(lobbyId).emit("lobbyDownload", { query: query });
  // update game state
  lobbiesMap[lobbyId].setStage(nextStage);
  io.to(lobbyId).emit("stage", nextStage);
  console.log(`Broadcasting "${query}" to Lobby ${lobbyId}`);
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
  socket.on("join", ({ lobbyId, username }) => {
    if (!socket.rooms.has(lobbyId)) {
      socket.join(lobbyId);
      // share game state with new user
      socket.emit("stage", lobbiesMap[lobbyId].getStage());
      console.log(`(${socket.id}) rooms: ${Array.from(socket.rooms)}`);
      io.to(lobbyId).emit("message", `${username} has joined Lobby ${lobbyId}`);
    }
  });

  // handle votes
  socket.on("vote", ({ lobbyId, vote }) => {
    const lobby = lobbiesMap[lobbyId];
    if (lobby instanceof Lobby) {
      lobby.game.castVote(vote);
      console.log(`Vote for ${vote} in Lobby ${lobbyId}`);
      socket.emit("gameUpdate", lobby.gameState);
    }
  });
});

server.listen(8080, () => console.log("http://127.0.0.1:8080"));
