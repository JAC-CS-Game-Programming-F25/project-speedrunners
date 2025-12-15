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
    timer,
} from "../globals.js";  
import Camera from "./Camera.js";
import RingManager from "./RingManager.js";
import SpikeManager from "./SpikeManager.js";
import PowerUpManager from "./PowerUpManager.js";
import EnemyManager from "./EnemyManager.js";
import SpringManager from "./SpringManager.js";
import SignPostManager from "./SignPostManager.js";
import UserInterface from "./UserInterface.js";
import ScoreManager from "./ScoreManager.js";
import Timer from "../../lib/Timer.js";

export default class Map {
    static BACKGROUND_LAYER = 1;
    static COLLISION_LAYER = 0;
    
    constructor(mapDefinition) {
        this.width = mapDefinition.width;
        this.height = mapDefinition.height;
        this.tilesets = mapDefinition.tilesets;
        this.backgrounds = null;
        
        const sprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Tiles),
            Tile.SIZE,
            Tile.SIZE,
            16  
        );
        
        this.layers = mapDefinition.layers.map(
            (layerData) => new Layer(layerData, sprites)
        );
        
        this.backgroundLayer = this.layers[Map.BACKGROUND_LAYER];
        this.collisionLayer = this.layers[Map.COLLISION_LAYER];
        
        this.scoreManager = new ScoreManager()


        this.player = new Player(32, 664, 32, 40, this, this.scoreManager);
        
        this.playerIsHit = false;
        this.playerDamageTimer = 0;
        this.playerDamageCooldown = 1.0;
        
        this.camera = new Camera(
            this.player,
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
            this.width * Tile.SIZE,
            this.height * Tile.SIZE
        );

        this.ringManager = new RingManager();
        this.setupRings();
        
        this.spikeManager = new SpikeManager();
        this.setupSpikes();
        
        this.powerUpManager = new PowerUpManager();
        this.setupPowerUps();
        
        this.enemyManager = new EnemyManager(this.scoreManager);
        this.setupEnemies();
        
        this.springManager = new SpringManager();
        this.setupSprings();

        this.signPostManager = new SignPostManager();
        this.setupSignPosts();
        
        this.player.powerUpManager = this.powerUpManager;
        this.player.spikeManager = this.spikeManager;
        this.player.enemyManager = this.enemyManager;
        this.player.springManager = this.springManager;
        this.player.signPostManager = this.signPostManager;
        this.player.ringManager = this.ringManager;
        this.time = 0; // displayed seconds for UI

        this.timer = new Timer()

        // Add a task that increments the time every 1 second
        this.timer.addTask(() => {
            this.time += 1;
        }, 1); 

        this.ui = new UserInterface(this.player, this.ringManager, this.scoreManager, this.time)
    }

    setupSignPosts() {
       this.signPostManager.addSignPost(4728, 660);
       this.signPostManager.addSignPost(100, 664);
    }
    
    setupRings() {
        this.ringManager.addRingLine(426, 620, 6, 25);
        this.ringManager.addRingLine(816, 620, 6, 25);
        this.ringManager.addRingLine(1530, 361, 8, 25);
        this.ringManager.addRingLine(1285, 40, 6, 25);

        //this.ringManager.addRing(450, 170);
        //this.ringManager.addRing(480, 150);
        //this.ringManager.addRing(510, 170);
    }
    
    setupSpikes() {
        this.spikeManager.addSpike(2242, 672);
        this.spikeManager.addSpike(2210, 672);
        this.spikeManager.addSpike(863, 672);
        this.spikeManager.addSpike(852, 672);
        this.spikeManager.addSpike(3309, 610);
    }
    
    setupPowerUps() {
        this.powerUpManager.addBox(1219, 576, 'rings');
        this.powerUpManager.addBox(1914, 674, 'speed');
        this.powerUpManager.addBox(4036, 674, 'invincibility');
        //this.powerUpManager.addBox(500, 192, 'random');
        //this.powerUpManager.addBox(700, 192, 'random');
    }
    
    setupEnemies() {
        this.enemyManager.addEnemy('crab', 2312, 672);
        this.enemyManager.addEnemy('crab', 2352, 672);
        this.enemyManager.addEnemy('crab', 2392, 672);

        this.enemyManager.addEnemy('buzzbomber', 2838, 672);
        this.enemyManager.addEnemy('buzzbomber', 2798, 672);
        this.enemyManager.addEnemy('buzzbomber', 2748, 672);

        this.enemyManager.addEnemy('crab', 4550, 672);
        this.enemyManager.addEnemy('crab', 4510, 672);
        this.enemyManager.addEnemy('crab', 4590, 672);

        this.enemyManager.addEnemy('buzzbomber', 4450, 672);
        this.enemyManager.addEnemy('buzzbomber', 4410, 672);
        this.enemyManager.addEnemy('buzzbomber', 4490, 672);

        this.enemyManager.addEnemy('buzzbomber', 1754, 361);
        this.enemyManager.addEnemy('buzzbomber', 1734, 361);
        this.enemyManager.addEnemy('buzzbomber', 1714, 361);
        //this.enemyManager.addEnemy('crab', 800, 192);
    }
    
    setupSprings() {
        this.springManager.addSpring(1040, 688);
        this.springManager.addSpring(1396, 520);
        this.springManager.addSpring(2048, 370);
        this.springManager.addSpring(4175, 688);
        this.springManager.addSpring(4290, 306);
       // this.springManager.addSpring(2080, 350);
    }
    
    update(dt) {
        this.player.update(dt);
        
        this.camera.update(dt);
        this.ringManager.update(dt);
        this.spikeManager.update(dt);
        this.powerUpManager.update(dt, this.player);
        this.timer.update(dt)
        this.player.rings = this.ringManager.getRingCount()
        
        this.enemyManager.update(dt, this.spikeManager, this.powerUpManager);
        
        this.springManager.update(dt);
        this.signPostManager.update(dt);
        this.ui.update(dt)
        
        if (this.playerDamageTimer > 0) {
            this.playerDamageTimer -= dt;
        }
        
        this.ringManager.checkCollisions(this.player);
        
        const instantPowerUps = this.powerUpManager.getInstantPowerUps();
        instantPowerUps.forEach(powerUp => {
            const ringAmount = powerUp.getRingAmount();
            this.ringManager.totalRingsCollected += ringAmount;
        });
        
        if (!this.player.isInvincible && !this.player.isDamagedInvincible && this.playerDamageTimer <= 0) {
          if (this.player.hitSpikeTop) {
              if (!this.playerIsHit) {
                  this.playerIsHit = true;
                  
                  // For spikes, use facing direction for knockback (spikes are stationary)
                  this.player.knockbackRight = !this.player.facingRight;
                  
                  this.player.hit(true);
                   // console.log("Player hit spike from top!");
                }
            } else {
                this.playerIsHit = false;
            }
            
            this.player.hitSpikeTop = false;
        }
    }
    
    render() {
        this.camera.applyTransform(context);
        this.collisionLayer.render();
        this.spikeManager.render(context);
        this.springManager.render(context);
        this.powerUpManager.render(context);
        this.enemyManager.render(context);
        this.ringManager.render(context);
        this.signPostManager.render(context);
        this.player.render(context);
        
        this.powerUpManager.renderPowerUps(context);
        
        this.backgroundLayer.render();
        this.camera.resetTransform(context);
        
        this.ui.render()
    }
    
    renderUI() {
        // context.save();
        // context.fillStyle = '#FFD700';
        // context.font = '20px Arial';
        // context.fillText(`Rings: ${this.ringManager.getRingCount()}`, 10, 25);
        
        // if (this.playerIsHit || this.playerDamageTimer > 0) {
        //     context.fillStyle = '#FF0000';
        //     context.fillText('HIT!', 10, 50);
        // }
        
        // let yOffset = 75;
        // if (this.player.hasSpeedShoes) {
        //     const timeLeft = this.powerUpManager.getPowerUpTimeRemaining('speed');
        //     context.fillStyle = '#00FFFF';
        //     context.fillText(`Speed: ${Math.ceil(timeLeft)}s`, 10, yOffset);
        //     yOffset += 25;
        // }
        
        // if (this.player.isInvincible) {
        //     const timeLeft = this.powerUpManager.getPowerUpTimeRemaining('invincibility');
        //     context.fillStyle = '#FFD700';
        //     context.fillText(`Invincible: ${Math.ceil(timeLeft)}s`, 10, yOffset);
        //     yOffset += 25;
        // }
        
        // context.fillStyle = '#FF6B6B';
        // context.fillText(`Enemies: ${this.enemyManager.getActiveCount()}`, 10, yOffset);
        
        // context.restore();
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
    
    /**
     * Get tile from a specific layer by column and row
     * @param {number} layerIndex - The layer index (0 = collision, 1 = background)
     * @param {number} col - Column (x tile coordinate)
     * @param {number} row - Row (y tile coordinate)
     * @returns {Tile|null}
     */
    getTileAt(layerIndex, col, row) {
        return this.layers[layerIndex]?.getTile(col, row);
    }
    
    /**
     * Get collision layer tile at specified tile coordinates
     * Used by CollisionDetector for slope height sampling
     * @param {number} col - Column (x tile coordinate)
     * @param {number} row - Row (y tile coordinate)
     * @returns {Tile|null}
     */
    getCollisionTileAt(col, row) {
        // Bounds check
        if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
            return null;
        }
        return this.collisionLayer.getTile(col, row);
    }
    
    /**
     * Check if there's a solid tile at the given tile coordinates
     * @param {number} col - Column (x tile coordinate)
     * @param {number} row - Row (y tile coordinate)
     * @returns {boolean}
     */
    isSolidTileAt(col, row) {
        if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
            return false;
        }
        
        const tile = this.collisionLayer.getTile(col, row);
        
        return tile !== null && tile.id !== undefined && tile.id !== -1;
    }
}