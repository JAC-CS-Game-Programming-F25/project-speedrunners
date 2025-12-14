import Input from "../../../lib/Input.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { input } from "../../globals.js";
import Player from "./Player.js";
import PlayerState from "./PlayerState.js";
import { PlayerConfig } from "../../../config/PlayerConfig.js";

/**
 * Represents the skidding state of the player.
 * @extends PlayerState
 */
export default class PlayerSkiddingState extends PlayerState {
    /**
     * Creates a new PlayerSkiddingState instance.
     * @param {Player} player - The player object.
     */
    constructor(player) {
        super(player);
        // direction the skid started so he doesn't skid the wrong way when pressing opposite direction
        this.skidDirectionRight = true; 
    }
    
    /**
     * Called when entering the skidding state.
     */
    enter() {
        this.player.currentAnimation = this.player.animations.skid;
        
        // Lock skid direction based on current velocity
        if (this.player.velocity.x > 0) {
            this.skidDirectionRight = true; // running right, skidding right
        } else if (this.player.velocity.x < 0) {
            this.skidDirectionRight = false; // running left, skidding left
        }
    }
    
    /**
     * Called when exiting the skidding state.
     */
    exit() {}
    
    /**
     * Updates the skidding state.
     * @param {number} dt - The time passed since the last update.
     */
    update(dt) {
        super.update(dt);
        this.handleInput();
        this.handleSkidding();
        this.checkTransitions();
    }


    render(context) {
        const sprite = this.player.currentAnimation.getCurrentFrame();
        const frameWidth = sprite.width;
        const frameHeight = sprite.height;

        context.save();

        // Handle orientation based on locked skid direction
        if (!this.skidDirectionRight) {
            context.scale(-1, 1);
            context.translate(
                Math.floor(-this.player.position.x - this.player.dimensions.x),
                Math.floor(this.player.position.y)
            );
        } else {
            context.translate(
                Math.floor(this.player.position.x),
                Math.floor(this.player.position.y)
            );
        }

        const offsetY = this.player.dimensions.y - frameHeight;

        sprite.render(0, offsetY);

        context.restore();
    }
    
    /**
     * Handles player input.
     */
    handleInput() {
        if (input.isKeyPressed(Input.KEYS.SPACE)) {
            this.player.stateMachine.change(PlayerStateName.Jumping);
        }
    }
    
    handleSkidding() {
        // Apply STRONG deceleration during skid for snappy feel
        const skidDecel = PlayerConfig.skidDeceleration || PlayerConfig.deceleration * 2;
        
        if (this.player.velocity.x > 0) {
            this.player.velocity.x = Math.max(0, this.player.velocity.x - skidDecel);
        } else if (this.player.velocity.x < 0) {
            this.player.velocity.x = Math.min(0, this.player.velocity.x + skidDecel);
        }
        
        if (Math.abs(this.player.velocity.x) < 0.1) this.player.velocity.x = 0;
    }
    
    /**
     * Checks for state transitions.
     */
    checkTransitions() {
		if(this.player.stateMachine.currentState.name === PlayerStateName.Victory){
			return;
		}
        // Exit skid when stopped
        if (Math.abs(this.player.velocity.x) < 0.1) {
            if (input.isKeyHeld(Input.KEYS.A) || input.isKeyHeld(Input.KEYS.D)) {
                this.player.stateMachine.change(PlayerStateName.Walking);
            } else {
                this.player.stateMachine.change(PlayerStateName.Idling);
            }
        }
    }
}