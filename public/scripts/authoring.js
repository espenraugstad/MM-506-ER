import { modalMessage, destroyModal } from "../modules/modalMessage.js";

/****** HTML ELEMENTS ******/
const previewBar = document.getElementById("previews");
const presentationTitle = document.getElementById("presentation-title");
const authoringEditor = document.getElementById("authoring-editor");
const savePresentationButton = document.getElementById(
  "save-presentation-button"
);
const clearEditorButton = document.getElementById("clear-editor-button");
const showNotesButton = document.getElementById("show-notes-button");
const dashboardButton = document.getElementById("dashboard-button");
const goToPresenterButton = document.getElementById("go-to-presenter-button");
const authoringShowNotes = document.getElementById("authoring-show-notes");

/***** GLOBAL VARIABLES *****/
let currentPresentation = null;
let currentPresentationNotes = null;
let parsedPresentation = null;
let showingNotes = false;
let isSaved = true;

/***** EVENT HANDLERS *****/
presentationTitle.addEventListener("blur", () => {
  isSaved = false;
  currentPresentation.presentation_title = presentationTitle.innerText;
  /* if(currentPresentation.presentation_title !== presentationTitle.innerText){
    console.log("Title changed");
  } else {
    console.log("Title remains");
  } */

  //presentationTitle.contentEditable = true;
  //presentationTitle.focus();
});

authoringEditor.addEventListener("input",  () => {
  // Update current presentation
  isSaved = false;
  updatePresentationContent();
  updatePreview();
});

savePresentationButton.addEventListener("click", async () => {
  let status = await savePresentation();
  let message = "";
  if(status === 200){
    message = "Presentation saved";
  } else {
    message = `Error ${status}`;
  }
  let saved = await modalMessage("Save", message, [{
    text: "Ok",
    returnValue: true
  }]);
  destroyModal();
});

clearEditorButton.addEventListener("click", () => {
  console.log("Clear editor");
});

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

dashboardButton.addEventListener("click", async () => {
  if (isSaved) {
    location.href = "./presenter-dashboard.html";
  } else {
    let action = await modalMessage(
      "Save changes?",
      "There are unsaved changes?\nSave changes?",
      [
        {
          text: "Cancel",
          returnValue: false,
        },
        {
          text: "Save and exit",
          returnValue: true,
        },
      ]
    );
    destroyModal();
    if (action) {
      console.log("Saving and exiting");
      await savePresentation();
      location.href = "./presenter-dashboard.html";
    } else {
      console.log("Cancelling");
    }
  }

});

goToPresenterButton.addEventListener("click", () => {
  console.log("Go to presenter");
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

    // Set title
    presentationTitle.innerHTML = currentPresentation.presentation_title;

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
  console.log("Updating pres");
  previewBar.innerHTML = "";
  if (currentPresentation) {
    
    //parsedPresentation = marked.parse(currentPresentation.markdown);
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

      previewBar.appendChild(slideDiv);
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
  parsedPresentation = marked.parse(currentPresentation.markdown);
}

async function savePresentation(){
  console.log("Saving");
  isSaved = true;
  let result = await fetch("/savePresentation", {
    method: "post",
    headers: {
      "content-type": "application/json",
      "authorization": "Bearer " + localStorage.getItem("sillytoken")
    },
    body: JSON.stringify(currentPresentation),
  });
  console.log(result.status);

  return result.status;
}