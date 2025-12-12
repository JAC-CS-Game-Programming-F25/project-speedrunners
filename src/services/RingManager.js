import Ring from "../objects/Ring.js";

export default class RingManager {
    constructor() {
        this.rings = [];
        this.totalRingsCollected = 0;
    }

    /**
     * Add a ring at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    addRing(x, y) {
        this.rings.push(new Ring(x, y));
    }

    /**
     * Add multiple rings in a horizontal line
     * @param {number} startX - Starting X position
     * @param {number} y - Y position
     * @param {number} count - Number of rings
     * @param {number} spacing - Space between rings (default 20)
     */
    addRingLine(startX, y, count, spacing = 20) {
        for (let i = 0; i < count; i++) {
            this.addRing(startX + (i * spacing), y);
        }
    }

    /**
     * Add rings in an arc pattern
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {number} radius - Arc radius
     * @param {number} count - Number of rings
     */
    addRingArc(centerX, centerY, radius, count) {
        const angleStep = Math.PI / (count - 1);
        for (let i = 0; i < count; i++) {
            const angle = angleStep * i;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY - Math.sin(angle) * radius;
            this.addRing(x, y);
        }
    }

    /**
     * Add rings in a grid pattern
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @param {number} spacingX - Horizontal spacing
     * @param {number} spacingY - Vertical spacing
     */
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

    /**
     * Make player lose rings when hit by spike
     * Creates bouncing rings that scatter from player position
     * @param {number} playerX - Player's X position
     * @param {number} playerY - Player's Y position
     * @param {number} maxRingsToLose - Maximum number of rings to lose (default 10)
     */
    loseRings(playerX, playerY, maxRingsToLose = 10) {
        const ringsToLose = Math.min(this.totalRingsCollected, maxRingsToLose);
        
        if (ringsToLose === 0) return; 
        
        for (let i = 0; i < ringsToLose; i++) {
            const lostRing = new Ring(playerX, playerY, true);
            lostRing.initializeAsLostRing(playerX, playerY);
            this.rings.push(lostRing);
        }
        
        this.totalRingsCollected = 0;
    }

    /**
     * Update all rings
     * @param {number} dt - Delta time
     */
    update(dt) {
        this.rings.forEach(ring => ring.update(dt));
        this.cleanupCollectedRings();
    }

    /**
     * Render all rings
     * @param {CanvasRenderingContext2D} context
     */
    render(context) {
        this.rings.forEach(ring => ring.render(context));
    }

    /**
     * Check collision with player
     * @param {Player} player
     */
    checkCollisions(player) {
        this.rings.forEach(ring => {
            // Only collect rings that aren't bouncing (lost rings can't be collected immediately)
            if (!ring.isCollected && !ring.isBouncing && ring.collidesWith(player)) {
                const value = ring.collect();
                this.totalRingsCollected += value;
                
                // Play sound effect here
            }
        });
    }

    /**
     * Get current ring count
     * @returns {number}
     */
    getRingCount() {
        return this.totalRingsCollected;
    }

    /**
     * Reset all rings and counter
     */
    reset() {
        this.rings = [];
        this.totalRingsCollected = 0;
    }

    /**
     * Remove collected rings from array (optional cleanup)
     */
    cleanupCollectedRings() {
        this.rings = this.rings.filter(ring => !ring.isCollected);
    }
}