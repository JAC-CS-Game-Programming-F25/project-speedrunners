import Animation from '../../../lib/Animation.js';
import { images, context, timer,debugOptions } from '../../globals.js';
import ImageName from '../../enums/ImageName.js';
import { loadPlayerSprites, playerSpriteConfig } from '../../../config/SpriteConfig.js';
import StateMachine from '../../../lib/StateMachine.js';
import PlayerIdlingState from './PlayerIdlingState.js';
import Vector from '../../../lib/Vector.js';
import Entity from '../Entity.js';
import Map from '../../services/Map.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import PlayerWalkingState from './PlayerWalkingState.js';
import PlayerJumpingState from './PlayerJumpingState.js';
import PlayerRunningState from './PlayerRunningState.js';
import PlayerDamageState from './PlayerDamageState.js';
import PlayerDeathState from './PlayerDeathState.js';
import InvincibilitySparkles from '../../objects/PowerUps/InvincibilitySparkles.js';
import RingManager from '../../services/RingManager.js';
import PlayerSkiddingState from './PlayerSkiddingState.js';
import PlayerCrouchingState from './PlayerCrouchingState.js';
import PlayerRollingState from './PlayerRollingState.js';
import PlayerBouncingState from './PlayerBouncingState.js';
import SignPostManager from '../../services/SignPostManager.js';
import PlayerVictoryState from './PlayerVictoryState.js';
import GameStateName from '../../enums/GameStateName.js';

export default class Player extends Entity {
    constructor(x, y, width, height, map, scoreManager) {
        super(x, y, width, height);
        this.initialPosition = new Vector(x, y);
        this.position = new Vector(x, y);
        this.dimensions = new Vector(width, height);
        this.velocity = new Vector(0, 0);
        this.map = map;
        this.facingRight = true;
        this.isInvincible = false;
        this.isDamagedInvincible = false;
        this.invincibilityDuration = 3;
        this.flickerInterval = 0.1
        this.powerUpManager = null;
        this.spikeManager = null;  
        this.enemyManager = null;  
        this.ringsManager = null;
		this.signPostManager = null;
		this.scoreManager = scoreManager;
        this.rings = [];
        this.hitSpikeTop = false;
        this.knockbackRight = undefined;
        this.sparkles = new InvincibilitySparkles();
		this.isBouncing = false;
		
        // Slope angle for sprite rotation
		this.slopeAngle = 0;
        this.displayAngle = 0; // Smoothed angle for rendering

		this.lives = 3
        this.sprites = loadPlayerSprites(
            images.get(ImageName.Sonic),
            playerSpriteConfig
        )

		// Create animations for different player states
		this.animations = {
			idle: new Animation(this.sprites.idle),
			walk: new Animation(this.sprites.walk, 0.1),
			jump: new Animation(this.sprites.jump, 0.08),
			run: new Animation(this.sprites.run, 0.1),
			damage: new Animation(this.sprites.damage, 0.1),
			death: new Animation(this.sprites.death),
			skid: new Animation(this.sprites.skid, 0.08),
			crouch: new Animation(this.sprites.crouch),
			roll: new Animation(this.sprites.roll, 0.08),
			bounce: new Animation(this.sprites.bounce)
		};

		this.currentAnimation = this.animations.idle;

		// Initialize state machine for player behavior
		this.stateMachine = new StateMachine();

		// Add states to the state machine
        this.stateMachine.add(
			PlayerStateName.Walking,
			new PlayerWalkingState(this)
		);
		this.stateMachine.add(
			PlayerStateName.Running,
			new PlayerRunningState(this)
		)
		this.stateMachine.add(
			PlayerStateName.Jumping,
			new PlayerJumpingState(this)
		)
		this.stateMachine.add(
			PlayerStateName.Damage,
			new PlayerDamageState(this)
		);
		this.stateMachine.add(
			PlayerStateName.Death,
			new PlayerDeathState(this)
		);
		this.stateMachine.add(
			PlayerStateName.Skidding,
			new PlayerSkiddingState(this)
		)
		this.stateMachine.add(
			PlayerStateName.Crouching,
			new PlayerCrouchingState(this)
		)
		this.stateMachine.add(
			PlayerStateName.Rolling,
			new PlayerRollingState(this)
		)
		this.stateMachine.add(
			PlayerStateName.Bounce,
			new PlayerBouncingState(this)
		)
		this.stateMachine.add(
			PlayerStateName.Idling,
			new PlayerIdlingState(this)
		);
		this.stateMachine.add(
    		PlayerStateName.Victory,
    		new PlayerVictoryState(this)
		);

		this.stateMachine.change(PlayerStateName.Idling);
	}

	update(dt) {
		this.stateMachine.update(dt);
		console.log(`${this.position.x},${this.position.y}`)
	

		if (this.isInvincible) {
			this.sparkles.update(dt, this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
		}

		if (this.isOnGround) {
			this.position.y = Math.round(this.position.y);

			// If slopeAngle is exactly 0, snap displayAngle to 0 immediately
			if (this.slopeAngle === 0) {
				this.displayAngle = 0; // Instant snap - no interpolation
			} else {
				// On a slope - smooth interpolation
				const diff = this.slopeAngle - this.displayAngle;
				this.displayAngle += diff * 0.2;
			}
		} else {
			// In air - return to zero
			this.displayAngle *= 0.8;
			if (Math.abs(this.displayAngle) < 0.01) {
				this.displayAngle = 0;
			}
			this.slopeAngle = 0;
		}
	}

	render(context) {
		context.globalAlpha = this.isDamagedInvincible ? this.flicker : 1;
		this.stateMachine.render(context);
		context.globalAlpha = 1;

		if (this.isInvincible) {
			this.sparkles.render(
				context,
				this.position.x,
				this.position.y,
				this.dimensions.x,
				this.dimensions.y
			);
		}
	}

	hit(hitBySpike = false) {
		if (this.isDamagedInvincible) {
			return;
		}
		if (this.stateMachine.currentState.name === PlayerStateName.Damage) {
			return;
		}
		const currentRings = this.map && this.map.ringManager ? this.map.ringManager.getRingCount() : 0;
		
		if (currentRings > 0) {
			// Calculate ground level - add extra buffer if hit by spike
			const spikeOffset = hitBySpike ? 30 : 0;
			const groundLevel = this.position.y + this.dimensions.y + spikeOffset;
			
			this.map.ringManager.loseRings(
				this.position.x + this.dimensions.x / 2,
				this.position.y + this.dimensions.y / 2,
				10,
				groundLevel
			);
			this.stateMachine.change(PlayerStateName.Damage);
		}
		else {
			this.die();
		}
	}

    die() {
        if (this.stateMachine.currentState.name !== PlayerStateName.Death) {
            this.stateMachine.change(PlayerStateName.Death)
        }
    }

    startInvincibility() {
        this.isDamagedInvincible = true;
        this.flicker = 1;
		timer.addTask(
			() => {
				this.flicker = this.flicker === 1 ? 0.5 : 1;
			},
			this.flickerInterval,
			this.invincibilityDuration,
			() => {
				this.isDamagedInvincible = false;
				this.flicker = 1;
                //console.log("Damage invincibility expired");
			}
    	);
	}

	canHitEnemy() {
		return (
			this.stateMachine.currentState.name === PlayerStateName.Jumping &&
			this.velocity.y > 0 &&
			!this.isDamagedInvincible
		);
	}

	canHitBox() {
		return (
			this.stateMachine.currentState.name === PlayerStateName.Jumping &&
			this.velocity.y > 0
		);
	}
}