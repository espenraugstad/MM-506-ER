/****** HTML ELEMENTS ******/
const previousPreview = document.getElementById("previous-preview");
const currentPreview = document.getElementById("current-preview");
const nextPreview = document.getElementById("next-preview");
const scriptDiv = document.querySelector(".presenter-script");

/****** GLOBAL VARIABLES ******/
const presentationId = localStorage.getItem("presentationId");
let presentation = null;
let slides = [];
let currentSlide = 0;

/****** FUNCTIONS ******/
window.onload = async () => {
  // Get current presentation
  presentation = await getCurrentPresentation();
  populateScript();
  prepareSlides();
  previewSlides();
  //console.log(presentation);
};

async function getCurrentPresentation() {
  const url = `/getPresentation/${presentationId}`;
  const cfg = {
    method: "get",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + localStorage.getItem("sillytoken"),
    },
  };

  let result = await fetch(url, cfg);
  if (result.status === 200) {
    let data = await result.json();
    return data;
  } else {
    return result.status;
  }
}

function populateScript() {
  let html = marked.parse(presentation.markdown);
  scriptDiv.innerHTML = html;
}

function prepareSlides() {
  slides = marked.parse(presentation.markdown).split("<hr>");
}

function previewSlides() {
  // If we're on the first slide, the previous slide preview should be empty
  if (currentSlide === 0) {
    setCurrentSlide(0);
    setPreviousSlide(-1);
  }

  // If there is only one slide
  if(slides.length ===  1){
    setNextSlide(-1);
  } else {
    setNextSlide(currentSlide + 1);
  }
}

function setPreviousSlide(index) {
    if(index === -1){
        // Slide is empty
        previousPreview.classList.add("preview--empty");
    } else {
        previousPreview.classList.remove("preview--empty");
        let domParser = new DOMParser();
        let slideHtml = domParser.parseFromString(slides[index], "text/html");
        console.log(slideHtml);
        if (slideHtml.body.firstChild) {
          let previewText = slideHtml.body.firstChild.textContent;
      
          previousPreview.innerHTML = `<div class="title-medium">${previewText}<div>`;
        }
    }
}

function setCurrentSlide(index) {
  let domParser = new DOMParser();
  let slideHtml = domParser.parseFromString(slides[index], "text/html");
  console.log(slideHtml);
  if (slideHtml.body.firstChild) {
    let previewText = slideHtml.body.firstChild.textContent;

    currentPreview.innerHTML = `<div class="title-medium">${previewText}<div>`;
  }
}

function setNextSlide(index) {
    if(index === -1){
        // Slide is empty
        nextPreview.classList.add("preview--empty");
    } else {
        nextPreview.classList.remove("preview--empty");
        let domParser = new DOMParser();
        let slideHtml = domParser.parseFromString(slides[index], "text/html");
        console.log(slideHtml);
        if (slideHtml.body.firstChild) {
          let previewText = slideHtml.body.firstChild.textContent;
      
          nextPreview.innerHTML = `<div class="title-medium">${previewText}<div>`;
        }
    }
}
