import Ring from "../objects/Ring.js";
import Spike from "../objects/Spike.js";
import PowerUpBox from "../objects/PowerUps/PowerUpBox.js";
import EnemyFactory from "./EnemyFactory.js";

/**
 * Factory for creating game objects (Rings, Spikes, PowerUpBoxes, Enemies)
 */
export default class GameObjectFactory {
    /**
     * Create a ring
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} isBouncing - Whether the ring is bouncing (lost ring)
     * @returns {Ring}
     */
    static createRing(x, y, isBouncing = false) {
        return new Ring(x, y, isBouncing);
    }

    /**
     * Create a spike
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Spike}
     */
    static createSpike(x, y) {
        return new Spike(x, y);
    }

    /**
     * Create a powerup box
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} powerUpType - 'speed', 'invincibility', 'rings', or 'random'
     * @returns {PowerUpBox}
     */
    static createPowerUpBox(x, y, powerUpType = 'random') {
        return new PowerUpBox(x, y, powerUpType);
    }

    /**
     * Create an enemy
     * @param {string} type - Enemy type ('buzzbomber' or 'crabmeat')
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy}
     */
    static createEnemy(type, x, y) {
        return EnemyFactory.create(type, x, y);
    }
}