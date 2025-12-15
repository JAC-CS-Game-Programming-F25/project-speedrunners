import Sprite from "../../lib/Sprite.js";
import { getSlopeHeights } from "../../config/Slopeconfig.js";

export default class Tile {
    static SIZE = 16;
    
    constructor(id, sprites) {
        this.sprites = sprites;
        this.id = id;
        
        // Get slope heights if this is a slope tile
        this.heights = getSlopeHeights(id);
        this.isSlope = this.heights !== null;
    }
    
    getHeightAt(localX) {
        // Use this.heights, not this.heightMap!
        if (this.heights && this.heights.length === 16) {
            const x = Math.max(0, Math.min(15, Math.floor(localX)));
            return this.heights[x];
        }
        
        // If it's a solid non-slope tile, return full height
        // Note: You need to check how isSolid is set - it might not exist
        // For now, assume non-slope solid tiles should return 16
        return 16;
    }
    
    render(x, y) {
        this.sprites[this.id].render(x * Tile.SIZE, y * Tile.SIZE);
    }
}