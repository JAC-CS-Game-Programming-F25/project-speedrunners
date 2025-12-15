import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';

import Player from './Player.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input, sounds, stateMachine } from '../../globals.js';
import Tile from '../../services/Tile.js';
import GameStateName from '../../enums/GameStateName.js';
import SoundName from '../../enums/SoundName.js';

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
        this.isHandlingDeath = false;
	}

	/**
	 * Called when entering the death state.
	 */
	enter() {
        sounds.play(SoundName.Dying)
        this.player.currentAnimation = this.player.animations.death;
        this.deathTimer = 0;
        this.player.lives -= 1;
        console.log("=== PLAYER DEATH STATE ENTERED ===");
        console.log("Lives remaining:", this.player.lives);
    }

	/**
	 * Updates the death state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
        if (this.isHandlingDeath) return
        this.deathTimer += dt;

        // Apply death physics (up then down)
        this.player.velocity.y = this.deathVelocity + this.deathGravity * this.deathTimer;
        this.player.position.y += this.player.velocity.y * dt;

        // Optional: keep him horizontally still
        this.player.velocity.x = 0;

        // Update death animation
        this.player.currentAnimation.update(dt);

        if (this.player.position.y > this.player.map.height * Tile.SIZE) {
            this.handleDeath();
        }

        // End death after duration
        if (this.deathTimer >= this.deathDuration) {
            this.handleDeath();
        }
	}

    handleDeath() {
        if (this.isHandlingDeath) return;
        this.isHandlingDeath = true
        // Check if player has lives remaining. if it's 0 it's game over
        if (this.player.lives <= 0) {
            // transition to game over state, while getting the final score.
            const finalScore = this.player.map.scoreManager.getScore();
            stateMachine.change(GameStateName.GameOver, { 
                score: finalScore,
                map: this.player.map  
            });
        } else {
            // if Sonic still has lives, respawn
            this.resetPlayer();
            this.isHandlingDeath = false
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
