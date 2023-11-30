const express = require("express");
const router = express.Router();
const { db } = require("../database");


// GET route for "/menu"
router.get("/", (req, res) => {
    db.all("SELECT id, item, ingredients FROM menu", [], (err, rows) => { // Hent alle kolonner fra menu tabellen
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Der skete en serverfejl." });
        }

        // Brug map for at transformere rækkerne og filtrer derefter null-værdier væk
        const themenu = rows.map(menu => {
            let menuItem, itemIngredients;
            try {
                menuItem = menu.item;
                itemIngredients = menu.ingredients;

                if (itemIngredients === null) {
                    // Log fejlen og spring over denne iteration
                    console.error("Dekrypteringsfejl for ingredienser");
                    return null;
                }

                // Parse itemIngredients som JSON og omdanner det til ingredients (et objekt af ingredienslisten)
                const ingredients = JSON.parse(itemIngredients); 

                // Returnerer objektet til det endelige array af objekter
                return { 
                    id: menu.id,
                    item: menuItem,
                    ingredients: ingredients
                }; 
            } catch (error) {
                // Log og håndter JSON parse fejl
                console.error("JSON Parse fejl: ", error);
                return null;
            }
        }).filter(item => item !== null); // Fjern null-værdier fra resultatet

        // Send det endelige resultat som JSON
        res.json(themenu);
    });
});

router.post("/sell", async (req, res) => {
    const io = req.io; // Hent socket.io fra "req"
    const { id } = req.body;
    let transactionActive = false; // Bruges til at holde styr på om en transaktion er aktiv i tilfælde af "rollbacks"
    if (!id || isNaN(id)) { // Sørger for, at "id" er en gyldig værdi
        return res.status(400).json({ error: "Ugyldig ID værdi." });
    } 
        try {
            db.run("BEGIN TRANSACTION"); // Starter en transaktion (åbner databasen)
            transactionActive = true; 
           
            const rows = await new Promise((resolve, reject) => {
                db.get("SELECT * FROM menu WHERE id = ?", [id], (err, item) => { // Henter den specifikke vare fra menu tabellen i databasen
                    if (err) {
                        reject(err);
                    } else if (!item) {
                        reject(new Error("Varen blev ikke fundet"));
                    } else {
                        resolve(item);
                    }
                });
            });

            const ingredients = JSON.parse(rows.ingredients); // Omdanner ingredienserne til et objekt
            let ingredientsArray = Object.entries(ingredients); // Omdanner objekt til array af objekter
            
            for (let i = 0; i < ingredientsArray.length; i+=2) { // Kører igennem arrayet og henter hver anden værdi, da hver anden værdi er mængden af ingrediensen
                const ingredientName = ingredientsArray[i][1]; // Henter ingrediens navnet
                const amountToReduce = parseInt(ingredientsArray[i + 1][1], 10); // Henter mængden af ingrediensen og omdanner den til et tal
                
                console.log("Ingrediens: " + ingredientName + ", Mængde forbrugt: " + amountToReduce)
                    await new Promise((resolve, reject) => {
                        db.run("UPDATE inventory SET quantity = quantity - ? WHERE item = ?", [amountToReduce, ingredientName], (err) => { // Opdaterer lageret
                            if (err) {
                                reject(err);
                            }
                            resolve();
                        });
                    });
                };
                await db.run("COMMIT");
                transactionActive = false; // Transaktionen er gennemført
                    if (transactionActive === false) { 
                        res.status(200).json({ message: "Salg behandlet og lager opdateret" }); // Sender en besked til klienten om, at salget er gennemført
                        io.emit("inventory_update"); // Sender en besked til alle klienter om, at lageret er opdateret, så HTML kan opdateres
                        console.log("Salg behandlet og lager opdateres");
                    };
        } catch (e) {
            if (transactionActive) { // Hvis der er en aktiv transaktion, så "afbrydes" forbindelsen
                await db.run("ROLLBACK"); 
            };
        };
    });
module.exports = router;

/*      if (!res.headersSent) {
            if (e.message === "Varen blev ikke fundet.") {
                res.status(404).json({ error: e.message });
            } else {
                res.status(500).json({ error: "Serverfejl under opdatering af databasen." });
            }
        } */
// return router; // HUSK! Returnerer routeren til app.js
