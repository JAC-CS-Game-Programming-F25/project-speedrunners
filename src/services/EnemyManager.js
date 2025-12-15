import EnemyFactory from "./EnemyFactory.js";

/**
 * Manages all enemies in the game
 */
export default class EnemyManager {
    constructor() {
        this.enemies = [];
    }

    /**
     * Add an enemy at the specified position
     * @param {string} type - Enemy type ('buzzbomber' or 'crab')
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    addEnemy(type, x, y) {
        this.enemies.push(EnemyFactory.create(type, x, y));
    }

    /**
     * Add multiple enemies in a horizontal line
     * @param {string} type - Enemy type
     * @param {number} startX - Starting X position
     * @param {number} y - Y position
     * @param {number} count - Number of enemies
     * @param {number} spacing - Space between enemies (default 80)
     */
    addEnemyLine(type, startX, y, count, spacing = 80) {
        for (let i = 0; i < count; i++) {
            this.addEnemy(type, startX + (i * spacing), y);
        }
    }

    /**
     * Update all enemies
     * @param {number} dt - Delta time
     * @param {SpikeManager} spikeManager - For enemy collision with spikes
     * @param {PowerUpManager} powerUpManager - For enemy collision with boxes
     */
    update(dt, spikeManager = null, powerUpManager = null) {
        this.enemies.forEach(enemy => {
            // Store old position
            const oldX = enemy.position.x;
            
            // Update enemy
            enemy.update(dt);
            
            // Check collisions with spikes and powerup boxes
            if (this.checkEnemySolidCollisions(enemy, spikeManager, powerUpManager)) {
                // Hit something, reverse direction
                enemy.position.x = oldX;
                enemy.movingRight = !enemy.movingRight;
            }
        });
        
        this.cleanupDeadEnemies();
    }
    
    /**
     * Check if enemy collides with solid objects
     * @param {Enemy} enemy
     * @param {SpikeManager} spikeManager
     * @param {PowerUpManager} powerUpManager
     * @returns {boolean} True if colliding
     */
    checkEnemySolidCollisions(enemy, spikeManager, powerUpManager) {
        // Check collision with spikes
        if (spikeManager) {
            for (const spike of spikeManager.spikes) {
                if (spike.isActive && spike.isSolid && spike.collidesWith(enemy)) {
                    return true;
                }
            }
        }
        
        // Check collision with powerup boxes
        if (powerUpManager) {
            for (const box of powerUpManager.boxes) {
                if (box.isSolid && box.collidesWith(enemy)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Render all enemies
     * @param {CanvasRenderingContext2D} context
     */
    render(context) {
        this.enemies.forEach(enemy => enemy.render(context));
    }

    /**
     * Check collisions with player
     * @param {Player} player
     * @param {RingManager} ringManager
     * @returns {Object} { tookDamage: boolean, killedEnemy: boolean }
     */
    checkCollisions(player, ringManager) {
        let result = {
            tookDamage: false,
            killedEnemy: false
        };
        for (const enemy of this.enemies) {
            if (!enemy.isActive || enemy.isDying) continue;
            
            // Check for collision
            if (!enemy.collidesWith(player)) continue

            // If player is invincible, kill enemy from any direction
            if (player.isInvincible) {
                enemy.die();
                result.killedEnemy = true;
               // console.log(`${enemy.constructor.name} destroyed by invincible Sonic!`);
                continue;
            }

            if (enemy.checkTopCollision(player)) {
                enemy.die();
                result.killedEnemy = true;
                // Give player a bounce
                player.velocity.y = -300;
                //console.log(`${enemy.constructor.name} destroyed!`);
                continue; 
            }

            // Check if player hit enemy from side (take damage)
            if (enemy.checkSideCollision(player) && !player.isDamagedInvincible) {
                result.tookDamage = true;
                player.hit()
                
                // Lose rings if not already damaged this frame
                if (ringManager && ringManager.getRingCount() > 0) {
                    ringManager.loseRings(
                        player.position.x + player.dimensions.x / 2,
                        player.position.y + player.dimensions.y / 2,
                        10
                    );
                }
                
                break; 
            }
            
        }

        return result;
    }

    /**
     * Remove dead enemies from array
     */
    cleanupDeadEnemies() {
        this.enemies = this.enemies.filter(enemy => enemy.isActive || enemy.isDying);
    }

    /**
     * Get count of active enemies
     * @returns {number}
     */
    getActiveCount() {
        return this.enemies.filter(e => e.isActive && !e.isDying).length;
    }

    /**
     * Reset all enemies
     */
    reset() {
        this.enemies = [];
    }
}