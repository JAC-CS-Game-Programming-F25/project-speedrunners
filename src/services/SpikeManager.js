import GameObjectFactory from "./GameObjectFactory.js";

export default class SpikeManager {
    constructor() {
        this.spikes = [];
    }

    /**
     * Add a spike at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    addSpike(x, y) {
        this.spikes.push(GameObjectFactory.createSpike(x, y));
    }

    /**
     * Add multiple spikes in a horizontal line
     * @param {number} startX - Starting X position
     * @param {number} y - Y position
     * @param {number} count - Number of spikes
     * @param {number} spacing - Space between spikes (default 16)
     */
    addSpikeLine(startX, y, count, spacing = 16) {
        for (let i = 0; i < count; i++) {
            this.addSpike(startX + (i * spacing), y);
        }
    }

    /**
     * Add spikes in a grid pattern
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @param {number} spacingX - Horizontal spacing
     * @param {number} spacingY - Vertical spacing
     */
    addSpikeGrid(startX, startY, rows, cols, spacingX = 16, spacingY = 16) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.addSpike(
                    startX + (col * spacingX),
                    startY + (row * spacingY)
                );
            }
        }
    }

    /**
     * Update all spikes
     * @param {number} dt - Delta time
     */
    update(dt) {
        this.spikes.forEach(spike => spike.update(dt));
    }

    /**
     * Render all spikes
     * @param {CanvasRenderingContext2D} context
     */
    render(context) {
        this.spikes.forEach(spike => spike.render(context));
    }

    /**
     * Check collision with player
     * @param {Player} player
     * @returns {boolean} True if player hit any spike
     */
    checkCollisions(player) {
        for (const spike of this.spikes) {
            if (spike.checkCollision(player)) {
                return true; 
            }
        }
        return false;
    }

    /**
     * Reset all spikes
     */
    reset() {
        this.spikes = [];
    }
}