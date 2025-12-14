	import PlayerState from './PlayerState.js';
	import Player from './Player.js';
	import Input from '../../../lib/Input.js';
	import { input } from '../../globals.js';
	import { PlayerConfig } from '../../../config/PlayerConfig.js';
	import PlayerStateName from '../../enums/PlayerStateName.js';

	/**
	 * Represents the running state of the player.
	 * @extends PlayerState
	 */
	export default class PlayerRunningState extends PlayerState {
		/**
		 * Creates a new PlayerRunningState instance.
		 * @param {Player} player - The player object.
		 */
		constructor(player) {
			super(player);
			this.isMovingRight = false;
			this.isMovingLeft = false;
		}

		/**
		 * Called when entering the running state.
		 */
		enter() {
			this.player.isOnGround = true;
			this.player.currentAnimation = this.player.animations.run;
			this.player.currentAnimation.refresh();
		}

		/**
		 * Updates the running state.
		 * @param {number} dt - The time passed since the last update.
		 */
		update(dt) {
			this.handleInput();         
			this.handleHorizontalMovement();  
			super.update(dt);  
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

			if (input.isKeyPressed(Input.KEYS.SPACE) && this.player.isOnGround) {
				this.player.stateMachine.change(PlayerStateName.Jumping);
			}

			if (input.isKeyPressed(Input.KEYS.S) && 
				!input.isKeyHeld(Input.KEYS.A) && 
				!input.isKeyHeld(Input.KEYS.D)) 
			{
				this.player.stateMachine.change(PlayerStateName.Rolling);
			}
			
		}

		/**
		 * Checks for state transitions.
		 */
		checkTransitions() {

			if (this.player.stateMachine.currentState.name === PlayerStateName.Damage) {
        	return;
    		}
           	const RUN_EXIT_THRESHOLD = PlayerConfig.runThreshold * 0.8;

			if (Math.abs(this.player.velocity.x) < RUN_EXIT_THRESHOLD) {
				this.player.stateMachine.change(PlayerStateName.Walking);
				return;
			}

            // If velocity is really low, go to idling
            if (!this.isMovingLeft && !this.isMovingRight && Math.abs(this.player.velocity.x) < 0.25) {
                this.player.stateMachine.change(PlayerStateName.Idling);
            }

			if (this.shouldSkid()) {
				this.player.stateMachine.change(PlayerStateName.Skidding);
			}
			
		}

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


	}
