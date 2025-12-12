import Layer from "./Layer.js";              
import Colour from "../enums/Colour.js";        
import Player from "../entities/player/Player.js";       
import Sprite from "../../lib/Sprite.js";        
import Tile from "./Tile.js";                     
import { ImageName } from "../enums/ImageName.js";  
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    images,
} from "../globals.js";  
import Camera from "./Camera.js";
import RingManager from "./RingManager.js";
import SpikeManager from "./SpikeManager.js";
import PowerUpManager from "./PowerUpManager.js";
import EnemyManager from "./EnemyManager.js";

export default class Map {
    static BACKGROUND_LAYER = 1;
    static COLLISION_LAYER = 0;
    
    constructor(mapDefinition) {
        this.width = mapDefinition.width;
        this.height = mapDefinition.height;
        this.tilesets = mapDefinition.tilesets;
        
        const sprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Tiles),
            Tile.SIZE,
            Tile.SIZE,
            16  
        );
        
        // Map all layers
        this.layers = mapDefinition.layers.map(
            (layerData) => new Layer(layerData, sprites)
        );
        
        // Store references to specific layers
        this.backgroundLayer = this.layers[Map.BACKGROUND_LAYER];
        this.collisionLayer = this.layers[Map.COLLISION_LAYER];
        
        // Position Sonic
        this.player = new Player(32, 188, 32, 40, this);
        
        this.playerIsHit = false;
        this.playerDamageTimer = 0;
        this.playerDamageCooldown = 1.0;
        
        // Create camera
        this.camera = new Camera(
            this.player,
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
            this.width * Tile.SIZE,
            this.height * Tile.SIZE
        );
        
        // Create ring manager and add some rings
        this.ringManager = new RingManager();
        this.setupRings();
        
        // Create spike manager and add some spikes
        this.spikeManager = new SpikeManager();
        this.setupSpikes();
        
        // Create powerup manager and add some boxes
        this.powerUpManager = new PowerUpManager();
        this.setupPowerUps();
        
        // Create enemy manager and add some enemies
        this.enemyManager = new EnemyManager();
        this.setupEnemies();
        
        // Give player access to managers for collision checks
        this.player.powerUpManager = this.powerUpManager;
        this.player.spikeManager = this.spikeManager;
        this.player.enemyManager = this.enemyManager;
    }
    
    setupRings() {
        // Add some example rings - adjust positions as needed
        
        this.ringManager.addRingArc(300, 180, 40, 7);
        
        this.ringManager.addRing(450, 192);
        this.ringManager.addRing(480, 192);
        this.ringManager.addRing(510, 192);
    }
    
    setupSpikes() {
        
        // Single spikes as obstacles
        this.spikeManager.addSpike(400, 192);
        this.spikeManager.addSpike(450, 192);
    }
    
    setupPowerUps() {
        
        // Random powerup boxes (will randomly choose between speed, invincibility, and rings)
        this.powerUpManager.addBox(500, 192, 'speed');
        this.powerUpManager.addBox(700, 192, 'invincibility');
        
    }
    
    setupEnemies() {
        // Add some example enemies - adjust positions as needed
        
        this.enemyManager.addEnemy('buzzbomber', 300, 192);
        this.enemyManager.addEnemy('buzzbomber', 600, 192);
        
        this.enemyManager.addEnemy('crab', 250, 192);
        this.enemyManager.addEnemy('crab', 550, 192);
        
    }
    
    update(dt) {
        // Player update now handles spike/enemy solid collisions internally
        this.player.update(dt);
        
        this.camera.update(dt);
        this.ringManager.update(dt);
        this.spikeManager.update(dt);
        this.powerUpManager.update(dt, this.player);
        
        // Pass spike and powerup managers so enemies can check collisions
        this.enemyManager.update(dt, this.spikeManager, this.powerUpManager);
        
        // Update damage timer
        if (this.playerDamageTimer > 0) {
            this.playerDamageTimer -= dt;
        }
        
        // Check ring collisions
        this.ringManager.checkCollisions(this.player);
        
        // Handle instant powerups (extra rings)
        const instantPowerUps = this.powerUpManager.getInstantPowerUps();
        instantPowerUps.forEach(powerUp => {
            const ringAmount = powerUp.getRingAmount();
            this.ringManager.totalRingsCollected += ringAmount;
        });
        
        // Check spike collisions (only if not invincible and not recently damaged)
        if (!this.player.isInvincible && this.playerDamageTimer <= 0) {
          // Check spike collisions (placeholder - implement damage later)
          if (this.spikeManager.checkCollisions(this.player)) {
              if (!this.playerIsHit && !this.player.isInvincible) {
                  this.playerIsHit = true;
                  if (this.ringManager.getRingCount() > 0) {
                      this.player.hit()
                    
                    // Make rings bounce out when hit!
                    this.ringManager.loseRings(
                        this.player.position.x + this.player.dimensions.x / 2,
                        this.player.position.y + this.player.dimensions.y / 2,
                        10  
                    );
                    console.log("Player hit a spike!");
                }
            } else {
                this.player.die()
            }
        }
        
        // Check enemy collisions
        if (this.player.isInvincible || this.playerDamageTimer <= 0) {
            const enemyCollision = this.enemyManager.checkCollisions(this.player, this.ringManager);
            
            // Only apply damage if NOT invincible
            if (enemyCollision.tookDamage && !this.player.isInvincible) {
                this.playerDamageTimer = this.playerDamageCooldown;
                console.log("Player hit by enemy!");
            }
            
            if (enemyCollision.killedEnemy) {
                console.log("Enemy destroyed!");
            }
        }
    }
    
    render() {
        this.camera.applyTransform(context);
        this.collisionLayer.render();
        this.spikeManager.render(context);
        this.powerUpManager.render(context); 
        this.enemyManager.render(context); 
        this.ringManager.render(context);
        this.player.render(context);
        
        this.powerUpManager.renderPowerUps(context);
        
        this.backgroundLayer.render();
        this.camera.resetTransform(context);
        
        this.renderUI();
    }
    
    renderUI() {
        context.save();
        context.fillStyle = '#FFD700';
        context.font = '20px Arial';
        context.fillText(`Rings: ${this.ringManager.getRingCount()}`, 10, 25);
        
        // Show hit indicator (placeholder)
        if (this.playerIsHit || this.playerDamageTimer > 0) {
            context.fillStyle = '#FF0000';
            context.fillText('HIT!', 10, 50);
        }
        
        // Show active powerups
        let yOffset = 75;
        if (this.player.hasSpeedShoes) {
            const timeLeft = this.powerUpManager.getPowerUpTimeRemaining('speed');
            context.fillStyle = '#00FFFF';
            context.fillText(`Speed: ${Math.ceil(timeLeft)}s`, 10, yOffset);
            yOffset += 25;
        }
        
        if (this.player.isInvincible) {
            const timeLeft = this.powerUpManager.getPowerUpTimeRemaining('invincibility');
            context.fillStyle = '#FFD700';
            context.fillText(`Invincible: ${Math.ceil(timeLeft)}s`, 10, yOffset);
            yOffset += 25;
        }
        
        // Show enemy count
        context.fillStyle = '#FF6B6B';
        context.fillText(`Enemies: ${this.enemyManager.getActiveCount()}`, 10, yOffset);
        
        context.restore();
    }
    
    static renderGrid() {
        context.save();
        context.strokeStyle = Colour.White;
        for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
            context.beginPath();
            context.moveTo(0, y * Tile.SIZE);
            context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
            context.closePath();
            context.stroke();
            for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
                context.beginPath();
                context.moveTo(x * Tile.SIZE, 0);
                context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
                context.closePath();
                context.stroke();
            }
        }
        context.restore();
    }
    
    getTileAt(layerIndex, col, row) {
        return this.layers[layerIndex]?.getTile(col, row);
    }
    
    isSolidTileAt(col, row) {
        if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
            return false;
        }
        
        const tile = this.collisionLayer.getTile(col, row);
        
        return tile !== null && tile.id !== undefined && tile.id !== -1;
    }
}