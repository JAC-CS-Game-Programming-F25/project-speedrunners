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
        
        this.layers = mapDefinition.layers.map(
            (layerData) => new Layer(layerData, sprites)
        );
        
        this.backgroundLayer = this.layers[Map.BACKGROUND_LAYER];
        this.collisionLayer = this.layers[Map.COLLISION_LAYER];
        
        this.player = new Player(32, 188, 32, 40, this);
        
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
        
        this.enemyManager = new EnemyManager();
        this.setupEnemies();
        
        this.springManager = new SpringManager();
        this.setupSprings();
        
        this.player.powerUpManager = this.powerUpManager;
        this.player.spikeManager = this.spikeManager;
        this.player.enemyManager = this.enemyManager;
        this.player.springManager = this.springManager;
        this.player.ringManager = this.ringManager;
    }
    
    setupRings() {
        this.ringManager.addRingLine(100, 160, 8, 25);
        this.ringManager.addRingArc(300, 180, 40, 7);
        this.ringManager.addRing(450, 170);
        this.ringManager.addRing(480, 150);
        this.ringManager.addRing(510, 170);
    }
    
    setupSpikes() {
        this.spikeManager.addSpike(1000, 192);
        //this.spikeManager.addSpike(450, 192);
    }
    
    setupPowerUps() {
        this.powerUpManager.addBox(100, 192, 'invincibility');
        // this.powerUpManager.addBox(500, 192, 'random');
        // this.powerUpManager.addBox(700, 192, 'random');
    }
    
    setupEnemies() {
        this.enemyManager.addEnemy('buzzbomber', 300, 192);
        //this.enemyManager.addEnemy('buzzbomber', 600, 192);
        this.enemyManager.addEnemy('crab', 250, 192);
                //this.enemyManager.addEnemy('crab', 250, 192);

        this.enemyManager.addEnemy('crab', 550, 192);
    }
    
    setupSprings() {
        this.springManager.addSpring(200, 208);
        this.springManager.addSpring(400, 208);
    }
    
    update(dt) {
        this.player.update(dt);
        
        this.camera.update(dt);
        this.ringManager.update(dt);
        this.spikeManager.update(dt);
        this.powerUpManager.update(dt, this.player);

        this.player.rings = this.ringManager.getRingCount()
        
        this.enemyManager.update(dt, this.spikeManager, this.powerUpManager);
        
        this.springManager.update(dt);
        
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
                  this.player.hit();
                    console.log("Player hit spike from top!");
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
        
        if (this.playerIsHit || this.playerDamageTimer > 0) {
            context.fillStyle = '#FF0000';
            context.fillText('HIT!', 10, 50);
        }
        
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