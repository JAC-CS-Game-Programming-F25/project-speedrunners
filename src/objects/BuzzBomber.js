import Enemy from "./Enemy.js";
import Animation from "../../lib/Animation.js";
import { images } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";
import { enemySpriteConfig, loadEnemySprites } from "../../../config/SpriteConfig.js";

/**
 * BuzzBomber enemy - ground crab enemy (4 frames)
 */
export default class BuzzBomber extends Enemy {
    static WIDTH = 40;
    static HEIGHT = 32;

    constructor(x, y) {
        super(x, y, BuzzBomber.WIDTH, BuzzBomber.HEIGHT);
        
        // Generate sprites from config
        const spriteSheet = images.get(ImageName.Badniks);
        this.sprites = loadEnemySprites(spriteSheet, enemySpriteConfig.BuzzBomber);
        
        this.animation = new Animation([0, 1, 2, 3], 0.15); // 4 frames, 0.15s each
        
        // Movement (ground enemy, slower)
        this.moveSpeed = 40;
        this.patrolDistance = 60;
        
        // Get explosion sprites from game objects sprite sheet
        const gameObjectsSheet = images.get(ImageName.GameObjects);
        this.explosionSprites = Enemy.generateExplosionSprites(gameObjectsSheet);
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