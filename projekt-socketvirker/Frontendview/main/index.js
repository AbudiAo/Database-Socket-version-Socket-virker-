document.addEventListener("DOMContentLoaded", () => {

// Opret forbindelse til Socket.IO serveren
let socket = io();

// Lyt efter "inventory_updated" begivenheden fra serveren (menu.js) --> "svar fra Router"
socket.on("inventory_update", () => {
    updateInventoryUI(); // Opdater lager UI når en "inventory_update" begivenhed modtages
});

// Checker sessionStorage for en token, der indikerer hvorvidt brugeren er logget ind eller ikke
    let userToken = sessionStorage.getItem("userID");
    if (!userToken) {
        // Omdiriger til login.html hvis de ikke er logget ind
        window.location.href = "/login/login.html"; 
    } else {

  // Hent menu data
  fetch("/menu")
      .then(response => response.json())
      .then(menuItems => {
          const menuDiv = document.getElementById("menu");
            menuItems.forEach(item => {
                const menuItem = document.createElement("div");
                const ingredientsStr = JSON.stringify(item.ingredients, null, 2);
                const button = document.createElement("button");
                button.textContent = "Sælg Vare";
                button.addEventListener("click", () => sellMenuItem(item.id));
                menuItem.innerHTML = `<h3>${item.item}</h3><pre>${ingredientsStr}</pre>`;
                menuItem.appendChild(button);
                menuDiv.appendChild(menuItem);
            });
        });

  // Hent lager data
  fetch("/inventory")
      .then(response => response.json())
      .then(inventoryItems => {
          const inventoryDiv = document.getElementById("inventory");
          inventoryItems.forEach(item => {
              const inventoryItem = document.createElement("div");
              inventoryItem.innerHTML = `<h3>${item.item}</h3><p>Mængde: ${item.quantity}</p>`;
              inventoryDiv.appendChild(inventoryItem);
          });
      });
    }
});

// Funktion til at håndtere salg af en menuvare
function sellMenuItem(menuItemId) {
    // socket.emit("sell_item", menuItemId); Ikke nødvendig da menu.js allerede håndterer salget

    fetch("/menu/sell", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: menuItemId }) // Ensure correct body data is sent
})
    .then(response => {
        if (!response.ok) {
            console.log(response);
            throw new Error("Network response was not ok " + response.statusText);
        }
            return response.json(); 
    })
    .then(data => {
        console.log(data.message);
    })
    .catch((error) => {
        console.error("Error:", error);
        alert("Der opstod en fejl under salgsprocessen. Prøv venligst igen."); // Vis en fejlmeddelelse til brugeren
    });
};

// Funktion til at opdatere lagerbeholdningen i UI (HTML elementerne)
function updateInventoryUI() {
    fetch("/inventory")
        .then(response => response.json())
        .then(inventoryItems => {
            const inventoryDiv = document.getElementById("inventory");
            // Fjern gamle lageroplysninger
            inventoryDiv.innerHTML = "";
            // Tilføj opdaterede lageroplysninger
            inventoryItems.forEach(item => {
                const inventoryItem = document.createElement("div");
                inventoryItem.innerHTML = `<h3>${item.item}</h3><p>Mængde: ${item.quantity}</p>`;
                inventoryDiv.appendChild(inventoryItem);
            });
        });
    };

/* document.sellMenuItem = function(menuItemId) {
    socket.emit("sell_item", menuItemId);
  }; */ // Ikke nødvendig da menu.js allerede håndterer salget