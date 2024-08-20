//!#region Global Properties
// Get Gallery Element
const gallery = document.querySelector(".gallery");

//!#endregion


//#region Fetch and Display Works Data

async function GenerateArticles() {
    
    // Fetch data from API/Works
    const reponse = await fetch("http://localhost:5678/api/works");
    const projetsData = await reponse.json();

    // Create HTML Elements
    for ( let i = 0; i < projetsData.length; i++ ) {
        // Create HTML Figure
        const figureElement = document.createElement("figure");
        // Create HTML Img and get url
        const imageElement = document.createElement("img");
        imageElement.src = projetsData[i].imageUrl;
        console.log('projetsData[i].imageUrl :>> ', projetsData[i].imageUrl);
        // Create HTML Caption and get data
        const captionElement = document.createElement("figcaption");
        captionElement.innerHTML = projetsData[i].title;
        console.log('projetsData[i].title :>> ', projetsData[i].title);
        
        // Append img and caption elements to each figure
        figureElement.appendChild(imageElement);
        figureElement.appendChild(captionElement);
        
        // Append each figure to the gallery
        gallery.appendChild(figureElement);
    }

}
//#endregion

//#region Methods
GenerateArticles();
//#endregion