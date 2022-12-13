const fs = require("fs");
const express = require("express");
const server = express();
const PORT = 8080;

server.use(express.json());
server.use(express.static("public"));

server.get("/getDefault", (req, res) =>{
    fs.readFile("./presentations.json", "utf-8", (err, data)=>{
        err ? console.log(err) : res.json(data).end();
    });
    
});

server.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`);
});