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

export { Game };
