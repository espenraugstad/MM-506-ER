import { getPresentation } from "../modules/presentationHandler.js";
/****** HTML ELEMENTS ******/
const presentationTitle = document.getElementById('presentation-title');
const previews = document.getElementById('previews');
const imageLeft = document.getElementById('image-left');
const imageCover = document.getElementById('image-cover');
const imageRight = document.getElementById('image-right');

/***** GLOBAL VARIABLES *****/
let presentationId = -1;
let currentPresentation = null;

/***** EVENT HANDLERS *****/
imageLeft.addEventListener("click", ()=>{
  console.log("Image left");
});

imageCover.addEventListener("click", ()=>{
  console.log("Image cover");
});

imageRight.addEventListener("click", ()=>{
  console.log("Image right");
});

/***** FUNCTIONS *****/
window.onload = async () => {
  // Get id from url
  let url = new URLSearchParams(location.search);
  presentationId = url.get("presentation");

  // Set it in local storage
  localStorage.setItem("presentationId", presentationId);

  // Retrieve presentation from dbs
  currentPresentation = await getPresentation(presentationId);

  // Set title
  presentationTitle.innerHTML = currentPresentation.presentation_title;
};

