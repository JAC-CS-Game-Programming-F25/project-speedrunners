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

/**
 * Represents the player character in the game.
 * @extends Entity
 */
export default class Player extends Entity {
	/**
	 * Creates a new Player instance.
	 * @param {number} x - The initial x-coordinate.
	 * @param {number} y - The initial y-coordinate.
	 * @param {number} width - The width of the player.
	 * @param {number} height - The height of the player.
	 * @param {Map} map - The game map instance.
	 */
	constructor(x, y, width, height, map) {
		super(x, y, width, height);
		this.initialPosition = new Vector(x, y);
		this.position = new Vector(x, y);
		this.dimensions = new Vector(width, height);
		this.velocity = new Vector(0, 0);
		this.map = map;
		this.facingRight = true;
		this.isInvincible = false; // invincibility frames
		this.invincibilityDuration = 3;
		this.flickerInterval = 0.1
    this.powerUpManager = null;
    this.spikeManager = null;  // NEW
    this.enemyManager = null;  // NEW
    this.sparkles = new InvincibilitySparkles();

		// Load player sprites
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
			death: new Animation(this.sprites.death)
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
			PlayerStateName.Idling,
			new PlayerIdlingState(this)
		);
	}

	/**
	 * Updates the player's state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		this.stateMachine.update(dt);
    if (this.isInvincible) {
        this.sparkles.update(dt);
    }
	}

	/**
	 * Renders the player.
	 * @param {CanvasRenderingContext2D} context - The rendering context.
	 */
	render(context) {
		context.save();
		context.globalAlpha = this.isInvincible ? this.flicker : 1;
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
		this.stateMachine.change(PlayerStateName.Damage)
	}

	die() {
		if (this.stateMachine.currentState.name !== PlayerStateName.Death) {
			this.stateMachine.change(PlayerStateName.Death)
		}
	}

	/**
	 * Handles player cooldown
	 */
	startInvincibility() {
		this.isInvincible = true;
		this.flicker = 1;

		timer.addTask(
			() => {
				this.flicker = this.flicker === 1 ? 0.5 : 1;
			},
			this.flickerInterval,
			this.invincibilityDuration,
			() => {
				// Stop invincibility and reset the flicker to normal
				this.isInvincible = false;
				this.flicker = 1;
			}
    	);
	}

}
