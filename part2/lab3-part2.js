//this class encapsulates all relevant data
class Computer {
    constructor(model, name, specifications, category, manufacturer, address, releaseDate, popularity, image = '') {
        this.model = model;
        this.name = name;
        this.specifications = specifications;
        this.category = category;
        this.manufacturer = manufacturer;
        this.address = address;
        this.releaseDate = releaseDate;
        this.popularity = popularity;
        this.image = image;
    }

    //demonstrate computer model details
    displayInfo() {
        return `
            <div class="computer-info">
                ${this.image ? `<img src="${this.image}" alt="${this.name}" class="computer-image">` : ''}
                <h3>${this.name}</h3>
                <p><strong>Specifications:</strong> ${this.specifications}</p>
                <p><strong>Category:</strong> ${this.category}</p>
                <p><strong>Manufacturer:</strong> ${this.manufacturer}</p>
                <p><strong>Address:</strong> ${this.address}</p>
                <p><strong>Release Date:</strong> ${this.releaseDate}</p>
                <p><strong>Popularity:</strong> ${this.popularity}</p>
            </div>`;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const computers = '../part1/stocks-formatted.json';
    const computerList = document.getElementById('computerList');
    const categoryList = document.getElementById('categoryList');
    const txtFilter = document.getElementById('txtFilter');
    const btnFilter = document.getElementById('btnFilter');
    const sortList = document.getElementById('sortList');
    const computerDetails = document.getElementById('computerDetails');
    const appliedFilters = document.createElement('div'); //to show which filters are applied
    appliedFilters.id = "appliedFilters";
    computerDetails.parentNode.insertBefore(appliedFilters, computerDetails);

    //store all the computer data from the JSON file
    let allData = [];

    //fetch from the json file
    fetch(computers)
        .then(response => response.json())
        .then(data => {
            allData = data;
            fillComputerList(data);
        })

    //computer model dropdown
    function fillComputerList(data) {
        computerList.innerHTML = '<option value="">Select Model</option>';
        
        //loop through each computer item
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.model;
            option.textContent = item.name;
            computerList.appendChild(option);
        });
    }

    btnFilter.addEventListener('click', () => {
        applyFilters();
    });

    //filter based on the category and the specification
    function applyFilters() {
        const filterTerm = txtFilter.value.toLowerCase(); //get the text and lower case for easier comparison
        const selectedCategory = categoryList.value; //selected category
        const selectedSort = sortList.value; //for sorting

        //variable base on category and specification
        let filteredData = allData.filter(item =>
            (selectedCategory === "" || item.category === selectedCategory) && //for category to match
            item.specifications.toLowerCase().includes(filterTerm) //for entered specification to match
        );

        //sort the filtered data in descending order
        if (selectedSort === "popularity") {
            filteredData.sort((a, b) => b.popularity - a.popularity);
        } else if (selectedSort === "releaseDate") {
            //sort by release date, newest first
            filteredData.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        }

        //for showing the summary of filters applied
        const appliedFilters = {
            category: selectedCategory ? selectedCategory : "All Categories",
            specifications: filterTerm ? filterTerm : "None",
            sortBy: selectedSort ? selectedSort : "None"
        };

        //display the filtered and sorted data
        updateDisplay(filteredData, appliedFilters);
    }

    sortList.addEventListener('change', () => {
        applyFilters();
    });

    //to show different models
    computerList.addEventListener('change', () => {
        const selectedModel = computerList.value;

        //find the selected model
        const selectedComputer = allData.filter(item => item.model === selectedModel);
        const appliedFilters = {
            model: selectedModel ? selectedModel : "None"
        };

        //show the details
        updateDisplay(selectedComputer, appliedFilters);
    });

    //update the Html to display the filtered details
    function updateDisplay(computers, appliedFilters) {
        let filtersText = "Filters Applied:";
        if (appliedFilters.category) filtersText += ` Category: ${appliedFilters.category}`;
        if (appliedFilters.specifications) filtersText += ` Specifications: ${appliedFilters.specifications}`;
        if (appliedFilters.sortBy) filtersText += ` | Sorted by: ${appliedFilters.sortBy}`;

        //for showing computers if there are none then show "no results"
        if (computers.length > 0) {
            computerDetails.innerHTML = `
                <p class="filters-text">${filtersText}</p>
                ${computers.map(comp => `
                    <div class="computer-item">
                        <img src="${comp.image}" alt="${comp.name}" class="computer-image" />
                        <h3>${comp.name}</h3>
                        <p>Specifications: ${comp.specifications}</p>
                        <p>Category: ${comp.category}</p>
                        <p>Manufacturer: ${comp.manufacturer}</p>
                        <p>Address: ${comp.address}</p>
                    </div>
                `).join("<hr>")}`;
        } else {
            computerDetails.innerHTML = "<p>No results found.</p>";
        }
    }

    //display the applied filters
    function showAppliedFilters(category, specs) {
        appliedFilters.innerHTML = `<strong>Filters Applied:</strong> 
            ${category ? `Category: ${category}` : 'Category: All'}
            ${specs ? ` | Specifications: "${specs}"` : ''}`;
        appliedFilters.style.margin = '10px 0';
        appliedFilters.style.padding = '10px';
        appliedFilters.style.backgroundColor = '#f0f8ff';
        appliedFilters.style.border = '1px solid #d3d3d3';
        appliedFilters.style.borderRadius = '5px';
    }
});
