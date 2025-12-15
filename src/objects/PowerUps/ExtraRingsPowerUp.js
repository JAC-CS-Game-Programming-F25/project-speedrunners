import PowerUp from "./PowerUp.js";
import Sprite from "../../../lib/Sprite.js";
import { images } from "../../globals.js";
import {ImageName} from "../../enums/ImageName.js";
import { sounds } from "../../globals.js";
import {SoundName} from "../../enums/SoundName.js";



export default class ExtraRingsPowerUp extends PowerUp {
    constructor(x, y, ringAmount = 10) {
        super(x, y);
        this.ringAmount = ringAmount;
        this.duration = 0; 
        this.sprite = ExtraRingsPowerUp.generateSprite();
    }

    static generateSprite() {
        const spriteSheet = images.get(ImageName.GameObjects);
        return new Sprite(
            spriteSheet,
            80,
            524,
            16,
            16
        );
    }

    activate(player) {
        // This is an instant powerup, not a timed one
        // The ring manager will handle adding rings
        this.isActive = false;

        setTimeout(() => {
            sounds.play(SoundName.Ring);
        }, 300); 

    }

    deactivate(player) {
        // No deactivation needed for instant powerup
    }

    getRingAmount() {
        return this.ringAmount;
    }
}
