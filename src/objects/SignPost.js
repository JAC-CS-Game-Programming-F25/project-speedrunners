import Animation from '../../lib/Animation.js';
import { images, sounds, stateMachine } from '../globals.js';
import { ImageName } from '../enums/ImageName.js';
import { loadSignPostSprites, signPostSpriteConfig } from '../../config/SpriteConfig.js';
import Entity from '../entities/Entity.js';
import GameStateName from '../enums/GameStateName.js';
import PlayerStateName from '../enums/PlayerStateName.js';
import SoundName from '../enums/SoundName.js';

export default class SignPost extends Entity {
    constructor(x, y) {
        super(x, y, 48, 48);
        
        this.isActive = true;
        this.isActivated = false;
        this.animationFinished = false;
        
        this.spinCount = 0;
        this.maxSpins = 3;
        
        this.player = null; // Will be set when activated
        
        const sprites = loadSignPostSprites(
            images.get(ImageName.GameObjects),
            signPostSpriteConfig
        );
        
        this.idleSprite = sprites.idle[0];
        this.spinningFrames = sprites.spinning;
        
        this.animations = {
            idle: new Animation(sprites.idle),
            spinning: new Animation(sprites.spinning, 0.1)
        };
        
        this.currentAnimation = this.animations.idle;
        this.frameWidths = [32, 8, 32, 48];
    }
    
    update(dt) {
    if (!this.isActive) return;
    
    if (this.isActivated && !this.animationFinished) {
        const previousFrame = this.currentAnimation.currentFrame;
        this.currentAnimation.update(dt);
        
        if (previousFrame === 3 && this.currentAnimation.currentFrame === 0) {
            this.spinCount++;
           // console.log(`Spin ${this.spinCount}/${this.maxSpins} complete`);
            
            if (this.spinCount >= this.maxSpins) {
                this.currentAnimation.currentFrame = 3;
                this.animationFinished = true;
               // console.log("Sign post animation finished!");
                
                // Pass the map to VictoryState
                setTimeout(() => {
                    const finalScore = this.player.map.scoreManager.getScore();
                    const finalRings = this.player.ringManager.getRingCount();
                    const finalTime = this.player.map.time;
                    stateMachine.change(GameStateName.Victory, { 
                        map: this.player.map,
                        score: finalScore,
                        rings: finalRings,
                        time: finalTime
                    });
                }, 500);
            }
        }
    }
}
    
    activate(player) {
        if (this.isActivated) return;
        
        this.isActivated = true;
        sounds.play(SoundName.SignSpin)
        this.animationFinished = false;
        this.spinCount = 0;
        this.player = player;
        this.currentAnimation = this.animations.spinning;
        this.currentAnimation.refresh();
        if (player) {
            const finalScore = this.player.map.scoreManager.getScore();
            const finalRings = this.player.ringManager.getRingCount();
            const finalTime = this.player.map.time;
            player.stateMachine.change(PlayerStateName.Victory, {
                score: finalScore,
                rings: finalRings,
                time: finalTime
            });
        }
        
       // console.log("Sign post activated!");
    }
    
    render(context) {
        if (!this.isActive) return;
        
        const frame = this.currentAnimation.getCurrentFrame();
        const frameIndex = this.currentAnimation.currentFrame;
        
        context.save();
        context.translate(this.position.x, this.position.y);
        
        if (this.isActivated) {
            const frameWidth = this.frameWidths[frameIndex];
            const offsetX = (this.dimensions.x - frameWidth) / 2;
            
            if (frameIndex === 2) {
                context.translate(this.dimensions.x / 2, 0);
                context.scale(-1, 1);
                frame.render(-frameWidth / 2, 0);
            } else {
                frame.render(offsetX, 0);
            }
        } else {
            frame.render(0, 0);
        }
        
        context.restore();
    }
}