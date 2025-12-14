import PlayerState from './PlayerState.js';
import Player from './Player.js';
import Input from '../../../lib/Input.js';
import { input } from '../../globals.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';
import PlayerStateName from '../../enums/PlayerStateName.js';

/**
 * Represents the jumping state of the player.
 * @extends PlayerState
 */
export default class PlayerJumpingState extends PlayerState {
    constructor(player) {
        super(player);
        this.jumpCut = false;
        this.spaceWasHeld = false; // Track if space was held at jump start
    }

    enter() {
        this.player.velocity.y = PlayerConfig.jumpPower;
        this.player.currentAnimation = this.player.animations.jump;
        this.player.currentAnimation.refresh();
        this.jumpCut = false;
        this.spaceWasHeld = input.isKeyHeld(Input.KEYS.SPACE); // Check on entry
    }

    exit() {}

	/**
	 * Updates the jumping state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
        this.handleInput();
		this.handleHorizontalMovement();
		super.update(dt);
		this.checkTransitions();
	}

    handleInput() {
        // Only cut if: (1) space was held when jump started, (2) space is now released, (3) still ascending
        if (this.spaceWasHeld && 
            !input.isKeyHeld(Input.KEYS.SPACE) && 
            this.player.velocity.y < 0 && 
            !this.jumpCut) {
            this.player.velocity.y *= 0.5;
            this.jumpCut = true;
        }
    }

    checkTransitions() {
        if (this.player.isOnGround) {
            if (Math.abs(this.player.velocity.x) > 0.1) {
                this.player.stateMachine.change(PlayerStateName.Walking);
            }
            else {
                this.player.stateMachine.change(PlayerStateName.Idling);
            }
        }
    }
}