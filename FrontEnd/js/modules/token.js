/**
 * This modules handles all the authentication token related logic like the login/logout behaviour and IsLoggedIn bool
 */


// Check For Token
function CheckForToken() {
    const token = localStorage.getItem("token");
    console.log(token);
    fetch(loginPostUrl, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if(!response.ok){
            throw new Error("Error while trying to retrieve response from API");
        }
        console.log("token" + response);
        return response.json()
    })
    .catch(error => {
        console.error(error)
    });
}