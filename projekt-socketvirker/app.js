const express = require("express");
const app = express();
const path = require("path");
const http = require("http").Server(app);
const io = require("socket.io")(http)

app.use("/socket.io", express.static(path.join(__dirname, "node_modules", "socket.io", "client-dist"))); // Tilføj socket.io til serveren
app.use((req, res, next) => {
  req.io = io; // Tilføj socket.io til alle router der bruger req
  next();
  }); 

const { initializeDatabase } = require("./database"); 
const menuRouter = require("./menu");
const inventoryRouter = require("./inventory");
const signupRouter = require("./signup");

app.use(express.json());
app.use(express.static("Frontendview")); // Tilføj statiske filer fra Frontendview mappen

initializeDatabase(); // Initialiser databasen (opretter tabeller og indsætter items og ingredienser)

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Frontendview","main","index.html")); // Send index.html til klienten
});

app.use("/menu", menuRouter);
app.use("/inventory", inventoryRouter);
app.use("/signup", signupRouter);

let antalLoggetInd = 0; // Tæller for antal brugere der logger ind / er logget ind

// Socket.io connection
io.on("connection", (socket) => { 
  antalLoggetInd++;
  console.log("En bruger er logget på");
  console.log("Antal brugere: " + antalLoggetInd); 
  
  /* socket.on("sell_item", (menuItemId) => {
    console.log("sell_item virker")
      inventoryRouter.handleItemSale(io, menuItemId);
  }); */ // DENNE FUNKTION GØR UMIDDELBART DET SAMME SOM "sellMenuItem" FUNKTIONEN I index.js og ER DERFOR IKKE NØDVENDIG

  socket.on("disconnect", () => { // Håndterer når en bruger logger af (lukker applikationen)
    antalLoggetInd--;
    console.log("Antal brugere: " + antalLoggetInd);
  });
});

const port = 3000;
http.listen(port, () => {
  console.log(`Server med Socket.IO kører på http://localhost:${port}`);
});

module.exports = app;
