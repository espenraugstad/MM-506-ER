// HTML elements
const manuscript = document.getElementById("manuscript");
const slides = document.getElementById('slides');

// Global variables
let slideDeck = []; // The slides
let currentSlideIndex = 0; // Index of current slide

window.onload = async () => {
  // Get the current presentation id from local storage
  const presentationId = localStorage.getItem("presentationId");

  // Get the presentation from the server
  let currentPresentationData = await getPresentation(presentationId);
  let currentPresentation = await currentPresentationData.json();

  // Create script
  createScript(currentPresentation);

  // Generate slidedeck
  generateSlidedeck(currentPresentation);

  // Preview the first slide
  previewSlide(currentSlideIndex);
};

async function getPresentation(id) {
  return await fetch(`/getPresentation/${id}`);
}

function createScript(presentation) {
  // Parse the markdown, and put it in the correct html-element
  manuscript.innerHTML = marked.parse(presentation.markdown);
}

function generateSlidedeck(presentation){
    slideDeck = marked.parse(presentation.markdown).split("<hr>");
}

function previewSlide(index){
    slides.innerHTML = slideDeck[index];
}