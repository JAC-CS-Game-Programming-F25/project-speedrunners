import Entity from "../entities/Entity.js";
import { images, sounds } from "../globals.js";
import { ImageName } from "../enums/ImageName.js";
import { objectSpriteConfig, loadObjectSprites } from "../../config/SpriteConfig.js";
import PlayerStateName from "../enums/PlayerStateName.js";
import SoundName from "../enums/SoundName.js";

export default class Spring extends Entity {
    static WIDTH = 32;
    static HEIGHT_IDLE = 16;
    static HEIGHT_COMPRESSED = 32;
    static BOUNCE_FORCE = -500; 
    static COMPRESS_DURATION = 0.15;
    
    constructor(x, y) {
        super(x, y, Spring.WIDTH, Spring.HEIGHT_IDLE);
        
        this.isCompressed = false;
        this.compressTimer = 0;
        
        // Generate sprites from config
        const spriteSheet = images.get(ImageName.GameObjects);
        const sprites = loadObjectSprites(spriteSheet, objectSpriteConfig.spring);
        this.idleSprite = sprites.idle;
        this.compressedSprite = sprites.compressed;
        
        this.isActive = true;
        this.isSolid = true; // Springs are solid objects
        
     //   console.log(`Spring created at (${x}, ${y}), isSolid: ${this.isSolid}, isActive: ${this.isActive}`);
    }
    
    /**
     * Activate the spring (compress and bounce player)
     * @param {Player} player
     */
    activate(player) {
        if (this.isCompressed) return;
        sounds.play(SoundName.Spring)
        this.isCompressed = true;
        this.compressTimer = 0;
        this.dimensions.y = Spring.HEIGHT_COMPRESSED;
        
        // Launch player upward
        player.velocity.y = Spring.BOUNCE_FORCE;
        
        // Force player off ground and position above spring
        player.isOnGround = false;
        player.position.y = this.position.y - player.dimensions.y - 1;
        
        player.stateMachine.change(PlayerStateName.Bounce);
        
    // console.log("Spring activated! Player bouncing with velocity:", Spring.BOUNCE_FORCE);
    }
    
    update(dt) {
        if (this.isCompressed) {
            this.compressTimer += dt;
            
            // Return to idle after duration
            if (this.compressTimer >= Spring.COMPRESS_DURATION) {
                this.isCompressed = false;
                this.compressTimer = 0;
                this.dimensions.y = Spring.HEIGHT_IDLE;
            }
        }
    }
    
    render(context) {
        if (!this.isActive) return;
        
        if (this.isCompressed) {
            // Compressed sprite is 32px tall (vs 16px idle)
            // Offset Y by -16 to keep bottom at same position
            const yOffset = Spring.HEIGHT_COMPRESSED - Spring.HEIGHT_IDLE; // 32 - 16 = 16
            this.compressedSprite.render(
                Math.floor(this.position.x),
                Math.floor(this.position.y - yOffset)
            );
        } else {
            this.idleSprite.render(
                Math.floor(this.position.x),
                Math.floor(this.position.y)
            );
        }
    }
}