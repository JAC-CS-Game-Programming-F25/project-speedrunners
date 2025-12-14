import Entity from '../entities/Entity.js';
import PlayerStateName from '../enums/PlayerStateName.js';
import Map from './Map.js'
import Tile from './Tile.js';
import { isSlopeTile } from '../../config/Slopeconfig.js';

export default class CollisionDetector {
    constructor(map) {
        this.map = map;
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
    const tileSize = Tile.SIZE;
    const footY = entity.position.y + entity.dimensions.y;

    const sampleDist = 6;

    const x1 = entity.position.x + entity.dimensions.x / 2 - sampleDist;
    const x2 = entity.position.x + entity.dimensions.x / 2 + sampleDist;

    const y1 = this.findGroundYAtX(x1, footY);
    const y2 = this.findGroundYAtX(x2, footY);

    if (y1 === null || y2 === null) return 0;

    const dx = sampleDist * 2;
    const dy = y2 - y1;

    return Math.atan2(dy, dx);
}

findGroundYAtX(x, footY) {
    const tileSize = Tile.SIZE;
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(footY / tileSize);

    for (let y = tileY - 1; y <= tileY + 1; y++) {
        const tile = this.map.getCollisionTileAt(tileX, y);
        if (!tile || !this.map.isSolidTileAt(tileX, y)) continue;

        const localX = Math.floor(x) % tileSize;
        const h = tile.getHeightAt(localX);
        if (h <= 0) continue;

        return y * tileSize + (tileSize - h);
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
        const entityBottom = entity.position.y + entity.dimensions.y;
        const targetY = groundY - entity.dimensions.y;
        const diff = targetY - entity.position.y;

        if (entity.velocity.y >= 0) {
            if (wasOnGround) {
                // ===============================
                // UPHILL: tiny snap corrections
                // ===============================
                if (diff < 0 && Math.abs(diff) <= 6) {
                    entity.position.y += diff;
                }

                // ===============================
                // DOWNHILL: smoothly follow slope
                // ===============================
                else if (diff > 0) {
    // Smooth downhill, but always move at least a tiny amount
    const followSpeed = Math.max(0.5, Math.abs(entity.velocity.x)); // ensures he keeps up
    entity.position.y += Math.min(diff, followSpeed);
}


                // ===============================
                // FOOT BIAS: gently pull Sonic closer
                // ===============================
                const footBias = 1; // 1px closer to the ground
                if (entityBottom + footBias <= groundY) {
                    entity.position.y += footBias;
                }

                // Safety snap if penetration occurs
                if (entity.position.y + entity.dimensions.y > groundY) {
                    entity.position.y = targetY;
                }

                entity.velocity.y = 0;
                entity.isOnGround = true;
                entity.slopeAngle = this.computeSlopeAngle(entity);
                return;
            }

            // Initial landing
            if (entityBottom >= groundY - 1) {
                entity.position.y = targetY;
                entity.velocity.y = 0;
                entity.isOnGround = true;
                return;
            }
        }

        if (entity.velocity.y < 0) {
            this.checkCeilingCollision(entity);
        }
    } else {
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
        entity.dimensions.x * 0.25,
        entity.dimensions.x * 0.5,
        entity.dimensions.x * 0.75
    ];

    let closestGroundY = null;

    for (const offset of sampleOffsets) {
        const footX = entity.position.x + offset;

        const tileX = Math.floor(footX / tileSize);
        const tileY = Math.floor(footY / tileSize);

        const tilesToCheck = [tileY - 1, tileY, tileY + 1];

        for (const checkTileY of tilesToCheck) {
            if (checkTileY < 0) continue;

            const tile = this.map.getCollisionTileAt(tileX, checkTileY);
            if (!tile || !this.map.isSolidTileAt(tileX, checkTileY)) continue;

            const localX = Math.floor(footX) % tileSize;
            const groundHeight = tile.getHeightAt(localX);
            if (groundHeight <= 0) continue;

            const groundY =
                checkTileY * tileSize + (tileSize - groundHeight);

            if (
                groundY >= footY - tileSize &&
                groundY <= footY + tileSize
            ) {
                if (closestGroundY === null || groundY < closestGroundY) {
                    closestGroundY = groundY;
					
                }
            }
        }
    }

    return closestGroundY;
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
                result.killedEnemy = true;
                player.velocity.y = -300;
                console.log(`${enemy.constructor.name} stomped! (jumping=${isJumping}, damageInvincible=${player.isDamageInvincible})`);
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
                    console.log(`${enemy.constructor.name} destroyed (${player.isInvincible ? "invincible" : "rolling"})`);
                }
            }
            return result;
        }

        // ================= DAMAGE INVINCIBLE =================
        if (player.isDamagedInvincible) {
            console.log("[COLLISION] Player is damage invincible - passing through enemies");
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

                    console.log(`[COLLISION] Knockback: playerX=${playerCenterX}, enemyX=${enemyCenterX}, knockbackRight=${player.knockbackRight}`);

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
                }
                
                this.resolveSpringCollision(player, spring);
            }
        }
    }
    
    checkSpringActivation(player, spring) {
        const playerBottom = player.position.y + player.dimensions.y;
        const springTop = spring.position.y;
        const overlapTop = playerBottom - springTop;
        
        return player.velocity.y > 0 && overlapTop < 10;
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
                console.log("Victory! Sign post hit!");
                break;
            }
        }
    }
}