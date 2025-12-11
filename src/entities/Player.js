
import Animation from '../../lib/Animation.js';
import { images, context } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import { loadPlayerSprites, spriteConfig } from '../../config/SpriteConfig.js';
import StateMachine from '../../lib/StateMachine.js';
import PlayerIdlingState from './PlayerIdlingState.js';
import PlayerWalkingState from './PlayerWalkingState.js';
import Vector from '../../lib/Vector.js';
import Entity from './Entity.js';
import Map from '../services/Map.js';
import PlayerStateName from '../enums/PlayerStateName.js';

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

		// Load player sprites
        this.sprites = loadPlayerSprites(
            images.get(ImageName.Sonic),
            spriteConfig
        )

		// Create animations for different player states
		this.animations = {
			idle: new Animation(this.sprites.idle),
			walk: new Animation(this.sprites.walk, 0.1),
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
	}

	/**
	 * Renders the player.
	 * @param {CanvasRenderingContext2D} context - The rendering context.
	 */
	render(context) {
		context.save();
		this.stateMachine.render(context);
		context.restore();
	}

}
