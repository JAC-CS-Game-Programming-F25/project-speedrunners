import Animation from '../../lib/Animation.js';
import { images } from '../globals.js';
import { ImageName } from '../enums/ImageName.js';
import { loadSignPostSprites, signPostSpriteConfig } from '../../config/SpriteConfig.js';
import Entity from '../entities/Entity.js';

export default class SignPost extends Entity {
    constructor(x, y) {
        super(x, y, 48, 48);
        
        this.isActive = true;
        this.isActivated = false;
        this.animationFinished = false;
        
        // Spin settings
        this.spinCount = 0;
        this.maxSpins = 3; // Number of times to spin before stopping
        
        // Load sprites
        const sprites = loadSignPostSprites(
            images.get(ImageName.GameObjects),
            signPostSpriteConfig
        );
        
        this.idleSprite = sprites.idle[0];
        this.spinningFrames = sprites.spinning;
        
        // Create animations
        this.animations = {
            idle: new Animation(sprites.idle),
            spinning: new Animation(sprites.spinning, 0.1)
        };
        
        this.currentAnimation = this.animations.idle;
        
        // Frame widths for centering calculation
        this.frameWidths = [32, 8, 32, 48]; // frame2, frame3, frame4, frame5
    }
    
    update(dt) {
        if (!this.isActive) return;
        
        if (this.isActivated && !this.animationFinished) {
            const previousFrame = this.currentAnimation.currentFrame;
            this.currentAnimation.update(dt);
            
            // Check if animation looped (went from last frame back to first)
            if (previousFrame === 3 && this.currentAnimation.currentFrame === 0) {
                this.spinCount++;
                console.log(`Spin ${this.spinCount}/${this.maxSpins} complete`);
                
                // Stop on last frame after completing all spins
                if (this.spinCount >= this.maxSpins) {
                    this.currentAnimation.currentFrame = 3;
                    this.animationFinished = true;
                    console.log("Sign post animation finished!");
                }
            }
        }
    }
    
    activate() {
        if (this.isActivated) return;
        
        this.isActivated = true;
        this.animationFinished = false;
        this.spinCount = 0;
        this.currentAnimation = this.animations.spinning;
        this.currentAnimation.refresh();
        console.log("Sign post activated!");
    }
    
    render(context) {
        if (!this.isActive) return;
        
        const frame = this.currentAnimation.getCurrentFrame();
        const frameIndex = this.currentAnimation.currentFrame;
        
        context.save();
        context.translate(this.position.x, this.position.y);
        
        if (this.isActivated) {
            // Calculate horizontal offset to center the frame
            const frameWidth = this.frameWidths[frameIndex];
            const offsetX = (this.dimensions.x - frameWidth) / 2;
            
            // Frame index 2 is frame4 (flipped version of frame2)
            if (frameIndex === 2) {
                // Flip horizontally around the center
                context.translate(this.dimensions.x / 2, 0);
                context.scale(-1, 1);
                frame.render(-frameWidth / 2, 0);
            } else {
                frame.render(offsetX, 0);
            }
        } else {
            // Idle frame (48px wide, no offset needed)
            frame.render(0, 0);
        }
        
        context.restore();
    }
}