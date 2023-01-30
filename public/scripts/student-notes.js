import { getPresentation } from "../modules/presentationHandler.js";

/***** HTML ELEMENTS *****/
const presentationTitle = document.getElementById("presentation-title");
const previewBar = document.getElementById("previews");

/***** GLOBAL VARIABLES *****/
let presentationId = localStorage.getItem("presentationId");
let currentPresentation = null;
let slides = null;
let rawSlides = null;
let activeSlideIndex = -1;

/***** EVENT LISTENERS *****/

/***** FUNCTIONS *****/
window.onload = async () => {
  currentPresentation = await getPresentation(presentationId);
  presentationTitle.innerHTML = currentPresentation.presentation_title;
  updatePreview();
  console.log(slides);
};

function updatePreview() {
  console.log("Updating pres");
  previewBar.innerHTML = "";
  if (currentPresentation) {
    //parsedPresentation = marked.parse(currentPresentation.markdown);
    slides = marked.parse(currentPresentation.markdown).split("<hr>");


    for (let slide of slides) {
      // Get index
      let currentSlideIndex = slides.findIndex(el => el===slide);

      // Div to contain the slide preview
      let slideDiv = document.createElement("div");
      slideDiv.classList.add("preview-slide");

      // Parse the html of the slide to an HTML document
      const domParser = new DOMParser();
      let slideHtml = domParser.parseFromString(slide, "text/html");
      // The first element will be in the preview
      let previewText = "";
      if (slideHtml.body.firstChild) {
        let previewText = slideHtml.body.firstChild.textContent;
        // Add the text to the slide (in a separate div?)
        if (previewText !== "") {
          slideDiv.innerHTML = `<div class="title-medium">${previewText}<div>`;
        } else {
          slideDiv.innerHTML = `<div class="title-medium">&lt;This slide is empty&gt;<div>`;
        }
      } else {
        slideDiv.innerHTML = `<div class="title-medium">&lt;This slide is empty&gt;<div>`;
      }

      // Eventlistener to select a slide
      slideDiv.addEventListener("click", ()=>{



        if(activeSlideIndex === currentSlideIndex){
            // Toggle the selected-class
            slideDiv.classList.toggle("selected-slide");
        } else {
            let selectedSlides = document.querySelectorAll(".selected-slide");
            for(let selected of selectedSlides){
                selected.classList.remove("selected-slide");
            }
            activeSlideIndex = currentSlideIndex;
            slideDiv.classList.add("selected-slide");
        }

        // If this slide is active, put notes in editor


      });

      previewBar.appendChild(slideDiv);
    }
  } else {
    console.log("No presentation exists.");
  }
}
