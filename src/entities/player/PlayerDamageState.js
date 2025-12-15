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
    }
    
    /**
     * Called when entering the damage state.
     */
    enter() {
        this.player.currentAnimation = this.player.animations.damage;
        this.animationFinished = false;
        
        // START INVINCIBILITY IMMEDIATELY (not when grounded)
        // This prevents being hit multiple times while in knockback
        this.player.startInvincibility();
        
        // Knockback velocity
        const knockbackSpeedX = 200; // horizontal speed of knockback
        const knockbackSpeedY = -250; // vertical speed
        
       // console.log(`[DAMAGE STATE] knockbackRight=${this.player.knockbackRight}, facingRight=${this.player.facingRight}`);
        
        // Apply velocity based on collision side (not facing direction)
        // knockbackRight is set by CollisionDetector based on enemy position
        if (this.player.knockbackRight !== undefined) {
            // Use collision-based direction
            if (this.player.knockbackRight) {
                this.player.velocity.x = knockbackSpeedX;  // Knockback to the right
              //  console.log(`[DAMAGE STATE] Knockback RIGHT (${knockbackSpeedX})`);
            } else {
                this.player.velocity.x = -knockbackSpeedX; // Knockback to the left
                //console.log(`[DAMAGE STATE] Knockback LEFT (${-knockbackSpeedX})`);
            }
        } else {
            // Fallback to facing direction (for spike hits, etc.)
            if (this.player.facingRight) {
                this.player.velocity.x = -knockbackSpeedX; 
               // console.log(`[DAMAGE STATE] Fallback knockback LEFT (facing right)`);
            } else {
                this.player.velocity.x = knockbackSpeedX; 
                //console.log(`[DAMAGE STATE] Fallback knockback RIGHT (facing left)`);
            }
        }
        this.player.velocity.y = knockbackSpeedY; // upward push
        
        // Reset knockback direction so it doesn't get reused
        this.player.knockbackRight = undefined;
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
    
    /**
     * Called when exiting the damage state.
     */
    exit() {
        // Invincibility continues after leaving damage state (timer handles it)
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