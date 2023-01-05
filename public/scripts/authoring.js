/****** HTML ELEMENTS ******/
const previews = document.getElementById("previews");
const authoringEditor = document.getElementById("authoring-editor");
const savePresentationButton = document.getElementById(
  "save-presentation-button"
);
const clearEditorButton = document.getElementById("clear-editor-button");
const showNotesButton = document.getElementById("show-notes-button");
const goToPresenterButton = document.getElementById("go-to-presenter-button");
const authoringShowNotes = document.getElementById("authoring-show-notes");

/***** GLOBAL VARIABLES *****/
let currentPresentation = null;
let currentPresentationNotes = null;
let parsedPresentation = null;
let showingNotes = false;

/***** EVENT HANDLERS *****/
showNotesButton.addEventListener("click", () => {
  if (showingNotes) {
    // Hide notes
    showingNotes = false;
    showNotesButton.innerHTML = "Show notes";
    authoringShowNotes.classList.add("hidden");
  } else {
    // Show notes
    showingNotes = true;
    showNotesButton.innerHTML = "Hide notes";
    authoringShowNotes.classList.remove("hidden");
  }
});

authoringEditor.addEventListener("input", () => {
  // Update current presentation
  updatePresentationContent();
  updatePreview();
});

savePresentationButton.addEventListener("click", async ()=>{
  console.log("Saving");
  
  let result = await fetch("/savePresentation",{
    method: "post", 
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(currentPresentation)
  });

  console.log(result);
});

/***** FUNCTIONS *****/
window.onload = async () => {
  await loadCurrentPresentation();
  await getCurrentPresentationNotes();

  // Update preview
  updatePreview();

  // Update notes
  updateNotes();
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
    currentPresentation = results;

    // Fill markdown in editor
    authoringEditor.value = currentPresentation.markdown;

    // Parse presentation
    parsedPresentation = marked.parse(currentPresentation.markdown);
  } else {
    console.log("An error occured");
    console.log(results);
  }
}

async function getCurrentPresentationNotes() {
  // Get id from url
  let url = new URLSearchParams(location.search);
  let id = url.get("presentation");

  // Request presentation from server
  let serverData = await fetch(`/getPresentationNotes/${id}`, {
    methode: "get",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + localStorage.getItem("sillytoken"),
    },
  });
  let results = await serverData.json();

  if (serverData.status === 200) {
    currentPresentationNotes = results;
  } else {
    console.log("An error occured");
    console.log(results);
  }
}

function updatePreview() {
  previews.innerHTML = "";
  if (currentPresentation) {
    parsedPresentation = marked.parse(currentPresentation.markdown);
    let slides = parsedPresentation.split("<hr>");

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

      previews.appendChild(slideDiv);
    }
  } else {
    console.log("No presentation exists.");
  }
}

function updateNotes() {
  if (currentPresentationNotes) {
    let notesHtml = '<h1>Public Notes</h1><div class="flex flex-col full">';

    for (let note of currentPresentationNotes.notes) {
      let noteHtml = marked.parse(note.markdown);
      notesHtml += `<div class=\"secondary-container notes-username flex\">${note.user}<span class=\"material-symbols-outlined note-arrow\">
      arrow_drop_up
      </span></div>
      <div class=\"flex flex-col full note-content\">${noteHtml}</div>  
     `;
    }
    notesHtml += "</div>";
    authoringShowNotes.innerHTML = notesHtml;
  }
}

function updatePresentationContent() {
  currentPresentation.markdown = authoringEditor.value;
}
