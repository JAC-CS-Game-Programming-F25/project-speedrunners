import { titleCardSprites } from "../../config/SpriteConfig.js";
import Easing from "../../lib/Easing.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, images, sounds, stateMachine, timer } from "../globals.js";
import Scene from "../services/Scene.js";
import PlayState from "./PlayState.js";

/**
 * Represents the state the game is in right before we start playing.
 * It will fade in, display the zone name and act name, then fade out into the level (playstate)
 */
export default class TitleTransitionState extends State {
    static SCALE = 1.5; 
    constructor(mapDefinition) {
        super();

        this.mapDefinition = mapDefinition

        this.transitionAlpha = 0;

        this.titleCardSprite = new Sprite(
            images.get(ImageName.TitleCard), 
            titleCardSprites[0].x,
            titleCardSprites[0].y,
            titleCardSprites[0].width,
            titleCardSprites[0].height
        );

        // X position of the sprite; start offscreen from the left side.
        this.spriteX = -this.titleCardSprite.width * TitleTransitionState.SCALE;

        // Y position of the sprite
        this.spriteY = 100;
    }

    enter(params) {
        this.runTransition();
        sounds.play(SoundName.GreenHill)
    }

    async runTransition() {
        // Fade in to black
        await timer.tweenAsync(this, { transitionAlpha: 1 }, 1, Easing.easeInOutQuad);

        // Tween the text to the center
        await timer.tweenAsync(
            this,
            { spriteX: (CANVAS_WIDTH - this.titleCardSprite.width * TitleTransitionState.SCALE) / 2 },
            0.5,
            Easing.easeOutQuad
        );

        // Pause so player can read the card
        await timer.wait(3);

        // Slide sprite offscreen to the right
        await timer.tweenAsync(
            this,
            { spriteX: CANVAS_WIDTH + this.titleCardSprite.width * TitleTransitionState.SCALE },
            0.5,
            Easing.easeInQuad
        );

        // switch to PlayState
        stateMachine.change(GameStateName.Play, { mapDefinition: this.mapDefinition });
    }
	update(dt) {
		timer.update(dt);
	}

	render() {
        context.save();
        context.imageSmoothingEnabled = false;
        // Draw black 
        context.fillStyle = `rgba(0,0,0,${this.transitionAlpha})`;
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw the title card sprite at its current position with the scale
        this.titleCardSprite.render(this.spriteX, this.spriteY, {
            x: TitleTransitionState.SCALE,
            y: TitleTransitionState.SCALE
        });

        context.restore(); 
	}

}
