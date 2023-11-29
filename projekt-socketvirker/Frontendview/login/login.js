document.addEventListener("DOMContentLoaded", () => {
    // Checker sessionStorage for en token, der indikerer hvorvidt brugeren er logget ind eller ikke
    let userToken = sessionStorage.getItem("userID");
    if (userToken) {
        // Omdiriger til index.html hvis de er logget ind
        window.location.href = "/main/index.html";
    };
}); 

const showCreateAccount = () => { // Viser blanketten for oprettelse af ny bruger
    document.getElementsByClassName("login-area")[0].style.visibility = "hidden";
    document.getElementsByClassName("create-area")[0].style.visibility = "visible";
}

const userCreation = () => { // Funktionen til at oprette en ny bruger
    let newEmail = document.getElementById("signupE-mail");
    let passwordcreation = document.getElementById("createPassword");
    let passwordconfirmation = document.getElementById("repeatPassword");

    if (newEmail.value === "" || passwordcreation.value === "" || passwordconfirmation.valu === "") {
        alert("Please fill out all fields");
        newEmail.style.border = "1px solid red";
        passwordcreation.style.border = "1px solid red";
        passwordconfirmation.style.border = "1px solid red";

        setTimeout(() => {
            newEmail.style.border = "none";
            passwordcreation.style.border = "none";
            passwordconfirmation.style.border = "none";
        }, 5000);
    } else if (passwordcreation.value !== passwordconfirmation.value) {
        alert("Passwords do not match!");
        passwordcreation.style.border = "1px solid red";
        passwordconfirmation.style.border = "1px solid red";

        setTimeout(() => {
            newEmail.style.border = "none";
            passwordcreation.style.border = "none";
        }, 5000);
    } else {
        let basicVerification = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; // kilde: https://www.w3resource.com/javascript/form/email-validation.php
        if(!basicVerification.test(newEmail.value)) { // Tjekker om e-mailen er i et gyldigt format --> Dette tjekker dog ikke hvorvidt det er en ægte e-mail
            alert("Please enter an e-mail address");
            newEmail.style.border = "1px solid red";

            setTimeout(() => {
                newEmail.style.border = "none";
            }, 5000);
            return false;
        }

        fetch ("/signup/create", { // Fetcher API endpointet til oprettelse af en ny bruger
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ // Sender det indtastede e-mail og password til serveren
                email: newEmail.value,
                password: passwordcreation.value
            })
        })
        .then(response => { 
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message);
                });
            } else { // Hvis brugeren er oprettet gives der besked om dette og brugeren "omdirigeres" til login siden
                let createTitle = document.getElementById("createtitle").children[0];
                let loader = document.getElementsByClassName("loader")[1];
                alert("Joe account created!");
                createTitle.innerHTML = "Redirecting...";
                loader.style.display = "block";
    
                    setTimeout(() => { // Resetter blanketten og skjuler den igen
                        newEmail.value = "";
                        passwordcreation.value = "";
                        passwordconfirmation.value = "";
                        document.getElementsByClassName("login-area")[0].style.visibility = "visible";
                        document.getElementsByClassName("create-area")[0].style.visibility = "hidden";
                        createTitle.innerHTML = "Create account";
                        loader.style.display = "none";
                    }, 1000);
                }
                return response.json()
            })
        .catch((error) => { // Hvis der opstår en fejl, vises en fejlmeddelelse (typisk når e-mailen allerede er i brug)
            console.log(error.message);
            alert("E-mail already in use");
            newEmail.style.border = "1px solid red";

            setTimeout(() => {
                newEmail.style.border = "none";
            }, 5000);
        });
    };
};

const userLogin = () => { // Funktionen til at logge ind
    let userMail = document.getElementById("insertE-mail");
    let userPassword = document.getElementById("insertPassword");

    if (userMail.value === "" || userPassword.value === "") {
        alert("Please fill out your login information");
        userMail.style.border = "1px solid red";
        userPassword.style.border = "1px solid red";

        setTimeout(() => {
            userMail.style.border = "none";
            userPassword.style.border = "none";
        }, 5000);
    } else {
        fetch ("/signup/login", { // Fetcher API endpointet til login (matcher e-mail og password med databasen)
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ // Sender det indtastede e-mail og password til serveren
                email: userMail.value,
                password: userPassword.value
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json()
            }})
        .then(existingUser => { 
            if (existingUser && existingUser.status === "success") { // Hvis brugeren findes i databasen, logges de ind (granted at password matcher)
                    let loginTitle = document.getElementById("logintitle").children[0];
                    let loader = document.getElementsByClassName("loader")[0];
                    loginTitle.innerHTML = "Logging in";
                    loader.style.display = "block";
        
                    setTimeout(() => {
                        // Opret en token til brugeren ved at bruge deres ID givet af databasen
                        let userToken = "userID: " + existingUser.userId;
                        // Gem token i sessionStorage
                        sessionStorage.setItem("userID", userToken); // erstattes med USERID

                        // Omdiriger til index.html (hovedmenuen)
                        window.location.href = "/main/index.html";
                        setTimeout(() => {
                            loginTitle.innerHTML = "Log in";
                            loader.style.display = "none";
                        }, 0);
                    }, 2500);
                } else { // Hvis brugeren ikke findes i databasen, fortælles der bare, at e-mail eller password er forkert
                    alert("E-mail or password is incorrect!");
                    userMail.style.border = "1px solid red";
                    userPassword.style.border = "1px solid red";
        
                    setTimeout(() => {
                        userMail.style.border = "none";
                        userPassword.style.border = "none";
                    }, 5000);
            };
        })
        .catch((error) => {
            console.error("Error:", error);
            }
        );
    };
};

