import Sprite from "../../lib/Sprite.js";
import { getSlopeHeights } from "../../config/Slopeconfig.js";

export default class Tile {
    static SIZE = 16;
    
    /**
     * Represents one tile in a Layer and on the screen.
     *
     * @param {number} id
     * @param {Sprite[]} sprites
     */
    constructor(id, sprites) {
        this.sprites = sprites;
        this.id = id;
        
        // Get slope heights if this is a slope tile
        this.heights = getSlopeHeights(id);
        this.isSlope = this.heights !== null;
    }
    
    /**
     * Get the ground height at a specific local X position (0-15)
     * @param {number} localX - X position within the tile (0-15)
     * @returns {number} Height at that position (0-16)
     */
    getHeightAt(localX) {
        if (this.isSlope && this.heights) {
            const clampedX = Math.max(0, Math.min(15, Math.floor(localX)));
            return this.heights[clampedX];
        }
        // Non-slope solid tiles are always full height (flat top)
        return Tile.SIZE;
    }
    
    render(x, y) {
        this.sprites[this.id].render(x * Tile.SIZE, y * Tile.SIZE);
    }
}