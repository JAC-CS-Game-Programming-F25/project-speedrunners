import { titleSpriteConfig } from "../../config/SpriteConfig.js";
import Animation from "../../lib/Animation.js";
import Input from "../../lib/Input.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, images, input, stateMachine, timer } from "../globals.js";
import Scene from "../services/Scene.js";
import PlayState from "./PlayState.js";

export default class TitleScreenState extends State {
	static SONIC_SCALE = 1.5
	static SONIC_MAX_HEIGHT = 150 * this.SONIC_SCALE
	constructor(mapDefinition) {
		super();
		
		// Initialize delay properties
		this.canStart = false;
		this.enterDelay = 0.3;
		this.delayTimer = 0;
		
		// Create animation for sonic
		this.sonicSprites = titleSpriteConfig.sonic.map(
				(frame) =>
					new Sprite(
						images.get(ImageName.TitleScreen),
						frame.x,
						frame.y,
						frame.width,
						frame.height
					)
		)

		this.pressStartSprite = new Sprite(
			images.get(ImageName.TitleScreen), 
			titleSpriteConfig.pressstart[0].x,
			titleSpriteConfig.pressstart[0].y,
			titleSpriteConfig.pressstart[0].width,
			titleSpriteConfig.pressstart[0].height
		);

		// Intro animation
		this.sonicIntro = new Animation(this.sonicSprites.slice(0, -2), 0.05, 1);

		// Finger loop animation, taking the last two frames
		this.sonicLoop = new Animation(this.sonicSprites.slice(-2), 0.2);

		this.currentSonicAnimation = this.sonicIntro;

		this.pressStartAlpha = 1;
		this.flickerInterval = 0.5; // seconds between flicker
		timer.addTask(
			() => {
				this.pressStartAlpha = this.pressStartAlpha === 1 ? 0 : 1;
			},
			this.flickerInterval
		);

		const bgHeight = images.get(ImageName.TitleScreenTopBG).height;

		// total height of both stacked backgrounds
		const totalOriginalHeight = bgHeight * 2;

		// scale so they perfectly fill the canvas height
		const scale = CANVAS_HEIGHT / totalOriginalHeight;

		// create the bgs.
		// We need to scale them because our canvas is 480 x 352, but the background for the title screen is made for 320 x 224.
		this.sceneTop = new Scene(
			ImageName.TitleScreenTopBG,
			0,
			scale
		);

		this.sceneBottom = new Scene(
			ImageName.TitleScreenBottomBG,
			bgHeight * scale,
			scale
		);
		
	}

	enter(){
		// Reset delay on every enter
		this.canStart = false;
		this.delayTimer = 0;
		
		// Reset animations
		this.sonicIntro.refresh();
		this.currentSonicAnimation = this.sonicIntro;
		
		//start playing the soundtrack
	}

	exit(){
		//stop playing the soundtrack
		//enter playstate
	}

	update(dt){
		this.sceneTop.update(dt);
		this.sceneBottom.update(dt);
		this.currentSonicAnimation.update(dt);
		if (this.currentSonicAnimation === this.sonicIntro && this.sonicIntro.isDone()) {
			this.currentSonicAnimation = this.sonicLoop;
		}
		
		// Wait for delay before accepting input
		if (!this.canStart) {
			this.delayTimer += dt;
			if (this.delayTimer >= this.enterDelay) {
				this.canStart = true;
			}
			return;
		}
		
		if (input.isKeyPressed(Input.KEYS.ENTER) && this.currentSonicAnimation === this.sonicLoop) {
			stateMachine.change(GameStateName.Play, { scene: this.sceneTop });
		}
	}
	
	render(){
		context.imageSmoothingEnabled = false;
		this.sceneTop.render();
		this.sceneBottom.render();
		// enable for when we render sonic since it looks bad for sonic
		context.imageSmoothingEnabled = true;
		context.save();
		
		this.renderSonicAnimation();

		context.restore();
	}

	renderSonicAnimation() {
		const sonicSprite = this.currentSonicAnimation.getCurrentFrame();

		// scale him
		const scaledWidth = sonicSprite.width * TitleScreenState.SONIC_SCALE;
		const scaledHeight = sonicSprite.height * TitleScreenState.SONIC_SCALE;

		// Center the animation using the max height so the sprites dont move up and down (some are different heights)
		const x = (CANVAS_WIDTH - scaledWidth) / 2;
		const y = (CANVAS_HEIGHT - TitleScreenState.SONIC_MAX_HEIGHT) / 2 + (TitleScreenState.SONIC_MAX_HEIGHT - scaledHeight);

		sonicSprite.render(x, y, { x: TitleScreenState.SONIC_SCALE, y: TitleScreenState.SONIC_SCALE});
		context.imageSmoothingEnabled = false;
		const pressX = (CANVAS_WIDTH - this.pressStartSprite.width * TitleScreenState.SONIC_SCALE) / 2;
		const pressY = y + scaledHeight;
		if (this.currentSonicAnimation === this.sonicLoop) {
			context.save();
			context.globalAlpha = this.pressStartAlpha;
			this.pressStartSprite.render(pressX, pressY, { x: TitleScreenState.SONIC_SCALE, y: TitleScreenState.SONIC_SCALE });
			context.restore();
		}
	}
}