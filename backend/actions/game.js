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
    this.voters = [];
    this.admins = [];
  }

  startGame() {
    this.game = new Game();
  }

  addPlayer(username) {
    if (!(players[0] && players[1])) {
      players.append(username);
      return 1;
    }

    return 0;
  }

  addVoters(username) {
    this.voters.append(username);
  }

  setAdmin(username) {
    this.admins.append(username);
  }
}

export { Game, Lobby };
