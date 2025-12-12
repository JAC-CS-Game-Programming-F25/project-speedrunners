import State from "../../lib/State.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/player/Player.js";
import Map from "../services/Map.js";
import {SoundName} from "../enums/SoundName.js";
import { sounds } from "../globals.js";

export default class PlayState extends State {
	constructor(mapDefinition) {
		super();
		this.map = new Map(mapDefinition);
	}

	update(dt) {
		this.map.update(dt);
	}


	render() {
		this.map.render();
	}
	

}
