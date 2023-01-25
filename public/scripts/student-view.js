/***** HTML ELEMENTS *****/
const presentationTitle = document.getElementById("presentation-title");
const previewBar = document.getElementById("previews");

/***** GLOBAL VARIABLES *****/
let presentationId = -1;
let currentPresentation = null;

/***** EVENT LISTENERS *****/

/***** FUNCTIONS *****/
window.onload = async () => {
  let currentUrl = new URLSearchParams(location.search);
  presentationId = currentUrl.get("id");
  console.log(presentationId);

  // Get the current presentation
  currentPresentation = await getPresentation();
  setTitle();
  console.log(currentPresentation);

  updatePreview();
};

function updatePreview() {  
  console.log("Updating pres");
  previewBar.innerHTML = "";
  if (currentPresentation) {
    
    //parsedPresentation = marked.parse(currentPresentation.markdown);
    let slides = marked.parse(currentPresentation.markdown).split("<hr>");

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

async function getPresentation() {
  let serverData = await fetch(`/getPresentation/${presentationId}`, {
    method: "get",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + localStorage.getItem("sillytoken"),
    },
  });

  if(serverData.status === 200){
    let results = await serverData.json();
    return results;
  } else {
    console.log(serverData.status);
  }

}

function setTitle(){
    presentationTitle.innerHTML = currentPresentation.presentation_title;
}