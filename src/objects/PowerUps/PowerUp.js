import Entity from "../../entities/Entity.js";

export default class PowerUp extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;

    constructor(x, y) {
        super(x, y, PowerUp.WIDTH, PowerUp.HEIGHT);
        this.isActive = false;
        this.duration = 0;
        this.timer = 0;
        this.isCollected = false;
        this.sprite = null;
        this.spawnY = y; // Track initial Y position for fade calculation
    }

    activate(player) {
        this.isActive = true;
        this.timer = 0;
    }

    deactivate(player) {
        this.isActive = false;
    }

    update(dt, player) {
        if (!this.isActive) return;

        this.timer += dt;
        if (this.timer >= this.duration) {
            this.deactivate(player);
        }
    }

    render(context) {
        if (this.isCollected || !this.sprite) return;
        
        // Calculate alpha based on distance from spawn (fade as it rises)
        const distanceFromSpawn = this.spawnY - this.position.y;
        const fadeStartDistance = 50; // Start fading after rising 30px
        const fadeEndDistance = 80;   // Fully transparent at 48px
        
        let alpha = 1.0;
        
        if (distanceFromSpawn > fadeStartDistance) {
            const fadeProgress = (distanceFromSpawn - fadeStartDistance) / (fadeEndDistance - fadeStartDistance);
            alpha = Math.max(0, 1.0 - fadeProgress);
        }
        
        context.globalAlpha = alpha;
        
        this.sprite.render(
            Math.floor(this.position.x),
            Math.floor(this.position.y)
        );
        
        context.globalAlpha = 1.0;
    }

    isExpired() {
        return this.isActive && this.timer >= this.duration;
    }

    collect() {
        if (!this.isCollected) {
            this.isCollected = true;
            return true;
        }
        return false;
    }
}
