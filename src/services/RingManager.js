import {SoundName} from "../enums/SoundName.js";
import { sounds } from "../globals.js";
import GameObjectFactory from "./GameObjectFactory.js";

export default class RingManager {
    constructor() {
        this.rings = [];
        this.totalRingsCollected = 0;
    }

    addRing(x, y) {
        this.rings.push(GameObjectFactory.createRing(x, y));
    }

    addRingLine(startX, y, count, spacing = 20) {
        for (let i = 0; i < count; i++) {
            this.addRing(startX + (i * spacing), y);
        }
    }

    addRingArc(centerX, centerY, radius, count) {
        const angleStep = Math.PI / (count - 1);
        for (let i = 0; i < count; i++) {
            const angle = angleStep * i;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY - Math.sin(angle) * radius;
            this.addRing(x, y);
        }
    }

    addRingGrid(startX, startY, rows, cols, spacingX = 20, spacingY = 20) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.addRing(
                    startX + (col * spacingX),
                    startY + (row * spacingY)
                );
            }
        }
    }

   loseRings(playerX, playerY, maxRingsToLose = 10, groundLevel = null) {
    const ringsToLose = Math.min(this.totalRingsCollected, maxRingsToLose);
    if (ringsToLose === 0) return; 
    
    // If no ground level passed, estimate it below the player
    const actualGroundLevel = groundLevel || (playerY + 50);
    
    for (let i = 0; i < ringsToLose; i++) {
        const lostRing = GameObjectFactory.createRing(playerX, playerY, true);
        lostRing.initializeAsLostRing(playerX, playerY, actualGroundLevel);
        this.rings.push(lostRing);
    }
    
    sounds.play(SoundName.LoseRings);
    this.totalRingsCollected = 0;
}

    update(dt) {
        this.rings.forEach(ring => ring.update(dt));
        this.cleanupCollectedRings();
    }

    render(context) {
        this.rings.forEach(ring => ring.render(context));
    }

    checkCollisions(player) {
        this.rings.forEach(ring => {
            if (!ring.isCollected && ring.collidesWith(player)) {
                const value = ring.collect();
                this.totalRingsCollected += value;
            }
        });
    }

    getRingCount() {
        return this.totalRingsCollected;
    }

    reset() {
        this.rings = [];
        this.totalRingsCollected = 0;
    }

    cleanupCollectedRings() {
        this.rings = this.rings.filter(ring => !ring.isCollected);
    }
}