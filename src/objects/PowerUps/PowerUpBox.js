import Sprite from "../../../lib/Sprite";
import Entity from "../../entities/Entity";

export default class PowerUpBox extends Entity{
    static Width = 16;
    static HEIGHT = 16;
        constructor(x, y) {
            super(x, y, PowerUpBox.WIDTH, PowerUpBox.HEIGHT);
            
            this.sprites = PowerUpBox.generateSprites();
            this.isCollected = false;
        }

        static generateSprite() {
            const spriteSheet = images.get(ImageName.GameObjects);
    
            return new Sprite(
                    spriteSheet,
                    308,     
                    182,   
                    39,     
                    32      
                );
            }
}