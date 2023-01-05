/****** HTML ELEMENTS ******/
const previews = document.getElementById("previews");
const authoringEditor = document.getElementById("authoring-editor");
const savePresentationButton = document.getElementById(
  "save-presentation-button"
);
const clearEditorButton = document.getElementById("clear-editor-button");
const showNotesButton = document.getElementById("show-notes-button");
const goToPresenterButton = document.getElementById("go-to-presenter-button");

/***** GLOBAL VARIABLES *****/
let currentPresentation = null;
let parsedPresentation = null;
let showingNotes = false;

/***** EVENT HANDLERS *****/
showNotesButton.addEventListener("click", ()=>{
    if(showingNotes){
        console.log("Hiding notes");
        // Hide notes
    } else {
        console.log("Showing notes");
        // Show notes
    }
});

/***** FUNCTIONS *****/
window.onload = async () => {
  await loadCurrentPresentation();
};

async function loadCurrentPresentation() {
  // Get id from url
  let url = new URLSearchParams(location.search);
  let id = url.get("presentation");

  // Request presentation from server
  let serverData = await fetch(`/getPresentation/${id}`, {
    methode: "get",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + localStorage.getItem("sillytoken"),
    },
  });
  let results = await serverData.json();

  if (serverData.status === 200) {
    console.log(results);
    currentPresentation = results;

    // Fill markdown in editor
    authoringEditor.value = currentPresentation.markdown;

    // Parse presentation
    parsedPresentation = marked.parse(currentPresentation.markdown);

    // Update preview
    updatePreview();
  } else {
    console.log("An error occured");
    console.log(results);
  }
}

function updatePreview() {
  if (currentPresentation) {
    console.log("Exits");
    let slides = parsedPresentation.split("<hr>");

    for (let slide of slides) {
      console.log(slide);

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
        console.log("What")
        slideDiv.innerHTML = `<div class="title-medium">&lt;This slide is empty&gt;<div>`;
      }

      previews.appendChild(slideDiv);
    }
  } else {
    console.log("No presentation exists.");
  }
}
