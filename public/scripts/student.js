/***** HTML ELEMENTS *****/
const takeNotesBtn = document.getElementById('take_notes');
const presentationId = document.getElementById('presentation_id');

/***** EVENT LISTENERS *****/
takeNotesBtn.addEventListener('click', ()=>{
    let id = presentationId.value;
    let userId = 0;
    location.href=`./modules/notes.html?id=${id}&user=${userId}`;
});