'use strict';
/**
 * @typedef NASAResponse
 * @property {string} date - Date of image
 * @property {string} explanation - Description of image
 * @property {string} hdurl - HD version of image
 * @property {string} media_type - Type of media
 * @property {string} service_version - Version
 * @property {string} title - The title of the article
 * @property {string} url - Standard Def version of image
 */

const loadedImages = [];

const loadedData = new Map();

/**
 * Displays a given NASA image
 * 
 * @param {NASAResponse} content 
 */
function showContent(content) {
	const imageContainer = document.querySelector("#media > .image")
	const videoContainer = document.querySelector("#media > .video")

	const loading = document.querySelector(".loading");

	const video = document.querySelector("#video");
	const imageHD = document.querySelector("#imageHD");
	const imageSD = document.querySelector("#imageSD");
	
	const description = document.querySelector("#description");
	const title = document.querySelector("#title");
	const date = document.querySelector("#date");

	loading.classList.remove("hidden");
	imageHD.classList.add("hidden");
	imageSD.classList.add("hidden");

	if (content.media_type == "image") {
		videoContainer.classList.add("hidden");
		imageContainer.classList.remove("hidden");

		imageSD.src = content.url;
		imageHD.src = content.hdurl;
	
		imageSD.alt = content.title;
		imageHD.alt = content.title;

	} else if (content.media_type == "video"){
		videoContainer.classList.remove("hidden");
		imageContainer.classList.add("hidden");
		video.src = content.url;
	}

	title.textContent = content.title;
	date.textContent = content.date;
	description.textContent = content.explanation;
}

function updateMap() {
	const buttonContainer = document.querySelector(".buttons");
	while(loadedData.size > 5) {
		loadedData.delete(loadedData.keys().next().value);
	}
	while(buttonContainer.childElementCount > 6) {
		buttonContainer.children[1].remove();
	}
}

/**
 * Adds the content from the API
 * 
 * @param {NASAResponse} content 
 */
function addImage(content) {
	const buttonContainer = document.querySelector(".buttons");
	const rocketButton = document.createElement("div");
	rocketButton.classList.add("rocket_button");

	const buttonFrontImg = document.createElement("img")
	const buttonBackImg = document.createElement("img")
	const buttonBackImgOn = document.createElement("img")
	const buttonMidText = document.createElement("span")

	buttonBackImg.classList.add("off")
	buttonBackImgOn.classList.add("on")
	buttonBackImg.classList.add("back")
	buttonBackImgOn.classList.add("back")

	buttonFrontImg.src = "images/rocket_front.png";
	buttonBackImg.src = "images/rocket_back_off.png";
	buttonBackImgOn.src = "images/rocket_back.png";

	buttonMidText.innerText = content.title;
	buttonMidText.classList.add("mid")

	rocketButton.appendChild(buttonBackImgOn)
	rocketButton.appendChild(buttonBackImg)
	rocketButton.appendChild(buttonMidText)
	rocketButton.appendChild(buttonFrontImg)

	buttonContainer.appendChild(rocketButton);

	const id = Date.now();

	loadedData.set(id, content);

	rocketButton.addEventListener("click", () => {
		showContent(loadedData.get(id));
	});

	updateMap();
	showContent(content);
}



// Adding event listeners to deal with loading of HD and SD images
document.addEventListener("DOMContentLoaded", () => {
	document.querySelector("#imageHD").addEventListener("load", () => {
		document.querySelector(".loading").classList.add("hidden");
		document.querySelector("#imageSD").classList.add("hidden")
		document.querySelector("#imageHD").classList.remove("hidden")
	})
	document.querySelector("#imageSD").addEventListener("load", () => {
		if(document.querySelector("#imageHD").classList.contains("hidden")) {
			document.querySelector(".loading").classList.add("hidden");
			document.querySelector("#imageSD").classList.remove("hidden")
		}
	})
});
