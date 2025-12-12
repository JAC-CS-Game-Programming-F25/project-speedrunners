import Enemy from "./Enemy.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";

/**
 * Crab enemy - flying enemy (5 frames)
 */
export default class Crab extends Enemy {
    static WIDTH = 48;
    static HEIGHT = 40; 

    constructor(x, y) {
        super(x, y, Crab.WIDTH, Crab.HEIGHT);
        
        this.sprites = this.generateSprites();
        this.animation = new Animation([0, 1, 2, 3, 4], 0.15); 
        
        this.moveSpeed = 30;
        this.patrolDistance = 100;
        
        const gameObjectsSheet = images.get(ImageName.GameObjects);
        this.explosionSprites = Enemy.generateExplosionSprites(gameObjectsSheet);
    }

    generateSprites() {
        const spriteSheet = images.get(ImageName.Badniks);
        
        return [
            new Sprite(spriteSheet, 8, 186, 48, 32),    // Frame 1
            new Sprite(spriteSheet, 64, 186, 48, 32),   // Frame 2
            new Sprite(spriteSheet, 120, 182, 48, 40),  // Frame 3
            new Sprite(spriteSheet, 176, 182, 48, 40),  // Frame 4
            new Sprite(spriteSheet, 232, 186, 48, 32)   // Frame 5
        ];
    }
}