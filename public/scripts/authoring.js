import { getPresentation } from "../modules/presentationHandler.js";
/****** HTML ELEMENTS ******/
const presentationTitle = document.getElementById('presentation-title');

/***** GLOBAL VARIABLES *****/
let presentationId = -1;
let currentPresentation = null;

/***** EVENT HANDLERS *****/

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
