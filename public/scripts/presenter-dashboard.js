/***** HTML ELEMENTS *****/
const presenterUsername = document.getElementById('presenter-username');
const presentationList = document.getElementById('presentation-list');
const logoutBtn = document.getElementById('logout-btn');

/***** GLOBAL VARIABLES *****/
let username = localStorage.getItem("user");
let userId = localStorage.getItem("userId");

window.onload = ()=>{
    setUsername();
    displayPresentations();
}

function setUsername(){
    presenterUsername.innerHTML = username;
}

async function displayPresentations(){
    let presentations = await getPresentations();
    let presentationsHTML = "";
    
    for(let presentation of presentations){
        let card = document.createElement("div");
        card.classList.add("presentation-card");

        let cardTitle = document.createElement("span");
        cardTitle.innerHTML = presentation.presentation_title;
        cardTitle.classList.add("presentation-card-title");

        card.appendChild(cardTitle);

        card.addEventListener("click", ()=>{
            console.log(presentation.presentation_id);
            location.href = `authoring.html?presentation=${presentation.presentation_id}`;
        })
       
        presentationList.appendChild(card);
    }  
    console.log(presentations);
}

async function getPresentations(){
    let data = await fetch(`/userPresentations/${userId}`);
    let presentations = await data.json();
    
    return presentations;
}

/***** EVENT LISTENERS *****/
logoutBtn.addEventListener("click", ()=>{
    localStorage.removeItem("user");
    localStorage.removeItem("presentationId");
    localStorage.removeItem("userId");
    location.replace("index.html");
    location.href="index.html";
});