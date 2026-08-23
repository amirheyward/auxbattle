class Game {
  constructor() {
    this.votes = [];
  }

  castVote(vote) {
    if (vote == "A" || vote == "B") {
      this.votes.push(vote);
    }
  }

  endVote() {
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
    this.gameState = {
      voters: undefined,
      admins: [],
      players: [],
      voters: [],
      stageArr: [1, 0, 0, 0],
      // this is used for conditional rendering on the frontend
      // [Pregame, PlayerChoice, VotePhase, Postgame]
      // all 0s = the actual video is playing
    };
  }

  startGame() {
    this.game = new Game();
  }

  addPlayer(username) {
    if (!(this.gameState.players[0] && this.gameState.players[1])) {
      players.append(username);
      return 1;
    }

    return 0;
  }

  addVoter(username) {
    this.gameState.voters.append(username);
  }

  setAdmin(username) {
    this.gameState.admins.append(username);
  }

  setStage(stageArr) {
    this.gameState.stageArr = stageArr;
  }

  get gameState() {
    return this.gameState.append("votes", this.game?.votes)
  }
}

export { Game, Lobby };
