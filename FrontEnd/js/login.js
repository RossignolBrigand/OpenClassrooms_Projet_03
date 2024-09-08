//TODO: Build logic to extract data from form and send Post request to API; Return the value from said request and store it into localStorage. 
//TODO: 

//* Properties

const globalUrl = "http://localhost:5678/api"
const loginPostUrl = globalUrl + "/users/login";

// Find Data containers
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");

const loginForm = document.getElementById("login-form");

// Create RegEx
const emailRegEx = new RegExp("[a-z0-9._-]+@[a-z0-9._-]+\.[a-z0-9._-]+");

// Handle display of error message on login page
function DisplayErrorMessage(message){
    const errorMessage = document.getElementById("error-message");
    errorMessage.innerHTML = message;
    return errorMessage;
}

//* Check input fields on user input for validation
function AddRegexListener(){
    emailInput.addEventListener("change", (event) => {
        const emailValue = event.target.value;
        DisplayErrorMessage("");
        if (emailRegEx.test(emailValue) == false){
            DisplayErrorMessage("Veuillez saisir une adresse e-mail valide");
        }
    })
}

//* Handle Login Form Submission
function AddFormSubmissionListener() {
    loginForm.addEventListener("submit", function (event) {

        // Prevent the page from reloading on submit
        event.preventDefault();
        // Check RegEx for inputValidation
        const email = emailInput.value;
        const password = passwordInput.value;
        //Reset errorMessage.innerHtml
        DisplayErrorMessage("");
        // Create Package to send to API
        const loginData = {
            "email": email,
            "password": password
        };
        console.log(loginData);
        // Send package to API
        fetch(loginPostUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        })
        // Handle API response
        .then(response => {
            if (!response.ok) {
                DisplayErrorMessage("Une erreur est survenue, vérifiez votre e-mail/mot de passe.");
                return;
            }
            return response.json();
        })
        // Create Authentication Token
        .then(data => {
            const token = data.token;
            sessionStorage.setItem("token", token);
            window.location.href = "index.html"
            return token;
        })
        .catch(error => {
            console.warn(error);
        });
    });
}

//*Initialize
function Initialize() {
    DisplayErrorMessage("");
    AddRegexListener();
    AddFormSubmissionListener();
}

//! Start
Initialize()
console.log("End of program: Login");