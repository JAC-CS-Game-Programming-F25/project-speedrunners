import Entity from "../entities/Entity.js";
import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";
import { objectSpriteConfig } from "../../config/SpriteConfig.js";

export default class Spike extends Entity {
    static WIDTH = 39;  // Actual sprite width
    static HEIGHT = 32; // Actual sprite height
    
    constructor(x, y) {
        super(x, y, Spike.WIDTH, Spike.HEIGHT);
        
        this.sprite = Spike.generateSprite();
        this.isActive = true;
        this.isSolid = true; // Spikes are solid objects
    }
    
    static generateSprite() {
        const frame = objectSpriteConfig.spike[0]
        return new Sprite(
            images.get(ImageName.GameObjects),
            frame.x,
            frame.y,
            frame.width,
            frame.height
        );
    }
    
    update(dt) {
    }
    
    render(context) {
        if (!this.isActive) return;
        
        this.sprite.render(
            Math.floor(this.position.x),
            Math.floor(this.position.y)
        );
    }
    
    /**
     * Check if player hit the spike (damage collision, not solid collision)
     * @param {Player} player
     * @returns {boolean}
     */
    checkCollision(player) {
        if (!this.isActive) return false;
        return this.collidesWith(player);
    }
}