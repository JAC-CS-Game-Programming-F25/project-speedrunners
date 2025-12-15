import PowerUp from "./PowerUp.js";
import Sprite from "../../../lib/Sprite.js";
import { images } from "../../globals.js";
import {ImageName} from "../../enums/ImageName.js";
import { sounds } from "../../globals.js";
import {SoundName} from "../../enums/SoundName.js";


export default class InvincibilityPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.duration = 8; 
        this.sprite = InvincibilityPowerUp.generateSprite();
        
    }

    static generateSprite() {
        const spriteSheet = images.get(ImageName.GameObjects);
        return new Sprite(
            spriteSheet,
            56,
            548,
            16,
            16
        );
    }

    activate(player) {
        super.activate(player);
        player.isInvincible = true;
        sounds.pause(SoundName.GreenHill)
        sounds.play(SoundName.Invincibility);
    }

    deactivate(player) {
        sounds.stop(SoundName.Invincibility);
        super.deactivate(player);
        player.isInvincible = false;
        sounds.play(SoundName.GreenHill);
    }
}