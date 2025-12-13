import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';

import Player from './Player.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from '../../globals.js';

/**
 * Represents the damage state of the player.
 * @extends PlayerState
 */
export default class PlayerDamageState extends PlayerState {
	/**
	 * Creates a new PlayerDamageState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
        this.invincibilityStarted = false
	}

	/**
	 * Called when entering the damage state.
	 */
	enter() {
		this.player.currentAnimation = this.player.animations.damage;
        this.animationFinished = false;
        this.invincibilityStarted = false
        
        // Knockback velocity
        const knockbackSpeedX = 200; // horizontal speed of knockback
        const knockbackSpeedY = -250; // vertical speed

        // Apply velocity opposite to the direction being faced
        if (this.player.facingRight) {
            this.player.velocity.x = -knockbackSpeedX; 
        } else {
            this.player.velocity.x = knockbackSpeedX; 
        }

        this.player.velocity.y = knockbackSpeedY; // upward push
    }

	/**
	 * Updates the damage state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		super.update(dt);

        if (this.player.isOnGround) {
            this.player.velocity.x = 0
            this.animationFinished = true;
        }
        this.checkTransitions()
	}

    checkTransitions() {
		if (this.player.isOnGround && this.animationFinished) {
			if (Math.abs(this.player.velocity.x) < 0.1) {
				this.player.stateMachine.change(PlayerStateName.Idling);
			} else {
				this.player.stateMachine.change(PlayerStateName.Walking);
			}
		}
    }
}
