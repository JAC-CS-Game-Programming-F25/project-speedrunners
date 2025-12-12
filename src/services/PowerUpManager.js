import GameObjectFactory from "./GameObjectFactory.js";

export default class PowerUpManager {
    constructor() {
        this.boxes = [];
        this.activePowerUps = [];
        this.releasedPowerUps = [];
        this.powerUpAddedToManager = false;
    }

    /**
     * Add a powerup box at position
     * @param {number} x 
     * @param {number} y 
     * @param {string} type - 'speed', 'invincibility', 'rings', or 'random'
     */
    addBox(x, y, type) {
        this.boxes.push(GameObjectFactory.createPowerUpBox(x, y, type));
    }

    /**
     * Check if player collides with any solid boxes
     * @param {Player} player 
     * @returns {PowerUpBox|null} The box that was collided with, or null
     */
    checkBoxCollisions(player) {
        for (const box of this.boxes) {
            if (box.isSolid && box.collidesWith(player)) {
                return box;
            }
        }
        return null;
    }

    /**
     * Get all solid boxes for collision checking
     * @returns {PowerUpBox[]}
     */
    getSolidBoxes() {
        return this.boxes.filter(box => box.isSolid);
    }

    update(dt, player) {
        // Update all boxes
        this.boxes.forEach(box => {
            box.update(dt);
        });

        // Update active powerups (timers)
        this.activePowerUps = this.activePowerUps.filter(powerUp => {
            powerUp.update(dt, player);
            return !powerUp.isExpired();
        });
    }

    render(context) {
        // Only render the boxes themselves
        this.boxes.forEach(box => {
            box.renderBox(context);
        });
    }

    renderPowerUps(context) {
        // Render rising powerups from boxes
        this.boxes.forEach(box => {
            if (box.explosionComplete && !box.powerUpReleased && box.releasedPowerUp) {
                box.releasedPowerUp.render(context);
            }
        });
        
        // Render collected powerups
        this.releasedPowerUps.forEach(powerUp => powerUp.render(context));
    }

    renderReleasedPowerUps(context) {
        this.releasedPowerUps.forEach(powerUp => powerUp.render(context));
    }

    /**
     * Get and consume any instant powerups (like rings)
     */
    getInstantPowerUps() {
        const instant = [];
        this.boxes.forEach(box => {
            if (box.releasedPowerUp && box.releasedPowerUp.justCollected) {
                instant.push(box.releasedPowerUp);
                box.releasedPowerUp.justCollected = false;
            }
        });
        return instant;
    }

    /**
     * Check if player has specific powerup active
     */
    hasPowerUp(player, type) {
        switch(type) {
            case 'speed':
                return player.hasSpeedShoes || false;
            case 'invincibility':
                return player.isInvincible || false;
            default:
                return false;
        }
    }

    /**
     * Get remaining time for a powerup
     */
    getPowerUpTimeRemaining(type) {
        const powerUp = this.activePowerUps.find(p => {
            if (type === 'speed') return p.constructor.name === 'SpeedShoesPowerUp';
            if (type === 'invincibility') return p.constructor.name === 'InvincibilityPowerUp';
            return false;
        });
        
        return powerUp ? Math.max(0, powerUp.duration - powerUp.timer) : 0;
    }

    reset() {
        this.boxes = [];
        this.releasedPowerUps = [];
        this.activePowerUps.forEach(powerUp => {
            if (powerUp.deactivate) {
                // Deactivate but we don't have player reference here
                // Player should reset these flags themselves
            }
        });
        this.activePowerUps = [];
    }
}