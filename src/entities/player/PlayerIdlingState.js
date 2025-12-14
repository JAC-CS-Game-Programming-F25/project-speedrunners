import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';

import Player from './Player.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from '../../globals.js';

/**
 * Represents the idling state of the player.
 * @extends PlayerState
 */
export default class PlayerIdlingState extends PlayerState {
	/**
	 * Creates a new PlayerIdlingState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
	}

	/**
	 * Called when entering the idling state.
	 */
	enter() {
		this.player.velocity.x = 0;
		this.player.velocity.y = 0;
		this.player.currentAnimation = this.player.animations.idle;
		this.player.currentAnimation.refresh();
	}

	/**
	 * Updates the idling state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		super.update(dt);
		this.handleInput();
	}

	/**
	 * Handles player input.
	 */
	handleInput() {
		 if (this.player.stateMachine.currentState.name === PlayerStateName.Victory) {
        return;
    }
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.player.stateMachine.change(PlayerStateName.Jumping);
		}

		if (input.isKeyPressed(Input.KEYS.S)) {
			this.player.stateMachine.change(PlayerStateName.Crouching);
		}

		// If the player is pressing A or D, not both, change to the walking state.
		if (input.isKeyHeld(Input.KEYS.A) !== input.isKeyHeld(Input.KEYS.D)) {
			this.player.stateMachine.change(PlayerStateName.Walking);
		}
	}
}
