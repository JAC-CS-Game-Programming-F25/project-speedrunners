import Entity from '../entities/Entity.js';
import PlayerStateName from '../enums/PlayerStateName.js';
import Map from './Map.js'
import Tile from './Tile.js';
import { isSlopeTile } from '../../config/Slopeconfig.js';

export default class CollisionDetector {
    constructor(map, scoreManager) {
        this.map = map;
        this.scoreManager = scoreManager
    }

    // ==================== TILE COLLISIONS ====================
    
checkHorizontalCollisions(entity) {
        const tileSize = Tile.SIZE;
        const tileLeft = Math.floor(entity.position.x / tileSize);
        const tileRight = Math.floor(
            (entity.position.x + entity.dimensions.x) / tileSize
        );
        const tileTop = Math.floor(entity.position.y / tileSize);
        const tileBottom = Math.floor(
            (entity.position.y + entity.dimensions.y - 1) / tileSize
        );
        
        // Check if entity is currently on a slope (use foot position)
        const footX = entity.position.x + entity.dimensions.x / 2;
        const footY = entity.position.y + entity.dimensions.y;
        const footTileX = Math.floor(footX / tileSize);
        const footTileY = Math.floor(footY / tileSize);
        const currentTile = this.map.getCollisionTileAt(footTileX, footTileY);
        const onSlope = currentTile && currentTile.isSlope;
        
        if (entity.velocity.x > 0) {
            // Check if hitting a wall (non-slope solid tile)
            // Be more permissive when on slopes - only check upper body
            if (this.isSolidWallInColumn(tileRight, tileTop, onSlope ? tileTop : tileBottom, entity)) {
                entity.position.x = tileRight * tileSize - entity.dimensions.x;
                entity.velocity.x = 0;
            }
        } else if (entity.velocity.x < 0) {
            if (this.isSolidWallInColumn(tileLeft, tileTop, onSlope ? tileTop : tileBottom, entity)) {
                entity.position.x = (tileLeft + 1) * tileSize;
                entity.velocity.x = 0;
            }
        }
    }

    /**
     * Check for solid wall tiles (excludes slopes to allow walking through them)
     */
    isSolidWallInColumn(x, yStart, yEnd, entity) {
        const tileSize = Tile.SIZE;
        
        for (let y = yStart; y <= yEnd; y++) {
            const tile = this.map.getCollisionTileAt(x, y);
            if (tile && this.map.isSolidTileAt(x, y)) {
                // Always allow passing through slope tiles
                if (tile.isSlope) {
                    continue;
                }
                
                // For non-slope tiles, check if this is actually blocking
                // (not just ground we're standing on)
                const tileTop = y * tileSize;
                const tileBottom = tileTop + tileSize;
                const entityBottom = entity.position.y + entity.dimensions.y;
                
                // If entity's feet are at or below the tile top, this might be ground not a wall
                if (entityBottom <= tileTop + 4) {
                    continue;
                }
                
                return true;
            }
        }
        return false;
    }


computeSlopeAngle(entity) {
    if (!entity.isOnGround) {
        return 0;
    }

    const tileSize = Tile.SIZE;
    const footY = entity.position.y + entity.dimensions.y;
    const centerX = entity.position.x + entity.dimensions.x / 2;

    // Get the tile directly under Sonic's CENTER foot position
    const tileX = Math.floor(centerX / tileSize);
    const tileY = Math.floor((footY + 1) / tileSize); // +1 to check tile we're standing ON

    const standingTile = this.map.getCollisionTileAt(tileX, tileY);
    
    // ONLY calculate angle if the tile we're standing on is a slope
    // Check the tile ID directly
    const standingTileId = standingTile ? standingTile.id : null;
    
    if (!standingTileId || !isSlopeTile(standingTileId)) {
        return 0; // Not on a slope tile - no tilt
    }

    // We're on a slope - now calculate the angle
    const sampleDist = 8;
    const leftX = centerX - sampleDist;
    const rightX = centerX + sampleDist;

    const leftY = this.findGroundYAtX(leftX, footY);
    const rightY = this.findGroundYAtX(rightX, footY);

    if (leftY === null || rightY === null) {
        return 0;
    }

    // Calculate height difference
    const dy = rightY - leftY;
    
    // If difference is tiny, treat as flat
    if (Math.abs(dy) <= 1) {
        return 0;
    }

    const dx = rightX - leftX;
    
    // atan2 gives us the angle
    // Positive dy = right side is LOWER = downhill to right = positive angle (tilt forward when going right)
    // Negative dy = right side is HIGHER = uphill to right = negative angle (tilt back when going right)
    const angle = Math.atan2(dy, dx);

    // Clamp to max tilt
    const maxAngle = Math.PI / 8; // ~22.5 degrees - reduced for subtlety
    return Math.max(-maxAngle, Math.min(angle, maxAngle));
}

findGroundYAtX(x, footY) {
    const tileSize = Tile.SIZE;
    const tileX = Math.floor(x / tileSize);

    for (let offsetY = -1; offsetY <= 1; offsetY++) {
        const tileY = Math.floor(footY / tileSize) + offsetY;

        const tile = this.map.getCollisionTileAt(tileX, tileY);
        if (!tile || !this.map.isSolidTileAt(tileX, tileY)) continue;

        // Safe modulo for localX
        let localX = Math.floor(x) % tileSize;
        if (localX < 0) localX += tileSize;

        const h = tile.getHeightAt(localX);
        if (h <= 0) continue;

        const groundY = tileY * tileSize + (tileSize - h);

        if (Math.abs(groundY - footY) <= 10) {
            return groundY;
        }
    }

    return null;
}




    /**
     * New slope-aware vertical collision using heightmap sampling
     */
checkVerticalCollisions(entity) {
    const tileSize = Tile.SIZE;
    const wasOnGround = entity.isOnGround;
    entity.isOnGround = false;

    const groundY = this.findGroundY(entity);

    if (groundY !== null) {
        const entityBottom = Math.round(entity.position.y + entity.dimensions.y);
        const targetY = groundY - entity.dimensions.y;
        const diff = groundY - entityBottom;

        if (entity.velocity.y >= 0) {
            if (wasOnGround) {
                const speed = Math.abs(entity.velocity.x);
                const maxSnapUp = Math.max(12, speed * 0.8);
                const maxSnapDown = Math.max(16, speed * 0.8);

                if (diff >= -maxSnapUp && diff <= maxSnapDown) {
                    entity.position.y = Math.round(targetY);
                    entity.velocity.y = 0;
                    entity.isOnGround = true;
                    entity.slopeAngle = this.computeSlopeAngle(entity);
                    return;
                }
            }

            // Landing from air - MORE GENEROUS for initial spawn
            // Changed from (-10, 14) to (-16, 20)
            if (diff >= -16 && diff <= 20) {
                entity.position.y = Math.round(targetY);
                entity.velocity.y = 0;
                entity.isOnGround = true;
                entity.slopeAngle = this.computeSlopeAngle(entity);
                return;
            }
        }

        if (entity.velocity.y < 0) {
            this.checkCeilingCollision(entity);
        }
    } else {
        entity.slopeAngle = 0;
        if (entity.velocity.y < 0) {
            this.checkCeilingCollision(entity);
        }
    }
}



    
    /**
     * Extended ground search for slope sticking (looks further down)
     */
    findGroundYExtended(entity, maxDistance) {
        const tileSize = Tile.SIZE;
        const footX = entity.position.x + entity.dimensions.x / 2;
        const footY = entity.position.y + entity.dimensions.y;
        
        const tileX = Math.floor(footX / tileSize);
        const localX = Math.floor(footX) % tileSize;
        
        // Check tiles below
        for (let offset = 0; offset <= Math.ceil(maxDistance / tileSize) + 1; offset++) {
            const checkTileY = Math.floor(footY / tileSize) + offset;
            const tile = this.map.getCollisionTileAt(tileX, checkTileY);
            
            if (tile && this.map.isSolidTileAt(tileX, checkTileY)) {
                const groundHeight = tile.getHeightAt(localX);
                
                if (groundHeight <= 0) continue;
                
                const groundY = checkTileY * tileSize + (tileSize - groundHeight);
                
                // Only return if within max distance and not too far above
                if (groundY <= footY + maxDistance && groundY >= footY - 8) {
                    return Math.round(groundY);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Find the ground Y position under the entity using heightmap sampling
     * @param {Entity} entity 
     * @returns {number|null} The Y position of the ground, or null if no ground
     */
  findGroundY(entity) {
    const tileSize = Tile.SIZE;
    const footY = entity.position.y + entity.dimensions.y;

    const sampleOffsets = [
        entity.dimensions.x * 0.2,
        entity.dimensions.x * 0.4,
        entity.dimensions.x * 0.5,
        entity.dimensions.x * 0.6,
        entity.dimensions.x * 0.8
    ];

    let bestGroundY = null;

    for (const offset of sampleOffsets) {
        const footX = entity.position.x + offset;
        const tileX = Math.floor(footX / tileSize);

        let localX = Math.floor(footX) % tileSize;
        if (localX < 0) localX += tileSize;

        const baseTileY = Math.floor(footY / tileSize);

        for (const checkTileY of [baseTileY - 1, baseTileY, baseTileY + 1]) {
            if (checkTileY < 0) continue;

            const tile = this.map.getCollisionTileAt(tileX, checkTileY);
            if (!tile || !this.map.isSolidTileAt(tileX, checkTileY)) continue;

            const groundHeight = tile.getHeightAt(localX);
            
            // DEBUG: Log tiles that return 0 height but are solid
            if (groundHeight <= 0) {
                console.warn(`[MISSING SLOPE?] Tile ID: ${tile.id} at (${tileX}, ${checkTileY}) returned height 0. isSlope: ${tile.isSlope}, heights: ${tile.heights}`);
                continue;
            }

            const groundY = checkTileY * tileSize + (tileSize - groundHeight);

            if (groundY >= footY - 20 && groundY <= footY + 20) {
                if (bestGroundY === null || groundY < bestGroundY) {
                    bestGroundY = groundY;
                }
            }
        }
    }

    // DEBUG: Log when no ground is found
    if (bestGroundY === null) {
        //console.warn(`[NO GROUND] No ground found for entity at (${entity.position.x.toFixed(1)}, ${entity.position.y.toFixed(1)})`);
    }

    return bestGroundY !== null ? Math.round(bestGroundY) : null;
}

    
    /**
     * Check ceiling collision (for jumping up)
     * Only collides with non-slope solid tiles
     */
    checkCeilingCollision(entity) {
        const tileSize = Tile.SIZE;
        const tileLeft = Math.floor(entity.position.x / tileSize);
        const tileRight = Math.floor(
            (entity.position.x + entity.dimensions.x - 1) / tileSize
        );
        const tileTop = Math.floor(entity.position.y / tileSize);
        
        // Check for solid ceiling (non-slope tiles only)
        for (let x = tileLeft; x <= tileRight; x++) {
            const tile = this.map.getCollisionTileAt(x, tileTop);
            if (tile && this.map.isSolidTileAt(x, tileTop) && !tile.isSlope) {
                entity.position.y = (tileTop + 1) * tileSize;
                entity.velocity.y = 0;
                return;
            }
        }
    }

    isSolidTileInColumn(x, yStart, yEnd) {
        for (let y = yStart; y <= yEnd; y++) {
            if (this.map.isSolidTileAt(x, y)) {
                return true;
            }
        }
        return false;
    }

    isSolidTileInRow(y, xStart, xEnd) {
        for (let x = xStart; x <= xEnd; x++) {
            if (this.map.isSolidTileAt(x, y)) {
                return true;
            }
        }
        return false;
    }
    
    isPlatformTileInRow(y, xStart, xEnd) {
        // Keep this if you have semi-solid platforms
        return false;
    }
    // ==================== ENEMY COLLISIONS ====================
    
    checkEnemyCollisions(player, enemyManager, ringManager = null) {
    let result = {
        tookDamage: false,
        killedEnemy: false
    };

    if (!enemyManager) return result;

    const isJumping = player.stateMachine.currentState.name === PlayerStateName.Jumping;
    const isRolling = player.stateMachine.currentState.name === PlayerStateName.Rolling;

    // ================= TOP COLLISION (Stomp) =================
    for (const enemy of enemyManager.enemies) {
        if (!enemy.isActive || enemy.isDying) continue;

        const topCollision = this.checkTopCollision(player, enemy);

        if (enemy.collidesWith(player) && topCollision &&
            (isJumping || player.isDamagedInvincible)) {
            enemy.die();
            this.scoreManager.add(100);
            result.killedEnemy = true;
            player.velocity.y = -300;
        }
    }

    if (result.killedEnemy) return result;

    // ================= POWERUP INVINCIBLE OR ROLLING =================
    if (player.isInvincible || isRolling) {
        for (const enemy of enemyManager.enemies) {
            if (!enemy.isActive || enemy.isDying) continue;

            if (enemy.collidesWith(player)) {
                enemy.die();
                result.killedEnemy = true;
            }
        }
        return result;
    }

    // ================= DAMAGE INVINCIBLE =================
    if (player.isDamagedInvincible) {
        return result;
    }

    // ================= SIDE COLLISION (Damage) =================
    let hitTakenThisFrame = false;

    for (const enemy of enemyManager.enemies) {
        if (!enemy.isActive || enemy.isDying) continue;

        if (enemy.collidesWith(player)) {
            const sideCollision = this.checkSideCollision(player, enemy);

            if (!hitTakenThisFrame && sideCollision) {
                result.tookDamage = true;

                const playerCenterX = player.position.x + player.dimensions.x / 2;
                const enemyCenterX = enemy.position.x + enemy.dimensions.x / 2;
                player.knockbackRight = playerCenterX > enemyCenterX;

                player.hit();
                hitTakenThisFrame = true;
            }

            this.resolveEnemyCollision(player, enemy);
        }
    }

    return result;
}

    checkTopCollision(player, enemy) {
        const playerBottom = player.position.y + player.dimensions.y;
        const enemyTop = enemy.position.y;
        const overlapTop = playerBottom - enemyTop;
        
        return player.velocity.y > 0 && overlapTop < 15;
    }
    
    checkSideCollision(player, enemy) {
        const playerBottom = player.position.y + player.dimensions.y;
        const enemyTop = enemy.position.y;
        const overlapTop = playerBottom - enemyTop;
        
        return player.velocity.y <= 0 || overlapTop >= 15;
    }
    
    resolveEnemyCollision(player, enemy) {
        const overlapLeft = (player.position.x + player.dimensions.x) - enemy.position.x;
        const overlapRight = (enemy.position.x + enemy.dimensions.x) - player.position.x;
        const overlapTop = (player.position.y + player.dimensions.y) - enemy.position.y;
        const overlapBottom = (enemy.position.y + enemy.dimensions.y) - player.position.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapLeft && player.velocity.x > 0) {
            player.position.x = enemy.position.x - player.dimensions.x;
            player.velocity.x = 0;
        }
        else if (minOverlap === overlapRight && player.velocity.x < 0) {
            player.position.x = enemy.position.x + enemy.dimensions.x;
            player.velocity.x = 0;
        }
    }

    // ==================== SPIKE COLLISIONS ====================
    
    checkSpikeCollisions(player, spikeManager) {
        let result = { hitTop: false };
        
        if (!spikeManager) return result;
        
        for (const spike of spikeManager.spikes) {
            if (!spike.isActive || !spike.isSolid) continue;
            
            if (spike.collidesWith(player)) {
                if (this.checkSpikeTopCollision(player, spike)) {
                    result.hitTop = true;
                }
                
                this.resolveSpikeCollision(player, spike);
            }
        }
        
        return result;
    }
    
    checkSpikeTopCollision(player, spike) {
        const playerBottom = player.position.y + player.dimensions.y;
        const spikeTop = spike.position.y;
        const overlapTop = playerBottom - spikeTop;
        
        return player.velocity.y > 0 && overlapTop < 10;
    }
    
    resolveSpikeCollision(player, spike) {
        const overlapLeft = (player.position.x + player.dimensions.x) - spike.position.x;
        const overlapRight = (spike.position.x + spike.dimensions.x) - player.position.x;
        const overlapTop = (player.position.y + player.dimensions.y) - spike.position.y;
        const overlapBottom = (spike.position.y + spike.dimensions.y) - player.position.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap < 1) return;
        
        if (minOverlap === overlapTop) {
            player.position.y = spike.position.y - player.dimensions.y;
            if (player.velocity.y > 0) {
                player.velocity.y = 0;
            }
            player.isOnGround = true;
        }
        else if (minOverlap === overlapBottom) {
            player.position.y = spike.position.y + spike.dimensions.y;
            if (player.velocity.y < 0) {
                player.velocity.y = 0;
            }
        }
        else if (minOverlap === overlapLeft) {
            if (player.velocity.x > 0) {
                player.position.x = spike.position.x - player.dimensions.x;
                player.velocity.x = 0;
            }
        }
        else if (minOverlap === overlapRight) {
            if (player.velocity.x < 0) {
                player.position.x = spike.position.x + spike.dimensions.x;
                player.velocity.x = 0;
            }
        }
    }

    // ==================== SPRING COLLISIONS ====================
    
checkSpringCollisions(player, springManager) {
    if (!springManager) return;
    
    for (const spring of springManager.springs) {
        if (!spring.isActive || !spring.isSolid) continue;
        
        if (spring.collidesWith(player)) {
            if (this.checkSpringActivation(player, spring)) {
                spring.activate(player);
                // Don't resolve collision after bouncing - player is launching
                continue;
            }
            
            // Only resolve collision if spring wasn't activated
            // (e.g., hitting from side or already compressed)
            if (!spring.isCompressed) {
                this.resolveSpringCollision(player, spring);
            }
        }
    }
}
    
   checkSpringActivation(player, spring) {
    const playerBottom = player.position.y + player.dimensions.y;
    const springTop = spring.position.y;
    const overlapTop = playerBottom - springTop;
    
    // More lenient: activate if falling OR just landed, and overlap is reasonable
    return player.velocity.y >= 0 && overlapTop > 0 && overlapTop < 16;
}
    
    resolveSpringCollision(player, spring) {
        const overlapLeft = (player.position.x + player.dimensions.x) - spring.position.x;
        const overlapRight = (spring.position.x + spring.dimensions.x) - player.position.x;
        const overlapTop = (player.position.y + player.dimensions.y) - spring.position.y;
        const overlapBottom = (spring.position.y + spring.dimensions.y) - player.position.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap < 1) return;
        
        if (minOverlap === overlapTop) {
            player.position.y = spring.position.y - player.dimensions.y;
        }
        else if (minOverlap === overlapBottom) {
            player.position.y = spring.position.y + spring.dimensions.y;
            if (player.velocity.y < 0) {
                player.velocity.y = 0;
            }
        }
        else if (minOverlap === overlapLeft) {
            if (player.velocity.x > 0) {
                player.position.x = spring.position.x - player.dimensions.x;
                player.velocity.x = 0;
            }
        }
        else if (minOverlap === overlapRight) {
            if (player.velocity.x < 0) {
                player.position.x = spring.position.x + spring.dimensions.x;
                player.velocity.x = 0;
            }
        }
    }

    // ==================== BOX COLLISIONS ====================
    
    checkBoxCollisions(player, powerUpManager) {
        if (!powerUpManager) return;
        
        const boxes = powerUpManager.boxes;
        
        for (const box of boxes) {
            if (box.collidesWith(player)) {
                const overlapLeft = (player.position.x + player.dimensions.x) - box.position.x;
                const overlapRight = (box.position.x + box.dimensions.x) - player.position.x;
                const overlapTop = (player.position.y + player.dimensions.y) - box.position.y;
                const overlapBottom = (box.position.y + box.dimensions.y) - player.position.y;
                
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                if (minOverlap === overlapTop) {
                    if (player.canHitBox() && !box.isHit) {
                        const powerUp = box.hit();
                        
                        if (powerUp) {
                            if (powerUp.duration === 0) {
                                powerUp.activate(player);
                                player.map.ringManager.totalRingsCollected += powerUp.getRingAmount();
                            } else {
                                powerUp.activate(player);
                                powerUpManager.activePowerUps.push(powerUp);
                            }
                        }
                        
                        player.velocity.y = -200;
                    }
                }
                
                if (box.isSolid) {
                    if (minOverlap === overlapTop) {
                        player.position.y = box.position.y - player.dimensions.y;
                        player.velocity.y = 0;
                        player.isOnGround = true;  
                    }
                    else if (minOverlap === overlapBottom) {
                        player.position.y = box.position.y + box.dimensions.y;
                        player.velocity.y = 0;
                    }
                    else if (minOverlap === overlapLeft) {
                        player.position.x = box.position.x - player.dimensions.x;
                    }
                    else if (minOverlap === overlapRight) {
                        player.position.x = box.position.x + box.dimensions.x;
                    }
                }
            }
        }
    }

    checkSignPostCollisions(player, signPostManager) {
        if (!signPostManager) return;
        
        for (const signPost of signPostManager.signPosts) {
            if (!signPost.isActive || signPost.isActivated) continue;
            
            if (signPost.collidesWith(player)) {
                signPost.activate(player);
             //   console.log("Victory! Sign post hit!");
                break;
            }
        }
    }
}