/***** HTML ELEMENTS *****/
const presenterUsername = document.getElementById("presenter-username");
const presentationList = document.getElementById("presentation-list");
const logoutBtn = document.getElementById("logout-btn");
const createPresentationButton = document.getElementById(
  "create-presentation-button"
);

/***** GLOBAL VARIABLES *****/
let username = localStorage.getItem("user");
let userId = localStorage.getItem("userId");

window.onload = async () => {
  console.log("Window loaded");
  setUsername();
  await displayPresentations();
  
};

function setUsername() {
  presenterUsername.innerHTML = username;
}

async function displayPresentations() {
  let presentations = await getPresentations();
  presentationList.innerHTML = "";

  for (let presentation of presentations) {
    let card = document.createElement("div");
    card.classList.add("presentation-card");

    let cardTitle = document.createElement("span");
    cardTitle.innerHTML = presentation.presentation_title;
    cardTitle.classList.add("presentation-card-title");

    card.appendChild(cardTitle);

    card.addEventListener("click", () => {
      console.log(presentation.presentation_id);
      location.href = `authoring.html?presentation=${presentation.presentation_id}`;
    });

    presentationList.appendChild(card);
  }
}

async function getPresentations() {
  try {
    let data = await fetch(`/userPresentations/${userId}`);
    console.log(data);
    let presentations = await data.json();
    return presentations;
  } catch (err) {
    presentationList.innerHTML = "Fail!";
    console.log("An error occured");
    console.log(err);
  }
}

/***** EVENT LISTENERS *****/
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  localStorage.removeItem("presentationId");
  localStorage.removeItem("userId");
  location.replace("index.html");
  location.href = "index.html";
});

createPresentationButton.addEventListener("click", () => {
  console.log("Click");
});