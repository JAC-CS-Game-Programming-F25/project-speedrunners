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
import SpringManager from "./SpringManager.js";

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
        
        // Player damage flag (placeholder for damage state implementation)
        this.playerIsHit = false;
        this.playerDamageTimer = 0;
        this.playerDamageCooldown = 1.0; // 1 second invulnerability after hit
        
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
        
        // Create spring manager and add some springs
        this.springManager = new SpringManager();
        this.setupSprings();
        
        // Give player access to managers for collision checks
        this.player.powerUpManager = this.powerUpManager;
        this.player.spikeManager = this.spikeManager;
        this.player.enemyManager = this.enemyManager;
        this.player.springManager = this.springManager;
    }
    
    setupRings() {
        // Add some example rings - adjust positions as needed
        
        // Line of rings at y=160
        this.ringManager.addRingLine(100, 160, 8, 25);
        
        // Arc of rings
        this.ringManager.addRingArc(300, 180, 40, 7);
        
        // Single rings
        this.ringManager.addRing(450, 170);
        this.ringManager.addRing(480, 150);
        this.ringManager.addRing(510, 170);
    }
    
    setupSpikes() {
        // Add some example spikes - adjust positions as needed
        
        // Line of spikes on ground
        //this.spikeManager.addSpikeLine(200, 224, 5, 16);
        
        // Single spikes as obstacles
        this.spikeManager.addSpike(400, 192);
        this.spikeManager.addSpike(450, 192);
    }
    
    setupPowerUps() {
        // Add powerup boxes with random powerups
        
        // Random powerup boxes (will randomly choose between speed, invincibility, and rings)
        this.powerUpManager.addBox(100, 192, 'random');
        this.powerUpManager.addBox(500, 192, 'random');
        this.powerUpManager.addBox(700, 192, 'random');
        
        // You can still specify exact types if needed:
        // this.powerUpManager.addBox(300, 180, 'speed');
        // this.powerUpManager.addBox(500, 180, 'invincibility');
        // this.powerUpManager.addBox(700, 180, 'rings');
    }
    
    setupEnemies() {
        // Add some example enemies - adjust positions as needed
        
        // BuzzBombers (flying enemies)
        this.enemyManager.addEnemy('buzzbomber', 300, 192);
        this.enemyManager.addEnemy('buzzbomber', 600, 192);
        
        // Crab (ground enemies)
        this.enemyManager.addEnemy('crab', 250, 192);
        this.enemyManager.addEnemy('crab', 550, 192);
        
        // Line of enemies
        // this.enemyManager.addEnemyLine('crab', 400, 192, 3, 80);
    }
    
    setupSprings() {
        // Add some example springs - adjust positions as needed
        
        // Single springs
        this.springManager.addSpring(200, 208); // On ground (224 - 16)
        this.springManager.addSpring(400, 208);
        
        // Line of springs
        // this.springManager.addSpringLine(500, 208, 3, 32);
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
        
        // Update springs
        this.springManager.update(dt);
        
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
            if (this.spikeManager.checkCollisions(this.player)) {
                if (!this.playerIsHit) {
                    this.playerIsHit = true;
                    this.playerDamageTimer = this.playerDamageCooldown;
                    
                    // Make rings bounce out when hit!
                    this.ringManager.loseRings(
                        this.player.position.x + this.player.dimensions.x / 2,
                        this.player.position.y + this.player.dimensions.y / 2,
                        10  // Lose up to 10 rings
                    );
                    console.log("Player hit a spike!");
                }
            } else {
                // Reset hit flag when not touching spike
                this.playerIsHit = false;
            }
        }
        
        // Check enemy collisions
        // Allow collisions when invincible (to kill enemies) or when not in damage cooldown
        if (this.player.isInvincible || this.playerDamageTimer <= 0) {
            const enemyCollision = this.enemyManager.checkCollisions(this.player, this.ringManager);
            
            // Only apply damage if NOT invincible
            if (enemyCollision.tookDamage && !this.player.isInvincible) {
                // Start damage cooldown
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
        this.springManager.render(context); // Render springs
        this.powerUpManager.render(context); // Renders boxes only
        this.enemyManager.render(context); // Render enemies
        this.ringManager.render(context);
        this.player.render(context);
        
        // Render powerups AFTER player so they appear on top
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