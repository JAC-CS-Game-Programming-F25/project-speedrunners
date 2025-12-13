	import PlayerState from './PlayerState.js';
	import Player from './Player.js';
	import Input from '../../../lib/Input.js';
	import { input } from '../../globals.js';
	import { PlayerConfig } from '../../../config/PlayerConfig.js';
	import PlayerStateName from '../../enums/PlayerStateName.js';

	/**
	 * Represents the walking state of the player.
	 * @extends PlayerState
	 */
	export default class PlayerWalkingState extends PlayerState {
		/**
		 * Creates a new PlayerWalkingState instance.
		 * @param {Player} player - The player object.
		 */
		constructor(player) {
			super(player);
			this.isMovingRight = false;
			this.isMovingLeft = false;
			this.idleTimer = 0;
		}

		/**
		 * Called when entering the walking state.
		 */
		enter() {
        this.player.isOnGround = true;
        this.player.currentAnimation = this.player.animations.walk;
        this.player.currentAnimation.refresh(); 
    }

		/**
		 * Updates the walking state.
		 * @param {number} dt - The time passed since the last update.
		 */
		update(dt) {
			super.update(dt);  
			this.handleInput();         
			this.handleHorizontalMovement(); 
			this.checkTransitions();   
	
		}

		/**
		 * Handles player input.
		 */
		handleInput() {
			if (input.isKeyHeld(Input.KEYS.A) && !this.isMovingRight) {
				this.isMovingLeft = true;
			} else {
				this.isMovingLeft = false;
			}

			if (input.isKeyHeld(Input.KEYS.D) && !this.isMovingLeft) {
				this.isMovingRight = true;
			} else {
				this.isMovingRight = false;
			}

			if (input.isKeyPressed(Input.KEYS.SPACE)) {
				this.player.stateMachine.change(PlayerStateName.Jumping);
			}
		}

		/**
		 * Checks for state transitions.
		 */
		checkTransitions() {
        // Force immediate stop when not pressing movement keys
        if (!this.isMovingLeft && !this.isMovingRight) {
            // If velocity is low, snap to 0 and transition immediately
            if (Math.abs(this.player.velocity.x) < 1.0) {  // Higher threshold
                this.player.velocity.x = 0;  // Force stop
                this.player.stateMachine.change(PlayerStateName.Idling);
                return;
            }
        }
        
        if (!this.player.isOnGround) {
            if (this.player.velocity.y < 0) {
                this.player.stateMachine.change(PlayerStateName.Jumping);
            } 
        }
        
        if (Math.abs(this.player.velocity.x) >= PlayerConfig.runThreshold) {
            this.player.stateMachine.change(PlayerStateName.Running);
        }

		if (this.shouldIdle()) {
				this.player.stateMachine.change(PlayerStateName.Idling);
			}
    }
			


		
// checkTransitions(dt) {
//     // Check if should idle
//     if (!this.isMovingLeft && !this.isMovingRight && Math.abs(this.player.velocity.x) < 0.1) {
//         this.idleTimer += dt;
        
//         // Force velocity to 0 while waiting to transition
//         this.player.velocity.x = 0; // ADD THIS LINE
        
//         // Only transition after 0.1 seconds of being still
//         if (this.idleTimer >= 0.1) {
//             this.player.stateMachine.change(PlayerStateName.Idling);
//             return;
//         }
//     } else {
//         this.idleTimer = 0;
//     }

//     if (!this.player.isOnGround) {
//         if (this.player.velocity.y < 0) {
//             this.player.stateMachine.change(PlayerStateName.Jumping);
//         } 
//     }
    
//     if (Math.abs(this.player.velocity.x) >= PlayerConfig.runThreshold) {
//         this.player.stateMachine.change(PlayerStateName.Running);
//     }
// }

		/**
		 * Determines if the player should transition to the skidding state.
		 * @returns {boolean} True if the player should skid, false otherwise.
		 */
		shouldSkid() {
			return (
				this.player.isOnGround &&
				Math.abs(this.player.velocity.x) > PlayerConfig.skidThreshold &&
				((input.isKeyHeld(Input.KEYS.A) && this.player.velocity.x > 0) ||
					(input.isKeyHeld(Input.KEYS.D) && this.player.velocity.x < 0))
			);
		}

		/**
		 * Determines if the player should transition to the idling state.
		 * @returns {boolean} True if the player should idle, false otherwise.
		 */
		shouldIdle() {
			return (
				!this.isMovingLeft &&
				!this.isMovingRight &&
				Math.abs(this.player.velocity.x) < 0.1
			);
		}
	}
