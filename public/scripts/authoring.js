// Html elements
const editor = document.getElementById("editor");
const previewBtn = document.getElementById("previewBtn");
const clearBtn = document.getElementById("clearBtn");
const parsedOutput = document.getElementById("parsedOutput");
const notesBtn = document.getElementById("notesBtn");
const notesOutput = document.getElementById("notesOutput");

// Control what is showing
let previewing = false;
let showingNotes = false;

// Toolbar buttons
const heading1 = document.getElementById("heading1");

// All presentations for current user
let presentations = null;

window.onload = async () => {
  // Get the default "presentation" from the server
  presentations = await getDefaultPresentation();
  console.log(presentations);
  // Add the markdown from the default presentation to the editor
  editor.value = presentations[0].markdown;
};

async function getDefaultPresentation() {
  let response = await fetch("/getDefault");
  let data = await response.json();
  return JSON.parse(data);
}

// Array containing the slides
let slideDeck = [];

// Toolbar events
heading1.addEventListener("click", () => {
  console.log("h1");
  // Get the index where the header should be inserted
  let selectionStart = editor.selectionStart;

  // Insert header 1 markdown
  insert("# ", selectionStart);

  // Return focus to textarea
  editor.focus();
});

function insert(text, index) {
  // Get the current value of the editor
  let textContent = editor.value;

  // Get the part of the editor to the left
  let startString = textContent.slice(0, index);

  // And to the right
  let endString = textContent.slice(index);

  // Remove any whitespace at the end of the endString
  endString = endString.trimEnd();

  // Create a new string with new text between left and right text
  let newString = startString + text + endString;

  // Replace content of the editor with the new string.
  editor.value = newString;
}

/***** PREVIEWING *****/
previewBtn.addEventListener("click", () => {
  if (previewing) {
    // Remove the preview
    parsedOutput.innerHTML = "";

    // Change name of preview button
    previewBtn.innerHTML = "Preview slides";

    // No longer showing the preview
    previewing = false;
  } else {
    // Clear the slides if already existing
    parsedOutput.innerHTML = "";

    // Parse content of the editor
    const parsed = marked.parse(editor.value);

    // Split parsed content into slides
    const segmentedOutput = parsed.split("<hr>");

    // Create slides for each segment
    let index = 1; // Slide number
    slideDeck = []; // Reset the slideDeck array
    for (slide of segmentedOutput) {
      // Create a new slide-div
      const slideDiv = document.createElement("div");
      slideDiv.classList.add("slide");

      // Add content to the slide
      slideDiv.innerHTML = slide;

      // Add all the slide to the preview-output
      parsedOutput.appendChild(slideDiv);

      // Add the slide to the slidedeck-array
      slideDeck.push({
        index: index,
        content: slide,
      });
      index++;
    }

    // Change name of preview button
    previewBtn.innerHTML = "Hide Preview";

    // Now previewing is active
    previewing = true;
  }

  console.log(JSON.stringify(slideDeck));
});

clearBtn.addEventListener("click", () => {
  editor.value = "";
});

/***** NOTES FROM OTHER USERS *****/
notesBtn.addEventListener("click", () => {
  if (showingNotes) {
    // Hide notes
    notesOutput.innerHTML = "";
    notesBtn.innerHTML = "Show notes";
    showingNotes = false;
  } else {
    // For now, only working with default presentation
    let currentPresentation = presentations[0];

    // Loop through all notes, and for each (public) note, parse and then show.
    for (let notes of currentPresentation.notes) {
      if (notes.public) {
        let parsedNotes = marked.parse(notes.markdown);

        // Create a new div for the notes
        let currentNotesDiv = document.createElement("div");
        currentNotesDiv.classList.add("note");
        // Add html
        currentNotesDiv.innerHTML = `<h4>${notes.user} writes:</h4> ${parsedNotes}<hr >`;
        // Add to notes-output
        notesOutput.appendChild(currentNotesDiv);
      }
    }

    // Change name of notes button
    notesBtn.innerHTML = "Hide notes";

    showingNotes = true;
  }
});
