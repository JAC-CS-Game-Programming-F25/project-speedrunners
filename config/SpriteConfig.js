import Sprite from '../lib/Sprite.js';

export const playerSpriteConfig = {
    idle: [{ x: 43, y: 257, width: 32, height: 40 }],
    walk: [
        // { x: 46, y: 349, width: 24, height: 40 },
        { x: 109, y: 347, width: 40, height: 40 },
        { x: 178, y: 348, width: 32, height: 40 },
        { x: 249, y: 349, width: 40, height: 40 },
        { x: 319, y: 347, width: 40, height: 40 },
        { x: 390, y: 348, width: 40, height: 40 },
    ],
	jump: [
		{ x: 43, y: 625, width: 32, height: 32},
		{ x: 113, y: 625, width: 32, height: 32},
		{ x: 183, y: 625, width: 32, height: 32},
		{ x: 253, y: 625, width: 32, height: 32},
		{ x: 323, y: 625, width: 32, height: 32},
	],
	run: [
		{ x: 39, y: 532, width: 32, height: 38},
		{ x: 109, y: 532, width: 32, height: 38},
		{ x: 179, y: 533, width: 32, height: 37},
		{ x: 249, y: 532, width: 32, height: 38},
	],
	damage: [
		{ x: 39, y: 807, width: 40, height: 32 },
		{ x: 109, y: 807, width: 40, height: 32 },
	],
	death: [
		{ x: 287, y: 798, width: 34, height: 43}
	],
	skid: [
		{ x: 479, y: 352, width: 32, height: 36 },
		{ x: 547, y: 352, width: 34, height: 36 },
	]
}

export const objectSpriteConfig = {
	ring: [
		{ x: 8, y: 182, width: 16, height: 16 },   // Frame 1
		{ x: 32, y: 182, width: 16, height: 16 },  // Frame 2
		{ x: 56, y: 182, width: 8, height: 16 },  // Frame 3
		{ x: 72, y: 182, width: 16, height: 16 }   // Frame 4
	],
	spike: [
		{ x: 308, y: 182, width: 39, height: 32 }
	],

	spring: {
    	idle: { x: 512, y: 470, width: 32, height: 16 },
    	compressed: { x: 512, y: 494, width: 32, height: 32 }
	}
}		

export const enemySpriteConfig = {

	Crab: [
		{x:8, y:186 , width: 48, height:32},
		{ x: 64, y: 186, width: 48, height: 32 },  
		{ x: 120, y: 182, width: 48, height: 40 },  
		{ x: 176, y: 182, width: 48, height: 40 },
		{ x: 232, y: 186, width: 48, height: 32 }
	],
	BuzzBomber: [
		{x:157, y: 259, width: 40, height:32},
		{x: 157, y: 299, width: 40, height:32},
		{x:213, y: 259, width: 40, height:32},
		{x:213, y: 299, width: 40, height:32},
	]

}

export function loadPlayerSprites(spriteSheet, playerSpriteConfig) {
	const sprites = {};

	for (const [animationName, frames] of Object.entries(playerSpriteConfig)) {
		sprites[animationName] = frames.map(
			(frame) =>
				new Sprite(
					spriteSheet,
					frame.x,
					frame.y,
					frame.width,
					frame.height
				)
		);
	}

	return sprites;
}


/**
 * Load object sprites from config (for objects with single or multiple frames)
 * @param {Image} spriteSheet 
 * @param {Object} config 
 * @returns {Array<Sprite>|Object} Array of sprites or object with named sprites
 */
export function loadObjectSprites(spriteSheet, config) {
    // Check if config is an array (simple multi-frame object like ring)
    if (Array.isArray(config)) {
        return config.map(
            (frame) =>
                new Sprite(
                    spriteSheet,
                    frame.x,
                    frame.y,
                    frame.width,
                    frame.height
                )
        );
    }
    
    // Otherwise, it's an object with named states (like spring)
    const sprites = {};
    for (const [stateName, frame] of Object.entries(config)) {
        sprites[stateName] = new Sprite(
            spriteSheet,
            frame.x,
            frame.y,
            frame.width,
            frame.height
        );
    }
    return sprites;
}

/**
 * Load enemy sprites from config
 * @param {Image} spriteSheet 
 * @param {Array} config 
 * @returns {Array<Sprite>} Array of animation frames
 */
export function loadEnemySprites(spriteSheet, config) {
    return config.map(
        (frame) =>
            new Sprite(
                spriteSheet,
                frame.x,
                frame.y,
                frame.width,
                frame.height
            )
    );
}
