const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto'); 

// Database
const db = new sqlite3.Database('storage.db');

// Initialiserer databasen og indsætter startdata
const initializeDatabase = () => {
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY, item TEXT, quantity INTEGER)');
    db.run('CREATE TABLE IF NOT EXISTS menu (id INTEGER PRIMARY KEY, item TEXT, ingredients TEXT)', () => {
      // Indsættelse af data i inventory og menu
      db.get('SELECT COUNT(*) AS count FROM inventory', (error, menu) => {
        if (error) {
          console.log("Fejl ved opsætning af lager og menu" + error.message);
        } else {
          if (menu.count === 0) {
            insertInitialData();
          } else {
            console.log("Lager og menu er allerede opsat"); 
          };
        };
      });
    });
  });
}; 

const insertInitialData = () => {
  const inventoryItems = [
    
        { item: "coffee beans", quantity: 1000 },
        { item: "whole milk", quantity: 100 },
        { item: "oat milk", quantity: 100 },
        { item: "water", quantity: 100 },
        { item: "oranges", quantity: 100 },
        { item: "apples", quantity: 100 },
        { item: "strawberries", quantity: 100 },
        { item: "blueberries", quantity: 100 },
        { item: "watermelon", quantity: 100 },
        { item: "pineapples", quantity: 100 },
        { item: "lemons", quantity: 100 },
        { item: "caramel", quantity: 100 },
        { item: "chocolate syrup", quantity: 100 },
        { item: "ice", quantity: 100 },
        { item: "vanilla ice cream", quantity: 100 },
        { item: "cup", quantity: 100 }
      
  ];

  const menuItems = [
    // Definer menu items her
     // Coffee Options
     { item: "Caffe Latte", ingredient1: "coffee beans", quantity1: 10, ingredient2: "whole milk", quantity2: 3, ingredient3: "cup", quantity3: 1 },
     { item: "Espresso", ingredient1: "coffee beans", quantity1: 7, ingredient2: "water", quantity2: 1, ingredient3: "cup", quantity3: 1 },
     { item: "Cappuccino", ingredient1: "coffee beans", quantity1: 8, ingredient2: "whole milk", quantity2: 3, ingredient3: "cup", quantity3: 1 },
     { item: "Mocha", ingredient1: "coffee beans", quantity1: 9, ingredient2: "chocolate syrup", quantity2: 2, ingredient3: "cup", quantity3: 1 },
     { item: "Americano", ingredient1: "coffee beans", quantity1: 6, ingredient2: "water", quantity2: 4, ingredient3: "cup", quantity3: 1 },
     { item: "Macchiato", ingredient1: "coffee beans", quantity1: 8, ingredient2: "caramel", quantity2: 2, ingredient3: "cup", quantity3: 1 },
     { item: "Affogato", ingredient1: "coffee beans", quantity1: 7, ingredient2: "vanilla ice cream", quantity2: 1, ingredient3: "cup", quantity3: 1 },
     { item: "Iced Coffee", ingredient1: "coffee beans", quantity1: 12, ingredient2: "ice", quantity2: 6, ingredient3: "cup", quantity3: 1 },

     // Juice Options
     { item: "Orange Juice", ingredient1: "oranges", quantity1: 3, ingredient2: "water", quantity2: 1, ingredient3: "cup", quantity3: 1 },
     { item: "Apple Juice", ingredient1: "apples", quantity1: 2, ingredient2: "water", quantity2: 1, ingredient3: "cup", quantity3: 1 },
     { item: "Strawberry Smoothie", ingredient1: "strawberries", quantity1: 5, ingredient2: "whole milk", quantity2: 2, ingredient3: "cup", quantity3: 1 },
     { item: "Blueberry Smoothie", ingredient1: "blueberries", quantity1: 4, ingredient2: "whole milk", quantity2: 2, ingredient3: "cup", quantity3: 1 },
     { item: "Mixed Berry Juice", ingredient1: "blueberries", quantity1: 2, ingredient2: "water", quantity2: 2, ingredient3: "cup", quantity3: 1 },
     { item: "Pineapple Juice", ingredient1: "pineapples", quantity1: 3, ingredient2: "water", quantity2: 1, ingredient3: "cup", quantity3: 1 },
     { item: "Watermelon Juice", ingredient1: "watermelons", quantity1: 4, ingredient2: "water", quantity2: 2, ingredient3: "cup", quantity3: 1 },
     { item: "Lemonade", ingredient1: "lemons", quantity1: 4, ingredient2: "water", quantity2: 2, ingredient3: "cup", quantity3: 1 }
  ];

  // Indsæt inventory data
  const inventoryStmt = db.prepare('INSERT OR IGNORE INTO inventory (item, quantity) VALUES (?, ?)'); 
  inventoryItems.forEach(item => {
    inventoryStmt.run(item.item, item.quantity);
  });
  inventoryStmt.finalize();

  // Indsæt menu data
  // Tilpasning af insertInitialData funktionen til at gemme en unik IV for både item og ingredients
const menuStmt = db.prepare('INSERT OR IGNORE INTO menu (item, ingredients) VALUES (?, ?)');
menuItems.forEach(item => {
  const allIngredients = JSON.stringify({
    ingredient1: item.ingredient1, quantity1: item.quantity1,
      ingredient2: item.ingredient2, quantity2: item.quantity2,
      ingredient3: item.ingredient3, quantity3: item.quantity3
    });
    menuStmt.run(item.item, allIngredients); 
});
  menuStmt.finalize();
};

module.exports = { db, initializeDatabase }; 



