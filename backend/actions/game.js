class Game {
  constructor() {
    this.votes = [];
  }

  castVote(vote) {
    if (vote == "A" || vote == "B") {
      this.votes.push(vote);
    }
  }

  getWinner() {
    const counts = {};
    for (const vote of this.votes) {
      counts[vote] = (counts[vote] ?? 0) + 1;
    }

    let maxCount = 0;
    let mostCommon = null;
    for (const [value, count] of Object.entries(counts)) {
      if (count > maxCount) {
        mostCommon = value;
        maxCount = count;
      }
    }
    return mostCommon;
  }

  getVotes() {
    return this.votes;
  }
}

class Lobby {
  constructor() {
    this.game = undefined;
    this.lobbyState = {
      voters: [],
      admins: [],
      players: [],
      stage: 0, // [Pregame, PAChoice, PAVideo, PBChoice, PBVideo, VotePhase, Postgame]
      winner: "",
    };
  }

  startGame() {
    if (this.lobbyState.stage == 0) {
      this.game = new Game();
      this.lobbyState.stage = 1;
    }
  }

  addPlayer(username) {
    if (!(this.lobbyState.players[0] && this.lobbyState.players[1])) {
      players.append(username);
      return 1;
    }

    return 0;
  }

  addVoter(username) {
    this.lobbyState.voters.append(username);
  }

  setAdmin(username) {
    this.lobbyState.admins.append(username);
  }

  nextStage() {
    if (this.lobbyState.stage >= 6) {
      this.lobbyState.stage = 0;
      this.lobbyState.winner = "";
    } else {
      if (this.lobbyState.stage == 5) {
        this.lobbyState.winner = this.game.getWinner();
      }
      this.lobbyState.stage++;
    }

    return this.lobbyState.stage;
  }

  get lobbyState() {
    return this.lobbyState.append("votes", this.game?.votes);
  }
}

export { Game, Lobby };
