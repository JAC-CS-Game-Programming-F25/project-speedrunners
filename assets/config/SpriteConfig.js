import Sprite from '../lib/Sprite.js';

// export const spriteConfig = {
//     idle: [{ x: 27, y: 242, width: 29, height: 39 }],
//     walk: [
//         { x: 30, y: 335, width: 24, height: 37 },
//         { x: 95, y: 333, width: 36, height: 37 },
//         { x: 165, y: 334, width: 29, height: 38 },
//         { x: 240, y: 335, width: 27, height: 37 },
//         { x: 306, y: 333, width: 37, height: 37 },
//         { x: 381, y: 334, width: 32, height: 38 }
//     ]
// }

export const spriteConfig = {
    idle: [{ x: 43, y: 257, width: 32, height: 40 }],
    walk: [
        { x: 46, y: 349, width: 24, height: 40 },
        { x: 109, y: 347, width: 40, height: 40 },
        { x: 178, y: 348, width: 32, height: 40 },
        { x: 249, y: 349, width: 40, height: 40 },
        { x: 319, y: 347, width: 40, height: 40 },
        { x: 390, y: 348, width: 40, height: 40 }
    ]
}

export function loadPlayerSprites(spriteSheet, spriteConfig) {
	const sprites = {};

	for (const [animationName, frames] of Object.entries(spriteConfig)) {
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