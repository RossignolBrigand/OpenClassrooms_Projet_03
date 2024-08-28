//TODO: Build logic to extract data from form and send Post request to API; Return the value from said request and store it into localStorage. 
//TODO: 

//* Properties

const globalUrl = "http://localhost:5678/api"
const loginPostUrl = globalUrl + "/users/login";

// Find Data containers
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");

const loginForm = document.getElementById("login-form");

// Create RegEx and Validation rules
const emailRegEx = new RegExp("[a-z0-9._-]+@[a-z0-9._-]+\.[a-z0-9._-]+");
const emailValidation = "sophie.bluel@test.tld";
const passwordValidation = "S0phie";

// Handle display of error message on page
function DisplayErrorMessage(message){
    const errorMessage = document.getElementById("email-error");
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
//* Handle Form Submission
function AddFormSubmissionListener() {
    loginForm.addEventListener("submit", function (event) {

        // Prevent the page from reloading on submit
        event.preventDefault();
        // Check RegEx for inputValidation
        const email = emailInput.value;
        const password = passwordInput.value;
        //Reset errorMessage.innerHtml
        DisplayErrorMessage("");

        if (email != emailValidation || password != passwordValidation) {
            DisplayErrorMessage("Une erreur est survenue, le mot de passe et/ou l'e-mail est erroné");
            return;
        }

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
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response failed:" + response.statusText);
                }
                console.log(response);
                return response.json();
            })
            .then(data => {
                const token = data.token;
                localStorage.setItem("token", token);
            })
            .catch(error => {
                console.warn(error);
            });
    });
}


// If correct redirect to home page, if incorrect display error message and stay on login page.
//*Initialize
function Initialize() {
    DisplayErrorMessage("");
    AddRegexListener();
    AddFormSubmissionListener();
}

//! Start
Initialize();
// Test
console.log("End of program: Login");

