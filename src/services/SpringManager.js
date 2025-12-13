import GameObjectFactory from "./GameObjectFactory.js";

/**
 * Manages all springs in the game
 */
export default class SpringManager {
    constructor() {
        this.springs = [];
    }
    
    /**
     * Add a spring at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    addSpring(x, y) {
        this.springs.push(GameObjectFactory.createSpring(x, y));
    }
    
    /**
     * Add multiple springs in a horizontal line
     * @param {number} startX - Starting X position
     * @param {number} y - Y position
     * @param {number} count - Number of springs
     * @param {number} spacing - Space between springs (default 32)
     */
    addSpringLine(startX, y, count, spacing = 32) {
        for (let i = 0; i < count; i++) {
            this.addSpring(startX + (i * spacing), y);
        }
    }
    
    /**
     * Update all springs
     * @param {number} dt - Delta time
     */
    update(dt) {
        this.springs.forEach(spring => spring.update(dt));
    }
    
    /**
     * Render all springs
     * @param {CanvasRenderingContext2D} context
     */
    render(context) {
        this.springs.forEach(spring => spring.render(context));
    }
    
    /**
     * Reset all springs
     */
    reset() {
        this.springs = [];
    }
}