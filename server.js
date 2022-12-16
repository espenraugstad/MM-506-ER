const fs = require("fs");
const express = require("express");
const server = express();
const PORT = 8080;

server.use(express.json());
server.use(express.static("public"));

server.get("/getDefault", (req, res) =>{
    fs.readFile("./presentations.json", "utf-8", (err, data)=>{
        //err ? console.log(err) : res.json(data).end();
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

server.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`);
});