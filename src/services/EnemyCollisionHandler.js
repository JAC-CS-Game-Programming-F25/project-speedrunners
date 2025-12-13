/**
 * Helper class to handle ALL enemy-player collision logic
 * Handles solid collision, kill detection, and damage detection
 */
export default class EnemyCollisionHandler {
    /**
     * Check and resolve collisions between player and enemies
     * Handles killing, damage, and solid collision in one place
     * @param {Player} player 
     * @param {EnemyManager} enemyManager 
     * @param {RingManager} ringManager - For losing rings on damage
     * @returns {Object} { tookDamage: boolean, killedEnemy: boolean }
     */
    static checkCollisions(player, enemyManager, ringManager = null) {
        let result = {
            tookDamage: false,
            killedEnemy: false
        };
        
        if (!enemyManager) return result;
        
        for (const enemy of enemyManager.enemies) {
            if (!enemy.isActive || enemy.isDying) continue;
            
            if (enemy.collidesWith(player)) {
                // 1. Check if player is invincible - kills from any direction
                if (player.isInvincible) {
                    enemy.die();
                    result.killedEnemy = true;
                    console.log(`${enemy.constructor.name} destroyed by invincible Sonic!`);
                    continue; // Skip solid collision when invincible
                }
                
                // 2. Check if player jumped on enemy (top collision = kill)
                if (this.checkTopCollision(player, enemy)) {
                    enemy.die();
                    result.killedEnemy = true;
                    
                    // Give player a bounce
                    player.velocity.y = -300;
                    
                    console.log(`${enemy.constructor.name} destroyed!`);
                    continue; // Skip damage/solid collision if killed
                }
                
                // 3. Check if player hit enemy from side (side collision = damage)
                if (this.checkSideCollision(player, enemy)) {
                    result.tookDamage = true;
                    
                    console.log("PLACEHOLDER: Player damage state triggered");
                    
                    // Lose rings if available
                    if (ringManager && ringManager.getRingCount() > 0) {
                        ringManager.loseRings(
                            player.position.x + player.dimensions.x / 2,
                            player.position.y + player.dimensions.y / 2,
                            10
                        );
                    }
                    
                    // Don't break - still need solid collision resolution
                }
                
                // 4. Resolve solid collision (blocks player from moving through enemy)
                this.resolveCollision(player, enemy);
            }
        }
        
        return result;
    }
    
    /**
     * Check if player jumped on enemy from above
     * @param {Player} player 
     * @param {Enemy} enemy 
     * @returns {boolean}
     */
    static checkTopCollision(player, enemy) {
        const playerBottom = player.position.y + player.dimensions.y;
        const enemyTop = enemy.position.y;
        const overlapTop = playerBottom - enemyTop;
        
        // Player must be falling and overlap should be small (hitting from top)
        return player.velocity.y > 0 && overlapTop < 15;
    }
    
    /**
     * Check if player hit enemy from side
     * @param {Player} player 
     * @param {Enemy} enemy 
     * @returns {boolean}
     */
    static checkSideCollision(player, enemy) {
        const playerBottom = player.position.y + player.dimensions.y;
        const enemyTop = enemy.position.y;
        const overlapTop = playerBottom - enemyTop;
        
        // Side collision if overlap is large or player not falling
        return player.velocity.y <= 0 || overlapTop >= 15;
    }
    
    /**
     * Resolve solid collision with enemy (only from sides, not from top)
     * @param {Player} player 
     * @param {Enemy} enemy 
     */
    static resolveCollision(player, enemy) {
        const overlapLeft = (player.position.x + player.dimensions.x) - enemy.position.x;
        const overlapRight = (enemy.position.x + enemy.dimensions.x) - player.position.x;
        const overlapTop = (player.position.y + player.dimensions.y) - enemy.position.y;
        const overlapBottom = (enemy.position.y + enemy.dimensions.y) - player.position.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        // Don't block jumping on top of enemies (that's for killing them)
        // Only resolve side collisions
        if (minOverlap === overlapLeft && player.velocity.x > 0) {
            // Hit from left - only if moving right
            player.position.x = enemy.position.x - player.dimensions.x;
            player.velocity.x = 0;
        }
        else if (minOverlap === overlapRight && player.velocity.x < 0) {
            // Hit from right - only if moving left
            player.position.x = enemy.position.x + enemy.dimensions.x;
            player.velocity.x = 0;
        }
    }
}