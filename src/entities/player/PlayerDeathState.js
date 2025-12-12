import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';

import Player from './Player.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from '../../globals.js';
import Tile from '../../services/Tile.js';

/**
 * Represents the death state of the player.
 * @extends PlayerState
 */
export default class PlayerDeathState extends PlayerState {
	/**
	 * Creates a new PlayerDamageState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
        this.deathTimer = 0;
        this.deathDuration = 2; // 2 seconds for death animation
        this.deathVelocity = -200; // Initial upward velocity
        this.deathGravity = 600; // Gravity during death
	}

	/**
	 * Called when entering the death state.
	 */
	enter() {
        this.player.currentAnimation = this.player.animations.death;
        this.deathTimer = 0;
    }

	/**
	 * Updates the death state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
    this.deathTimer += dt;

    // Apply death physics (up then down)
    this.player.velocity.y = this.deathVelocity + this.deathGravity * this.deathTimer;
    this.player.position.y += this.player.velocity.y * dt;

    // Optional: keep him horizontally still
    this.player.velocity.x = 0;

    // Update death animation
    this.player.currentAnimation.update(dt);

    // Optional: stop him if he goes below the screen (or you can respawn)
    if (this.player.position.y > this.player.map.height * Tile.SIZE) {
        this.resetPlayer();
    }

    // End death after duration
    if (this.deathTimer >= this.deathDuration) {
        this.resetPlayer();
    }
	}


    /**
     * Resets the player's position and state after death.
     */
    resetPlayer() {
        // Reset position to initial position
        this.player.position.x = this.player.initialPosition.x;
        this.player.position.y = this.player.initialPosition.y;
        this.player.velocity.x = 0;
        this.player.velocity.y = 0;
        this.player.isOnGround = false;
        this.deathTimer = 0;
 
        // Switch back to idling state
        this.player.stateMachine.change(PlayerStateName.Idling);
    }
}
