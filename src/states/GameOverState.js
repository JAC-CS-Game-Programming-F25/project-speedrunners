import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { input, stateMachine } from "../globals.js";

/**
 * Displays the game over screen along with the final score.
 */
export default class GameOverState extends State {
	constructor() {
		super();

		this.score = 0;
	}

	enter(parameters) {

	}

	update(dt) {

		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render() {

	}
}
