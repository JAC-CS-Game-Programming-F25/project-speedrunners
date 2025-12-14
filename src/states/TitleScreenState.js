import { titleSprites } from "../../config/SpriteConfig.js";
import Animation from "../../lib/Animation.js";
import Input from "../../lib/Input.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, images, input, stateMachine } from "../globals.js";
import Scene from "../services/Scene.js";
import PlayState from "./PlayState.js";

export default class TitleScreenState extends State {
	constructor(mapDefinition) {
		super();

		this.playState = new PlayState(mapDefinition);
		// Create animation for sonic
		this.sonicAnimation = new Animation(
			titleSprites.map(
				(frame) =>
					new Sprite(
						images.get(ImageName.TitleScreen),
						frame.x,
						frame.y,
						frame.width,
						frame.height
					)
			), 0.05, 1);


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
		//start playing the soundtrack
	}

	exit(){
		//stop playing the soundtrack
		//enter playstate
	}

	update(dt){
		this.sceneTop.update(dt);
		this.sceneBottom.update(dt);
		this.sonicAnimation.update(dt);
		if(input.isKeyHeld(Input.KEYS.ENTER)){
			stateMachine.change(GameStateName.Play);
		}

	}
	render(){
		this.sceneTop.render();
		this.sceneBottom.render();
		context.save();
		
		this.renderSonicAnimation();

		context.restore();
	}

	renderSonicAnimation() {
		const sonicSprite = this.sonicAnimation.getCurrentFrame();
		// center Sonic horizontally

		const x = (CANVAS_WIDTH - sonicSprite.width) / 2;
		const y = (CANVAS_HEIGHT - sonicSprite.height) / 2;

		sonicSprite.render(x, y);
	}

	renderText(){
		
	}
}
