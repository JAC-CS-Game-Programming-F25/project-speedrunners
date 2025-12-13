import State from '../../../lib/State.js';
import Player from './Player.js';
import CollisionDetector from '../../services/CollisionDetector.js';
import { debugOptions, input } from '../../globals.js';
import Input from '../../../lib/Input.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';
import Tile from '../../services/Tile.js';
import SpikeCollisionHandler from '../../services/SpikeCollisionHandler.js';
import EnemyCollisionHandler from '../../services/EnemyCollisionHandler.js';
import SpringCollisionHandler from '../../services/SpringCollisionHandler.js';

/**
 * Base class for all player states.
 * @extends State
 */
export default class PlayerState extends State {
	/**
	 * @param {Player} player - The player instance.
	 */
	constructor(player) {
		super();
		this.player = player;
		this.collisionDetector = new CollisionDetector(player.map);
	}

	/**
	 * Updates the player state.
	 * @param {number} dt - Delta time.
	 */
	update(dt) {
		this.applyGravity(dt);
		this.updatePosition(dt);
		
		// Check solid collisions after position update
		if (this.player.powerUpManager) {
			this.checkBoxCollisions();
		}
		if (this.player.spikeManager) {
			SpikeCollisionHandler.checkCollisions(this.player, this.player.spikeManager);
		}
		if (this.player.enemyManager) {
			EnemyCollisionHandler.checkCollisions(this.player, this.player.enemyManager);
		}
		if (this.player.springManager) {
			console.log("PlayerState: Calling SpringCollisionHandler");
			SpringCollisionHandler.checkCollisions(this.player, this.player.springManager);
		} else {
			console.log("PlayerState: No springManager on player!");
		}
		
		this.player.currentAnimation.update(dt);
	}

	checkBoxCollisions() {
		if (!this.player.powerUpManager) return;
		
		const boxes = this.player.powerUpManager.boxes;
		
		for (const box of boxes) {
			if (box.collidesWith(this.player)) {
				const overlapLeft = (this.player.position.x + this.player.dimensions.x) - box.position.x;
				const overlapRight = (box.position.x + box.dimensions.x) - this.player.position.x;
				const overlapTop = (this.player.position.y + this.player.dimensions.y) - box.position.y;
				const overlapBottom = (box.position.y + box.dimensions.y) - this.player.position.y;
				
				const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
				
				// Trigger box when landing on TOP
				if (minOverlap === overlapTop && this.player.velocity.y > 0 && !box.isHit) {
					const powerUp = box.hit();
					
					if (powerUp) {
						// Activate powerup IMMEDIATELY
						if (powerUp.duration === 0) {
							// Instant powerup (rings)
							powerUp.activate(this.player);
							this.player.map.ringManager.totalRingsCollected += powerUp.getRingAmount();
						} else {
							// Timed powerup (speed, invincibility)
							powerUp.activate(this.player);
							this.player.powerUpManager.activePowerUps.push(powerUp);
						}
					}
					
					// Add bounce effect
					this.player.velocity.y = -200;
				}
				
				// Resolve solid collision only if box is still solid
				if (box.isSolid) {
					if (minOverlap === overlapTop) {
						this.player.position.y = box.position.y - this.player.dimensions.y;
						this.player.velocity.y = 0;
						this.player.isOnGround = true;  
					}
					else if (minOverlap === overlapBottom) {
						this.player.position.y = box.position.y + box.dimensions.y;
						this.player.velocity.y = 0;
					}
					else if (minOverlap === overlapLeft) {
						this.player.position.x = box.position.x - this.player.dimensions.x;
					}
					else if (minOverlap === overlapRight) {
						this.player.position.x = box.position.x + box.dimensions.x;
					}
				}
			}
		}
	}

	/**
	 * Renders the player on the canvas.
	 */
	render(context) {
		super.render();

		context.save();

		if (!this.player.facingRight) {
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

		this.player.currentAnimation.getCurrentFrame().render(0, 0);
		context.restore();

		if (debugOptions.playerCollision) {
			this.renderDebug(context);
		}
	}

	renderDebug(context) {
		const left = Math.floor(this.player.position.x / Tile.SIZE) - 1;
		const top = Math.floor(this.player.position.y / Tile.SIZE) - 1;
		const right = Math.floor((this.player.position.x + this.player.dimensions.x) / Tile.SIZE) + 1;
		const bottom = Math.floor((this.player.position.y + this.player.dimensions.y - 1) / Tile.SIZE) + 1;

		context.fillStyle = 'rgba(255, 255, 0, 0.3)';
		for (let y = top; y <= bottom; y++) {
			for (let x = left; x <= right; x++) {
				context.fillRect(x * Tile.SIZE, y * Tile.SIZE, Tile.SIZE, Tile.SIZE);
			}
		}

		context.fillStyle = 'rgba(255, 0, 0, 0.5)';
		this.getCollidingTiles(left, top, right, bottom).forEach((tile) => {
			context.fillRect(tile.x * Tile.SIZE, tile.y * Tile.SIZE, Tile.SIZE, Tile.SIZE);
		});

		context.strokeStyle = 'blue';
		context.strokeRect(
			this.player.position.x,
			this.player.position.y,
			this.player.dimensions.x,
			this.player.dimensions.y
		);
	}

	getCollidingTiles(left, top, right, bottom) {
		const collidingTiles = [];
		for (let y = top; y <= bottom; y++) {
			for (let x = left; x <= right; x++) {
				if (this.player.map.isSolidTileAt(x, y)) {
					collidingTiles.push({ x, y });
				}
			}
		}
		return collidingTiles;
	}

	handleHorizontalMovement() {
		if (input.isKeyHeld(Input.KEYS.A) && input.isKeyHeld(Input.KEYS.D)) {
			this.slowDown();
		} else if (input.isKeyHeld(Input.KEYS.A)) {
			this.moveLeft();
			this.player.facingRight = false;
		} else if (input.isKeyHeld(Input.KEYS.D)) {
			this.moveRight();
			this.player.facingRight = true;
		} else {
			this.slowDown();
		}

		if (Math.abs(this.player.velocity.x) < 0.1) this.player.velocity.x = 0;
	}

	moveRight() {
		this.player.velocity.x = Math.min(
			this.player.velocity.x + PlayerConfig.acceleration,
			PlayerConfig.maxSpeed
		);
	}

	moveLeft() {
		this.player.velocity.x = Math.max(
			this.player.velocity.x - PlayerConfig.acceleration,
			-PlayerConfig.maxSpeed
		);
	}

	slowDown() {
		if (this.player.velocity.x > 0) {
			this.player.velocity.x = Math.max(0, this.player.velocity.x - PlayerConfig.deceleration);
		} else if (this.player.velocity.x < 0) {
			this.player.velocity.x = Math.min(0, this.player.velocity.x + PlayerConfig.deceleration);
		}
	}

	applyGravity(dt) {
		if (!this.player.isOnGround) {
			this.player.velocity.y = Math.min(
				this.player.velocity.y + PlayerConfig.gravity * dt,
				PlayerConfig.maxFallSpeed
			);
		}
	}

	updatePosition(dt) {
		const dx = this.player.velocity.x * dt;
		const dy = this.player.velocity.y * dt;

		this.player.position.x += dx;
		this.collisionDetector.checkHorizontalCollisions(this.player);

		this.player.position.y += dy;
		this.collisionDetector.checkVerticalCollisions(this.player);

		this.player.position.x = Math.max(
			0,
			Math.min(
				Math.round(this.player.position.x),
				this.player.map.width * Tile.SIZE - this.player.dimensions.x
			)
		);

		this.player.position.y = Math.round(this.player.position.y);
	}
}