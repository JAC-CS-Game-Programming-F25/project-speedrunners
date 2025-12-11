import Layer from "./Layer.js";              
import Colour from "../enums/Colour.js";        
import Player from "../entities/Player.js";       
import Sprite from "../../lib/Sprite.js";        
import Tile from "./Tile.js";                     
import { ImageName } from "../enums/ImageName.js";  
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    images,
	canvas
} from "../globals.js";  
import Camera from "./Camera.js";
import RingManager from "./RingManager.js";

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
        
        // Position Sonic - adjust this number: try 186, 188, 190, 192, or 194
        this.player = new Player(32, 188, 32, 40, this);
		this.camera = new Camera(
			this.player,
			canvas.width,
			canvas.height,
			this.width * Tile.SIZE,
			this.height * Tile.SIZE
		);
		this.ringManager = new RingManager();
        this.setupRings();
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
    
    update(dt) {
        this.player.update(dt);
        this.camera.update(dt);
        this.ringManager.update(dt);
        this.ringManager.checkCollisions(this.player);
    }
    
    render() {
        this.camera.applyTransform(context);
        this.collisionLayer.render();
        this.ringManager.render(context);
        this.player.render(context);
        this.backgroundLayer.render();
        this.camera.resetTransform(context);
        
        // Render ring counter in top-left (not affected by camera)
        this.renderUI();
    }
    
    renderUI() {
        context.save();
        context.font = '20px Arial';
        context.fillText(`Rings: ${this.ringManager.getRingCount()}`, 10, 25);
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