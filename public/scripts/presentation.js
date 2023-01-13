/***** HTML ELEMENTS *****/
const slides = document.getElementById("slides");

/***** GLOBAL VARIABLES *****/
let presentationKey = -1;
let slideDeck = []; // The slides
let currentSlideIndex = 0; // Index of current slide

// When loading, retrieve the presentation
window.onload = async () => {
  // Get the current presentation id from the url
  //presentationId = localStorage.getItem("presentationId");
  let urlParam = new URLSearchParams(document.location.search);
  presentationKey = urlParam.get("key");

  // Get the presentation from the server
  let currentPresentationData = await getPresentationByKey(presentationKey);
  console.log(currentPresentationData);
  if (currentPresentationData.status === 200) {
    let data = await currentPresentationData.json();
    let currentPresentation = data.presentation;

    console.log(currentPresentation);
    // Generate slidedeck
    generateSlidedeck(currentPresentation);
    console.log(slideDeck);

    // Diplay the first slide
    displaySlide(currentSlideIndex);
  } else {
    console.log("Error getting presentation");
  }
};

async function getPresentationByKey(key) {
  return await fetch(`/getPresentationByKey/${key}`);
}

function generateSlidedeck(presentation) {
  slideDeck = marked.parse(presentation.markdown).split("<hr>");
}

function displaySlide(index) {
  slides.innerHTML = slideDeck[index];
}

// Listening for slide changes from the server
const sse = new EventSource("/streamPresentation");
sse.addEventListener("message", (message) => {
  //console.log(message);
  let newIndex = message.data;
  console.log(newIndex.split('"')[1]);
  displaySlide(parseInt(newIndex.split('"')[1]));
});

sse.addEventListener("open", () => {
  console.log("Connection open");
});

sse.addEventListener("error", () => {
  console.log("Error est conn");
  console.log(err);
});
