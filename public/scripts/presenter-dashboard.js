import { destroyModal, modalMessage } from "../modules/modalMessage.js";

/***** HTML ELEMENTS *****/
const presenterUsername = document.getElementById("presenter-username");
const presentationList = document.getElementById("presentation-list");
const logoutBtn = document.getElementById("logout-btn");
const createPresentationButton = document.getElementById(
  "create-presentation-button"
);
const editPresentation = document.getElementById("edit-presentation");
const present = document.getElementById("present");

/***** GLOBAL VARIABLES *****/
let username = localStorage.getItem("user");
let userId = localStorage.getItem("userId");
let selectedPresentationId = -1;

window.onload = async () => {
  //1;
  setUsername();
  await displayPresentations();
};

function setUsername() {
  presenterUsername.innerHTML = username;
}

async function displayPresentations() {
  let presentations = await getPresentations();
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
    deckLine.appendChild(deleteButton);

    presentationList.appendChild(deckLine);

    deckTitle.addEventListener("click", () => {
      console.log(p.presentation_id);
      console.log(selectedPresentationId);

      if (selectedPresentationId !== p.presentation_id) {
        console.log("Another");
        // Turn of any other selections
        let selected = document.querySelector(".deckline--selected");
        console.log(selected);
        if (selected) {
          selected.classList.remove("deckline--selected");
        }
        deckLine.classList.add("deckline--selected");
      } else {
        console.log("Same");
        deckLine.classList.toggle("deckline--selected");
      }
      selectedPresentationId = p.presentation_id;

      console.log(deckLine);
      // Make nav buttons active or inactive
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

    deleteButton.addEventListener("click", async () => {
      console.log(`Deleting ${p.presentation_title}`);
      let action = await modalMessage(
        "Delete",
        `Are you sure you want to delete the presentation "${p.presentation_title}"?`,
        [
          { text: "Cancel", returnValue: false },
          { text: "Delete", returnValue: true },
        ]
      );
      destroyModal();
      if (action) {
        console.log("Deleting");
        await deletePresentation(p.presentation_id);
        await displayPresentations();
      } else {
        return;
      }
    });
  }
}

async function deletePresentation(presentationId) {
  console.log(`Deleting presentation ${presentationId}`);
  const url = "/deletePresentation";
  const cfg = {
    method: "post",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ presentationId: presentationId }),
  };
  let result = await fetch(url, cfg);
  console.log(result);
  let data = await result.json();
  console.log(data);
}

async function getPresentations() {
  try {
    let data = await fetch(`/userPresentations/${userId}`);
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

createPresentationButton.addEventListener("click", async () => {
  const url = "/createPresentation";

  const sillytoken = localStorage.getItem("sillytoken");

  const config = {
    method: "post",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + sillytoken,
    },
    body: JSON.stringify({ userId: localStorage.getItem("userId") }),
  };

  let result = await fetch(url, config);
  console.log(result);
  if(result.status === 200){
    let data = await result.json();
    location.href = `authoring.html?presentation=${data.id}`
  } else {
    console.log(result.status);
  }
/*   let data = await result.json();
  if (result.status === 200) {
    location.href = `authoring.html?presentation=${data.presentation_id}`;
  } else {
    console.log(result.status);
  }
  console.log(data); */
});

editPresentation.addEventListener("click", () => {
  if (document.querySelector(".deckline--selected")) {
    location.href = `authoring.html?presentation=${selectedPresentationId}`;
  }
});

present.addEventListener("click", () => {
  if (document.querySelector(".deckline--selected")) {
    localStorage.setItem("presentationId", selectedPresentationId);
    location.href = "presenter.html";
  }
});
