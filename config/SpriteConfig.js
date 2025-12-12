import Sprite from '../lib/Sprite.js';

export const spriteConfig = {
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
		{ x: 39, y: 532, width: 32, height: 40},
		{ x: 109, y: 532, width: 32, height: 40},
		{ x: 179, y: 533, width: 32, height: 39},
		{ x: 249, y: 532, width: 32, height: 40},
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
