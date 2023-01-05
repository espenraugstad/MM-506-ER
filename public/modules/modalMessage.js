export function modalMessage(title, message, buttons) {
  return new Promise((res, rej) => {
    console.log(buttons);
    let modal = document.createElement("div");
    modal.classList.add("modal-message");
    let modalHtml = `<h1>${title}</h1><p>${message}</p>`;
    modal.innerHTML = modalHtml;
    let modalButtonArea = document.createElement("div");
    modalButtonArea.classList.add("modal-button-area");
    modal.appendChild(modalButtonArea);

    // Add buttons
    for (let b of buttons) {
      let newButton = document.createElement("button");
      newButton.innerHTML = b.text;
      newButton.addEventListener("click", () => {
        res(b.returnValue);
      });
      modalButtonArea.appendChild(newButton);
    }

    document.querySelector("body").appendChild(modal);

    // Fade everything else
    let fadeElements = document.querySelectorAll("body > :not(.modal-message)");
    //fadeElements.style.filter = "opacity(0.2)";
    console.log(fadeElements);
    for (let el of fadeElements) {
      //el.style.filter = "opacity(0.2)";
      el.classList.add("fade");
    }
  });
}

export function destroyModal(){
    console.log("Destroying modal");
    // Retrieve the modal div
    let allModals = document.querySelectorAll(".modal-message");
    for(let modal of allModals){
        modal.remove();
    }

    // Remove all fade classes
    let allFades = document.querySelectorAll(".fade");
    for(let f of allFades){
        f.classList.remove("fade");
    }
}
