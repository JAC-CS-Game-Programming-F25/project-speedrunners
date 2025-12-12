import Animation from "../../../lib/Animation.js";
import Sprite from "../../../lib/Sprite.js";
import { images } from "../../globals.js";
import { ImageName } from "../../enums/ImageName.js";

export default class InvincibilitySparkles {
    constructor() {
        this.sprites = this.generateSprites();
        this.animation = new Animation([0, 1, 2, 3], 0.1); // 0.1s per frame
    }
    
    generateSprites() {
        const spriteSheet = images.get(ImageName.GameObjects);
        return [
            new Sprite(spriteSheet, 556, 726, 72, 40),  // Frame 1
            new Sprite(spriteSheet, 548, 774, 88, 40),  // Frame 2
            new Sprite(spriteSheet, 548, 822, 88, 40),  // Frame 3
            new Sprite(spriteSheet, 564, 870, 56, 24)   // Frame 4
        ];
    }
    
    update(dt) {
        this.animation.update(dt);
    }
    
    render(context, playerX, playerY, playerWidth, playerHeight) {
        const currentFrame = this.animation.getCurrentFrame();
        const sprite = this.sprites[currentFrame];
        
        // Center sparkles on player
        const offsetX = (playerWidth - sprite.width) / 2;
        const offsetY = (playerHeight - sprite.height) / 2;
        
        sprite.render(
            Math.floor(playerX + offsetX),
            Math.floor(playerY + offsetY)
        );
    }
}