//* Global Properties *//
const globalUrl = "http://localhost:5678/api"
const worksUrl = globalUrl + "/works";

// Admin properties
let IsAdmin = false;

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

//#region GALLERY

// Generates the home page gallery based on data input (API/works || newSet)
function GenerateFigureElements(data) {
    try{
        if(data === null){
            throw new Error("Error while trying to handle data input")
        }
        // Get Gallery Element
        const gallery = document.querySelector(".gallery");
        // Clear the gallery before inputing anything
        gallery.innerHTML = "";

        data.forEach((item) => {
            // Create HTML Figure
            const figureElement = document.createElement("figure");
            // Create HTML Img and get url
            const imageElement = document.createElement("img");
            imageElement.src = item.imageUrl;
            
            // Create HTML Caption and get data
            const captionElement = document.createElement("figcaption");
            captionElement.innerHTML = item.title;
            
            // Append img and caption elements to each figure
            figureElement.appendChild(imageElement);
            figureElement.appendChild(captionElement);
            
            // Append each figure to the gallery
            gallery.appendChild(figureElement);
        });
    }
    catch(error){
        console.error("Error  while generating gallery elements: " + error);
    }
}

// Generates filter buttons on home page based on data (API/categories)
function GenerateFilterButtons(data) {
    try{
        // Error Management
        if(data === null){
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
        data.forEach((item) => {
            const filterElement = document.createElement("button");
            filterElement.innerHTML = item.name;
            filterElement.classList.add("filter-button");
            filterElement.setAttribute("id", `button-${item.id}`);
                
            filterDiv.appendChild(filterElement);
        })
    }
    catch(error){
        console.error("Error while trying to generate the gallery filter buttons: " + error);
    }
}

// Generates a set from the 
function SortbyCategory(data, category) {
    try{
        // Error management
        if(data === null){
            throw new Error("Error: Cannot retrieve data")
        }
        if(category === null){
            throw new Error("Error: Cannot retrieve categories")
        }
        // Set construction
        let newSet = new Set();
        data.forEach(item => {
            if(item.category.name === category){
                newSet.add(item);  
            }
        });
        return newSet;
    }
    catch(error){
        console.error("Error while trying to sort data by category: " + error);
    }
}

// Handles category buttons logic
function AddFilterButtonsEventListeners(categories, data) {
    try{
        const buttons = document.querySelectorAll(".filter-button")
        let activeButton = null;
        
        categories.forEach((item) => {
                // Loops through all categories to find each corresponding button and assign it the EventListener
                const button = document.getElementById(`button-${item.id}`);
                button.addEventListener("click", function() {
                    // Check if button is already active or not
                    if (button === activeButton){
                        DeactivateAllButtons();
                        GenerateFigureElements(data);
                    }
                    else{
                        // if clicked and not already active, activates the button
                        DeactivateAllButtons();
                        button.classList.add("active");
                        activeButton = button;
                        const sortedData = SortbyCategory(data, item.name);
                        GenerateFigureElements(sortedData);
                    }
                });
            });

        //Handle the default button behaviour
        const button = document.getElementById("button-default");
        button.addEventListener("click", function () {
            if (button === activeButton) {
                    DeactivateAllButtons();
                    GenerateFigureElements(data);
                }
            else {
                DeactivateAllButtons();
                button.classList.add("active");
                activeButton = button;
                GenerateFigureElements(data);
            }
        });
            
        //*Function that handles the active state of buttons and allow the gallery to return to a default state when either clicked on default button or a filter button is deactivated.
        function DeactivateAllButtons() {
            buttons.forEach(button => {
              button.classList.remove("active");
            });
            activeButton = null;
          }
    }
    catch(error){
        console.error("Error while handling filter buttons event listeners" + error);
    }
}

//#endregion

//#region ADMIN-MODE

// Check for Admin Status
function CheckForAdmin(){
    try{
        const token = sessionStorage.getItem("token");
        if(token != null){
            IsAdmin = true;
            console.log("You are now logged in as an Administrator")
        }
        else{
            throw new Error("Token credentials were not found!")
        }
    }
    catch(error){
        console.log("Error while checking for admin: " + error);
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
        console.log("Error while handling home page admin changes: " + error);
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
        console.log("Error while handling admin edition mode elements generation: " + error);
    }
}

// Handle Logout Behaviour
function HandleLogout(){
    IsAdmin = false;
    //Clear sessionToken
    sessionStorage.removeItem("token");
    //Reset page
    location.reload();
}

//#endregion

//#region MODAL

// Generate all the necessary html elements of the modal 
// except for the gallery element and the form to upload photos
function GenerateModal(){
    try{
            // modal background
            const modal = document.createElement("aside"); 
            modal.classList.add("modal");
            modal.setAttribute("id", "modal1");
            modal.setAttribute("role", "dialog");
            modal.setAttribute("aria-hidden", "true");
            modal.style.display = "none";
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
                    CloseModal(e);
                }
            }); 
    }
    catch(error){
        console.log("Error while generating Modal: " + error);
    }
}

// Handles display of modal based on bool
function HandleModalDisplay(e){
    try{
        if(IsModalOpen) {
            CloseModal(e)
        }
        else if(!IsModalOpen){
            OpenModal(e)
        }
    }
    catch(error){
        console.log("Error while handling the display of modal: " + error);
    }
}

function OpenModal(e) {
    e.preventDefault();
    const modal = document.getElementById("modal1");
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modal.style.display = null;
    IsModalOpen = true;
    HandleModalPages();
}

function CloseModal(e) {
    e.preventDefault();
    const modal = document.getElementById("modal1");
    // Set a timer to let the vanish animation happen
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    const hideModal = function () {
        modal.style.display = "none";
        IsModalOpen = false;
        modal.removeEventListener("animationend", hideModal);
    }
    modal.addEventListener("animationend", hideModal);
}

// Handle Modal pages generation logic (page 1 or page 2)
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
        console.log("Error while handling the choice of modal page: " + error);
    }
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
        console.log("Error while trying to display admin gallery page: " + error);
    }
}

// Generate the modal admin gallery elements (photo + delete buttons)
function GenerateAdminGalleryElements(){
    const globalUrl = "http://localhost:5678/api";
    const worksUrl = globalUrl + "/works";
    try{
        const modalGallery = document.querySelector(".modal-workspace");
        modalGallery.classList.add("modal-gallery");
        modalGallery.classList.remove("modal-form");
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
            console.log("Error while genarating admin gallery elements: " + error);
        });
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
        DisplayUploadForm()
        .then(() => {
            AddUploadGroupEventListener(); // Big button = input file
            AddUploadImageListener(); // File preview logic
            AddCheckFormListeners(); // Submit button enable or disable
            AddSubmitFormListener(); // Form submission listener and button logic
        })
        // Check form fields
        CheckFormFields();
    }
    catch(error){
        console.log("Error while trying to display modal upload page: " + error);
    }

}

// Call the admin upload form elements generation and handle form data and submission logic 
async function DisplayUploadForm(){
    try{
        // fetch categories
        const categoriesUrl = `${globalUrl}/categories`
    
        const modalWorkspace = document.querySelector(".modal-workspace");
        modalWorkspace.classList.remove("modal-gallery");
        // Reset modal workspace before populating
        modalWorkspace.innerHTML = "";
        // Instantiate
        const data = await FetchData(categoriesUrl)
        GenerateUploadFormElements(data);
    }
    catch(error){
        console.log("Error while attempting to display admin upload form: " + error);
    }
}

// Generate Html elements of the upload form
function GenerateUploadFormElements(data){
        try{
        const modalWorkspace = document.querySelector(".modal-workspace");
        modalWorkspace.classList.remove("modal-gallery");
        modalWorkspace.classList.add("modal-form");
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
        uploadMsg.innerHTML = "jpg, png : 4mo max";
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
        const categoryLabel = document.createElement("label");
        const categoryInput = document.createElement("select");
        const chevronIcon = document.createElement("i");
        //Group
        const categoryGroup = document.createElement("div");
        categoryGroup.className = "form-group";
        categoryGroup.setAttribute("id", "category-group");
        // Select field
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
        // Icon
        chevronIcon.classList.add("fa-solid", "fa-chevron-down");
        //Append
        categoryGroup.appendChild(categoryLabel);
        categoryGroup.appendChild(categoryInput);
        categoryGroup.appendChild(chevronIcon);
      
        //* Form
        const uploadForm = document.createElement("form");
        uploadForm.setAttribute("id", "upload-form");
        uploadForm.appendChild(uploadGroup);
        uploadForm.appendChild(titleGroup);
        uploadForm.appendChild(categoryGroup);
        modalWorkspace.appendChild(uploadForm);
        }
        catch(error){
            console.log("Error while generating admin upload form elements: " + error);
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
        console.log("Error while checking form fields: " + error);
    }

}

// Function to send works with authorization
function SubmitNewWork(event) {
    try{
        event.preventDefault();
        const sendWorkUrl = worksUrl;
        const token = sessionStorage.getItem("token");

        const inputFile = document.getElementById("input-file");
        const inputTitle = document.getElementById("input-title");
        const inputCategory = document.getElementById("select-category");

        if(token === null){
            HandleLogout();
            throw new Error("Error while trying to retrieve authentication token, you will be logged out")
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
                DisplayAdminGalleryPage() // Reset Modal Page
                FetchData(worksUrl)
                .then(data =>{
                    GenerateFigureElements(data);
                })
            }
        })
        .catch(error => {
            console.error("Error while trying to communicate with API: " + error)
        });
    }
    catch(error){
        console.log("Error while trying to post new element: " + error);
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
        const confirmation =  confirm("Voulez vous vraiment supprimer ce fichier ? (l'action est irréversible) ");
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
                console.error("Erreur lors de la communication avec l'API")
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
            console.error("Une erreur s'est produite lors de la suppression du fichier: " + error);
        })
        }    
    }
    catch(error){
        console.log("Error while trying to remove selected file: " + error);
    }
}

// Handles image input in upload form (aka Big button)
function AddUploadGroupEventListener(){
    try{
        const uploadButton = document.getElementById("upload-group");
        const fileInput = document.getElementById("input-file");
        //Ensure there is only one event listener
        uploadButton.removeEventListener("click", InputClick);
        // Make the big button as if click on file input
        uploadButton.addEventListener("click", InputClick);

        function InputClick(){
            fileInput.click()
        }

    }
    catch(error){
        console.log("Error while handling upload group listeners: " + error);
    }
}

// Handle Upload Image preview and file validation
function AddUploadImageListener(){
    const fileInput = document.getElementById("input-file");
    fileInput.removeEventListener("change", DisplayUploadedImage); 
    fileInput.addEventListener("change", DisplayUploadedImage); 
        
        function DisplayUploadedImage(event){
        const file = event.target.files[0];
        const fakeButton = document.getElementById("fake-button");
        const errorMessage = document.getElementById("file-message");
        const previewIcon = document.getElementById("preview-icon");
        const previewImage = document.getElementById("preview-image");
        // File validation
        const MAX_FILE_SIZE_MB = 4;  // Maximum allowed file size (4 MB)
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert to bytes for JS
        const acceptedTypes = ["image/jpg", "image/jpeg", "image/png"]; // Should always be true based on input acceptance but handles error message display
        
        if(file === null ){
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
            errorMessage.style.color = "#c51010";
            return;
        }
        // If file too big display error message
        if(file.size > MAX_FILE_SIZE_BYTES) {
            errorMessage.style.display = "block"; // Show error message
            fakeButton.style.display = "block"; // Show fake button
            previewIcon.style.display = "block"; // Show the icon
            previewImage.style.display = "none"; // Hide the image
            errorMessage.textContent = `Error: the file size exceeds the limits (Maximum size: ${MAX_FILE_SIZE_MB}mo)`;
            errorMessage.style.color = "#c51010";
            return;
        }
        // If all validations pass, update preview and hide all unnecessary elements
        errorMessage.style.display = "none"; // Hide error message
        errorMessage.style.color = "inherit"; // Reset color of message 
        fakeButton.style.display = "none"; // Hide button
        previewIcon.style.display = "none"; // Hide the icon
        previewImage.style.display = "block"; // Display the image
        const reader = new FileReader();
        reader.onload = function(element) {
            previewImage.src = element.target.result;  // Display image preview
        };
        reader.readAsDataURL(file);
        }
    
}

function AddCheckFormListeners(){
    try{
        const inputFile = document.getElementById("input-file");
        const inputTitle = document.getElementById("input-title");
        const selectCategory = document.getElementById("select-category");
    
        // Ensure only one event listener is present
        inputFile.removeEventListener("change", CheckFormFields);
        inputTitle.removeEventListener("input", CheckFormFields);
        selectCategory.removeEventListener("change", CheckFormFields);
    
        // Check for data and disable/enable the button accordingly
        inputFile.addEventListener("change", CheckFormFields);
        inputTitle.addEventListener("input", CheckFormFields);
        selectCategory.addEventListener("change", CheckFormFields);
    }
    catch(error){
        console.log("Error while handling form fields listeners: " + error);
    }
}

function AddSubmitFormListener(){
    try{
        const submitButton = document.getElementById("submit-button");
        // Ensure only one listener is present
        submitButton.removeEventListener("click", SubmitNewWork);
        // Submit button listener
        submitButton.addEventListener("click", SubmitNewWork);
    }
    catch(error){
        console.log("Error while handling admin submit form listener: " + error);
    }

}

// Setup all admin buttons to open/close modal
function AddModalEventListeners(){
    try{
        const adminButtons = Array.from(document.querySelectorAll("button.admin-modal, a.admin-modal"));
        adminButtons.forEach(item => {
           item.addEventListener("click", HandleModalDisplay);
        });
    }       
    catch(error){
        console.log("Error while handling modal event listeners: " + error);
    }
}

//#endregion

//** INITIALIZE **//
async function Initialize(){
    try{
        // Get data from API
        const worksUrl = `${globalUrl}/works`;
        const categoriesUrl = `${globalUrl}/categories`;
        
        const works = await FetchData(worksUrl);
        const categories = await FetchData(categoriesUrl);

        // Check for Admin status (logged in and token present in storage)
        CheckForAdmin();

        // If Admin handle the main page modifications if not display default page and generate category filters
        if(IsAdmin){
            HandleAdminChanges();
            GenerateModal();
            AddModalEventListeners();
        }
        if(!IsAdmin){
            // Change projets' class
            const projetsNav = document.getElementById("projets-nav");
            projetsNav.classList.add("active");
            // Generate categories buttons
            GenerateFilterButtons(categories);
            AddFilterButtonsEventListeners(categories, works);
        }
        // Handle normal gallery behaviour regardless of Admin status
        GenerateFigureElements(works);
    }
    catch(error){
        console.error(error);
    }
}

//! Start
Initialize();