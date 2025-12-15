import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, context, input, stateMachine, images, timer, sounds } from "../globals.js";
import GameStateName from "../enums/GameStateName.js";
import ImageName from "../enums/ImageName.js";
import { victorySpriteConfig } from "../../config/SpriteConfig.js";
import SoundName from "../enums/SoundName.js";

export default class VictoryState extends State {
    constructor() {
        super();
        this.transitionTimer = 0;
        this.transitionDelay = 10;
        this.canSkip = false;
        this.hudImage = null;
        this.map = null;
        
        // Tween properties
        this.tweenProgress = 0;
        this.tweenDuration = 1.5;
        this.startY = -250;
        this.endY = 0;
        
        // Score tallying properties
        this.displayScore = 0;
        this.timeBonus = 0;
        this.ringBonus = 0;
        this.isTallying = false;
        this.tallySpeed = 100; // Points to add per tick
        this.tallyInterval = 0.02; // Seconds between ticks
        this.tallyTimer = 0;
    }
    
    enter(params) {
        this.score = params.score || 0;
        // Get current high score
        let highScore = parseInt(localStorage.getItem('highScore')) || 0;

        // Update the final score with the new score
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score);
            highScore = this.score;
        }

        this.rings = params.rings || 0;
        this.time = params.time || 0;
        this.transitionTimer = 0;
        this.canSkip = false;
        this.tweenProgress = 0;
        
        // Initialize display values
        this.displayScore = this.score;
        this.timeBonus = this.calculateTimeBonus();
        this.ringBonus = this.rings * 100;
        this.isTallying = false;
        this.tallyTimer = 0;
        
        console.log(`Victory! Score: ${this.score}, Rings: ${this.rings}, Time: ${this.time}`);
        console.log(`Time Bonus: ${this.timeBonus}, Ring Bonus: ${this.ringBonus}`);
        
        if (params && params.map) {
            this.map = params.map;
        }
        
        this.hudImage = images.get(ImageName.Hud);
        
        if (!this.hudImage) {
            console.error("HUD image not loaded!");
            return;
        }

        // Start tallying after tween completes
        timer.addTask(
            () => {},
            this.tweenDuration,
            1,
            () => { 
                this.canSkip = true;
                this.isTallying = true;
                    
                sounds.play(SoundName.ScoreTally);
                this.isTallySoundPlaying = true;
            }
        );
    }

    exit() {
            console.log("VictoryState exit called");
        sounds.stop(SoundName.ScoreTally)
        this.isTallySoundPlaying = false;
    }
    
    update(dt) {
        this.transitionTimer += dt;
        
        // Update tween progress
        if (this.tweenProgress < 1) {
            this.tweenProgress += dt / this.tweenDuration;
            if (this.tweenProgress > 1) {
                this.tweenProgress = 1;
            }
        }
        
        // Tally the bonuses
        if (this.isTallying) {
            this.tallyTimer += dt;
            
            if (this.tallyTimer >= this.tallyInterval) {
                this.tallyTimer = 0;
                
                // Decrease time bonus and add to score
                if (this.timeBonus > 0) {
                    const amount = Math.min(this.tallySpeed, this.timeBonus);
                    this.timeBonus -= amount;
                    this.displayScore += amount;
                }
                // Then decrease ring bonus and add to score
                else if (this.ringBonus > 0) {
                    const amount = Math.min(this.tallySpeed, this.ringBonus);
                    this.ringBonus -= amount;
                    this.displayScore += amount;
                }
                // Tallying complete
                else {
                    this.isTallying = false;
                    if (this.isTallySoundPlaying) {
                        sounds.stop(SoundName.ScoreTally);
                        this.isTallySoundPlaying = false;
                    }

                    sounds.play(SoundName.Tallied);
                }
            }
        }
        
        if (this.map && this.map.backgrounds) {
            const cameraX = this.map.camera.position.x;
            this.map.backgrounds.top.update(dt, cameraX);
            this.map.backgrounds.middle1.update(dt, cameraX);
            this.map.backgrounds.middle2.update(dt, cameraX);
            this.map.backgrounds.bottom.update(dt, cameraX);
        }
        
        if (this.map) {
            this.map.update(dt);
        }
        
        if (this.transitionTimer >= this.transitionDelay) {
            stateMachine.change(GameStateName.TitleScreen);
            return;
        }
        
        // Allow skipping (instant tally) with ENTER
        if (this.canSkip && input.isKeyPressed(Input.KEYS.ENTER)) {
            if (this.isTallying) {
                // Instant complete the tally
                this.displayScore += this.timeBonus + this.ringBonus;
                this.timeBonus = 0;
                this.ringBonus = 0;
                this.isTallying = false;

                if (this.isTallySoundPlaying) {
                    sounds.stop(SoundName.ScoreTally);
                    this.isTallySoundPlaying = false;
                }
                sounds.play(SoundName.Tallied);
            } else {
                stateMachine.change(GameStateName.TitleScreen);
            }
        }
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    render() {
        if (this.map && this.map.backgrounds) {
            context.imageSmoothingEnabled = false;
            this.map.backgrounds.top.render();
            this.map.backgrounds.middle1.render();
            this.map.backgrounds.middle2.render();
            this.map.backgrounds.bottom.render();
        }
        
        if (this.map) {
            this.map.render();
        }
        
        if (!this.hudImage) return;
        
        context.save();
        
        const config = victorySpriteConfig;
        
        const easedProgress = this.easeOutCubic(this.tweenProgress);
        const tweenOffsetY = this.startY + (this.endY - this.startY) * easedProgress;
        
        const bgX = (CANVAS_WIDTH - config.background.width) / 2;
        const bgY = (CANVAS_HEIGHT - config.background.height) / 2 + tweenOffsetY;
        
        // Draw background sprite (SONIC HAS PASSED)
        context.drawImage(
            this.hudImage.image,
            config.background.x, config.background.y,
            config.background.width, config.background.height,
            bgX, bgY,
            config.background.width, config.background.height
        );
        
        // Draw ACT 1 sprite
        context.drawImage(
            this.hudImage.image,
            config.act1.x, config.act1.y,
            config.act1.width, config.act1.height,
            bgX + config.act1.offsetX, bgY + config.act1.offsetY,
            config.act1.width, config.act1.height
        );
        
        // Draw SCORE sprite
        context.drawImage(
            this.hudImage.image,
            config.score.x, config.score.y,
            config.score.width, config.score.height,
            bgX + config.score.offsetX, bgY + config.score.offsetY,
            config.score.width, config.score.height
        );
        
        // Draw TIME sprite
        context.drawImage(
            this.hudImage.image,
            config.time.x, config.time.y,
            config.time.width, config.time.height,
            bgX + config.time.offsetX, bgY + config.time.offsetY,
            config.time.width, config.time.height
        );
        
        // Draw BONUS next to TIME
        context.drawImage(
            this.hudImage.image,
            config.bonus.x, config.bonus.y,
            config.bonus.width, config.bonus.height,
            bgX + config.bonus.offsetX, bgY + config.time.offsetY,
            config.bonus.width, config.bonus.height
        );
        
        // Draw RINGS sprite
        context.drawImage(
            this.hudImage.image,
            config.rings.x, config.rings.y,
            config.rings.width, config.rings.height,
            bgX + config.rings.offsetX, bgY + config.rings.offsetY,
            config.rings.width, config.rings.height
        );
        
        // Draw BONUS next to RINGS
        context.drawImage(
            this.hudImage.image,
            config.bonus.x, config.bonus.y,
            config.bonus.width, config.bonus.height,
            bgX + config.bonus.offsetX, bgY + config.rings.offsetY,
            config.bonus.width, config.bonus.height
        );
        
        // Draw the actual values
        context.fillStyle = '#FFFFFF';
        context.font = '18px hud';

        const valueOffsetX = 200;
        
        // Draw SCORE value (animated)
       this.drawHudText(
    this.displayScore.toString(),
    bgX + valueOffsetX,
    bgY + config.score.offsetY + 12
);
        
        // Draw TIME BONUS value (animated)
        this.drawHudText(
    this.timeBonus.toString(),
    bgX + valueOffsetX,
    bgY + config.time.offsetY + 12
);
        
        // Draw RING BONUS value (animated)
        this.drawHudText(
    this.ringBonus.toString(),
    bgX + valueOffsetX,
    bgY + config.rings.offsetY + 12
);
        
        context.restore();
    }
    
    calculateTimeBonus() {
        const timeInSeconds = this.time || 0;
        
        if (timeInSeconds < 30) return 5000;
        if (timeInSeconds < 45) return 1000;
        if (timeInSeconds < 60) return 500;
        if (timeInSeconds < 90) return 400;
        if (timeInSeconds < 120) return 300;
        if (timeInSeconds < 180) return 200;
        if (timeInSeconds < 240) return 100;
        if (timeInSeconds < 300) return 50;
        return 0;
    }

    drawHudText(text, x, y) {
    context.lineWidth = 1.5;
    context.strokeStyle = "#0f0a57";
    context.fillStyle = "#ededf0";
    context.strokeText(text, x, y);
    context.fillText(text, x, y);
}
}