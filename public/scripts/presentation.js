/***** HTML ELEMENTS *****/
const info = document.getElementById('info');
const slides = document.getElementById('slides');

/***** GLOBAL VARIABLES *****/
let slideDeck = []; // The slides
let currentSlideIndex = 0; // Index of current slide

// When loading, retrieve the presentation
window.onload = async () => {
  // Get the current presentation id from the url
  //presentationId = localStorage.getItem("presentationId");
  let urlParam = new URLSearchParams(document.location.search);
  let presentationId = urlParam.get("id");

  // Get the presentation from the server
  let currentPresentationData = await getPresentation(presentationId);
  let currentPresentation = await currentPresentationData.json();

  // Generate slidedeck
  generateSlidedeck(currentPresentation);

  // Diplay the first slide
  displaySlide(currentSlideIndex);
};

async function getPresentation(id) {
  return await fetch(`/getPresentation/${id}`);
}

function generateSlidedeck(presentation){
    slideDeck = marked.parse(presentation.markdown).split("<hr>");
}

function displaySlide(index){
    slides.innerHTML = slideDeck[index];
}