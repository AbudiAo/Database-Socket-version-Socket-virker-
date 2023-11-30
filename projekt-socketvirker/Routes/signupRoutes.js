const express = require("express");
const router = express.Router();
const { db } = require("../database");
const bcrypt = require("bcrypt");
const { encryptPassword } = require("../Services/bCryptEncryption");

router.post("/create", async (req, res) => { // Opretter en ny bruger med brugerens indtastede e-mail og password
    let {email, password} = req.body;
    
    db.get("SELECT email FROM users WHERE email = ?", [email], async (error, mail) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else if (mail) { // Hvis e-mailen allerede eksisterer i databasen, sendes en fejlkode tilbage til brugeren
            res.status(409).json({ message: "Kontakt en administrator" });
            return;
        }

        let hashedPassword = await encryptPassword(password) // Krypterer passwordet med bcrypt

        db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], (err) => { // Indsætter brugerens e-mail og krypterede password i databasen
            if (err) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.json({ message: "Bruger oprettet", id: this.lastID });  // Sender en bekræftelse hvor this.lastID er brugerens ID i databasen
            console.log("Bruger oprettet med ID: " + this.lastID);
        });
    });
});

router.post("/login", async (req, res) => { // Logger brugeren ind med deres indtastede e-mail og password
    let {email, password} = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (error, user) => { // Finder brugeren i databasen ved brug af e-mailen
        if (error) {
            res.status(500).json({ error: error.message });
        } else if (user) { // Hvis brugeren findes, sammenlignes det indtastede password med det hashede password i databasen
            // Sammenlign kodeord
            const comparison = bcrypt.compareSync(password, user.password); //bcrypt.compareSync() sammenligner passwordet med det hashede password i databasen
                  if(comparison) { // hvis kodeordene matcher, sendes JSON data med status = success kode
                      res.json({ 
                        status: "success",
                        // userId og username sendes tilbage til frontenden så de kan lagres i sessionStorage kun (userId)
                        userId: user.id, 
                        username: user.email
                      });
                      console.log(`Bruger med ID: "${user.id}" er logget på`);
                  } else { // Hvis de ikke matcher, så  sendes der en fejlbesked
                    res.status(401).send({message: "Invalid credentials"}) 
                  }
              } else { // Hvis brugeren ikke findes, så  sendes der også en fejlbesked
                res.status(401).send({message: "Invalid credentials"}) 
              }
        })
    });

router.post("/userinfo", async (req, res) => { // Henter brugerens informationer fra databasen
    let userId = req.body;

    db.get("SELECT email FROM users WHERE id = ?", [userId.id], (error, user) => { // Finder brugeren i databasen ved brug af deres ID
        if (error) {
            res.status(500).json({ error: error.message });
        } else if (user) { // Når der findes en e-mail så sendes denne tilbage til klienten
            res.json({ 
                status: "success",
                username: user.email,
            });
        } else { 
            res.status(404).send({message: "E-mail ikke fundet, kontakt en administrator"}) 
        };
    });
});

module.exports = router;