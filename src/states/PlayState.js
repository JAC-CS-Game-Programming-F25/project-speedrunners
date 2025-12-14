import State from "../../lib/State.js";
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

		// Get the heights of all the backgrounds (the heights are in assets.json)
		const topHeight = 64;
		const middle1Height = 48;
		const middle2Height = 40;
		const bottomHeight = 104;

		// get the total height
		const totalHeight = topHeight + middle1Height + middle2Height + bottomHeight;

		// scale by the total height
		const scale = CANVAS_HEIGHT / totalHeight;

		// get the scaled heights
		const scaledTop = topHeight * scale;
		const scaledMiddle1 = middle1Height * scale;
		const scaledMiddle2 = middle2Height * scale;

		// Top BG
		this.bgTop = new LevelBackground(ImageName.LevelTopBG, 0, scale, 0.3);

		// Middle1
		this.bgMiddle1 = new LevelBackground(ImageName.LevelMiddleBG1, scaledTop, scale, 0.6);

		// Middle2
		this.bgMiddle2 = new LevelBackground(ImageName.LevelMiddleBG2, scaledTop + scaledMiddle1, scale, 0.8);

		// Bottom/Water bg
		// The 50 at the end is auto scroll speed
		this.bgBottom = new LevelBackground(ImageName.LevelBottomBG, scaledTop + scaledMiddle1 + scaledMiddle2, scale, 1, 50);
	}

	update(dt) {
		const cameraX = this.map.camera.position.x;

		this.bgTop.update(dt, cameraX);
		this.bgMiddle1.update(dt, cameraX);
		this.bgMiddle2.update(dt, cameraX);
		this.bgBottom.update(dt, cameraX);
		this.map.update(dt);
	}


	render() {
		const cameraX = this.map.camera.position.x;

		// draw backgrounds manually
		this.bgTop.render();
		this.bgMiddle1.render();
		this.bgMiddle2.render();
		this.bgBottom.render();

		this.map.render();

	}

}
