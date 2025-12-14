import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';

import Player from './Player.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from '../../globals.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';

/**
 * Represents the bounce state of the player, when he is on a spring.
 * @extends PlayerState
 */
export default class PlayerBouncingState extends PlayerState {
	/**
	 * Creates a new PlayerBounceState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
	}

	/**
	 * Called when entering the bounce state.
	 */
	enter() {
		this.player.currentAnimation = this.player.animations.bounce;
		this.player.isBouncing = true;
		this.player.currentAnimation.refresh();
	}

	/**
	 * Updates the bounce state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		super.update(dt);
		this.handleHorizontalMovement()
		this.checkTransitions();
	}


    /**
	 * Checks for state transitions.
	 */
	checkTransitions() {
		 if (this.player.stateMachine.currentState.name === PlayerStateName.Victory) {
        return;
    }
		if (this.player.velocity.y >= 0) {
			this.player.isOnSpring = false;
			this.player.stateMachine.change(PlayerStateName.Walking);
		}
	}
}
