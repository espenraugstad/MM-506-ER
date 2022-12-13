// Html elements
const editor = document.getElementById("editor");
const parseBtn = document.getElementById("parseBtn");
const clearBtn = document.getElementById("clearBtn");
const parsedOutput = document.getElementById("parsedOutput");

// Toolbar buttons
const heading1 = document.getElementById("heading1");

window.onload = () => {
  // Fill the editor with some test text
  editor.value = `# Heading 1\nThis is some example text.\n\n---\n\n# More fun stuff\nThis project is being developed as part of a masters project at the [University of Agder].\n\n---\n\n# This is the 3rd slide\nAnd here is an image: \n\n![Alt text](images/book-cover.jpg)\n\n[University of Agder]: https://www.uia.no/
  `;
};

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

// Parsing
parseBtn.addEventListener("click", () => {
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
        content: slide
    });
    index++;
  }

  console.log(slideDeck);
});

clearBtn.addEventListener("click", () => {
  editor.value = "";
});
