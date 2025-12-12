/**
 * Helper class to handle solid spike collisions
 */
export default class SpikeCollisionHandler {
    /**
     * Check and resolve collisions between player and spikes
     * @param {Player} player 
     * @param {SpikeManager} spikeManager 
     */
    static checkCollisions(player, spikeManager) {
        if (!spikeManager) return;
        
        for (const spike of spikeManager.spikes) {
            if (!spike.isActive || !spike.isSolid) continue;
            
            if (spike.collidesWith(player)) {
                this.resolveCollision(player, spike);
            }
        }
    }
    
    /**
     * Resolve solid collision with spike
     * @param {Player} player 
     * @param {Spike} spike 
     */
    static resolveCollision(player, spike) {
        const overlapLeft = (player.position.x + player.dimensions.x) - spike.position.x;
        const overlapRight = (spike.position.x + spike.dimensions.x) - player.position.x;
        const overlapTop = (player.position.y + player.dimensions.y) - spike.position.y;
        const overlapBottom = (spike.position.y + spike.dimensions.y) - player.position.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        // Only resolve if overlap is significant (more than 1 pixel)
        if (minOverlap < 1) return;
        
        // Resolve collision based on smallest overlap
        if (minOverlap === overlapTop) {
            // Hit from top - land on spike
            player.position.y = spike.position.y - player.dimensions.y;
            if (player.velocity.y > 0) {
                player.velocity.y = 0;
            }
            player.isOnGround = true;
        }
        else if (minOverlap === overlapBottom) {
            // Hit from bottom
            player.position.y = spike.position.y + spike.dimensions.y;
            if (player.velocity.y < 0) {
                player.velocity.y = 0;
            }
        }
        else if (minOverlap === overlapLeft) {
            // Hit from left - only block if moving right
            if (player.velocity.x > 0) {
                player.position.x = spike.position.x - player.dimensions.x;
                player.velocity.x = 0;
            }
        }
        else if (minOverlap === overlapRight) {
            // Hit from right - only block if moving left
            if (player.velocity.x < 0) {
                player.position.x = spike.position.x + spike.dimensions.x;
                player.velocity.x = 0;
            }
        }
    }
}