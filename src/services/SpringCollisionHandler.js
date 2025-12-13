/**
 * Helper class to handle solid spring collisions AND bounce activation
 */
export default class SpringCollisionHandler {
    /**
     * Check and resolve collisions between player and springs
     * Also activates springs when player lands on them
     * @param {Player} player 
     * @param {SpringManager} springManager 
     */
    static checkCollisions(player, springManager) {
        if (!springManager) return;
        
        for (const spring of springManager.springs) {
            if (!spring.isActive || !spring.isSolid) continue;
            
            if (spring.collidesWith(player)) {
                // Check if player is landing on spring from above (activation check)
                if (this.checkBounceActivation(player, spring)) {
                    spring.activate(player);
                }
                
                // Handle solid collision
                this.resolveCollision(player, spring);
            }
        }
    }
    
    /**
     * Check if player should activate spring (landing from above)
     * @param {Player} player 
     * @param {Spring} spring 
     * @returns {boolean}
     */
    static checkBounceActivation(player, spring) {
        const playerBottom = player.position.y + player.dimensions.y;
        const springTop = spring.position.y;
        const overlapTop = playerBottom - springTop;
        
        // Player must be falling and hitting from top
        return player.velocity.y > 0 && overlapTop < 10;
    }
    
    /**
     * Resolve solid collision with spring
     * @param {Player} player 
     * @param {Spring} spring 
     */
    static resolveCollision(player, spring) {
        const overlapLeft = (player.position.x + player.dimensions.x) - spring.position.x;
        const overlapRight = (spring.position.x + spring.dimensions.x) - player.position.x;
        const overlapTop = (player.position.y + player.dimensions.y) - spring.position.y;
        const overlapBottom = (spring.position.y + spring.dimensions.y) - player.position.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        // Only resolve if overlap is significant (more than 1 pixel)
        if (minOverlap < 1) return;
        
        // Resolve collision based on smallest overlap
        if (minOverlap === overlapTop) {
            // Hit from top - land on spring (but don't set velocity here, spring.activate does that)
            player.position.y = spring.position.y - player.dimensions.y;
            // Don't set isOnGround for springs - we want player to keep falling into it
        }
        else if (minOverlap === overlapBottom) {
            // Hit from bottom
            player.position.y = spring.position.y + spring.dimensions.y;
            if (player.velocity.y < 0) {
                player.velocity.y = 0;
            }
        }
        else if (minOverlap === overlapLeft) {
            // Hit from left - only block if moving right
            if (player.velocity.x > 0) {
                player.position.x = spring.position.x - player.dimensions.x;
                player.velocity.x = 0;
            }
        }
        else if (minOverlap === overlapRight) {
            // Hit from right - only block if moving left
            if (player.velocity.x < 0) {
                player.position.x = spring.position.x + spring.dimensions.x;
                player.velocity.x = 0;
            }
        }
    }
}