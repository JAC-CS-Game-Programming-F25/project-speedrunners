import State from '../../../lib/State.js';
import Player from './Player.js';
import CollisionDetector from '../../services/CollisionDetector.js';
import { debugOptions, input } from '../../globals.js';
import Input from '../../../lib/Input.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';
import Tile from '../../services/Tile.js';
import PlayerStateName from '../../enums/PlayerStateName.js';

export default class PlayerState extends State {
	constructor(player) {
		super();
		this.player = player;
		this.collisionDetector = new CollisionDetector(player.map);
	}

	update(dt) {
    this.applyGravity(dt);
    this.updatePosition(dt); // Spring check is now inside here
    
    if (this.player.powerUpManager) {
        this.collisionDetector.checkBoxCollisions(this.player, this.player.powerUpManager);
    }
    if (this.player.spikeManager) {
        const spikeResult = this.collisionDetector.checkSpikeCollisions(this.player, this.player.spikeManager);
        this.player.hitSpikeTop = spikeResult.hitTop;
    }
    if (this.player.enemyManager) {
        this.collisionDetector.checkEnemyCollisions(this.player, this.player.enemyManager, this.player.ringManager);
    }
    // REMOVED: Spring check is now in updatePosition
    if (this.player.signPostManager) {
        this.collisionDetector.checkSignPostCollisions(this.player, this.player.signPostManager);
    }
    
    this.player.currentAnimation.update(dt);
}

	render(context) {
    super.render();
    context.save();
    
    const posX = Math.round(this.player.position.x);
    const posY = Math.round(this.player.position.y);
    
    const centerX = posX + this.player.dimensions.x / 2;
    const centerY = posY + this.player.dimensions.y / 2;
    
    // Apply tilt rotation
    if (this.player.isOnGround && Math.abs(this.player.displayAngle) > 0.01) {
        context.translate(centerX, centerY);
        context.rotate(this.player.displayAngle);
        context.translate(-centerX, -centerY);
    }
    
    if (!this.player.facingRight) {
        context.scale(-1, 1);
        context.translate(
            -posX - this.player.dimensions.x,
            posY
        );
    } else {
        context.translate(posX, posY);
    }
    
    const frame = this.player.currentAnimation.getCurrentFrame();
    const offsetY = this.player.dimensions.y - frame.height + 4;
    
    frame.render(0, offsetY);
    context.restore();
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

		// context.strokeStyle = 'blue';
		// context.strokeRect(
		// 	this.player.position.x,
		// 	this.player.position.y,
		// 	this.player.dimensions.x,
		// 	this.player.dimensions.y
		// );
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
		const WALK_CAP = PlayerConfig.walkCap
		const MAX_SPEED = PlayerConfig.maxSpeed;
		const MIN_MOVE_SPEED = PlayerConfig.minMoveSpeed
		
		const isWalking = this.player.stateMachine.currentState.name === PlayerStateName.Walking;
		const acceleration = isWalking ? PlayerConfig.walkAcceleration : PlayerConfig.runAcceleration;
		
		// IMPROVED: If moving left, apply stronger opposite force for snappy direction change
		if (this.player.velocity.x < 0) {
			// Moving left but want to go right - apply stronger deceleration
			this.player.velocity.x += acceleration * 2; // Double acceleration for direction change
			
			// If we crossed zero, give minimum speed in new direction
			if (this.player.velocity.x > 0 && this.player.velocity.x < MIN_MOVE_SPEED) {
				this.player.velocity.x = MIN_MOVE_SPEED;
			}
		}
		// If starting from stop or moving slowly right, give instant minimum speed
		else if (this.player.velocity.x < MIN_MOVE_SPEED) {
			this.player.velocity.x = MIN_MOVE_SPEED;
		}
		// Normal acceleration when already moving right
		else {
			this.player.velocity.x += acceleration;
		}

		const cap = isWalking ? PlayerConfig.runThreshold : MAX_SPEED;
		this.player.velocity.x = Math.min(this.player.velocity.x, cap);

	}

	moveLeft() {
	const MAX_SPEED = PlayerConfig.maxSpeed;
	const MIN_MOVE_SPEED = PlayerConfig.minMoveSpeed;
	
	const isWalking = this.player.stateMachine.currentState.name === PlayerStateName.Walking;
	const acceleration = isWalking ? PlayerConfig.walkAcceleration : PlayerConfig.runAcceleration;

	if (this.player.velocity.x > 0) {
		this.player.velocity.x -= acceleration * 2;

		if (this.player.velocity.x < 0 && this.player.velocity.x > -MIN_MOVE_SPEED) {
			this.player.velocity.x = -MIN_MOVE_SPEED;
		}
	}
	else if (this.player.velocity.x > -MIN_MOVE_SPEED) {
		this.player.velocity.x = -MIN_MOVE_SPEED;
	}
	else {
		this.player.velocity.x -= acceleration;
	}

	const cap = isWalking ? PlayerConfig.runThreshold : MAX_SPEED;
	this.player.velocity.x = Math.max(this.player.velocity.x, -cap);
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
    
    // Check springs BEFORE vertical collision
    let hitSpring = false;
    if (this.player.springManager) {
        hitSpring = this.collisionDetector.checkSpringCollisions(this.player, this.player.springManager);
    }
    
    // Only check ground collision if we didn't hit a spring
    if (!hitSpring) {
        this.collisionDetector.checkVerticalCollisions(this.player);
    }

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