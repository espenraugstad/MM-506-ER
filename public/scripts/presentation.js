/***** HTML ELEMENTS *****/
const slides = document.getElementById("slides");

/***** GLOBAL VARIABLES *****/
let presentationKey = -1;
let slideDeck = []; // The slides
let currentSlideIndex = 0; // Index of current slide
const eventSource = new EventSource("/connectSSE");

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
    console.log(eventSource);
  } else {
    console.log("Error getting presentation");
  }

  // Listen for slide changes
 // await listen();
};

eventSource.addEventListener("message", (e)=>{
  console.log("Slide changed");
  console.log(e.data);
  if(parseInt(e.data) !== currentSlideIndex){
    currentSlideIndex = parseInt(e.data);
    displaySlide(currentSlideIndex);
  }
});  

async function getPresentationByKey(key) {
  return await fetch(`/getPresentationByKey/${key}`);
}

function generateSlidedeck(presentation) {
  slideDeck = marked.parse(presentation.markdown).split("<hr>");
}

function displaySlide(index) {
  slides.innerHTML = slideDeck[index];
}

/* async function listen(){
  console.log("Listening");
  let result = await fetch("/slideIndex");
  let data = await result.json();
  console.log(data);
  if(data.index !== currentSlideIndex){
    currentSlideIndex = data.index;
    displaySlide(currentSlideIndex);
  }
  setTimeout(listen, 1000);
} */

/* async function listen(){
  console.log("Listening");
  let result = await fetch("/changeSlide")
} */

/* function listen() {
  // Listening for slide changes from the server
  let sse = new EventSource("/streamPresentation");
  sse.addEventListener("message", (message) => {
    console.log(message);
    let newIndex = message.data;
    //console.log(newIndex.split('"')[1]);
    //displaySlide(parseInt(newIndex.split('"')[1]));
    displaySlide(parseInt(message.data));
  });

  sse.addEventListener("open", () => {
    console.log("Connection open");
  });

  sse.addEventListener("error", (err) => {
    console.log("Error est conn");
    console.log(err);
    sse.close();
    // Retry connecting:
    console.log("Retrying connection");
    setTimeout(listen, 1000);
  });
} */

