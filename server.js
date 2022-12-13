const express = require("express");
const server = express();
const PORT = 8080;

server.use(express.json());
server.use(express.static("public"));

server.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`);
});