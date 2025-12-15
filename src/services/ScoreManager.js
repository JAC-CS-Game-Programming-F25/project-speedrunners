/**
 * Manages the score for the entire game.
 */
export default class ScoreManager {
    constructor() {
        this.score = 0;
    }

    add(points) {
        this.score += points;
    }

    reset() {
        this.score = 0;
    }

    getScore() {
        return this.score;
    }
}