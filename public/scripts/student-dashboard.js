/***** HTML ELEMENTS *****/
const studentUsername = document.getElementById("student-username");
const presentationList = document.getElementById("presentation-list");
const logoutBtn = document.getElementById("logout-btn");
const viewPresentation = document.getElementById('view-presentation');

/***** GLOBAL VARIABLES *****/
let username = localStorage.getItem("user");
let userId = localStorage.getItem("userId");
let selectedPresentationId = -1;

/***** EVENT LISTENERS *****/
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  localStorage.removeItem("presentationId");
  localStorage.removeItem("userId");
  location.replace("index.html");
  location.href = "index.html";
});

viewPresentation.addEventListener("click", ()=>{
    if(document.querySelector(".deckline--selected")){
        console.log(`Viewing presentation with id ${selectedPresentationId}`);
        location.href = `./student-view.html?id=${selectedPresentationId}`;
    }
})

/***** FUNCTIONS *****/
window.onload = async () => {
    setUsername();
  await displayPresentations();
  //await getAvailablePresentations();
};

function setUsername(){
    studentUsername.innerHTML = username;
}

async function getAvailablePresentations() {
  let result = await fetch(`/studentPresentations/${userId}`);
  if (result.status === 200) {
    let data = await result.json();
    console.log(data);
  } else {
    console.log(result.status);
  }
  //let data = await result.json();
  //console.log(data);
}

async function displayPresentations() {
  let presentations = [];
  let result = await fetch(`/studentPresentations/${userId}`);
  if (result.status === 200) {
    presentations = await result.json();
  } else {
    console.log(result.status);
  }

  presentationList.innerHTML = "";
  for (let p of presentations) {
    let deckLine = document.createElement("div");
    deckLine.classList.add("deckline");

    let deckTitle = document.createElement("div");
    deckTitle.classList.add("deckline__title");
    deckTitle.innerHTML = p.presentation_title;
    deckLine.appendChild(deckTitle);

    let deleteButton = document.createElement("div");
    deleteButton.classList.add("delete-presentation");
    deleteButton.innerHTML =
      '<span class="material-symbols-outlined">delete</span>';
    //deckLine.appendChild(deleteButton);

    presentationList.appendChild(deckLine);

    deckTitle.addEventListener("click", () => {
      if (selectedPresentationId !== p.presentation_id) {
        let selected = document.querySelector(".deckline--selected");
        if (selected) {
          selected.classList.remove("deckline--selected");
        }
        deckLine.classList.add("deckline--selected");
      } else {
        deckLine.classList.toggle("deckline--selected");
      }
      selectedPresentationId = p.presentation_id;
      if (deckLine.classList.contains("deckline--selected")) {
        let selectedBtns = document.querySelectorAll(".dashboard--action");
        for (let el of selectedBtns) {
          el.classList.remove("btn--inactive");
        }
      } else {
        let selectedBtns = document.querySelectorAll(".dashboard--action");
        for (let el of selectedBtns) {
          el.classList.add("btn--inactive");
        }
      }
      
    });
  }
}
