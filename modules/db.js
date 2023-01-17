const fs = require("fs");

class Db {
    async getDatabase(){
        try{
            const data = await fs.promises.readFile("./presentations.json", "utf-8");
            return JSON.parse(data);
        } catch (err){
            console.log("Error getting database");
            console.log(err);
        }
    }

    async writeDatabase(db){
        try{
            await fs.promises.writeFile("./presentations.json", JSON.stringify(db));
            return true;
        } catch (err){
            console.log(err);
            return false;
        }
    }

    async getStudentPresentations(id){
        let db = await this.getDatabase();
        let availablePresentations = [];

        // Loop throug all presentations and find which ones this student has access to
        let presentations = db.presentations;
        for(let p of presentations){
            let access = p.hasAccess;
            // Look for the id in the access-array
            if(access.findIndex(el => el === parseInt(id)) !== -1){
                availablePresentations.push(p);
            }   
        }

        //console.log(availablePresentations);
        return availablePresentations;
    }

    async createPresentation(userId){
        let db = await this.getDatabase();
        
        // Get the highest existing presentation id
        let presentations = db.presentations;
        let highestId = 0;
        for(let p of presentations){
            if(p.presentation_id > highestId){
                highestId = p.presentation_id;
            }
        }

        let newPresentation = {
            presentation_id: highestId + 1,
            presentation_title: "Untitled presentation",
            owner_id: parseInt(userId),
            markdown: "",
            slides: [],
            hasAccess: []
          };        
        
          db.presentations.push(newPresentation);

          let successfullyWritten = await this.writeDatabase(db);
          if(successfullyWritten){
            return highestId + 1;
          } else {
            return -1;
          }
    }

    async stopPresentation(id, key){
        let db = await this.getDatabase();

        // Make sure to find item in active
        let active = db.active;
        let activeIndex = active.findIndex(el => el.key === key && el.id === id);
        if(activeIndex === -1){
            return 404;
        } else {
            active.splice(activeIndex, 1);
            db.active = active;
            let written = await this.writeDatabase(db);
            if(written){
                return 200;
            } else {
                return 500;
            }
        }
    }
}

module.exports = Db;