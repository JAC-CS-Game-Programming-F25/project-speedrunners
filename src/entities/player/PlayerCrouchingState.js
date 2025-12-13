import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';

import Player from './Player.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from '../../globals.js';

/**
 * Represents the crouching state of the player.
 * @extends PlayerState
 */
export default class PlayerCrouchingState extends PlayerState {
	/**
	 * Creates a new PlayerCrouchingState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
	}

	/**
	 * Called when entering the crouching state.
	 */
	enter() {
		this.player.currentAnimation = this.player.animations.crouch;
		this.player.currentAnimation.refresh();
	}

	/**
	 * Updates the crouching state.
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
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.player.stateMachine.change(PlayerStateName.Jumping);
		}

		// If the player releases S, change to the idling state.
		if (!input.isKeyHeld(Input.KEYS.S)) {
			this.player.stateMachine.change(PlayerStateName.Idling);
		}
	}
}
