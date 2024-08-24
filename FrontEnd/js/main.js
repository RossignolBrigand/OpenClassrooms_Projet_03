//* Global Properties *//
const globalUrl = "http://localhost:5678/api"

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

/** Function that handles construction of html elements of the gallery based on input (data);
 * @param {Object} data - The data you want to be generated within the gallery either fetched from the API or from a sorted Set.
 */
function GenerateFigureElements(data) {
    
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
    
}

/**  Generate Filter buttons based on categories fetched from API and a default one to reset filtering
 * @param {Object} data - The data needed to generate the buttons based on the categories stored in the API
 */
function GenerateFilterButtons(data) {
    
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
            if (i < data.length) {
                filterElement.innerHTML = data[i].name;
                filterElement.classList.add("filter-button");
                filterElement.setAttribute("id", `button-${data[i].id}`);
            }
            else {
                throw new Error(error);
            }
        filterDiv.appendChild(filterElement);
    }
}

/**  Function to create a set from input data as an array and sorts it based on a category as string. Returns a new Set that can be used in other functions.
 * @param {Object} data -  the data you want to sort.
 * @param {String} category - the category you want the data to be sorted by (as a string)
 * @returns the sorted data as a new Set.
*/
function SortbyFilter(data, category) {
    let newSet = new Set();
    data.forEach(item => {
        if(item.category.name == category){
            newSet.add(item);  
        }
    });
    return newSet;
}
/** This function loops through all the buttons found within the filter section and maps them based on the categories fetched from the API. 
 *  Then for each button we assign them an eventListener function which creates a specific set based on the works fetched from the API and filters them into a set based on the category the button is named from.
 *  To finish the set in converted back to an array and we call the GenerateFigureElements function. 
 * @param {Object} catData - the Categories fetched from the API. Needed to loop through the buttons and find their id based on each category.
 * @param {Object} baseData - the array of works needed to create sets and convert them or restore the filtering back to default.
 */
function AddFilterButtonsEventListeners(catData, baseData) {

    const buttons = document.querySelectorAll(".filter-button")
    let activeButton = null;
    /**Function that handles the active state of buttons and allow the gallery to return to a default state when either clicked on default button or a filter button is deactivated.
     * 
     */
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
                    const sortedSet = SortbyFilter(baseData, baseData[i].category.name);
                    const sortedArray = Array.from(sortedSet);
                    GenerateFigureElements(sortedArray);
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
// 
async function Initialize(){
    const worksUrl = `${globalUrl}/works`;
    const categoriesUrl = `${globalUrl}/categories`;
    
    const worksData = await FetchData(worksUrl);
    const categoriesData = await FetchData(categoriesUrl);

    GenerateFilterButtons(categoriesData);
    GenerateFigureElements(worksData);
    AddFilterButtonsEventListeners(categoriesData, worksData);
}


//! Start
Initialize();