import Animation from "../../../lib/Animation.js";
import Sprite from "../../../lib/Sprite.js";
import { images } from "../../globals.js";
import { ImageName } from "../../enums/ImageName.js";
import { objectSpriteConfig } from "../../../config/SpriteConfig.js";

export default class InvincibilitySparkles {
    constructor(maxTrailLength = 5) {
        this.animation = new Animation(
            objectSpriteConfig.invincibilitySparkles.map(
                (frame) =>
                    new Sprite(
                        images.get(ImageName.GameObjects),
                        frame.x,
                        frame.y,
                        frame.width,
                        frame.height
                    )
            ), 0.15
        );
            
        // Trails for invincibility since there are "after frames"
        this.trail = []; 
        this.maxTrailLength = maxTrailLength;
        // Time between each trail
        this.trailSpacing = 0.05; 
        this.trailTimer = 0;
    }
    
    update(dt, playerX, playerY, playerWidth, playerHeight) {
        this.animation.update(dt);

        
        // Update trail timer
        this.trailTimer += dt;
        // Every spacing, push a new frame of the invincibility on the players position and dimensions
        if (this.trailTimer >= this.trailSpacing) {
            this.trailTimer = 0;
            this.trail.push({
                x: playerX,
                y: playerY,
                width: playerWidth,
                height: playerHeight,
                frame: this.animation.getCurrentFrame()
            });

            // Keep only the last trail frames
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }
    }
    
    render(context, playerX, playerY, playerWidth, playerHeight) {
        // Render trail from oldest to newest
        this.trail.forEach((t, i) => {
            context.save();
            const alpha = (i + 1) / this.trail.length * 0.6; // fade out older trails
            context.globalAlpha = alpha;
            t.frame.render(t.x, t.y);
            context.restore();
        });
    }
}