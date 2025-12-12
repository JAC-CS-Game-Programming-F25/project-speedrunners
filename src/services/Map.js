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
        this.spikeManager.addSpikeLine(230, 195, 5, 16);
    }
    
    update(dt) {
        this.player.update(dt);
        this.camera.update(dt);
        this.ringManager.update(dt);
        this.spikeManager.update(dt);
        
        // Check ring collisions
        this.ringManager.checkCollisions(this.player);
        
        // Check spike collisions (placeholder - implement damage later)
        if (this.spikeManager.checkCollisions(this.player)) {
            if (!this.playerIsHit) {
                this.playerIsHit = true;
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
    
    render() {
        this.camera.applyTransform(context);
        this.collisionLayer.render();
        this.spikeManager.render(context);
        this.ringManager.render(context);
        this.player.render(context);
        this.backgroundLayer.render();
        this.camera.resetTransform(context);
        
        // Render ring counter in top-left (not affected by camera)
        this.renderUI();
    }
    
    renderUI() {
        context.save();
        context.fillStyle = '#FFD700';
        context.font = '20px Arial';
        context.fillText(`Rings: ${this.ringManager.getRingCount()}`, 10, 25);
        
        // Show hit indicator (placeholder)
        if (this.playerIsHit) {
            context.fillStyle = '#FF0000';
            context.fillText('HIT!', 10, 50);
        }
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