import Enemy from "./Enemy.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";

/**
 * BuzzBomber enemy - ground crab enemy (4 frames)
 */
export default class BuzzBomber extends Enemy {
    static WIDTH = 40;
    static HEIGHT = 32;

    constructor(x, y) {
        super(x, y, BuzzBomber.WIDTH, BuzzBomber.HEIGHT);
        
        this.sprites = this.generateSprites();
        this.animation = new Animation([0, 1, 2, 3], 0.15);
        
        // Movement (ground enemy, slower)
        this.moveSpeed = 40;
        this.patrolDistance = 60;
        
        // Get explosion sprites from game objects sprite sheet
        const gameObjectsSheet = images.get(ImageName.GameObjects);
        this.explosionSprites = Enemy.generateExplosionSprites(gameObjectsSheet);
    }

    generateSprites() {
        const spriteSheet = images.get(ImageName.Badniks);
        
        return [
            new Sprite(spriteSheet, 157, 259, 40, 32),  // Frame 1
            new Sprite(spriteSheet, 157, 299, 40, 32),  // Frame 2
            new Sprite(spriteSheet, 213, 259, 40, 32),  // Frame 3
            new Sprite(spriteSheet, 213, 299, 40, 32)   // Frame 4
        ];
    }

    render(context) {
        if (!this.isActive && this.explosionComplete) return;

        // Render explosion
        if (this.isDying && this.explosionSprites) {
            const currentFrame = this.explosionAnimation.getCurrentFrame();
            this.explosionSprites[currentFrame].render(
                Math.floor(this.position.x),
                Math.floor(this.position.y)
            );
            return;
        }

        // Render normal sprite with flipping
        if (this.animation && this.sprites.length > 0) {
            const currentFrame = this.animation.getCurrentFrame();
            
            context.save();
            
            // Flip sprite when moving right
            if (this.movingRight) {
                context.scale(-1, 1);
                this.sprites[currentFrame].render(
                    -Math.floor(this.position.x) - this.dimensions.x,
                    Math.floor(this.position.y)
                );
            } else {
                this.sprites[currentFrame].render(
                    Math.floor(this.position.x),
                    Math.floor(this.position.y)
                );
            }
            
            context.restore();
        }
    }
}