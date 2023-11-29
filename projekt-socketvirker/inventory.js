const express = require("express");
const router = express.Router();
const { db } = require("./database");

// API endpoint til at hente inventory
router.get("/", (req, res) => {
  db.all("SELECT * FROM inventory", [], (err, inven) => { // Hent alle kolonner fra inventory tabellen
      if (err) {
          console.error("Fejl i query:", err.message);
          res.status(500).json({ error: err.message });
          return;
        }
      const inventory = inven.map(item => ({ // Omdannelse af kolonner fra inventory tabellen til JSON format
        id: item.id,
        item: item.item,
        quantity: item.quantity
      }));
    res.json(inventory); // Send resultatet af query til klienten
  });
});

module.exports = router;

// Funktion til at håndtere salget af en vare fra menuen
/* const handleItemSale = (io, menuItemId) => {
  console.log("handleItemSale kører")
  db.get("SELECT ingredients from menu WHERE id = ?", [menuItemId], (err, item) => { // Hent de respektive ingredienser fra menu tabellen
      if (err) {
          console.error(err.message);
          return;
      }
       // Check if a row was returned
       if (!item) {
        console.error("Der eksisterer intet menupunkt med ID:", menuItemId);
        return;
       }

      const items = JSON.parse(item.ingredients); // Omdan listen af ingredienserne (og antallet) til JSON format som skal bruges til at opdatere inventory tabellen
      const usedIngredients = [
          { ingredient: items.ingredient1, amount: items.quantity1 },
          { ingredient: items.ingredient2, amount: items.quantity2 },
          { ingredient: items.ingredient3, amount: items.quantity3 },
      ];

      usedIngredients.forEach(update => {
          db.run("UPDATE inventory SET quantity = quantity - ? WHERE item = ?", [update.amount, update.ingredient], function(updateErr) {
              if (updateErr) {
                  console.error(updateErr.message);
                  return;
              }
              console.log("OG DEN EMITTER")
              io.emit("inventory_update", { ingredient: update.ingredient, newQuantity: this.changes });
          });
      });
  });
};

router.handleItemSale = handleItemSale; */