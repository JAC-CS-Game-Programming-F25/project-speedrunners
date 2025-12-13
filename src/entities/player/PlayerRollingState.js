import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';

import Player from './Player.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from '../../globals.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';

/**
 * Represents the rolling state of the player.
 * @extends PlayerState
 */
export default class PlayerRollingState extends PlayerState {
	/**
	 * Creates a new PlayerRollingState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
	}

	/**
	 * Called when entering the rolling state.
	 */
	enter() {
		this.player.currentAnimation = this.player.animations.roll;
		this.player.currentAnimation.refresh();
	}

	/**
	 * Updates the rolling state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		super.update(dt);
		this.handleInput();
        this.handleRoll(dt);
        this.checkTransitions();
	}

	/**
	 * Handles player input.
	 */
	handleInput() {
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.player.stateMachine.change(PlayerStateName.Jumping);
		}
        
	}

    handleRoll() {
		this.slowDown();
		if (Math.abs(this.player.velocity.x) < 0.1) this.player.velocity.x = 0;
    }

    
    checkTransitions() {
        if (Math.abs(this.player.velocity.x) < 0.1) {
            this.player.stateMachine.change(PlayerStateName.Idling);
        }
    }
}
