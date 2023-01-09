const fs = require("fs");
const express = require("express");
const { kMaxLength } = require("buffer");
const server = express();
const PORT = 8080;

server.use(express.json());
server.use(express.static("public"));

/***** SERVER VARIABLES *****/
let connections = []; // Keeping track of connections

/***** MIDDLEWARE *****/
function sse(req, res, next) {
  res.sseSetup = function () {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
    });
    res.flushHeaders();
  };

  res.sseSend = function (data) {
    res.write("data: " + JSON.stringify(data) + "\n\n");
    server;
  };

  next();
}

/***** ENDPOINTS *****/
server.post("/login", (req, res) => {
  let user = req.body.username;
  let password = req.body.password;

  // Check if user exists
  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let database = JSON.parse(data);
      let users = database.users;
      console.log(users);
      let currentUser = users.find(
        (el) => el.password === password && el.username === user
      );
      console.log(currentUser);
      if (currentUser) {
        res.json(currentUser).end();
      } else {
        res.json({ username: null }).end();
      }
    }
  });
});

server.get("/userPresentations/:userId", (req, res) => {
  let id = req.params.userId;
  console.log("Getting user presentations");
  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let presentations = JSON.parse(data).presentations;
      //console.log(presentations);
      /*       for (let p of presentations) {
        console.log(typeof id);
      } */
      // Filter presentations for the relevant user
      let returnPresentations = presentations.filter(
        (p) => p.owner_id === parseInt(id)
      );

      res.json(returnPresentations).end();
    }
  });
});

server.get("/getDefault", (req, res) => {
  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data).end();
    }
  });
});

server.get("/getPresentation/:presentation_id", (req, res) => {
  // Authorization info
  const credentials = req.headers.authorization.split(" ")[1];
  const [username, password, role] = Buffer.from(credentials, "base64")
    .toString("UTF-8")
    .split(":");

  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json(err).end();
    } else {
      let presentationDb = JSON.parse(data);

      let users = presentationDb.users;
      // Locate the user with the given username and password
      let currentUser = users.filter(
        (u) => u.username === username && u.password === password
      )[0];
      let currentUserId = currentUser.user_id;

      let allPresentations = presentationDb.presentations;

      // Find the presentation with the id provided by the request object
      let presentation = allPresentations.find(
        (pres) =>
          parseInt(req.params.presentation_id) === pres.presentation_id &&
          pres.owner_id === currentUserId
      );
      if (presentation) {
        res.status(200).json(presentation).end();
      } else {
        res.status(500).json({ message: "Presentation not found" }).end();
      }
    }
  });
});

server.get("/getPresentationNotes/:presentation_id", (req, res) => {
  // Authorization info
  const credentials = req.headers.authorization.split(" ")[1];
  const [username, password, role] = Buffer.from(credentials, "base64")
    .toString("UTF-8")
    .split(":");
  const presentationId = req.params.presentation_id;

  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json(err).end();
    } else {
      let presentationDb = JSON.parse(data);

      let notes = presentationDb.notes;

      // Locate the notes with the current presentation id
      let currentNotes = notes.filter(
        (n) => n.presentation_id === parseInt(presentationId)
      );

      res.status(200).json({ notes: currentNotes }).end();
    }
  });
});

server.post("/createPresentation", (req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  let [username, password, role] = Buffer.from(token, "base64")
    .toString("UTF-8")
    .split(":");
  /*   console.log(username);
  console.log(password);
  console.log(role); */
  

  // Read the database
  let presentationDb = null;
  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      presentationDb = JSON.parse(data);

      // Find all presentation ids
      let presentations = presentationDb.presentations;
      let highestId = 0;
      for (p of presentations) {
        console.log(p.presentation_id > highestId);
        if (p.presentation_id > highestId) {
          highestId = p.presentation_id;
        }
      }

      // Create presentation
      let newPresentation = {
        "presentation_id": highestId + 1,
        "presentation_title": "Untitled presentation",
        "owner_id": parseInt(req.body.userId),
        "markdown": "",
        "slides": []
      }

      // Add presentation to db
      presentationDb.presentations.push(newPresentation);

      // Update db 
      fs.writeFile(
        "./presentations.json",
        JSON.stringify(presentationDb),
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).json(err).end();
          } else {
            res
              .status(200)
              .json({ message: "Presentation created", presentation_id: highestId+1 })
              .end();
          }
        }
      );

    }
  });
});

server.post("/savePresentation", (req, res) => {
  // console.log(req.body);
  let currentPresentation = req.body;

  let presentationDb = null;
  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      presentationDb = JSON.parse(data);
      /* console.log(presentationDb.presentations);
            console.log(currentPresentation.presentation_id); */
      // Find the relevant presentation in the db, and replace it with current presentation
      let presentationIndex = presentationDb.presentations.findIndex(
        (el) => el.presentation_id === currentPresentation.presentation_id
      );
      //console.log(presentationIndex);
      //console.log(presentationDb.presentations[presentationIndex]);
      //console.log(currentPresentation);
      presentationDb.presentations[presentationIndex] = currentPresentation;
      //console.log(presentationDb);

      // Write the updated file to the "database"
      fs.writeFile(
        "./presentations.json",
        JSON.stringify(presentationDb),
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).json(err).end();
          } else {
            res
              .status(200)
              .json({ message: "Presentation saved successfully" })
              .end();
          }
        }
      );
    }
  });
});

server.post("/deletePresentation", (req, res) =>{
  console.log(req.body.presentationId);

  let presentationDb = null;
  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json(err).end();
    } else {
      let presentationDb = JSON.parse(data);

      let presentations = presentationDb.presentations;

      // Filter out the presentation to delete
      presentations = presentations.filter(p => p.presentation_id !== parseInt(req.body.presentationId));

      console.log(presentations);

      presentationDb.presentations = presentations;

      // Rewrite db with the new files
      fs.writeFile(
        "./presentations.json",
        JSON.stringify(presentationDb),
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).json(err).end();
          } else {
            res
              .status(200)
              .json({ message: "Presentation deleted" })
              .end();
          }
        }
      );

      //res.status(200).json({ notes: currentNotes }).end();
    }
  });
});


server.post("/saveNotes", (req, res) => {
  //console.log(req.body);

  // Read entire file
  let allPresentations = null;
  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      allPresentations = JSON.parse(data);

      // Find the index of the presentation with the id provided by the request object
      let presentationIndex = allPresentations.findIndex(
        (pres) => parseInt(req.body.presentation) === pres.presentation_id
      );

      //console.log(allPresentations[presentationIndex].notes);

      // Find index of the notes
      let notesIndex = allPresentations[presentationIndex].notes.findIndex(
        (note) => parseInt(note.user_id) === parseInt(req.body.user)
      );
      console.log(allPresentations[presentationIndex].notes[notesIndex]);

      let newAllPresentations = allPresentations;
      newAllPresentations[presentationIndex].notes[notesIndex].markdown =
        req.body.markdown;
      console.log(newAllPresentations);

      // Write this to presentations
      fs.writeFile(
        "./presentations.json",
        JSON.stringify(newAllPresentations),
        (err) => {
          if (err) {
            console.log(err);
            res.send(500).end();
          } else {
            res.send(200).end();
          }
        }
      );
    }
  });
});

server.get("/changeSlide/:slideIndex", sse, (req, res) => {
  console.log(req.params.slideIndex);
  // Send the new slide index to all connections
  for (let connection of connections) {
    connection.sseSend(req.params.slideIndex);
  }
});

server.get("/streamPresentation", sse, (req, res) => {
  console.log("Streaming");
  res.sseSetup();
  //res.sseSend("test");
  connections.push(res);
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
