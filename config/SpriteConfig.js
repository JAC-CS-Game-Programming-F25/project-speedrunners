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
	],
	crouch: [
		{ x: 507, y: 271, width: 34, height: 26 }
	],
	roll: [
		{ x: 43, y: 625, width: 32, height: 32},
		{ x: 113, y: 625, width: 32, height: 32},
		{ x: 183, y: 625, width: 32, height: 32},
		{ x: 253, y: 625, width: 32, height: 32},
		{ x: 323, y: 625, width: 32, height: 32},
	],
	bounce: [
		{ x: 597, y: 255, width: 24, height: 45}
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
	},
	invincibilitySparkles: [
		{ x: 456, y: 182, width: 48, height: 48 },  
		{ x: 512, y: 182, width: 48, height: 48 },  
		{ x: 568, y: 182, width: 48, height: 48 },  
		{ x: 624, y: 182, width: 48, height: 48 }   
	],
	gameover: [{ x: 456, y: 391, width: 144, height: 16 }]
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

export const titleSpriteConfig = {
	sonic: [
		{ x: 32, y: 538, width: 256, height: 144},
		{ x: 360, y: 538, width: 256, height: 144},
		{ x: 688, y: 538, width: 256, height: 144},
		{ x: 32, y: 770, width: 256, height: 144},
		{ x: 360, y: 770, width: 256, height: 144},
		{ x: 688, y: 770, width: 256, height: 144},
		{ x: 32, y: 1002, width: 256, height: 144},
		{ x: 360, y: 1002, width: 256, height: 144},
		{ x: 688, y: 1002, width: 256, height: 144},
		{ x: 32, y: 1234, width: 256, height: 144},
		{ x: 360, y: 1230, width: 256, height: 148},
		{ x: 688, y: 1234, width: 256, height: 144},
		{ x: 32, y: 1466, width: 256, height: 144},
		{ x: 360, y: 1464, width: 256, height: 146},
		{ x: 688, y: 1462, width: 256, height: 148},
		{ x: 32, y: 1692, width: 256, height: 150},
		{ x: 360, y: 1692, width: 256, height: 150},
		{ x: 688, y: 1692, width: 256, height: 150},
	],
	pressstart: [
		{ x: 536, y: 1976, width: 144, height: 7.5 }
	]
}

export const titleCardSprites = [
	{ x: 91, y: 233, width: 157, height: 56}
]

export const HUDSpriteConfig = {
	lives: [
		{ x: 24, y: 384, width: 48, height: 16}
	],
	score: [
		{ x: 8, y: 416, width: 40, height: 16 } 
	],
	time: [
		{ x: 8, y: 440, width: 32, height: 15 },
	],
	rings: [
		{ x: 8, y: 464, width: 40, height: 16 },
		{ x: 56, y: 464, width: 40, height: 16 },
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




// Sign Post Sprite Configuration
export const signPostSpriteConfig = {
    frame1: { x: 228, y: 662, width: 48, height: 48 },
    frame2: { x: 284, y: 690, width: 32, height: 48 },
    frame3: { x: 324, y: 690, width: 8, height: 48 },
    frame4: { x: 284, y: 690, width: 32, height: 48, flipped: true }, // Same as frame2 but flipped
    frame5: { x: 228, y: 718, width: 48, height: 48 }
};

/**
 * Loads sign post sprites from spritesheet
 * @param {Image} image - The spritesheet image
 * @param {Object} config - The sprite configuration
 * @returns {Object} Object containing sign post sprite arrays
 */
export function loadSignPostSprites(image, config) {
    return {
        idle: [new Sprite(image, config.frame1.x, config.frame1.y, config.frame1.width, config.frame1.height)],
        spinning: [
            new Sprite(image, config.frame2.x, config.frame2.y, config.frame2.width, config.frame2.height),
            new Sprite(image, config.frame3.x, config.frame3.y, config.frame3.width, config.frame3.height),
            new Sprite(image, config.frame4.x, config.frame4.y, config.frame4.width, config.frame4.height),
            new Sprite(image, config.frame5.x, config.frame5.y, config.frame5.width, config.frame5.height)
        ]
    };
}



// Victory Screen Sprite Configuration
// Victory Screen Sprite Configuration
export const victorySpriteConfig = {
    background: { x: 348, y: 184, width: 320, height: 224 },
    act1: { x: 348, y: 496, width: 40, height: 24, offsetX: 184, offsetY: 74 },
    score: { x: 348, y: 416, width: 40, height: 16, offsetX: 80, offsetY: 100 },
    time: { x: 348, y: 440, width: 32, height: 16, offsetX: 80, offsetY: 116 },
    rings: { x: 348, y: 464, width: 32, height: 16, offsetX: 80, offsetY: 132 },
    bonus: { x: 388, y: 440, width: 40, height: 16, offsetX: 115, offsetY: 116 }
};

/**
 * Loads victory screen sprites from spritesheet
 * @param {Image} image - The spritesheet image
 * @param {Object} config - The sprite configuration
 * @returns {Object} Object containing victory screen sprites
 */
export function loadVictorySprites(image, config) {
    return {
        background: new Sprite(image, config.background.x, config.background.y, config.background.width, config.background.height),
        act1: {
            sprite: new Sprite(image, config.act1.x, config.act1.y, config.act1.width, config.act1.height),
            offsetX: config.act1.offsetX,
            offsetY: config.act1.offsetY
        },
        score: {
            sprite: new Sprite(image, config.score.x, config.score.y, config.score.width, config.score.height),
            offsetX: config.score.offsetX,
            offsetY: config.score.offsetY
        },
        time: {
            sprite: new Sprite(image, config.time.x, config.time.y, config.time.width, config.time.height),
            offsetX: config.time.offsetX,
            offsetY: config.time.offsetY
        },
        rings: {
            sprite: new Sprite(image, config.rings.x, config.rings.y, config.rings.width, config.rings.height),
            offsetX: config.rings.offsetX,
            offsetY: config.rings.offsetY
        }
    };
}