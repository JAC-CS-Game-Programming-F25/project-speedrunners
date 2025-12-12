import Entity from "../entities/Entity.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";

export default class Ring extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;
    static RING_VALUE = 1;
    static GRAVITY = 600;
    static BOUNCE_DAMPING = 0.6;

    /**
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @param {boolean} isBouncing - If true, ring is lost from player and bouncing
     */
    constructor(x, y, isBouncing = false) {
        super(x, y, Ring.WIDTH, Ring.HEIGHT);
        
        this.sprites = Ring.generateSprites();
        this.isCollected = false;
        this.isBouncing = isBouncing;
        this.bounceTimer = 0;
        this.bounceDuration = 2.5;
        this.groundLevel = 224; 
        
        // Create animation for spinning ring effect
        this.animation = new Animation([0, 1, 2, 3], 0.15);
    }

    static generateSprites() {
        const spriteSheet = images.get(ImageName.GameObjects);
        const sprites = [];
        
       const ringFrames = [
            { x: 8, y: 182, width: 16, height: 16 },   // Frame 1
            { x: 32, y: 182, width: 16, height: 16 },  // Frame 2
            { x: 56.197, y: 182, width: 7, height: 16 },  // Frame 3
            { x: 72, y: 182, width: 16, height: 16 }   // Frame 4
        ];

        ringFrames.forEach(frame => {
            sprites.push(new Sprite(
                spriteSheet,
                frame.x,
                frame.y,
                frame.width,
                frame.height
            ));
        });

        return sprites;
    }

    update(dt) {
        if (this.isCollected) return;
        
        // Update animation
        this.animation.update(dt);

        if (this.isBouncing) {
            this.bounceTimer += dt;

            this.velocity.y += Ring.GRAVITY * dt;

            this.position.x += this.velocity.x * dt;
            this.position.y += this.velocity.y * dt;

            if (this.position.y + this.dimensions.y > this.groundLevel) {
                this.position.y = this.groundLevel - this.dimensions.y;
                this.velocity.y = -Math.abs(this.velocity.y) * Ring.BOUNCE_DAMPING;
                
                this.velocity.x *= 0.9;
                
                if (Math.abs(this.velocity.y) < 30) {
                    this.velocity.y = 0;
                    this.velocity.x *= 0.85;
                }
            }

            if (this.bounceTimer > this.bounceDuration) {
                this.isCollected = true;
            }
        }
    }

    render(context) {
        if (this.isCollected) return;
        
        const currentFrame = this.animation.getCurrentFrame();
        const sprite = this.sprites[currentFrame];
        
        if (this.isBouncing && this.bounceTimer > this.bounceDuration * 0.8) {
            const fadeAmount = 1 - ((this.bounceTimer - this.bounceDuration * 0.8) / (this.bounceDuration * 0.2));
            context.globalAlpha = Math.max(0, fadeAmount);
        }
        
        sprite.render(
            Math.floor(this.position.x),
            Math.floor(this.position.y)
        );

        context.globalAlpha = 1.0;
    }

    collect() {
        if (!this.isCollected && !this.isBouncing) {
            this.isCollected = true;
            return Ring.RING_VALUE;
        }
        return 0;
    }

    /**
     * Initialize ring as a lost ring with scatter velocity
     * @param {number} sourceX - X position of player (where rings scatter from)
     * @param {number} sourceY - Y position of player
     */
    initializeAsLostRing(sourceX, sourceY) {
        this.isBouncing = true;
        this.bounceTimer = 0;
        
        this.position.x = sourceX;
        this.position.y = sourceY;
        
        const angle = (Math.random() * 120 + 30) * (Math.PI / 180); 
        const speed = 150 + Math.random() * 100;
        
        this.velocity.x = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
        this.velocity.y = -Math.abs(Math.sin(angle)) * speed;
    }
}