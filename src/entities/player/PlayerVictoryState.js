import PlayerState from './PlayerState.js';
import PlayerStateName from '../../enums/PlayerStateName.js';

export default class PlayerVictoryState extends PlayerState {
    constructor(player) {
        super(player);
        this.name = PlayerStateName.Victory;
    }
    
    enter() {
        // Stop all movement
        this.player.velocity.x = 0;
        this.player.velocity.y = 0;
        
        // Use idle animation (or create a victory animation if you have one)
        this.player.currentAnimation = this.player.animations.idle;
        this.player.currentAnimation.refresh();
        
       // console.log("Player entered victory state!");
    }
    
    update(dt) {
        // Only apply gravity and update position (no input handling)
        this.applyGravity(dt);
        this.updatePosition(dt);
        
        this.player.currentAnimation.update(dt);
    }
    
    // No input handling - player can't move
    handleInput() {
        // Do nothing
    }
}