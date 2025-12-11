import Entity from "../entities/Entity.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";
import {SoundName} from "../enums/SoundName.js";
import { sounds } from "../globals.js";

export default class Ring extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;
    static RING_VALUE = 1;

    /**
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     */
    constructor(x, y) {
        super(x, y, Ring.WIDTH, Ring.HEIGHT);
        
        this.sprites = Ring.generateSprites();
        this.isCollected = false;
        
        // Create animation for spinning ring effect
        this.animation = new Animation([0, 1, 2, 3], 0.9);
    }

    static generateSprites() {
        const spriteSheet = images.get(ImageName.GameObjects);
        const sprites = [];
        
        // Ring sprite coordinates from the spritesheet
        // These are the 4 frames of the ring animation (horizontal row)
        const ringFrames = [
            { x: 8, y: 182, width: 16, height: 16 },   // Frame 1
            { x: 32, y: 182, width: 16, height: 16 },  // Frame 2
            { x: 56.197, y: 182, width: 7, height: 16 },  // Frame 3
            { x: 72, y: 182, width: 16, height: 16 }   // Frame 4
        ];

        ringFrames.forEach(frame => {
            sprites.push(new Sprite(
                spriteSheet,
                frame.x,
                frame.y,
                frame.width,
                frame.height
            ));
        });

        return sprites;
    }

    update(dt) {
        if (this.isCollected) return;
        
        // Update animation
        this.animation.update(dt);
    }

    render(context) {
        if (this.isCollected) return;
        
        const currentFrame = this.animation.getCurrentFrame();
        const sprite = this.sprites[currentFrame];
        
        sprite.render(
            Math.floor(this.position.x),
            Math.floor(this.position.y)
        );
    }

    collect() {
        if (!this.isCollected) {
            this.isCollected = true;
            sounds.play(SoundName.Ring);
            return Ring.RING_VALUE;
        }
        return 0;
    }
}