'use strict';

document.addEventListener("DOMContentLoaded", setup);

let url = new URL("https://api.nasa.gov/planetary/apod")
url.searchParams.set("api_key", "SJ7kv4M1ckzCXhHBppQDRASRRY8VFOkaFsUSO7k5");
url.searchParams.set("count", "1");

/**
 * Handles get nasa data button click event
 */
function submit() {
    getResponse().then(data => addImage(data[0]))
}


/**
 * Gets a response from the Nasa APOD api
 * 
 * @returns Promise<NASAData>
 */
async function getResponse()
{
    return await fetch(url)
        .then(response => {
            if (!response.ok) {
                errorWarning();
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                document.querySelector("#info").classList.remove("hidden")
                document.querySelector("#warning").classList.add("hidden");
                return response.json();
            }
        }
    );
}


/**
 * Initalizes warning message in DOM
 */
function errorWarning()
{
    document.querySelector("#info").classList.add("hidden")
    const warning = document.querySelector("#warning");
    warning.classList.remove("hidden");
    warning.innerHTML = "Error occured. Please try again!";
}


/**
 * Sets up event listeners
 */
function setup()
{
    document.querySelector("#nasaButton").addEventListener("click", submit);
}
