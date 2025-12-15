import Entity from "../entities/Entity.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import { images, sounds } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";
import { objectSpriteConfig } from "../../config/SpriteConfig.js";
import {SoundName} from "../enums/SoundName.js";

export default class Ring extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;
    static RING_VALUE = 1;
    static GRAVITY = 600;
    static BOUNCE_DAMPING = 0.6;
    static COLLECTION_DELAY = 0.5;

    constructor(x, y, isBouncing = false) {
        super(x, y, Ring.WIDTH, Ring.HEIGHT);
        
        this.isCollected = false;
        this.isBouncing = isBouncing;
        this.bounceTimer = 0;
        this.bounceDuration = 5;
        this.groundLevel = 224;
        this.canBeCollected = !isBouncing;
        this.isLostRing = isBouncing; // Track if this was a lost ring
        
        // Create animation for spinning ring effect
        this.animation = new Animation(
            objectSpriteConfig.ring.map(
				(frame) =>
					new Sprite(
						images.get(ImageName.GameObjects),
						frame.x,
						frame.y,
						frame.width,
						frame.height
					)
			), 0.15);

            
    }


    update(dt) {
        if (this.isCollected) return;
        
        this.animation.update(dt);

        // Timer runs for all lost rings, even after they stop bouncing
        if (this.isLostRing) {
            this.bounceTimer += dt;

            // Enable collection after delay
            if (this.bounceTimer >= Ring.COLLECTION_DELAY) {
                this.canBeCollected = true;
            }

            // Disappear after 5 seconds
            if (this.bounceTimer > this.bounceDuration) {
                this.isCollected = true;
                return;
            }
        }

        // Physics only while actively bouncing
        if (this.isBouncing) {
            this.velocity.y += Ring.GRAVITY * dt;

            this.position.x += this.velocity.x * dt;
            this.position.y += this.velocity.y * dt;

            if (this.position.y + this.dimensions.y > this.groundLevel) {
                this.position.y = this.groundLevel - this.dimensions.y;
                this.velocity.y = -Math.abs(this.velocity.y) * Ring.BOUNCE_DAMPING;
                
                this.velocity.x *= 0.9;
                
                if (Math.abs(this.velocity.y) < 30) {
                    this.isBouncing = false; // Stop physics, but timer keeps running
                    this.velocity.y = 0;
                    this.velocity.x = 0;
                }
            }
        }
    }

    render(context) {
        if (this.isCollected) return;

        context.save()
        
        // Fade effect in last second for lost rings
        if (this.isLostRing && this.bounceTimer > this.bounceDuration * 0.8) {
            const fadeAmount = 1 - ((this.bounceTimer - this.bounceDuration * 0.8) / (this.bounceDuration * 0.2));
            context.globalAlpha = Math.max(0, fadeAmount);
        }
        
        context.translate(
            Math.floor(this.position.x),
            Math.floor(this.position.y)
        );

        const frame = this.animation.getCurrentFrame();
        const offsetX = Math.floor((this.dimensions.x - frame.width) / 2);
        const offsetY = this.dimensions.y - frame.height; 
        frame.render(offsetX, offsetY);

        context.globalAlpha = 1.0;

        context.restore()
    }

    collect() {
        if (!this.isCollected && this.canBeCollected) {
            this.isCollected = true;
            sounds.play(SoundName.Ring);
            return Ring.RING_VALUE;
        }
        return 0;
    }

    initializeAsLostRing(sourceX, sourceY, groundLevel = null) {
    this.isBouncing = true;
    this.isLostRing = true;
    this.bounceTimer = 0;
    this.canBeCollected = false;
    
    this.position.x = sourceX;
    this.position.y = sourceY;
    
    // Use passed ground level, or default to below the source position
    this.groundLevel = groundLevel || (sourceY + 50);
    
    const angle = (Math.random() * 120 + 30) * (Math.PI / 180); 
    const speed = 150 + Math.random() * 100;
    
    this.velocity.x = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
    this.velocity.y = -Math.abs(Math.sin(angle)) * speed;
}
}