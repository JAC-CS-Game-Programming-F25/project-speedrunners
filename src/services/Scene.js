import ImageName from "../enums/ImageName.js";
import { CANVAS_WIDTH, context, images } from "../globals.js";


export default class Scene {
	constructor(imageName, y = 0, scale = 1) {
		this.imageName = imageName;
		this.y = y;
		this.scale = scale;

		this.bgImage = images.get(imageName);
		this.bgWidth = this.bgImage.width;
		this.bgHeight = this.bgImage.height;

		// round to avoid a split line down the middle between the first and second render
		this.scaledWidth  = Math.round(this.bgWidth  * this.scale);
		this.scaledHeight = Math.round(this.bgHeight * this.scale);

		this.backgroundX = 0;
		this.backgroundScrollSpeed = 100;
	}

	update(dt) {
		this.backgroundX -= this.backgroundScrollSpeed * dt;

		if (this.backgroundX <= -this.scaledWidth) {
			this.backgroundX += this.scaledWidth;
		}
	}

	render() {
		const x = Math.floor(this.backgroundX);

		images.render(this.imageName, x, this.y, this.scaledWidth, this.scaledHeight);
		images.render(this.imageName, x + this.scaledWidth, this.y, this.scaledWidth, this.scaledHeight);
	}
}
