import Entity from "../entities/Entity.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";

/**
 * Base class for all enemies
 */
export default class Enemy extends Entity {
    static EXPLOSION_DURATION = 0.15; // 0.15s per frame
    static DEFAULT_SPEED = 50; // Default movement speed
    
    constructor(x, y, width, height) {
        super(x, y, width, height);
        
        this.isActive = true;
        this.isDying = false;
        this.explosionTimer = 0;
        this.explosionComplete = false;
        
        // Movement
        this.moveSpeed = Enemy.DEFAULT_SPEED;
        this.movingRight = true; // Start moving right
        this.patrolDistance = 80; // Distance to move before turning
        this.startX = x; // Remember starting position
        
        // Animation
        this.animation = null;
        this.sprites = [];
        
        // Explosion sprites (shared across all enemies)
        this.explosionSprites = null;
        this.explosionAnimation = null;
    }

    /**
     * Generate explosion sprites (same as powerup box)
     * @param {Image} spriteSheet 
     * @returns {Array<Sprite>}
     */
    static generateExplosionSprites(spriteSheet) {
        return [
            new Sprite(spriteSheet, 40, 662, 32, 32),  // Frame 1
            new Sprite(spriteSheet, 80, 662, 32, 32)   // Frame 2
        ];
    }

    /**
     * Called when enemy takes damage (jumped on)
     */
    die() {
        if (this.isDying) return;
        
        this.isDying = true;
        this.explosionTimer = 0;
        this.explosionAnimation = new Animation([0, 1], Enemy.EXPLOSION_DURATION);
    }

    update(dt) {
        if (this.explosionComplete) {
            this.isActive = false;
            return;
        }

        if (this.isDying) {
            this.explosionTimer += dt;
            if (this.explosionAnimation) {
                this.explosionAnimation.update(dt);
            }
            
            if (this.explosionTimer >= Enemy.EXPLOSION_DURATION * 2) {
                this.explosionComplete = true;
                this.isActive = false;
            }
            return;
        }

        // Movement logic
        this.updateMovement(dt);

        // Update normal animation
        if (this.animation) {
            this.animation.update(dt);
        }
    }

    /**
     * Update enemy movement (patrol left and right)
     * @param {number} dt - Delta time
     */
    updateMovement(dt) {
        // Calculate distance from start position
        const distanceFromStart = Math.abs(this.position.x - this.startX);
        
        // Reverse direction if moved too far
        if (distanceFromStart >= this.patrolDistance) {
            this.movingRight = !this.movingRight;
        }
        
        // Store old position for collision checking
        const oldX = this.position.x;
        
        // Move in current direction
        if (this.movingRight) {
            this.position.x += this.moveSpeed * dt;
        } else {
            this.position.x -= this.moveSpeed * dt;
        }
        
        // Check for collisions with solid objects and reverse if needed
        if (this.checkSolidCollisions()) {
            // Hit something solid, reverse direction
            this.position.x = oldX; // Reset position
            this.movingRight = !this.movingRight; // Reverse direction
        }
    }
    
    /**
     * Check if enemy is colliding with solid objects (spikes, boxes)
     * @returns {boolean} True if colliding with solid object
     */
    checkSolidCollisions() {
        // This will be called by subclasses if they have access to managers
        // For now, return false (subclasses can override or we check in manager)
        return false;
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

        // Render normal sprite
        if (this.animation && this.sprites.length > 0) {
            const currentFrame = this.animation.getCurrentFrame();
            this.sprites[currentFrame].render(
                Math.floor(this.position.x),
                Math.floor(this.position.y)
            );
        }
    }
}