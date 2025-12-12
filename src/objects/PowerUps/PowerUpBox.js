import Sprite from "../../../lib/Sprite.js";
import Entity from "../../entities/Entity.js";
import { images } from "../../globals.js";
import {ImageName} from "../../enums/ImageName.js";
import Animation from "../../../lib/Animation.js";
import PowerUpFactory from "../../services/PowerUpFactory.js";

export default class PowerUpBox extends Entity {
    static WIDTH = 32;
    static HEIGHT = 32;
    static POWERUP_RISE_SPEED = 150;
    static POWERUP_RISE_DISTANCE = 80;
    static EXPLOSION_DURATION = 0.15;

    constructor(x, y, powerUpType = 'random') {
        super(x, y, PowerUpBox.WIDTH, PowerUpBox.HEIGHT);
        
        // Randomly select powerup if 'random' is specified
        if (powerUpType === 'random') {
            this.powerUpType = PowerUpFactory.getRandomType();
        } else {
            this.powerUpType = powerUpType;
        }
        
        this.isHit = false;
        this.isSolid = true;
        this.powerUpReleased = false;
        this.releasedPowerUp = null;
        this.powerUpRiseDistance = 0;
        
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionComplete = false;
        
        this.boxSprite = this.generateBoxSprite();
        this.emptyBoxSprite = this.generateEmptyBoxSprite();
        this.iconSprite = this.generateIconSprite(this.powerUpType);
        this.explosionSprites = this.generateExplosionSprites();
        this.explosionAnimation = new Animation([0, 1], PowerUpBox.EXPLOSION_DURATION);
    }

    generateBoxSprite() {
        const spriteSheet = images.get(ImageName.GameObjects);
        return new Sprite(spriteSheet, 8, 469, 32, 32);
    }

    generateEmptyBoxSprite() {
        const spriteSheet = images.get(ImageName.GameObjects);
        return new Sprite(spriteSheet, 48, 485, 32, 16);
    }

    generateExplosionSprites() {
        const spriteSheet = images.get(ImageName.GameObjects);
        return [
            new Sprite(spriteSheet, 40, 662, 32, 32),
            new Sprite(spriteSheet, 80, 662, 32, 32)
        ];
    }

    generateIconSprite(type) {
        const spriteSheet = images.get(ImageName.GameObjects);
        let x, y;
        
        switch(type) {
            case 'speed':
                x = 8; 
                y = 548;
                break;
            case 'invincibility':
                x = 56;
                y = 548;
                break;
            case 'rings':
                x = 80;
                y = 524;
                break;
            default:
                x = 8;
                y = 548;
        }
        
        return new Sprite(spriteSheet, x, y, 16, 16);
    }
    
    hit() {
        if (this.isHit) return null;
        
        this.isHit = true;
        this.isSolid = false;
        this.isExploding = true;
        this.explosionTimer = 0;
        
        // Use PowerUpFactory to create the powerup
        const powerupX = this.position.x + 8;
        const powerupY = this.position.y;
        
        this.releasedPowerUp = PowerUpFactory.create(
            this.powerUpType, 
            powerupX, 
            powerupY,
            { ringAmount: 10 } // Options for rings powerup
        );
        
        return this.releasedPowerUp;
    }

    update(dt) {
        if (this.isExploding && !this.explosionComplete) {
            this.explosionTimer += dt;
            this.explosionAnimation.update(dt);
            
            if (this.explosionTimer >= PowerUpBox.EXPLOSION_DURATION * 2) {
                this.explosionComplete = true;
                this.isExploding = false;
            }
        }
        
        if (this.explosionComplete && !this.powerUpReleased && this.releasedPowerUp) {
            this.powerUpRiseDistance += PowerUpBox.POWERUP_RISE_SPEED * dt;
            this.releasedPowerUp.position.y = this.position.y - this.powerUpRiseDistance;
            
            if (this.powerUpRiseDistance >= PowerUpBox.POWERUP_RISE_DISTANCE) {
                this.powerUpReleased = true;
            }
        }
    }

    renderBox(context) {
        if (this.isExploding) {
            const currentFrame = this.explosionAnimation.getCurrentFrame();
            this.explosionSprites[currentFrame].render(
                Math.floor(this.position.x),
                Math.floor(this.position.y)
            );
            return;
        }
        
        if (this.explosionComplete) {
            this.emptyBoxSprite.render(
                Math.floor(this.position.x),
                Math.floor(this.position.y + 16)
            );
            return;
        }
        
        this.boxSprite.render(
            Math.floor(this.position.x),
            Math.floor(this.position.y)
        );
        
        if (!this.isHit) {
            this.iconSprite.render(
                Math.floor(this.position.x + 8),
                Math.floor(this.position.y + 6)
            );
        }
    }

    render(context) {
        this.renderBox(context);
    }

    getReleasedPowerUp() {
        if (this.powerUpReleased && this.releasedPowerUp) {
            const powerup = this.releasedPowerUp;
            this.releasedPowerUp = null;
            return powerup;
        }
        return null;
    }

    checkHit(player) {
        if (this.isHit) return false;
        
        if (this.collidesWith(player)) {
            const collisionDir = this.getCollisionDirection(player);
            if (collisionDir === 'bottom') {
                return true;
            }
        }
        return false;
    }
}