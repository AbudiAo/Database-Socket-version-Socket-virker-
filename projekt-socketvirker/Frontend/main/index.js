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
        displayUserMail(); // Viser brugerens e-mail på klienten

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
const sellMenuItem = (menuItemId) => {
    // socket.emit("sell_item", menuItemId); Ikke nødvendig da menu.js allerede håndterer salget

    fetch("/menu/sell", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: menuItemId }) // Sender menuvarens ID til serveren
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
const updateInventoryUI = () => {
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

// LOG OUT CODE
let userLogOutBtn = document.getElementById("userLogOutBtn")
    userLogOutBtn.addEventListener("click", () => {
        userlogOut();
    });

const userlogOut = () => {
    sessionStorage.removeItem("userID");
    setTimeout(() => {
        window.location.href = "/login/login.html";
    }, 10000);
};

// DISPLAY USER EMAIL
const displayUserMail = () => {
    const findUserMail = sessionStorage.getItem("userID");
    const findUserID = findUserMail.split(": ")[1];
    let mailPlaceHolder = document.getElementById("loggedInName");

    fetch("/signup/userinfo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: findUserID })
    })
    .then(response => {
        if (response.ok) {
            return response.json(); 
        } else {
            console.log(response);
            throw new Error("Network response was not ok " + response.status);  
        }
    }) 
    .then(data => {
        mailPlaceHolder.innerHTML = data.username;
    })
    .catch((error) => {
        console.error("Error:", error);
    });
};