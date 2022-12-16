// HTML elements
const manuscript = document.getElementById("manuscript");
const slides = document.getElementById('slides');
const startPresentation = document.getElementById('startPresentation');
const previousSlide = document.getElementById('previousSlide');
const nextSlide = document.getElementById('nextSlide');

// Global variables
let presentationId = -1;
let slideDeck = []; // The slides
let currentSlideIndex = 0; // Index of current slide

window.onload = async () => {
  // Get the current presentation id from local storage
  presentationId = localStorage.getItem("presentationId");

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

/***** EVENT LISTENERS *****/
startPresentation.addEventListener('click', ()=>{
    console.log("Start");
    if(presentationId !== -1){
        window.open(`presentation.html?id=${presentationId}`);
    } 
});

previousSlide.addEventListener('click', async ()=>{
    console.log('Previous');
    if(currentSlideIndex > 0){
        currentSlideIndex--;
    }

    previewSlide(currentSlideIndex);

    await fetch(`/changeSlide/${currentSlideIndex}`);
})

nextSlide.addEventListener('click', async ()=>{
    console.log("Next");

    if(currentSlideIndex < slideDeck.length-1){
        currentSlideIndex++;
    }
    
    previewSlide(currentSlideIndex);

    // Send the index to the server so that it can be resent to the presentation
    await fetch(`/changeSlide/${currentSlideIndex}`);
});

