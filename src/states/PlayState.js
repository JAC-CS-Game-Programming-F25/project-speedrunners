import State from "../../lib/State.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/player/Player.js";
import Map from "../services/Map.js";
import {SoundName} from "../enums/SoundName.js";
import { CANVAS_HEIGHT, context, sounds } from "../globals.js";
import { images } from "../globals.js";
import {ImageName} from "../enums/ImageName.js";
import Scene from "../services/Scene.js";
import LevelBackground from "../services/LevelBackground.js";

export default class PlayState extends State {
	constructor(mapDefinition) {
		super();
		
		this.map = new Map(mapDefinition);
		const totalHeight = 64 + 88 + 104; // 256
		const scale = CANVAS_HEIGHT / totalHeight;

		const scaledTopHeight = 64 * scale;
		const scaledMiddleHeight = 88 * scale;
		const scaledBottomHeight = 104 * scale;

		// Top & middle BG: parallax only, no auto-scroll
		this.bgTop = new LevelBackground(ImageName.LevelTopBG, 0, scale, 0.3);
		this.bgMiddle = new LevelBackground(ImageName.LevelMiddleBG, scaledTopHeight, scale, 0.6);

		// Bottom / water BG: parallax + auto-scroll
		this.bgBottom = new LevelBackground(
			ImageName.LevelBottomBG,
			scaledTopHeight + scaledMiddleHeight,
			scale,
			1,   // parallax
			50   // auto-scroll pixels/sec
		);
	}

	update(dt) {
		const cameraX = this.map.camera.position.x;

		this.bgTop.update(dt, cameraX);
		this.bgMiddle.update(dt, cameraX);
		this.bgBottom.update(dt, cameraX);
		this.map.update(dt);
	}


	render() {
		const cameraX = this.map.camera.position.x;

		// draw backgrounds manually
		this.bgTop.render();
		this.bgMiddle.render();
		this.bgBottom.render();

		this.map.render();

	}

}
