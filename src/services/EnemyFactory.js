import BuzzBomber from "../objects/BuzzBomber.js";
import Crab from "../objects/Crab.js";

/**
 * Factory for creating Enemy objects
 */
export default class EnemyFactory {
    /**
     * Create an enemy of the specified type
     * @param {string} type - 'buzzbomber' or 'crab'
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created enemy
     */
    static create(type, x, y) {
        switch(type.toLowerCase()) {
            case 'buzzbomber':
                return new BuzzBomber(x, y);
            case 'crab':
                return new Crab(x, y);
            default:
                throw new Error(`Unknown enemy type: ${type}`);
        }
    }

    /**
     * Get all available enemy types
     * @returns {string[]} Array of enemy type names
     */
    static getAvailableTypes() {
        return ['buzzbomber', 'crab'];
    }

    /**
     * Get a random enemy type
     * @returns {string} Random enemy type
     */
    static getRandomType() {
        const types = EnemyFactory.getAvailableTypes();
        return types[Math.floor(Math.random() * types.length)];
    }
}