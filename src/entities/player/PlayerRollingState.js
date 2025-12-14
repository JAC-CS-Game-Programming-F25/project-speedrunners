import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';
import Player from './Player.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from '../../globals.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';

export default class PlayerRollingState extends PlayerState {
    constructor(player) {
        super(player);
        this.rollFriction = PlayerConfig.deceleration * 0.3;
        this.previousX = 0;
        this.stuckFrames = 0;
    }
    
    enter() {
        this.player.currentAnimation = this.player.animations.roll;
        this.player.currentAnimation.refresh();
        this.previousX = this.player.position.x;
        this.stuckFrames = 0;
        console.log(`Entered rolling with velocity: ${this.player.velocity.x}`);
    }
    
    update(dt) {
        const velocityBeforeCollision = this.player.velocity.x;
        
        super.update(dt);
        
        // Check if we hit a wall
        if (Math.abs(velocityBeforeCollision) > 1 && this.player.velocity.x === 0) {
            console.log("Roll stopped by wall collision!");
            this.player.stateMachine.change(PlayerStateName.Idling);
            return;
        }
        
        // Check if position hasn't changed (stuck in place)
        if (Math.abs(this.player.position.x - this.previousX) < 0.5) {
            this.stuckFrames++;
            if (this.stuckFrames >= 3) {
                console.log("Roll stopped - not moving!");
                this.player.stateMachine.change(PlayerStateName.Idling);
                return;
            }
        } else {
            this.stuckFrames = 0;
        }
        
        this.previousX = this.player.position.x;
        
        this.handleInput();
        this.handleRoll(dt);
        this.checkTransitions();
    }
    
    handleInput() {
        if (input.isKeyPressed(Input.KEYS.SPACE)) {
            this.player.stateMachine.change(PlayerStateName.Jumping);
        }
    }
    
    handleRoll(dt) {
        if (this.player.velocity.x > 0) {
            this.player.velocity.x = Math.max(0, this.player.velocity.x - this.rollFriction);
        } else if (this.player.velocity.x < 0) {
            this.player.velocity.x = Math.min(0, this.player.velocity.x + this.rollFriction);
        }
    }
    
    checkTransitions() {
        if (Math.abs(this.player.velocity.x) < 0.1) {
            this.player.stateMachine.change(PlayerStateName.Idling);
        }
    }
}