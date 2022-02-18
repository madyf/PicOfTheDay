/**
 * @typedef Vec2
 * @type {object}
 * @property {number} x - X.
 * @property {number} y - Y.
 */


// Creates a bitmap array of sprites given a spritemap


class Sprite {
	pos; 
	vol;
	image;
	size;

	/**
	 * @param {Vec2} pos - Sprite position
	 * @param {Vec2} vol - Sprite Volocity
	 * @param {HTMLImageElement} image - Sprite Image
	 * @param {number} - Size of the sprite
	 */
	constructor (pos, vol, image, size) {
		this.pos = pos;
		this.vol = vol;
		this.image = image;
		this.size = size;
	}

	getImage(){
		return this.image;
	}

	stepMotion(){
		this.pos.x += this.vol.x;
		this.pos.y += this.vol.y;
	}

	step(){
		this.stepMotion();
	}
}

class AnimatedSprite extends Sprite {
	frames;
	frame_count;
	current_frame;

	/**
	 * @param {Vec2} pos - Sprite position
	 * @param {Vec2} vol - Sprite Volocity
	 * @param {HTMLImageElement} image - Sprite Image
	 * @param {number} size - Size of the sprite
	 * @param {number} frame_count - Number of frames
	 */
	constructor (pos, vol, frames) {
		super(pos, vol, new Image(), 1);
		this.current_frame = 0;
		this.frames = frames;
		this.frame_count = frames.length;
	}

	getImage(){
		if(this.frames){
			return this.frames[this.current_frame];
		} else{
			return this.image;
		}
	}

	stepAnimation() {
		// Making sure the frame is always within bounds
		this.current_frame = (this.current_frame+1)%this.frame_count;
	}

	step() {
		this.stepMotion();
		this.stepAnimation();
	}
	
	static async extractSprites(image, size, frames){
		let sprites = [];
		// Initalizing a temporary canvas to extract image data
		const c = document.createElement("canvas");
		c.width = size;
		c.height = size;
		// Getting a temporary context
		const ctx = c.getContext("2d");
	
		for(let i = 0; i < frames; i++){
			// Adding each image to the frames list
			ctx.clearRect(0, 0, size, size)
			ctx.drawImage(image, i*size, 0, size, size, 0, 0, size, size);
			sprites.push(await createImageBitmap(ctx.getImageData(0, 0, size, size)));
		}
	
		// Disposing of old canvas
		c.remove();
		return sprites;
	}
}

/**
 * Represents a dynamic background using canvas
 */
class DynamicBackground {
	/**
	* @param {HTMLCanvasElement} canvas
	* @param {number} comet_count - The number of comets in the background
	* @param {number} star_count - The number of stars in the background
	* @param {number} width - The width of the canvas
	* @param {number} height - The height of the canvas
	*/
	constructor(canvas, comet_count, star_count, width, height) {
		this.canvas = canvas;
		this.sprites = [];
		this.stars = [];
		this.comet_sprite = document.querySelector("#cometSprite");
		let star_sprite_medium = document.querySelector("#starSpriteMedium");
		let star_sprite_large = document.querySelector("#starSpriteLarge");
		let planet_sprite = document.querySelector("#planetSprite");
		let moon_sprite = document.querySelector("#moonSprite");
		let star_sprite_small = document.querySelector("#starSpriteSmall");
		let ring_planet_sprite = document.querySelector("#ringPlanetSprite")


		star_sprite_large.addEventListener("load", () => {
			AnimatedSprite.extractSprites(star_sprite_large, 3, 20).then(sprites => {
				this.initStars(sprites, 40);
				window.addEventListener("resize", () => {
					this.initStars(sprites, 40);
				});
			});			
		})

		star_sprite_small.addEventListener("load", () => {
			AnimatedSprite.extractSprites(star_sprite_small, 1, 20).then(sprites => {
				this.initStars(sprites, 40);
				window.addEventListener("resize", () => {
					this.initStars(sprites, 40);
				});
			});
		})
		star_sprite_medium.addEventListener("load", () => {
			AnimatedSprite.extractSprites(star_sprite_medium, 2, 20).then(sprites => {
				this.initStars(sprites, 40);
				window.addEventListener("resize", () => {
					this.initStars(sprites, 40);
				});
			});
		})


		moon_sprite.addEventListener("load", () => {
			AnimatedSprite.extractSprites(moon_sprite, 40, 200).then(sprites => {
				this.sprites.push(new AnimatedSprite(
					{"x":20, "y":20}, 
					{"x":0, "y":0}, 
					sprites
				));
			})
		})

		planet_sprite.addEventListener("load", () => {
			AnimatedSprite.extractSprites(planet_sprite, 200, 30).then(sprites => {
				this.sprites.push(new AnimatedSprite(
					{"x":10, "y":75}, 
					{"x":0, "y":0}, 
					sprites
				));
			})
		})

		ring_planet_sprite.addEventListener("load", () => {
			AnimatedSprite.extractSprites(ring_planet_sprite, 300, 50).then(sprites => {
				this.sprites.push(new AnimatedSprite(
					{"x":250, "y":0}, 
					{"x":0, "y":0}, 
					sprites
				));
			})
		})


		this.setSize(width, height);
		this.ctx = canvas.getContext("2d");

		this.comet_count = comet_count;
		this.initComets(comet_count);

		let interval = setInterval(() => {
			this.step();
			this.draw();
		}, 100);
	}

	/**
	 * @param {number} width 
	 * @param {number} height 
	 */
	setSize(width, height){
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
	}
	
	/** 
	 * Creates comets
	 * 
	 * @param {number} count - Number of comets to create
	 */
	initComets(count) {
		for(let i = 0; i < count; i++){
			let comet = new Sprite({"x":Math.floor(Math.random()*this.width), "y":Math.floor(Math.random()*this.height)}, {"x":-1, "y":1}, this.comet_sprite, 6);
			this.sprites.push(comet);
		}
	}

	/**
	 * Creates stars
	 */
	initStars(sprites, res) {
		// The number of squared pixels per star
		// Resetting all old stars
		// this.stars = [];

		let tilesX = Math.floor(this.width/res);
		let tilesY = Math.floor(this.height/res);

		// Adding extra rows and cols on each axis to avoid blank edges
		for(let i = -1; i < tilesX + 1; i++) {
			for(let j = -1; j < tilesY + 1; j++){
				let spr = new AnimatedSprite(
					{
						"x": Math.floor(i * res + Math.random()*res),
						"y": Math.floor(j * res + Math.random()*res)
					},
					{
						"x":0, 
						"y":0
					},
					sprites
				);
				
				spr.current_frame = Math.floor(Math.random()*spr.frame_count); 

				this.stars.push(spr);
			}
		}
	}

	/**
	 * Generates a random position to place a comet
	 * 
	 * @returns {x:number, y:number}
	 */
	getRandCometPos() {
		let ratio = this.width / ( this.height + this.width );
		if(Math.random() > ratio){
			return {
				"x": Math.floor(this.width),
				"y": Math.floor(Math.random() * this.height)
			}
		} else {
			return {
				"x": Math.floor(Math.random() * this.width),
				"y": 0
			}
		}
	}

	step() {
		this.sprites.forEach(sprite => {
			sprite.step();
		})
		this.constrainSprites();
	}
	
	draw() {
		this.ctx.clearRect(0, 0, this.width+12, this.height+12);

		this.stars.forEach(star => {
			this.ctx.drawImage(star.getImage(), star.pos.x, star.pos.y);
			star.stepAnimation();
		})

		this.sprites.forEach(sprite => {
			this.ctx.drawImage(sprite.getImage(), sprite.pos.x, sprite.pos.y);
		})
	}


	// Constrains the sprites within the bounds, making them loop when exiting bounds
	constrainSprites() {
		this.sprites.forEach(sprite => {
			if(sprite.vol.x == 0 && sprite.vol.y == 0) return;

			if(sprite.pos.x < this.width - sprite.size){
				sprite.pos.x += this.width + sprite.size * 2;
			}
			if(sprite.pos.y < this.height - sprite.size){
				sprite.pos.y += this.height + sprite.size * 2;
			}
			if(sprite.pos.x > this.width + sprite.size){
				sprite.pos.x -= (this.width + sprite.size * 2);
			}
			if(sprite.pos.y > this.height + sprite.size){
				sprite.pos.y -= (this.height + sprite.size * 2);
			}
		})
	}
}

/**
 * Initalizes the background
 */
function setup(){
	const scale = 4;
	const bgElement = document.querySelector("#background")
	const background = new DynamicBackground(bgElement, 20, 20,  window.innerWidth/scale, window.innerHeight/scale);

	resize = () => {
		background.setSize(window.innerWidth/scale, window.innerHeight/scale)
		background.stars = [];
	}
	window.addEventListener("resize", resize);
	resize();
}

document.addEventListener("DOMContentLoaded", setup);
