/**
 * Helper class to handle solid enemy collisions
 */
export default class EnemyCollisionHandler {
    /**
     * Check and resolve solid collisions between player and enemies
     * @param {Player} player 
     * @param {EnemyManager} enemyManager 
     */
    static checkCollisions(player, enemyManager) {
        if (!enemyManager) return;
        
        for (const enemy of enemyManager.enemies) {
            if (!enemy.isActive || enemy.isDying) continue;
            
            if (enemy.collidesWith(player)) {
                if (player.isInvincible ) {
                    continue;
                }   
                this.resolveCollision(player, enemy);
            }
        }
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