import { objectSpriteConfig } from "../../config/SpriteConfig.js";
import Animation from "../../lib/Animation.js";
import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, images, input, stateMachine, timer } from "../globals.js";

/**
 * Displays the game over screen along with the final score.
 */
export default class GameOverState extends State {
	static SCALE = 1
	constructor() {
		super();


		this.score = 0;
		this.canSkip = false;
		this.map = null;
		this.transitionTimer = 0;
		this.transitionDelay = 10; // Auto-transition after 10 seconds
		this.tweenY = { value: -200 }; // Start above the screen, we will go to the center
		

		// Create the game over sprite
		this.gameOverSprite = new Sprite(
			images.get(ImageName.GameObjects), 
			objectSpriteConfig.gameover[0].x,
			objectSpriteConfig.gameover[0].y,
			objectSpriteConfig.gameover[0].width,
			objectSpriteConfig.gameover[0].height
		);
	}

	enter(parameters) {
		if (parameters) {
			// Get the final score
			this.score = parameters.score || 0;
			
			// Get the map from params so we can render it
			if (parameters.map) {
				this.map = parameters.map;
			}
		}
		
		// Reset tween position
		this.tweenY.value = -200;
		this.canSkip = false;
		this.transitionTimer = 0;

		const spriteHeight = objectSpriteConfig.gameover[0].height * GameOverState.SCALE;
		const centerY = (CANVAS_HEIGHT - spriteHeight) / 2;

		// Tween the Y position to the center
		timer.tween(
			this.tweenY,
			{ value: centerY },
			1.0, // 1 second duration
			Easing.easeInOutBack,
			() => { this.canSkip = true; } // Enable skipping when tween completes
		);
	}

	update(dt) {
		this.transitionTimer += dt;
		
		// Update backgrounds 
		if (this.map && this.map.backgrounds) {
			const cameraX = this.map.camera.position.x;
			this.map.backgrounds.top.update(dt, cameraX);
			this.map.backgrounds.middle1.update(dt, cameraX);
			this.map.backgrounds.middle2.update(dt, cameraX);
			this.map.backgrounds.bottom.update(dt, cameraX);
		}
		
		// Keep updating the map 
		if (this.map) {
			this.map.update(dt);
		}
		
		// Auto-transition after delay
		if (this.transitionTimer >= this.transitionDelay) {
			stateMachine.change(GameStateName.TitleScreen);
			return;
		}
		
		// skip with enter
		if (this.canSkip && input.isKeyPressed(Input.KEYS.ENTER)) {
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render() {
		// Render backgrounds
		if (this.map && this.map.backgrounds) {
			context.imageSmoothingEnabled = false;
			this.map.backgrounds.top.render();
			this.map.backgrounds.middle1.render();
			this.map.backgrounds.middle2.render();
			this.map.backgrounds.bottom.render();
		}
		
		// Render the game/map
		if (this.map) {
			this.map.render();
		}
		context.save();
		context.imageSmoothingEnabled = false;
		
		const scale = GameOverState.SCALE;
		
		// Calculate X position to center horizontally
		const spriteWidth = this.gameOverSprite.width * scale;
		const x = (CANVAS_WIDTH - spriteWidth) / 2;
		
		// Y position comes directly from tween
		const y = this.tweenY.value;
		
		// Render the game over sprite
		this.gameOverSprite.render(x, y, { x: scale, y: scale });
		
		context.restore();
	}
}
