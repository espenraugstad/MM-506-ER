import { getPresentation } from "../modules/presentationHandler.js";

/***** HTML ELEMENTS *****/
const presentationTitle = document.getElementById("presentation-title");
const previewBar = document.getElementById("previews");
const studentModuleLive = document.getElementById('student-module-live');
const studentModuleNotes = document.getElementById('student-module-notes');

/***** GLOBAL VARIABLES *****/
let presentationId = -1;
let currentPresentation = null;

/***** EVENT LISTENERS *****/
studentModuleNotes.addEventListener("click",  ()=>{
  console.log("click");
  location.href = "student-notes.html";
});

/***** FUNCTIONS *****/
window.onload = async () => {
  let currentUrl = new URLSearchParams(location.search);
  presentationId = currentUrl.get("id");
  localStorage.setItem("presentationId", presentationId);

  // Get the current presentation
  currentPresentation = await getPresentation(presentationId);
  setTitle();

  updatePreview();
};

function updatePreview() {  
  console.log("Updating pres");
  previewBar.innerHTML = "";
  if (currentPresentation) {
    
    //parsedPresentation = marked.parse(currentPresentation.markdown);
    let slides = marked.parse(currentPresentation.markdown).split("<hr>");

    for (let slide of slides) {
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

      previewBar.appendChild(slideDiv);
    }
  } else {
    console.log("No presentation exists.");
  }
}



function setTitle(){
    presentationTitle.innerHTML = currentPresentation.presentation_title;
}