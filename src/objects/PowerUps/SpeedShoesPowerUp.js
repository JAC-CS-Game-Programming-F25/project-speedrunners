import PowerUp from "./PowerUp.js";
import Sprite from "../../../lib/Sprite.js";
import { images } from "../../globals.js";
import {ImageName} from "../../enums/ImageName.js";
import { PlayerConfig } from "../../../config/PlayerConfig.js";

export default class SpeedShoesPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.duration = 10;
        this.speedMultiplier = 2 ;
        this.originalMaxSpeed = null;
        this.originalRunThreshold = null;
        this.sprite = SpeedShoesPowerUp.generateSprite();
    }
    
    static generateSprite() {
        const spriteSheet = images.get(ImageName.GameObjects);
        return new Sprite(spriteSheet, 8, 548, 16, 16);
    }
    
    activate(player) {
        super.activate(player);
        // Save original speeds
        this.originalMaxSpeed = PlayerConfig.maxSpeed;
        this.originalRunThreshold = PlayerConfig.runThreshold;
        
        // Increase speeds
        PlayerConfig.maxSpeed *= this.speedMultiplier;
        PlayerConfig.runThreshold *= this.speedMultiplier;
        
        player.hasSpeedShoes = true;
    }
    
    deactivate(player) {
        super.deactivate(player);
        // Restore original speeds
        if (this.originalMaxSpeed !== null) {
            PlayerConfig.maxSpeed = this.originalMaxSpeed;
            PlayerConfig.runThreshold = this.originalRunThreshold;
        }
        player.hasSpeedShoes = false;
    }
}