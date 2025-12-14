import Entity from '../entities/Entity.js';
import PlayerStateName from '../enums/PlayerStateName.js';
import Map from './Map.js'
import Tile from './Tile.js';

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
        if (entity.velocity.x > 0) {
            if (this.isSolidTileInColumn(tileRight, tileTop, tileBottom)) {
                entity.position.x = tileRight * tileSize - entity.dimensions.x;
                entity.velocity.x = 0;
            }
        } else if (entity.velocity.x < 0) {
            if (this.isSolidTileInColumn(tileLeft, tileTop, tileBottom)) {
                entity.position.x = (tileLeft + 1) * tileSize;
                entity.velocity.x = 0;
            }
        }
    }

    checkVerticalCollisions(entity) {
        const tileSize = Tile.SIZE;
        const tileLeft = Math.floor(entity.position.x / tileSize);
        const tileRight = Math.floor(
            (entity.position.x + entity.dimensions.x - 1) / tileSize
        );
        const tileTop = Math.floor(entity.position.y / tileSize);
        const tileBottom = Math.floor(
            (entity.position.y + entity.dimensions.y) / tileSize
        );
        entity.isOnGround = false;
        if (entity.velocity.y >= 0) {
            if (this.isSolidTileInRow(tileBottom, tileLeft, tileRight)) {
                entity.position.y = tileBottom * tileSize - entity.dimensions.y;
                entity.velocity.y = 0;
                entity.isOnGround = true;
            }
        } else if (entity.velocity.y < 0) {
            if (this.isSolidTileInRow(tileTop, tileLeft, tileRight) && !this.isPlatformTileInRow(tileTop, tileLeft, tileRight)) {
                entity.position.y = (tileTop + 1) * tileSize;
                entity.velocity.y = 0;
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
        return result; // Skip damage & solid collision
    }

    // ================= DAMAGE INVINCIBLE =================
    if (player.isDamagedInvincible) {
        console.log("[COLLISION] Player is damage invincible - passing through enemies");
        return result; // Skip side collisions
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
                // Activate the sign post spinning animation
                signPost.activate();
                
                console.log("Victory! Sign post hit!");
                
                // player.stateMachine.change(PlayerStateName.Victory);
                
                break; // Only activate one sign post at a time
            }
        }
    }
}