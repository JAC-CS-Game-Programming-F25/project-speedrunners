import Enemy from "./Enemy.js";
import Animation from "../../lib/Animation.js";
import { images } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";
import { enemySpriteConfig, loadEnemySprites } from "../../../config/SpriteConfig.js";

/**
 * Crab enemy - flying enemy (5 frames)
 */
export default class Crab extends Enemy {
    static WIDTH = 48;
    static HEIGHT = 40; // Max height (frames 3 and 4)

    constructor(x, y) {
        super(x, y, Crab.WIDTH, Crab.HEIGHT);
        
        // Generate sprites from config
        const spriteSheet = images.get(ImageName.Badniks);
        this.sprites = loadEnemySprites(spriteSheet, enemySpriteConfig.Crab);
        
        this.animation = new Animation([0, 1, 2, 3, 4], 0.15); // 5 frames, 0.15s each
        
        // Movement (flying enemy, slightly faster)
        this.moveSpeed = 60;
        this.patrolDistance = 100;
        
        // Get explosion sprites from game objects sprite sheet
        const gameObjectsSheet = images.get(ImageName.GameObjects);
        this.explosionSprites = Enemy.generateExplosionSprites(gameObjectsSheet);
    }
}