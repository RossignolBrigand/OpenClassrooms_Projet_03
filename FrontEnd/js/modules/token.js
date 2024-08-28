/**
 * This modules handles all the authentication token related logic like the login/logout behaviour and IsLoggedIn bool
 */

//Variables

let IsLoggedIn = false;

// Check For Token
function CheckToken(){
    try{
        const token = sessionStorage.getItem("token");
        if(token === null){
            console.log("Vous n'êtes pas connecté(e)");
            IsLoggedIn = false;
        }
        else {
            console.log("Vous êtes connecté(e)");
            IsLoggedIn = true;
        }
        return IsLoggedIn;
    }
    catch(error){
        console.log(error);
    }
}

CheckToken();
