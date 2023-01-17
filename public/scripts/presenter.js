/****** HTML ELEMENTS ******/
const previousPreview = document.getElementById("previous-preview");
const currentPreview = document.getElementById("current-preview");
const nextPreview = document.getElementById("next-preview");
const scriptDiv = document.querySelector(".presenter-script");
const previous = document.getElementById("previous");
const start = document.getElementById("start");
const next = document.getElementById("next");
const activeKeyDiv = document.getElementById('active-key');
const toAuthor = document.getElementById("to-author");
const toDashboard = document.getElementById("to-dashboard");

/****** GLOBAL VARIABLES ******/
const presentationId = localStorage.getItem("presentationId");
let presentation = null;
let slides = [];
let currentSlide = 0;
let isActive = false;

/****** EVENT LISTENERS ******/
toAuthor.addEventListener(
  "click",
  () =>
    (location.href = `authoring.html?presentation=${localStorage.getItem(
      "presentationId"
    )}`)
);
toDashboard.addEventListener(
  "click",
  () => (location.href = "presenter-dashboard.html")
);

previous.addEventListener("click", async () => {
  // Update slide preview
  if (currentSlide > 0) {
    currentSlide -= 1;
    previewSlides();
    // Notify server that slide has been changed
    await fetch(`/changeSlide/${currentSlide}`);
  } else {
    console.log("This is the start of the presentation");
  }
});

start.addEventListener("click", async () => {
  if (!isActive) {
    start.innerHTML = "Stop presentation";
    isActive = true;
    let activeKey = "";
    // Send to server to activate and generate key
    let serverResponse = await fetch("/startPresentation", {
      method: "post",
      headers: {
        "content-type": "application/json", // Add auth if necessary
      },
      body: JSON.stringify({
        id: presentationId,
      }),
    });
    if (serverResponse.status === 200) {
      let data = await serverResponse.json();
      console.log(data.key);
      activeKey = data.key;
      localStorage.setItem("activePresentationKey", activeKey);
      activeKeyDiv.innerHTML = activeKey;
    } else {
      console.log(serverResponse);
    }
    console.log("Presentation is running");
    window.open(`presentation.html?key=${activeKey}`);
    // Open presentation in new window
  } else {
    start.innerHTML = "Start presentation";
    isActive = false;
    console.log("Presentation has stopped");

    // Remove current presentation from active on server
    let removeActiveRes = await fetch(`/stopPresentation`,{
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: presentationId,
        key: localStorage.getItem("activePresentationKey")
      })
    });
    
    if(removeActiveRes.status === 200 || removeActiveRes.status === 404){
      localStorage.removeItem("activePresentationKey");
      activeKeyDiv.innerHTML = "";
    } else {
      console.log(removeActiveRes);
    }
  
  }
});

next.addEventListener("click", async () => {
  // Update slide preview
  if (currentSlide + 1 < slides.length) {
    currentSlide += 1;
    previewSlides();
    // Notify server that slide has been changed
    await fetch(`/changeSlide/${currentSlide}`);
  } else {
    console.log("You have reached the end of the slide deck");
  }
});
/****** FUNCTIONS ******/
window.onload = async () => {
  // Get current presentation
  presentation = await getCurrentPresentation();
  populateScript();
  prepareSlides();
  previewSlides();
  //console.log(presentation);

  // Check to see if presentation is active
  if(localStorage.getItem("activePresentationKey")){
    activeKeyDiv.innerHTML = localStorage.getItem("activePresentationKey");
    start.innerHTML = "Stop presentation";
    isActive = true;
  }
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
    // If there is only one slide
    if (slides.length === 1) {
      setNextSlide(-1);
    } else {
      setNextSlide(currentSlide + 1);
    }
  } else {
    // If there is only one slide
    if (slides.length === 1) {
      setNextSlide(-1);
    } else {
      setPreviousSlide(currentSlide - 1);
      setCurrentSlide(currentSlide);
      if (currentSlide === slides.length - 1) {
        setNextSlide(-1);
      } else {
        setNextSlide(currentSlide + 1);
      }
    }
  }
}

function setPreviousSlide(index) {
  if (index === -1) {
    // Slide is empty
    previousPreview.classList.add("preview--empty");
    previousPreview.innerHTML = "No slide";
  } else {
    previousPreview.classList.remove("preview--empty");
    let domParser = new DOMParser();
    let slideHtml = domParser.parseFromString(slides[index], "text/html");
    if (slideHtml.body.firstChild) {
      let previewText = slideHtml.body.firstChild.textContent;

      previousPreview.innerHTML = `<div class="title-medium">${previewText}<div>`;
    }
  }
}

function setCurrentSlide(index) {
  let domParser = new DOMParser();
  let slideHtml = domParser.parseFromString(slides[index], "text/html");
  if (slideHtml.body.firstChild) {
    let previewText = slideHtml.body.firstChild.textContent;

    currentPreview.innerHTML = `<div class="title-medium">${previewText}<div>`;
  }
}

function setNextSlide(index) {
  if (index === -1) {
    // Slide is empty
    nextPreview.classList.add("preview--empty");
    nextPreview.innerHTML = "End of presentation";
  } else {
    nextPreview.classList.remove("preview--empty");
    let domParser = new DOMParser();
    let slideHtml = domParser.parseFromString(slides[index], "text/html");
    if (slideHtml.body.firstChild) {
      let previewText = slideHtml.body.firstChild.textContent;

      nextPreview.innerHTML = `<div class="title-medium">${previewText}<div>`;
    }
  }
}
