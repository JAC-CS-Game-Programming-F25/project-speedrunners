import State from "../../lib/State.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/player/Player.js";
import Map from "../services/Map.js";
import {SoundName} from "../enums/SoundName.js";
import { sounds } from "../globals.js";
import { images } from "../globals.js";
import {ImageName} from "../enums/ImageName.js";

export default class PlayState extends State {
	constructor(mapDefinition) {
		super();
		this.map = new Map(mapDefinition);
		this.backgroundImage = images.get(ImageName.Background);

		this.parallaxLayers = [
			{ image: this.backgroundImage, speedX: 0.04, speedY: 0.1 },
		];
	}

	update(dt) {
		this.map.update(dt);
	}


	render() {
		this.map.render();
	}

}
