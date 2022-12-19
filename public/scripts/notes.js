/***** HTML ELEMENTS *****/
const editor = document.getElementById('editor');
const parsed = document.getElementById('parsed');
const saveAndParse = document.getElementById('saveAndParse');

/***** GLOBAL VARIABLES *****/
let currentPresentation = null;
let presentationId;
let userId;

window.onload = async () => {
    // Get presentation and user id from url
    let url = new URLSearchParams(location.search);
    presentationId = url.get("id");
    userId = url.get("user");

    // Retrieve current presentation TODO! Check if this is actually a valid presentation!  
    let currentPresentationData = await fetch(`/getPresentation/${presentationId}`);
    currentPresentation = await currentPresentationData.json();

    // Fill editor and parsed-field with exisiting notes, if any
    populate();
}

function populate(){
    console.log(currentPresentation.notes);
    // Get the notes of the current student
    let notes = currentPresentation.notes.find(el => parseInt(el.user_id) === parseInt(userId)  );
    console.log(notes);
    editor.value = notes.markdown;
    parseNotes();
}

function parseNotes(){
    // Get markdown from editor
    let md = editor.value;

    // Parse
    let parse = marked.parse(md);

    // Put parse in parsed
    parsed.innerHTML = parse;
}

async function saveNotes(){
    // Get the markdown
    let md = editor.value;

    let result = await fetch("/saveNotes", {
        method: "post",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            presentation: presentationId,
            user: userId,
            markdown: md
        })
    });
    console.log(result);
}

/***** EVENT LISTENERS *****/
saveAndParse.addEventListener('click', ()=>{
    parseNotes();
    saveNotes();
});