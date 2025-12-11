import Layer from "./Layer.js";              
import Colour from "../enums/Colour.js";        
import Player from "../entities/Player.js";       
import Sprite from "../../lib/Sprite.js";        
import Vector from "../../lib/Vector.js";          
import Tile from "./Tile.js";                     
import { ImageName } from "../enums/ImageName.js";  
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    images,
} from "../globals.js";  


export default class Map {

	/**
	 * The index of the foreground layer in the layers array.
	 * @type {number}
	 */
	static FOREGROUND_LAYER = 0;
	

	/**
	 * The collection of layers, sprites,
	 * and characters that comprises the world.
	 *
	 * @param {object} mapDefinition JSON from Tiled map editor.
	 */
	constructor(mapDefinition) {
    this.width = mapDefinition.width;
    this.height = mapDefinition.height;
    this.tilesets = mapDefinition.tilesets;
    
    // Generate sprites with 16px margin (from tileset.tsx)
    const sprites = Sprite.generateSpritesFromSpriteSheet(
        images.get(ImageName.Tiles),
        Tile.SIZE,
        Tile.SIZE,
        16  
    );
    
    this.player = new Player(32, 192, 32, 40, this);

    this.layers = mapDefinition.layers.map(
        (layerData) => new Layer(layerData, sprites)
    );
    
    this.foregroundLayer = this.layers[Map.FOREGROUND_LAYER];
}

	update(dt) {
		this.player.update(dt);
	}

	render() {
		this.foregroundLayer.render();
		//this.collisionLayer.render();
		this.player.render(context);
		//Map.renderGrid();
		//this.topLayer.render();

		// if (DEBUG) {
		// 	Map.renderGrid();
		// }
	}

	/**
	 * Draws a grid of squares on the screen to help with debugging.
	 */
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
	 * Gets a tile from a specific layer at the given column and row.
	 * @param {number} layerIndex - The index of the layer.
	 * @param {number} col - The column of the tile.
	 * @param {number} row - The row of the tile.
	 * @returns {Tile|null} The tile at the specified position, or null if no tile exists.
	 */
	getTileAt(layerIndex, col, row) {
		return this.bottomLayer.getTile(col, row);
	}

	/**
	 * Checks if there's a solid tile at the specified column and row.
	 * @param {number} col - The column to check.
	 * @param {number} row - The row to check.
	 * @returns {boolean} True if there's a solid tile, false otherwise.
	 */
	isSolidTileAt(col, row) {
		const tile = this.foregroundLayer.getTile(col, row);
		return tile !== null && tile.id !== -1;
	}
}