import Animation from '../../../lib/Animation.js';
import { images, context, timer } from '../../globals.js';
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

export default class Player extends Entity {
	constructor(x, y, width, height, map) {
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
		this.rings = [];
		this.hitSpikeTop = false;
		this.sparkles = new InvincibilitySparkles();

        this.sprites = loadPlayerSprites(
            images.get(ImageName.Sonic),
            playerSpriteConfig
        )

		this.animations = {
			idle: new Animation(this.sprites.idle),
			walk: new Animation(this.sprites.walk, 0.1),
			jump: new Animation(this.sprites.jump, 0.08),
			run: new Animation(this.sprites.run, 0.1),
			damage: new Animation(this.sprites.damage, 0.1),
			death: new Animation(this.sprites.death)
		};

		this.currentAnimation = this.animations.idle;

		this.stateMachine = new StateMachine();

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
			PlayerStateName.Idling,
			new PlayerIdlingState(this)
		);
	}

	update(dt) {
		this.stateMachine.update(dt);
		if (this.isInvincible) {
			this.sparkles.update(dt);
		}
	}

	render(context) {
		context.save();
		context.globalAlpha = this.isDamagedInvincible ? this.flicker : 1;
		this.stateMachine.render(context);
		if (this.isInvincible) {
			this.sparkles.render(
				context,
				this.position.x,
				this.position.y,
				this.dimensions.x,
				this.dimensions.y
			);
		}
		context.restore();
	}

	hit() {
		if (this.rings > 0 && !this.isDamagedInvincible) {
			this.stateMachine.change(PlayerStateName.Damage)
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
			}
    	);
	}

	canHit() {
		return (
			this.stateMachine.currentState.name === PlayerStateName.Jumping &&
			this.velocity.y > 0 &&
			!this.isDamagedInvincible
		);
	}

}