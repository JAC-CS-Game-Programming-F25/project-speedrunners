import { images } from "../globals.js";

export default class LevelBackground {
	constructor(imageName, y = 0, scale = 1, parallax = 1, autoScrollSpeed = 0) {
		this.imageName = imageName;
		this.y = y;
		this.scale = scale;
		this.parallax = parallax;
		this.autoScrollSpeed = autoScrollSpeed;

		const img = images.get(imageName);
		this.width  = Math.round(img.width  * scale);
		this.height = Math.round(img.height * scale);

		this.scrollOffset = 0; // auto-scroll
		this.cameraX = 0;       // store cameraX for render
	}

	update(dt, cameraX) {
		this.cameraX = cameraX;

		if (this.autoScrollSpeed !== 0) {
			this.scrollOffset += this.autoScrollSpeed * dt;

			// wrap scrollOffset to width so it tiles infinitely
			this.scrollOffset %= this.width;
		}
	}

	render() {
		// combine camera parallax and auto-scroll
		const offsetX = Math.floor(-this.cameraX * this.parallax + this.scrollOffset);

		// render two copies for seamless tiling
		images.render(this.imageName, offsetX, this.y, this.width, this.height);
		images.render(this.imageName, offsetX - this.width, this.y, this.width, this.height);
	}
}
