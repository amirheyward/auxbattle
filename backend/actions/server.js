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
  if (lobby instanceof Lobby) {
    if (!lobby.addPlayer(username)) {
      lobby.addVoter(username);
    }
    io.to(lobbyId).emit("gameUpdate", lobby.lobbyState);
    res.status(200).json({ success: 1 });
  } else {
    res.status(400).json({ message: `Lobby ${lobbyId} not found` });
  }
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
      console.log(`(${socket.id}) rooms: ${Array.from(socket.rooms)}`);
      io.to(lobbyId).emit("message", `${username} has joined Lobby ${lobbyId}`);
    }
    const lobby = lobbiesMap[lobbyId];
    if (lobby instanceof Lobby) {
      socket.emit("gameUpdate", lobby.lobbyState);
    }
  });

  // handle votes
  socket.on("vote", ({ lobbyId, vote }) => {
    const lobby = lobbiesMap[lobbyId];
    if (lobby instanceof Lobby) {
      lobby.game.castVote(vote);
      console.log(`Vote for ${vote} in Lobby ${lobbyId}`);
      io.to(lobbyId).emit("gameUpdate", lobby.lobbyState);
    }
  });

  // start game
  socket.on("start", ({ lobbyId, username }) => {
    const lobby = lobbiesMap[lobbyId];
    if (lobby instanceof Lobby) {
      if (lobby.lobbyState.admins.contains(username)) {
        lobby.startGame();
        console.log(`${username} started game in Lobby ${lobbyId}`);
        io.to(lobbyId).emit("gameUpdate", lobby.lobbyState);
      }
    }
  });

  // force next stage from game admin
  socket.on("next", ({ lobbyId, username }) => {
    const lobby = lobbiesMap[lobbyId];
    if (lobby instanceof Lobby) {
      if (lobby.lobbyState.admins.contains(username)) {
        lobby.nextStage();
        console.log(`${username} forced next stage in Lobby ${lobbyId}`);
        io.to(lobbyId).emit("gameUpdate", lobby.lobbyState);
      }
    }
  });

  // request song
  socket.on("song", ({ lobbyId, username, query }) => {
    const lobby = lobbiesMap[lobbyId];
    if (lobby instanceof Lobby) {
      if (lobby.lobbyState.players.contains(username)) {
        lobby.nextStage();
        console.log("Before emitting " + query);
        io.to(lobbyId).emit("lobbyDownload", { query: query });
        console.log(`Broadcasting "${query}" to Lobby ${lobbyId}`);
        io.to(lobbyId).emit("gameUpdate", lobby.lobbyState);
      }
    }
  });
});

server.listen(8080, () => console.log("http://127.0.0.1:8080"));
