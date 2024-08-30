//* Global Properties *//
const globalUrl = "http://localhost:5678/api"

// Admin properties
let IsAdmin = false;
let logoutTimer;
const logoutTime = 10; // How much time you want the session to be

// Modal properties

let IsModalOpen = false; 


//****** FETCH *******/
// Function to call API based on URL
async function FetchData(url) {
    try {
        // Make an API request
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse response as JSON
        const data = await response.json();
        // Return the data
        return data; 
    } catch (error) {
        // Return null if there's an error
        console.error('Error fetching data:', error);
        return null;
    }
}
// Function to send token to API when need for Administrator status
function FetchAuthentication() {
    try{
        const loginPostUrl = globalUrl + "/users/login";
        const token = localStorage.getItem("token");
        console.log(token);
        if(token == null){
            throw new Error("Error while trying to retrieve authentication token ")
        }
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
    catch(error){
        console.log(error);
    }
}

//****** GALLERY *******/
/** Function that handles construction of html elements of the gallery based on input (data);
 * @param {Object} data - The data you want to be generated within the gallery either fetched from the API or from a sorted Set.
 */
function GenerateFigureElements(data) {
    try{
        if(data == null){
            throw new Error("Error while trying to handle data input")
        }
        // Get Gallery Element
        const gallery = document.querySelector(".gallery");
        // Clear the gallery before inputing anything
        gallery.innerHTML = "";
        // Create HTML Elements
        for ( let i = 0; i < data.length; i++ ) {
            // Create HTML Figure
            const figureElement = document.createElement("figure");
            // Create HTML Img and get url
            const imageElement = document.createElement("img");
            imageElement.src = data[i].imageUrl;
            
            // Create HTML Caption and get data
            const captionElement = document.createElement("figcaption");
            captionElement.innerHTML = data[i].title;
            
            // Append img and caption elements to each figure
            figureElement.appendChild(imageElement);
            figureElement.appendChild(captionElement);
            
            // Append each figure to the gallery
            gallery.appendChild(figureElement);
        }
        // return gallery;
    }
    catch(error){
        console.error(error);
    }
}

/**  Generate Filter buttons based on categories fetched from API and a default one to reset filtering
 * @param {Object} data - The data needed to generate the buttons based on the categories stored in the API
 */
function GenerateFilterButtons(data) {
    try{
        // Error Management
        if(data == null){
            throw new Error("Error while trying to handle data input")
        }

        // Get Filters Div
        const filters = document.querySelector(".filters");
    
        // Create Filter div
        const filterDiv = document.createElement("div");
        filterDiv.className = "filter-section";
        filters.appendChild(filterDiv);
    
        // Create Default button
        const defaultButton = document.createElement("button");
        defaultButton.innerHTML = "Tous";
        defaultButton.classList.add("filter-button");
        defaultButton.classList.add("active");
        defaultButton.setAttribute("id", "button-default");
        filterDiv.appendChild(defaultButton);
    
        // Create Categories Filter Buttons
        for (let i = 0; i < data.length; i++) {
            const filterElement = document.createElement("button");
            filterElement.innerHTML = data[i].name;
            filterElement.classList.add("filter-button");
            filterElement.setAttribute("id", `button-${data[i].id}`);
                
            filterDiv.appendChild(filterElement);
        }
    }
    catch(error){
        console.error(error);
    }
}

/**  Function to create a set from input data as an array and sorts it based on a category as string. Returns a new Set that can be used in other functions.
 * @param {Object} data -  the data you want to sort.
 * @param {String} category - the category you want the data to be sorted by (as a string)
 * @returns the sorted data as a new Array.
*/
function SortbyCategory(data, category) {
    try{
        // Error management
        if(data == null){
            throw new Error("Error: Cannot retrieve data")
        }
        if(category == null){
            throw new Error("Error: Cannot retrieve categories")
        }

        let newSet = new Set();
        data.forEach(item => {
            if(item.category.name == category){
                newSet.add(item);  
            }
        });
        const newArray = Array.from(newSet);
        return newArray;
    }
    catch(error){
        console.error(error);
    }
}

// Handle Category buttons logic
function AddFilterButtonsEventListeners(catData, baseData) {
    try{
        const buttons = document.querySelectorAll(".filter-button")
        let activeButton = null;
        //*Function that handles the active state of buttons and allow the gallery to return to a default state when either clicked on default button or a filter button is deactivated.
        function DeactivateAllButtons() {
            buttons.forEach(button => {
              button.classList.remove("active");
            });
            activeButton = null;
          }
    
        for (let i = 0; i < catData.length + 1 ; i++) {
            // Loops through all categories to find each corresponding button and assign it the EventListener
            if (i < catData.length) {
                const button = document.getElementById(`button-${catData[i].id}`);
                button.addEventListener("click", function() {
                    // Check if button is already active or not
                    if (button === activeButton){
                       DeactivateAllButtons();
                       GenerateFigureElements(baseData);
                    }
                    // if clicked and not already active, activates the button
                    else {
                        DeactivateAllButtons();
                        button.classList.add("active");
                        activeButton = button;
                        GenerateFigureElements(SortbyCategory(baseData, baseData[i].category.name));
                    }
                });
            }
            //Handle the default button behaviour
            else {
                const button = document.getElementById("button-default");
                button.addEventListener("click", function () {
                    if (button === activeButton) {
                        DeactivateAllButtons();
                        GenerateFigureElements(baseData);
                    }
                    else {
                        DeactivateAllButtons();
                        button.classList.add("active");
                        activeButton = button;
                        GenerateFigureElements(baseData);
                    }
                });
            }
        }
    }
    catch(error){
        console.error(error);
    }
}

//****** ADMIN-MODE *******/

// Handle Automatic logout 
function StartLogoutTimer() {
    if(IsAdmin){
        // Abort former timer
        clearTimeout(logoutTimer);
        //Start timer 
        logoutTimer = setTimeout(() => {    
            // Display an alert to prompt for imminent logout
            const confirmation = confirm("Votre session va expirer dans 1 minute. Souhaitez-vous rester connecté(e) ?");
    
            if (confirmation.ok) {
                //Restart the timer on confirm
                StartLogoutTimer();
            }
            else {
                HandleLogout();
            }
          }, (logoutTime - 1) * 60 * 1000); // Starts the alert 1 minute before timeout
    } 
    else {
        return;
    }
    }

// Check for Admin Status
function CheckForAdmin(){
    try{
        const token = sessionStorage.getItem("token");
        if(token != null){
            IsAdmin = true;
        }
    }
    catch(error){
        console.log(error);
    }
}
// HandleAdminChanges
function HandleAdminChanges(){
    try{
        //Check for Admin status and modifies the page accordingly
        if(IsAdmin){
            const loginNav = document.getElementById("login-nav");
            const portfolioTitleDiv =document.querySelector(".title-div");

            // Change login nav
            loginNav.classList.add("active");
            loginNav.innerHTML = "logout"
            loginNav.addEventListener("click", (event) => {
                // Make sure the user goes back to home page
                loginNav.href = "index.html";
                // Handle redirection back to projects !IsAdmin
                HandleLogout();
            })
            // Generate Admin Mode (top bar + button)
            HandleEditionMode();
            portfolioTitleDiv.style.marginBottom = "60px"; // Add more whitespace if filter buttons are not present.
        }
    }
    catch(error){
        console.log(error);
    }
}

function HandleEditionMode(){
    try{
        // Edition Top bar
        const topBarContainer = document.createElement("div");
        const modifyButton = document.createElement("a");
        const modifyIcon = document.createElement("i") // Create element for fa icon

        topBarContainer.classList.add("topbar-container");
        modifyButton.classList.add("admin-modal");
        modifyButton.href = "#modal1"; // Sets the link for the modale
        modifyButton.innerHTML = "Mode Édition";

        modifyIcon.classList.add("fa-solid","fa-pen-to-square");
        modifyIcon.style.marginRight = "5px";
        // Append components
        modifyButton.prepend(modifyIcon);
        topBarContainer.appendChild(modifyButton);
        document.body.insertBefore(topBarContainer, document.body.firstChild); // Insert div at the very top of the body

        // "Modifier" button
        const titleDiv = document.querySelector(".title-div");

        const modalButton = document.createElement("a");
        modalButton.classList.add("admin-modal");
        modalButton.href = "#modal1";
        modalButton.innerHTML = "Modifier";

        const modalIcon = document.createElement("i");
        modalIcon.classList.add("fa-solid","fa-pen-to-square");
        modalIcon.style.marginRight = "5px";
        // Append Components
        titleDiv.appendChild(modalButton);
        modalButton.prepend(modalIcon);
    }
    catch(error){
        console.log(error);
    }
}

// Handle Logout Behaviour
function HandleLogout(){
    IsAdmin = false;
    //Clear sessionToken
    sessionStorage.removeItem("token");
    // Clear login Timer
    clearTimeout(logoutTimer);
    //Reset page
    //TODO Not working for the moment
    Initialize();
}

//** MODAL  **//

// Ge
function GenerateModal(){
    try{
        const globalUrl = "http://localhost:5678/api";
        const worksUrl = globalUrl + "/works";
        // Generate the modal container
        function GenerateModalContainer(){
            // modal background
            const modalContainer = document.createElement("aside"); 
            modalContainer.classList.add("modal");
            modalContainer.setAttribute("id", "modal1");
            modalContainer.setAttribute("style", "display:none");
            modalContainer.setAttribute("aria-hidden", "true");
            modalContainer.setAttribute("role", "dialog");
            // modal container
            const modalWrapper = document.createElement("div"); 
            modalWrapper.classList.add("modal-wrapper");
            // modal buttons div
            const modalButtons = document.createElement("div");
            modalButtons.classList.add("modal-buttons")
            // back modal button
            const backModalButton = document.createElement("button");
            const backIcon = document.createElement("i");
            backIcon.setAttribute("id", "back-button");
            backIcon.classList.add("fa-solid", "fa-arrow-left");
            backModalButton.appendChild(backIcon); // add icon within button
            // modal close button
            const closeModalButton = document.createElement("button"); 
            closeModalButton.classList.add("admin-modal");
            const closeIcon = document.createElement("i");
            closeIcon.classList.add("fa-solid", "fa-x");
            closeModalButton.appendChild(closeIcon); // add icon within button

            // Append everything
            modalButtons.appendChild(backModalButton);
            modalButtons.appendChild(closeModalButton);
            modalWrapper.appendChild(modalButtons);
            modalContainer.appendChild(modalWrapper);
            document.body.appendChild(modalContainer);
        }
        // Generate the work are of the modal
        function GenerateModalGalleryArea(){
            try{
                const modalWrapper = document.querySelector(".modal-wrapper");
                // create workarea div
                const modalWorkArea = document.createElement("section");
                modalWorkArea.classList.add("modal-workarea")
                //modal title
                const modalTitle = document.createElement("h2");
                modalTitle.classList.add("modal-title");
                modalTitle.innerHTML = "Title";
                // modal gallery
                const modalGallery = document.createElement("div");
                modalGallery.classList.add("modal-gallery");
                // line
                const line = document.createElement("hr");
                // Action button
                const actionButton = document.createElement("button");
                actionButton.classList.add("action-button");
                actionButton.textContent = "Action";
                // Append everything
                modalWorkArea.appendChild(modalTitle);
                modalWorkArea.appendChild(modalGallery);
                modalWorkArea.appendChild(line);
                modalWorkArea.appendChild(actionButton);
                modalWrapper.appendChild(modalWorkArea);
            }
            catch(error){
                console.log(error);
            }
        }
        // Generate the modal gallery elements
        function GenerateModalGalleryElements(){
            try{
                const modalGallery = document.querySelector(".modal-gallery");
                fetch(worksUrl)
                .then(response => {
                    if(!response.ok){
                        throw new Error("Error while trying to fetch data for the modal gallery")
                    }
                    return response.json();
                })
                .then(data => {
                    data.forEach(element => {
                        const figureElement = document.createElement("img");
                        figureElement.classList.add("modal-figure");
                        figureElement.src = element.imageUrl;
                        modalGallery.appendChild(figureElement);
                    })
                })
                .catch(error => {
                    console.log(error);
                });
            }
            catch(error){

            }
        }
        GenerateModalContainer();
        GenerateModalGalleryArea();
        GenerateModalGalleryElements();
    }
    catch(error){
        console.log("Error generating Modal:" + error.stack);
    }
}

function AddModalEventListeners(){
    try{
        const adminButtons = document.querySelectorAll("button.admin-modal, a.admin-modal");
        console.log(adminButtons);
        adminButtons.forEach(item => {
           item.addEventListener("click", (event) => {
                try{
                    DisplayModal();
                }
                catch(error){
                    console.log(error);
                }
            })
        });
    }
    catch(error){
        console.log(error);
    }
}

function DisplayModal(){
    try{
        const modalContainer = document.getElementById("modal1");
        if(IsModalOpen) {
            modalContainer.style.display = "none";
            IsModalOpen = false;
        }
        else if(!IsModalOpen){
            modalContainer.style.display = "flex";
            IsModalOpen = true;
        }
    }
    catch(error){
        console.log(error);
    }
}
//** INITIALIZE **//
async function Initialize(){
    try{
        // Get data from API
        const worksUrl = `${globalUrl}/works`;
        const categoriesUrl = `${globalUrl}/categories`;
        
        const worksData = await FetchData(worksUrl);
        const categoriesData = await FetchData(categoriesUrl);

        // Check for Admin status (logged in and token present in storage)
        CheckForAdmin();
        //Start automatic logout if Admin or simply returns if not
        StartLogoutTimer();

        // If Admin handle the main page modifications if not display default page and generate category filters
        if(IsAdmin){
            HandleAdminChanges();
            GenerateModal();
            AddModalEventListeners()
        }
        if (!IsAdmin){
            // Change projets' class
            const projetsNav = document.getElementById("projets-nav");
            projetsNav.classList.add("active");
            // Generate categories buttons
            GenerateFilterButtons(categoriesData);
            AddFilterButtonsEventListeners(categoriesData, worksData);
        }
        // Handle normal gallery behaviour regardless of Admin status
        GenerateFigureElements(worksData);
    }
    catch(error){
        console.error(error);
    }
}

//! Start
Initialize();
// Test
console.log("end of main program");