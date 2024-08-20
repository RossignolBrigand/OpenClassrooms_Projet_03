//!#region Global Properties

//!#endregion


//#region Fetch and Display Works Data

async function GenerateArticles() {
    
    // Fetch data from API/Works
    const reponse = await fetch("http://localhost:5678/api/works");
    const projetsData = await reponse.json();
    
    // Get Gallery Element
    const gallery = document.querySelector(".gallery");
    
    // Create HTML Elements
    for ( let i = 0; i < projetsData.length; i++ ) {
        // Create HTML Figure
        const figureElement = document.createElement("figure");
        // Create HTML Img and get url
        const imageElement = document.createElement("img");
        imageElement.src = projetsData[i].imageUrl;
        
        // Create HTML Caption and get data
        const captionElement = document.createElement("figcaption");
        captionElement.innerHTML = projetsData[i].title;
        
        // Append img and caption elements to each figure
        figureElement.appendChild(imageElement);
        figureElement.appendChild(captionElement);
        
        // Append each figure to the gallery
        gallery.appendChild(figureElement);
    }
    
}
//#endregion

//#region Generate Filters

//TODO: Build function to display works based on selected category DONT FORGET to keep back to default category.
async function GenerateFilterButtons() {
    // Fetch data from API
    const reponse = await fetch("http://localhost:5678/api/categories");
    const categories = await reponse.json();
    
    // Get Filters Div
    const filters = document.querySelector(".filters");

    // Create Filter div
    const filterDiv = document.createElement("div");
    filterDiv.className = "filter-section";
    filters.appendChild(filterDiv);

    // Create Filter Buttons + 1 Default
    for (let i = 0; i < categories.length + 1; i++) {
        console.log("in");
        const filterElement = document.createElement("button");
            if (i < categories.length) {
                filterElement.innerHTML = categories[i].name;
            }
            else {
                filterElement.innerHTML = "Default";
            }
        filterDiv.appendChild(filterElement);
    }
}

//#endregion

//#region Methods
GenerateFilterButtons();
GenerateArticles();
//#endregion