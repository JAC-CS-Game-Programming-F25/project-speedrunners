import { HUDSpriteConfig } from "../../config/SpriteConfig.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, context, images } from "../globals.js";

export default class UserInterface {
    static SCALE = 1.5
    constructor(player, ringManager, scoreManager, time) {
        this.player = player;
        this.ringManager = ringManager;
        this.scoreManager = scoreManager,
        this.time = time

        // Create sprites from config
        this.ringAnimation = new Animation(HUDSpriteConfig.rings.map(frame => 
            new Sprite(images.get(ImageName.Hud), frame.x, frame.y, frame.width, frame.height)
        ), 0.2)

        this.timeSprite = new Sprite(
            images.get(ImageName.Hud), 
            HUDSpriteConfig.time[0].x,
            HUDSpriteConfig.time[0].y,
            HUDSpriteConfig.time[0].width,
            HUDSpriteConfig.time[0].height
        );

        this.scoreSprite = new Sprite(
            images.get(ImageName.Hud), 
            HUDSpriteConfig.score[0].x,
            HUDSpriteConfig.score[0].y,
            HUDSpriteConfig.score[0].width,
            HUDSpriteConfig.score[0].height
        );

        this.livesSprite = new Sprite(
            images.get(ImageName.Hud), 
            HUDSpriteConfig.lives[0].x,
            HUDSpriteConfig.lives[0].y,
            HUDSpriteConfig.lives[0].width,
            HUDSpriteConfig.lives[0].height
        );
    }

    update(dt) {
        if (this.ringManager.getRingCount() === 0) {
            this.ringAnimation.update(dt);
        }
    }

    render() {
        context.save();
		context.imageSmoothingEnabled = false;
        const scale = UserInterface.SCALE;

        // HUD font
        context.fillStyle = "#FFFFFF";
        context.textBaseline = "top";
        context.font = `24px hud`;

        // Top left side of the screen
        const topLeftX = 20;

        // We are going to continously change this for each label
        let currentY = 15;

        // Score
        this.scoreSprite.render(topLeftX, currentY, { x: scale, y: scale });
        this.drawHudText(
            this.scoreManager.getScore(),
            topLeftX + 55 * scale,
            currentY,
            scale
        );

        currentY += 20 * scale;

        // Time
        this.timeSprite.render(topLeftX, currentY, { x: scale, y: scale });
        this.drawHudText(
            this.formatTime(this.player.map.time),
            topLeftX + 55 * scale,
            currentY,
            scale
        );

        currentY += 20 * scale;

        // Rings
        this.ringAnimation.getCurrentFrame().render(topLeftX, currentY, { x: scale, y: scale });
        
        const ringCount = this.ringManager.getRingCount();

        if (ringCount === 0) {
            this.ringAnimation.getCurrentFrame().render(topLeftX, currentY, { x: scale, y: scale });
        } else {
            this.ringAnimation.frames[0].render(topLeftX, currentY, { x: scale, y: scale });
        }
            
        this.drawHudText(
            this.ringManager.getRingCount(),
            topLeftX + 55 * scale,
            currentY,
            scale
        );

        // Lives on the bottom left
        const bottomLeftX = 20;
        const bottomLeftY = CANVAS_HEIGHT - 30 * scale;

        this.livesSprite.render(bottomLeftX, bottomLeftY, { x: scale, y: scale });

        // smaller font size for lives
        context.font = `16px hud`

        // Draw number of lives next to the sprite
        this.drawHudText(
            this.player.lives,             // Number of lives
            bottomLeftX + 43 * scale,      // Adjust X to position text next to sprite
            bottomLeftY + 13,                   // Same Y as sprite
            scale
        );

        context.restore();
    }

    drawHudText(text, x, y, scale) {
        context.lineWidth = scale;
        context.strokeStyle = "#0f0a57"; // black-ish outline around the text
        context.fillStyle = "#ededf0";   // white text

        context.strokeText(text, x, y);
        context.fillText(text, x, y);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(1, '0')}:${String(secs).padStart(2, '0')}`;
    }
}