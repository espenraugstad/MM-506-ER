const fs = require("fs");
const Storage = require("./modules/db.js");
const express = require("express");
const server = express();
const PORT = 8080;

server.use(express.json());
server.use(express.static("public"));

/***** SERVER VARIABLES *****/
const db = new Storage();
let connections = []; // Keeping track of connections
let slideIndex = 0;

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

/***** HELPER FUNCTIONS *****/
function generateKey() {
  const chars = "0123456789";
  let ran = "";
  for (let i = 0; i < 5; i++) {
    ran += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return ran;
}

/***** ENDPOINTS *****/
server.post("/login", (req, res) => {
  console.log(req.body);
  let user = req.body.username;
  let password = req.body.password;
  let role = req.body.role;

  // Check if user exists
  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let database = JSON.parse(data);
      let users = database.users;
      console.log(users);
      let currentUser = users.find(
        (el) =>
          el.password === password && el.username === user && el.role === role
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
      console.log(currentUser);
      let currentUserId = currentUser.user_id;

      let allPresentations = presentationDb.presentations;
      console.log(allPresentations);
      // Find the presentation with the id provided by the request object
      if (currentUser.role === "presenter") {
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
      } else if(currentUser.role === "student"){
        console.log("Current role is student");
        console.log(currentUser);

        let presentation = allPresentations.find((pres) => { return (parseInt(req.params.presentation_id) === pres.presentation_id && pres.hasAccess.findIndex(id => id === currentUser.user_id) !== -1);
        });
        console.log(presentation);

        if(presentation){
          res.status(200).json(presentation).end();
        } else {
          res.status(404).json({message: "Presentation not found"}).end();
        }

      } else {
        res.status(400).json({message: "Invalid role"}).end();
      }
    }
  });
});

server.get("/studentPresentations/:studentId", async (req, res) => {
  console.log(req.params.studentId);
  let data = await db.getStudentPresentations(req.params.studentId);
  console.log(data);
  if (data) {
    res.status(200).json(data).end();
  } else {
    res.status(500).end();
  }
  //let dta = await db.getDatabase();
  //console.log(dta);
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

server.get("/getPresentationByKey/:key", (req, res) => {
  let key = req.params.key;
  console.log(key);

  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let db = JSON.parse(data);
      let active = db.active;

      // See if current presentation is active
      let activeIndex = active.findIndex((el) => el.key === key);
      if (activeIndex > -1) {
        console.log("Presentation is active");
        // Get presentation id
        let id = active[activeIndex].id;

        // Get the presentation
        let p = db.presentations.find(
          (el) => el.presentation_id === parseInt(id)
        );

        res.status(200).json({ presentation: p }).end();
      } else {
        console.log("Presentation is not active");
        res.status(404).end();
      }
    }
  });
});

server.post("/createPresentation", async (req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  let [username, password, role] = Buffer.from(token, "base64")
    .toString("UTF-8")
    .split(":");

  let result = await db.createPresentation(req.body.userId);
  console.log(result);
  if (result !== -1) {
    res.status(200).json({ msg: "Success", id: result }).end();
  } else {
    res.status(500).end();
  }
});

server.post("/oldCreatePresentation", (req, res) => {
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
      for (let p of presentations) {
        console.log(p.presentation_id > highestId);
        if (p.presentation_id > highestId) {
          highestId = p.presentation_id;
        }
      }

      // Create presentation
      let newPresentation = {
        presentation_id: highestId + 1,
        presentation_title: "Untitled presentation",
        owner_id: parseInt(req.body.userId),
        markdown: "",
        slides: [],
      };

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
              .json({
                message: "Presentation created",
                presentation_id: highestId + 1,
              })
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

server.post("/deletePresentation", (req, res) => {
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
      presentations = presentations.filter(
        (p) => p.presentation_id !== parseInt(req.body.presentationId)
      );

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
            res.status(200).json({ message: "Presentation deleted" }).end();
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

server.post("/startPresentation", (req, res) => {
  console.log(req.body);
  const id = req.body.id;

  fs.readFile("./presentations.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let db = JSON.parse(data);
      console.log(db);
      let active = db.active;
      console.log(active);
      let key = generateKey();
      while (active.findIndex((el) => el.key === key) !== -1) {
        key = generateKey();
      }
      db.active.push({ key: key, id: id });

      // Rewrite db
      fs.writeFile("./presentations.json", JSON.stringify(db), (err) => {
        if (err) {
          console.log(err);
          res.send(500).end();
        } else {
          res.status(200).json({ key: key }).end();
        }
      });
    }
  });
});

server.post("/stopPresentation", async (req, res) => {
  console.log(req.body);
  let id = req.body.id;
  let key = req.body.key;
  try {
    let result = await db.stopPresentation(id, key);
    res.status(result).end();
  } catch (err) {
    console.log("Unable to stop presentation");
    console.log(err);
  }

  /* if(removed){
    res.status(200).end();
  } else {
    res.status(500).end();
  } */
});

function sendNewSlide(index) {
  console.log("Changing slide");

  console.log(index);

  for (let c of connections) {
    c.write(`data: ${index}\n\n`);
  }

  //res.write("event: slideChange\n");
}
/* 
server.get("/changeSlide", (req, res) => {
  sendNewSlide(req.query.slide);
});
 */
server.get("/connectSSE", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  connections.push(res);
});

server.get("/changeSlide/:slideIndex", (req, res) => {
  /*   console.log("Changing slide");
  console.log(req.params.slideIndex);
  // Send the new slide index to all connections
  for (let connection of connections) {
    connection.write(`data: ${req.params.slideIndex}\n\n`);
  } */
  let newSlideIndex = parseInt(req.params.slideIndex);
  if (newSlideIndex !== slideIndex) {
    slideIndex = newSlideIndex;
    res.status(200).end();
  } else {
    res.status(304).end();
  }
});

server.get("/slideIndex", (req, res) => {
  res.json({ index: slideIndex }).end();
});

/* server.get("/changeSlide/:slideIndex", (req, res) => {
  console.log("Changing slide");
  console.log(req.params.slideIndex);
  // Send the new slide index to all connections
  for (let connection of connections) {
    connection.write(`data: ${req.params.slideIndex}\n\n`);
  }
}); */

/* server.get("/streamPresentation", sse, (req, res) => {
  console.log("Streaming");
  res.sseSetup();
  //res.sseSend("test");
  connections.push(res);
}); */

server.get("/streamPresentation", (req, res) => {
  console.log("Streaming");

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  };

  res.writeHead(200, headers);

  // Add connection to array
  connections.push(res);
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
