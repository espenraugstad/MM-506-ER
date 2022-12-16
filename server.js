const fs = require("fs");
const express = require("express");
const server = express();
const PORT = 8080;

server.use(express.json());
server.use(express.static("public"));

/***** SERVER VARIABLES *****/
let connections = []; // Keeping track of connections


/***** MIDDLEWARE *****/
function sse(req, res, next){
   res.sseSetup = function(){
        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
          });
          res.flushHeaders();
    }

    res.sseSend = function(data){
        res.write("data: " + JSON.stringify(data) + "\n\n");server
    }

    next();
}





/***** ENDPOINTS *****/

server.get("/getDefault", (req, res) =>{
    fs.readFile("./presentations.json", "utf-8", (err, data)=>{
        if(err){
            console.log(err);
        } else {             
            res.json(data).end();
        }
    });
});

server.get("/getPresentation/:presentation_id", (req, res)=>{
    fs.readFile("./presentations.json", "utf-8", (err, data) => {
        if(err){
            console.log(err);
        } else {
            let allPresentations = JSON.parse(data);
            // Find the presentation with the id provided by the request object
            let presentation = allPresentations.find(pres => parseInt(req.params.presentation_id) === pres.presentation_id);
            res.json(presentation).end();
        }
    })   
});

server.get("/changeSlide/:slideIndex", sse, (req, res)=>{    
    console.log(req.params.slideIndex); 
    // Send the new slide index to all connections
    for(let connection of connections){
        connection.sseSend(req.params.slideIndex);
    }
}); 

server.get("/streamPresentation", sse, (req, res)=>{
    console.log("Streaming");
    res.sseSetup();
    //res.sseSend("test");
    connections.push(res);
});

server.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`);
});