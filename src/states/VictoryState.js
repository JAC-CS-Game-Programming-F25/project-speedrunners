import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, context, input, stateMachine, images, timer } from "../globals.js";
import GameStateName from "../enums/GameStateName.js";
import ImageName from "../enums/ImageName.js";
import { victorySpriteConfig } from "../../config/SpriteConfig.js";

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
        this.tweenDuration = 1.5; // seconds to tween in
        this.startY = -250; // Start above the screen
        this.endY = 0; // End at center
    }
    
    enter(params) {
        this.score = params.score;
        // Get current high score
        let highScore = parseInt(localStorage.getItem('highScore')) || 0;

        // Update the final score with the new score
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score);
            highScore = this.score;
        }
        console.log("My score:" + this.score)
        console.log("Highscore:" + highScore)

        this.rings = params.rings;
        this.time = params.time;
        this.transitionTimer = 0;
        this.canSkip = false;
        this.tweenProgress = 0;
        
        // Get the map from params so we can render it
        if (params && params.map) {
            this.map = params.map;
        }
        
        // Get the HUD image
        this.hudImage = images.get(ImageName.Hud);
        
        if (!this.hudImage) {
            console.error("HUD image not loaded!");
            return;
        }
        
        // Allow skipping after tween completes
        timer.addTask(
            () => {},
            this.tweenDuration,
            1,
            () => { this.canSkip = true; }
        );
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
        
        if (this.map && this.map.backgrounds) {
            const cameraX = this.map.camera.position.x;
            this.map.backgrounds.top.update(dt, cameraX);
            this.map.backgrounds.middle1.update(dt, cameraX);
            this.map.backgrounds.middle2.update(dt, cameraX);
            this.map.backgrounds.bottom.update(dt, cameraX);
        }
        
        // Keep updating the map so animations continue
        if (this.map) {
            this.map.update(dt);
        }
        
        if (this.transitionTimer >= this.transitionDelay) {
            stateMachine.change(GameStateName.TitleScreen);
            return;
        }
        
        if (this.canSkip && input.isKeyPressed(Input.KEYS.ENTER)) {
            stateMachine.change(GameStateName.TitleScreen);
        }
    }
    
    // Easing function for smooth animation (ease out cubic)
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
        
        // Render the game 
        if (this.map) {
            this.map.render();
        }
        
        if (!this.hudImage) return;
        
        context.save();
        
        const config = victorySpriteConfig;
        
        // Calculate tween offset
        const easedProgress = this.easeOutCubic(this.tweenProgress);
        const tweenOffsetY = this.startY + (this.endY - this.startY) * easedProgress;
        
        // Calculate position to center the background sprite
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
        
        // Draw RINGS sprite
        context.drawImage(
            this.hudImage.image,
            config.rings.x, config.rings.y,
            config.rings.width, config.rings.height,
            bgX + config.rings.offsetX, bgY + config.rings.offsetY,
            config.rings.width, config.rings.height
        );
        
        context.restore();
    }
}