//* Global Properties *//
const globalUrl = "http://localhost:5678/api"
const worksUrl = globalUrl + "/works";

// Admin properties
let IsAdmin = false;
let logoutTimer;
const logoutTime = 10; // How much time you want the session to be

// Modal properties

let IsModalOpen = false; 
let modalPageId = 1;

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
            if(item.category.name === category){
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
    
            if (confirmation) {
                //Restart the timer on confirm
                StartLogoutTimer();
            }
            if(!confirmation){
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

// Handles main page changes like login/logout if Admin
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

// Handles generation of topbar and modify buttons
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
    location.reload();
    //TODO Not working for the moment
    Initialize();
}

//*** MODAL ***//

// Generate all the necessary html elements of the modal 
// except for the gallery element and the form to upload photos
function GenerateModal(){
    try{
            // modal background
            const modal = document.createElement("aside"); 
            modal.classList.add("modal");
            modal.setAttribute("id", "modal1");
            modal.setAttribute("style", "display:none");
            modal.setAttribute("aria-hidden", "true");
            modal.setAttribute("role", "dialog");
            // modal wrapper
            const modalWrapper = document.createElement("div"); 
            modalWrapper.classList.add("modal-wrapper");
            // modal buttons div
            const modalButtons = document.createElement("div");
            modalButtons.classList.add("modal-buttons")
            // back modal button
            const backModalButton = document.createElement("button");
            const backIcon = document.createElement("i");
            backModalButton.classList.add("back-button");
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
            modal.appendChild(modalWrapper);
            document.body.appendChild(modal);

            // create modal inner container div
            const modalContainer = document.createElement("section");
            modalContainer.classList.add("modal-container")
            //modal title
            const modalTitle = document.createElement("h2");
            modalTitle.classList.add("modal-title");
            modalTitle.innerHTML = "Title";
            // modal gallery
            const modalWorkSpace = document.createElement("div");
            modalWorkSpace.classList.add("modal-workspace");
            // line
            const line = document.createElement("hr");
            // Action button
            const actionButton = document.createElement("button");
            actionButton.classList.add("action-button");
            actionButton.setAttribute("id", "gallery-button");
            actionButton.textContent = "Ajouter une photo";
            // Submit button
            const submitButton = document.createElement("button");
            submitButton.classList.add("action-button");
            submitButton.setAttribute("id", "submit-button");
            submitButton.textContent = "Valider";
            // Append inner container
            modalContainer.appendChild(modalTitle);
            modalContainer.appendChild(modalWorkSpace);
            modalContainer.appendChild(line);
            modalContainer.appendChild(actionButton);
            modalContainer.appendChild(submitButton);
            modalWrapper.appendChild(modalContainer);
            // Add EventListener on modal to close when outside wrapper or its children
            modal.addEventListener("click", (e) => {
                if(!modalWrapper.contains(e.target)) {
                    DisplayModal();
                }
            }); 
    }
    catch(error){
        console.log("Error generating Modal:" + error.stack);
    }
}

// Generate the modal admin gallery elements (photo + delete buttons)
function GenerateAdminGalleryElements(){
    const globalUrl = "http://localhost:5678/api";
    const worksUrl = globalUrl + "/works";
    try{
        const modalGallery = document.querySelector(".modal-workspace");
        modalGallery.classList.add("modal-gallery");
        //Reset the gallery each time it is called
        modalGallery.innerHTML = "";
        return fetch(worksUrl)
        .then(response => {
            if(!response.ok){
                throw new Error("Error while trying to fetch data for the modal gallery")
            }
            return response.json();
        })
        .then(data => {
            data.forEach(element => {
                const imgContainer = document.createElement("div");
                const imgElement = document.createElement("img");
                const deleteButton = document.createElement("button");
                const deleteIcon = document.createElement("i");

                imgContainer.classList.add("img-container");
                imgElement.classList.add("modal-img");
                imgElement.setAttribute("id", element.id);
                imgElement.src = element.imageUrl;
                deleteIcon.classList.add("fa-solid","fa-trash-can");
                deleteButton.classList.add("delete-button");
                
                deleteButton.appendChild(deleteIcon);
                imgContainer.appendChild(imgElement);
                imgContainer.appendChild(deleteButton);
                modalGallery.appendChild(imgContainer);
            })
        })
        .catch(error => {
            console.log(error);
        });
    }
    catch(error){
        console.log(error);
    }
}

// Call the admin upload form elements generation and handle form data and submission logic 
function GenerateAdminUploadForm(){
    // fetch categories
    const categoriesUrl = `${globalUrl}/categories`

    const modalWorkspace = document.querySelector(".modal-workspace");
    modalWorkspace.classList.remove("modal-gallery");
    // Reset modal workspace before populating
    modalWorkspace.innerHTML = "";
    // Instantiate
    FetchData(categoriesUrl)
    .then((data) => {
        GenerateUploadFormElements(data);
    })
    .then(() => {
        HandleUploadGroupListener(); // Big button = input file
        HandleUploadImageListener(); // File preview logic
        AdminSubmitFormListeners(); // Form submission listener and button logic
    })
    .catch(error => {
        console.log(error);
    })
}

// Generate Html elements of the upload form
function GenerateUploadFormElements(data){
        try{
        const modalWorkspace = document.querySelector(".modal-workspace");
        //* Upload Field
        const uploadGroup = document.createElement("button");
        const uploadButton = document.createElement("button");
        const uploadMsg = document.createElement("p");
        const uploadInput = document.createElement("input");
        const uploadPreview = document.createElement("div");
        const uploadPreviewIcon = document.createElement("i");
        const uploadPreviewImage = document.createElement("img");
        // Group (Button)
        uploadGroup.className = "form-group";
        uploadGroup.setAttribute("id", "upload-group");
        uploadGroup.setAttribute("type", "button");
        // Input
        uploadInput.classList.add("form-input");
        uploadInput.setAttribute("type", "file");
        uploadInput.setAttribute("id", "input-file");
        uploadInput.setAttribute("name", "input-file");
        uploadInput.setAttribute("accept", ".jpg, .jpeg, .png");
        uploadInput.style.opacity = 0; // Hide the input field without disabling it
        uploadInput.style.display = "none"; // Hide the added buttons and filename created by input
        //* Preview
        uploadPreview.className = "file-preview-container"
        uploadPreview.appendChild(uploadPreviewIcon);
        uploadPreview.appendChild(uploadPreviewImage);
        // Preview Icon
        uploadPreviewIcon.style.height = "60px";
        uploadPreviewIcon.style.fontSize = "24px";
        uploadPreviewIcon.style.color = "#B9C5CC";
        uploadPreviewIcon.setAttribute("id", "preview-icon");
        uploadPreviewIcon.classList.add("fa-regular", "fa-image");
        // Preview Img
        uploadPreviewImage.src = "";
        uploadPreviewImage.setAttribute("id", "preview-image");
        uploadPreviewImage.style.display = "none";
        // Button
        uploadButton.setAttribute("type", "button");
        uploadButton.setAttribute("id", "fake-button");
        uploadButton.textContent = "+ Ajouter photo";
        // Message
        uploadMsg.setAttribute("id", "file-message");
        uploadMsg.innerHTML = "jpg, png: 4Mo max.";
        // Append
        uploadGroup.appendChild(uploadInput);
        uploadGroup.appendChild(uploadPreview);
        uploadGroup.appendChild(uploadButton);
        uploadGroup.appendChild(uploadMsg);

        //* Title
        const titleInput = document.createElement("input");
        const titleLabel = document.createElement("label");
        // Group
        const titleGroup = document.createElement("div");
        titleGroup.className = "form-group";
        //Input Field
        titleInput.classList.add("form-input");
        titleInput.setAttribute("name", "input-title");
        titleInput.setAttribute("id", "input-title");
        titleInput.setAttribute("type", "text");
        titleInput.setAttribute("required", "true");
        // Label
        titleLabel.setAttribute("label", "Titre");
        titleLabel.setAttribute("for", "input-title");
        titleLabel.innerHTML = "Titre";
        // Append
        titleGroup.appendChild(titleLabel);
        titleGroup.appendChild(titleInput);

        //* Category
        const categoryInput = document.createElement("select");
        const categoryLabel = document.createElement("label");
        //Group
        const categoryGroup = document.createElement("div");
        categoryGroup.className = "form-group";
        // Input field
        categoryInput.classList.add("form-input");
        categoryInput.setAttribute("name", "select-category");
        categoryInput.setAttribute("id", "select-category");
        categoryInput.setAttribute("type", "select");
        categoryInput.setAttribute("required", "true");
        // Options
        //Default null
        categoryInput.appendChild(document.createElement("option"));
        // Categories
        data.forEach(category => {
            const categoryOption = document.createElement("option");
            categoryOption.value = category.id;
            categoryOption.textContent = category.name;
            categoryInput.appendChild(categoryOption);
        })
        // Label
        categoryLabel.setAttribute("label", "Catégorie");
        categoryLabel.setAttribute("for", "select-category");
        categoryLabel.innerHTML = "Catégorie";
        //Append
        categoryGroup.appendChild(categoryLabel);
        categoryGroup.appendChild(categoryInput);

        //* Form
        const uploadForm = document.createElement("form");
        uploadForm.setAttribute("id", "upload-form");
        uploadForm.appendChild(uploadGroup);
        uploadForm.appendChild(titleGroup);
        uploadForm.appendChild(categoryGroup);
        modalWorkspace.appendChild(uploadForm);
        }
        catch(error){
            console.log(error);
        }
}

// Handle image input
function HandleUploadGroupListener(){
    try{
        const uploadButton = document.getElementById("upload-group");
        const fileInput = document.getElementById("input-file");
        // Make the big button as if click on file input
        uploadButton.addEventListener("click", function() {
            fileInput.click();
        });
    }
    catch(error){
        console.log(error);
    }
}

// Handle Upload Image preview and file validation
function HandleUploadImageListener(){
    const fileInput = document.getElementById("input-file");
    fileInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        const fakeButton = document.getElementById("fake-button");
        const errorMessage = document.getElementById("file-message");
        const previewIcon = document.getElementById("preview-icon");
        const previewImage = document.getElementById("preview-image");
        // File validation
        const MAX_FILE_SIZE_MB = 4;  // Maximum allowed file size (4 MB)
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert to bytes for JS
        const acceptedTypes = ["image/jpg", "image/jpeg", "image/png"]; // Should always be true based on input acceptance but handles error message display
        
        if(!file){
            // Nothing should happen
            return;
        }
        // If file type is wrong display error message
        if(!acceptedTypes.includes(file.type)) {
            errorMessage.style.display = "block"; // Show error message if it was previously hidden
            fakeButton.style.display = "block"; // Show button
            previewIcon.style.display = "block"; // Show the icon
            previewImage.style.display = "none"; // Hide the image
            errorMessage.textContent = "Error: the type of file is not accepted";
            return;
        }
        // If file too big display error message
        if(file.size > MAX_FILE_SIZE_BYTES) {
            errorMessage.style.display = "block"; // Show error message
            fakeButton.style.display = "block"; // Show fake button
            previewIcon.style.display = "block"; // Show the icon
            previewImage.style.display = "none"; // Hide the image
            errorMessage.textContent = `Error: the file size exceeds the limits (Maximum size: ${MAX_FILE_SIZE_MB})`;
            return;
        }
        // If all validations pass, update preview and hide all unnecessary elements
        errorMessage.style.display = "none"; // Hide error message
        fakeButton.style.display = "none"; // Hide button
        previewIcon.style.display = "none"; // Hide the icon
        previewImage.style.display = "block"; // Display the image
        const reader = new FileReader();
        reader.onload = function(element) {
            previewImage.src = element.target.result;  // Display image preview
        };
        reader.readAsDataURL(file);
    });
}

// Display Modal Gallery
function DisplayAdminGalleryPage(){
    const actionButton = document.getElementById("gallery-button");
    const submitButton = document.getElementById("submit-button");
    const backButton = document.querySelector(".back-button");
    const title = document.querySelector(".modal-title");
    const modalWorkspace = document.querySelector(".modal-workspace");
    try{
        modalPageId = 1;
        // Reset gallery
        modalWorkspace.innerHTML = "";
        // Hide back arrow 
        backButton.style.display = "none";
        backButton.setAttribute("disabled", "true");
        // Title
        title.innerHTML = "Galerie photo";
        // Generate Modal Gallery
        GenerateAdminGalleryElements()
            .then(() => {
                // Add the event listeners on delete buttons
                AddAdminDeleteEventListeners();
            })
            .catch(error => {
                console.log(error);
            });
        // Action button
        actionButton.style.display = "block";
        actionButton.addEventListener("click", DisplayAdminUploadPage);
        //Submit button
        submitButton.style.display = "none";
    }
    catch(error){
        console.log(error);
    }
}

// Display Modal UploadForm
function DisplayAdminUploadPage(){
    const actionButton = document.getElementById("gallery-button");
    const submitButton = document.getElementById("submit-button");
    const backButton = document.querySelector(".back-button");
    const title = document.querySelector(".modal-title");
    const modalWorkspace = document.querySelector(".modal-workspace");
    try{
        modalPageId = 2;
        // reset modalWorkspace before populating
        modalWorkspace.innerHTML = "";
        // Show back arrow
        backButton.style.display = "flex";
        backButton.removeAttribute("disabled");
        backButton.addEventListener("click", DisplayAdminGalleryPage);
        // Title
        title.innerHTML = "Ajout photo";
        // Action button 
        actionButton.style.display = "none";
        actionButton.removeEventListener("click", DisplayAdminUploadPage); // Clear the event listener of the action button to be sure;
        // Submit button
        submitButton.style.display = "block";
        submitButton.classList.add("disabled");
        submitButton.disabled = true;
        // Display form
        GenerateAdminUploadForm()
        // Check form fields
        CheckFormFields();
    }
    catch(error){
        console.log(error);
    }

}

// Handle Modal Pages Logic
function HandleModalPages(){
    try{
        if(modalPageId === 1){
            DisplayAdminGalleryPage();
        }
        if(modalPageId === 2){
            DisplayAdminUploadPage();
        }
    }
    catch(error){
        console.log(error);
    }
 }

// Handles display style of modal based on bool
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
            HandleModalPages();
        }
    }
    catch(error){
        console.log(error);
    }
}

// Function to send works with authorization
//TODO Check for issues after submission
function PostNewWork() {
    try{
        const sendWorkUrl = worksUrl;
        const token = sessionStorage.getItem("token");

        const inputFile = document.getElementById("input-file");
        const inputTitle = document.getElementById("input-title");
        const inputCategory = document.getElementById("select-category");

        if(token === null){
            throw new Error("Error while trying to retrieve authentication token ")
        }

        // Create formData package
        const formData = new FormData();
        formData.append("image", inputFile.files[0]);
        formData.append("title", inputTitle.value);
        formData.append("category", inputCategory.value);

        // Request
        fetch(sendWorkUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })
        .then(response => {
            if(!response.ok){
                throw new Error("Error while trying to retrieve response from API");
            }
            if(response.ok){
                console.log("Fichier téléversé avec succès!");
                DisplayAdminGalleryPage(); // Reset Modal Page
                FetchData(worksUrl)
                .then(data =>{
                    GenerateFigureElements(data);
                })
            }
        })
        .catch(error => {
            console.error(error)
        });
    }
    catch(error){
        console.log(error);
    }
}

// Function to be called by the delete buttons
function DeleteWork(id){
    try{
        const deleteUrl = `${worksUrl}/${id}`;
        const token = sessionStorage.getItem("token");

        if(token === null){
            throw new Error("Error: ID token not found")
        }
        const confirmation =  confirm("Voulez vous vraiment supprimer ce fichier ? (l'action est irréversible) " + "// id de l'objet: " + id);
        if(!confirmation){
            return;
        }
        if(confirmation){
        fetch(deleteUrl, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response =>{
            if(!response.ok){
                console.error("Erreur lors de l'envoi de la requête")
            }
            else{
                DisplayAdminGalleryPage();
                FetchData(worksUrl)
                .then(data => {
                    GenerateFigureElements(data);
                })
                .catch(error => {
                    console.log(error);
                })
            }
        })
        .catch(error => {
            console.error("Une erreur s'est produite: ", error);
        })
        }    
    }
    catch(error){
        console.log(error);
    }
}

// Find and wire all the delete buttons in the modal to the DeleteWork function while passing the img id 
function AddAdminDeleteEventListeners(){
    // Find img containers
    const imgContainers = document.querySelectorAll(".img-container");
    // Get the button within each container
    imgContainers.forEach(function(container){
        const button = container.querySelector(".delete-button");
        // for each button find the img within parent container and call the DeleteWork function passing the image id as a parameter 
        button.onclick = function() {
            const img = container.querySelector(".modal-img");
            const id = img.id;
            DeleteWork(id);
        }
    })
}

function AdminSubmitFormListeners(){
    const inputFile = document.getElementById("input-file");
    const inputTitle = document.getElementById("input-title");
    const selectCategory = document.getElementById("select-category");

    const submitButton = document.getElementById("submit-button");

    // Check for data and disable/enable the button accordingly
    inputFile.addEventListener("change", CheckFormFields);
    inputTitle.addEventListener("input", CheckFormFields);
    selectCategory.addEventListener("change", CheckFormFields);
    
    // Submit button listener
    submitButton.addEventListener("click", (event) => {
        try{
            event.preventDefault();
            PostNewWork();
        }  
        catch(error){
            console.log(error);
        }
    })
}

// Setup all admin buttons to open/close modal
function AddModalEventListeners(){
    try{
        const adminButtons = Array.from(document.querySelectorAll("button.admin-modal, a.admin-modal"));
        adminButtons.forEach(item => {
           item.addEventListener("click", DisplayModal);
        });
    }       
    catch(error){
        console.log(error);
    }
}

// Check that data is present to enable submission button
function CheckFormFields() {
    try{
    const textValue = document.getElementById("input-title").value.trim();
    const selectValue = document.getElementById("select-category").value > 0;
    const fileValue = document.getElementById("input-file").files.length > 0;

    const submitButton = document.getElementById("submit-button");

    // Enable submit button only if all fields are filled and a file is selected
    if (textValue && selectValue && fileValue) {
        submitButton.classList.remove("disabled");
        submitButton.disabled = false;
    } 
    else {
        submitButton.classList.add("disabled");
        submitButton.disabled = true;
    }
    }
    catch(error){
        console.log("Error Check Form Fields:"+ error.lineNumber + error);
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
            AddModalEventListeners();
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