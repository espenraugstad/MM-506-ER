/***** HTML ELEMENTS *****/
const presentationTitle = document.getElementById("presentation-title");

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
};

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