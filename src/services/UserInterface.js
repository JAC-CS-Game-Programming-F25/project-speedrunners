import { HUDSpriteConfig } from "../../config/SpriteConfig.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, context, images } from "../globals.js";

export default class UserInterface {
    static SCALE = 1.5
    constructor(player, ringManager) {
        this.player = player;
        this.ringManager = ringManager;

        // Create sprites from config
        this.ringAnimation = new Animation(HUDSpriteConfig.rings.map(frame => 
            new Sprite(images.get(ImageName.Hud), frame.x, frame.y, frame.width, frame.height)
        ))

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
        this.ringAnimation.update(dt);
    }

    render() {
        context.save();
		context.imageSmoothingEnabled = false;
        const scale = UserInterface.SCALE;

        // Top left side of the screen
        const topLeftX = 20;

        // We are going to continously change this for each label
        let currentY = 15;

        // Score
        this.scoreSprite.render(topLeftX, currentY, { x: scale, y: scale });
        currentY += 20 * scale;

        // Time
        this.timeSprite.render(topLeftX, currentY, { x: scale, y: scale });
        currentY += 20 * scale;

        // Rings
        this.ringAnimation.getCurrentFrame().render(topLeftX, currentY, { x: scale, y: scale });

        // Lives on the bottom left
        const bottomLeftX = 20;
        const bottomLeftY = CANVAS_HEIGHT - 30 * scale;
        this.livesSprite.render(bottomLeftX, bottomLeftY, { x: scale, y: scale });


        context.restore();
    }
}