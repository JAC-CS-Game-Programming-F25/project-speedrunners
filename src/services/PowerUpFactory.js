import SpeedShoesPowerUp from "../objects/PowerUps/SpeedShoesPowerUp.js";
import InvincibilityPowerUp from "../objects/PowerUps/InvincibilityPowerUp.js";
import ExtraRingsPowerUp from "../objects/PowerUps/ExtraRingsPowerUp.js";

/**
 * Factory for creating PowerUp objects
 */
export default class PowerUpFactory {
    /**
     * Create a powerup of the specified type
     * @param {string} type - 'speed', 'invincibility', or 'rings'
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Additional options (e.g., ringAmount for rings powerup)
     * @returns {PowerUp} The created powerup
     */
    static create(type, x, y, options = {}) {
        switch(type) {
            case 'speed':
                return new SpeedShoesPowerUp(x, y);
            case 'invincibility':
                return new InvincibilityPowerUp(x, y);
            case 'rings':
                return new ExtraRingsPowerUp(x, y, options.ringAmount || 10);
            default:
                throw new Error(`Unknown powerup type: ${type}`);
        }
    }

    /**
     * Get a random powerup type
     * @returns {string} Random powerup type
     */
    static getRandomType() {
        const types = ['speed', 'invincibility', 'rings'];
        return types[Math.floor(Math.random() * types.length)];
    }
}