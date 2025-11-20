//create a new user
function createUser() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const newUserID = users.length > 0 ? users[users.length - 1].id + 1 : 1;

    const newUser = {
        id: newUserID,
        user: {
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('address2').value.split(",")[0]?.trim() || '',
            state: document.getElementById('address2').value.split(",")[1]?.trim() || '',
            zip: document.getElementById('address2').value.split(",")[2]?.trim() || ''
        },
        portfolio: []//no data
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));//adds the user to users.json
    showAlert("New user created successfully!");
    loadUsers();
}
//functionj to get user info
async function loadUsers() {
    try {
        const storedUsers = localStorage.getItem("users");
        let users;

        //load users from localStorage, otherwise from users.json
        if (storedUsers) {
            users = JSON.parse(storedUsers);
        } else {
            const response = await fetch('users.json');
            users = await response.json();
            localStorage.setItem("users", JSON.stringify(users));
        }

        const userList = document.getElementById('userList');
        userList.innerHTML = '';

        users.forEach(userData => {
            const li = document.createElement('li');
            li.textContent = `${userData.user.firstname} ${userData.user.lastname}`;
            li.addEventListener('click', () => displayUserDetails(userData));
            userList.appendChild(li);
        });
    } catch (error) {
        showAlert("Error loading users");
    }
}
//custom alert message
function showAlert(message) {
    document.getElementById("alertMessage").textContent = message;
    document.getElementById("customAlert").style.display = "block";
}
//for closing it
function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
}
//event listener for the btn
document.getElementById('customAlert').addEventListener('click', closeAlert);

//load users
document.addEventListener('DOMContentLoaded', loadUsers);

//update the info of users
function saveUser() {
    const userID = parseInt(document.getElementById('userID').value);
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const userIndex = users.findIndex(user => user.id === userID);
    if (userIndex !== -1) {
        users[userIndex].user.firstname = document.getElementById('firstname').value;
        users[userIndex].user.lastname = document.getElementById('lastname').value;
        users[userIndex].user.email = document.getElementById('email').value;
        users[userIndex].user.address = document.getElementById('address').value;
        const address2 = document.getElementById('address2').value.split(",");
        users[userIndex].user.city = address2[0]?.trim() || '';
        users[userIndex].user.state = address2[1]?.trim() || '';
        users[userIndex].user.zip = address2[2]?.trim() || '';

        localStorage.setItem("users", JSON.stringify(users));
        showAlert("User updated successfully!");
        loadUsers();
        displayUserDetails(users[userIndex]);
    } else {
        showAlert("Error: User not found.");
    }
}
//delete the selected user
function deleteUser() {
    const userID = parseInt(document.getElementById('userID').value);
    let users = JSON.parse(localStorage.getItem("users"));
    users = users.filter(user => user.id !== userID);
    localStorage.setItem("users", JSON.stringify(users));
    showAlert("User deleted successfully!");
    loadUsers();
    clearForm();
}
//resets data to the initial
async function resetData() {
    try {
        const response = await fetch('users.json');
        const users = await response.json();
        localStorage.setItem("users", JSON.stringify(users));
        showAlert("Data reset to the original state!");
        loadUsers();
        clearForm();
    } catch (error) {
        showAlert("Error resetting data.");
    }
}
//clear form for better control
function clearForm() {
    document.getElementById('userID').value = '';
    document.getElementById('firstname').value = '';
    document.getElementById('lastname').value = '';
    document.getElementById('address').value = '';
    document.getElementById('address2').value = '';
    document.getElementById('email').value = '';
}
//eventlistener for the edit&save btn
document.getElementById('btneditSave').addEventListener('click', (event) => {
    event.preventDefault();
    saveUser();
});
//eventlistener for the new user btn
document.getElementById('btnCreate').addEventListener('click', (event) => {
    event.preventDefault();
    createUser();
    clearForm();
});
//eventlistener for the delete btn
document.getElementById('btnDelete').addEventListener('click', (event) => {
    event.preventDefault();
    deleteUser();
});
//eventlistener for the reset btn
document.getElementById('btnReset').addEventListener('click', (event) => {
    event.preventDefault();
    resetData();
});
//displays user portfolio which contains the model and the quantity
function displayUserDetails(userData) {
    //displays selected user info in the userform
    document.getElementById('userID').value = userData.id;
    document.getElementById('firstname').value = userData.user.firstname;
    document.getElementById('lastname').value = userData.user.lastname;
    document.getElementById('address').value = userData.user.address;
    document.getElementById('address2').value = `${userData.user.city}, ${userData.user.state}, ${userData.user.zip}`;
    document.getElementById('email').value = userData.user.email;

    const portfolioList = document.getElementById('listPortfolio');
    portfolioList.innerHTML = '';

    userData.portfolio.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('portfolio-item');
        itemDiv.innerHTML = `
            <p><strong>Model:</strong> ${item.model}</p>
            <p><strong>Quantity:</strong> ${item.owned}</p>
            <button class="delete-btn">Delete</button>
        `;


        //for the selected user portfolio, you can click on the portfolio to show the stock details
        itemDiv.addEventListener('click', () => displayStockDetails(item.model));

        //portfolio delete btn
        const deleteBtn = itemDiv.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            deletePortfolioItem(userData.id, index);
        });
        portfolioList.appendChild(itemDiv);
    });
}
//function to delete portfolio item
function deletePortfolioItem(userId, itemIndex) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(user => user.id === userId);

    users[userIndex].portfolio.splice(itemIndex, 1);
    localStorage.setItem("users", JSON.stringify(users));

    showAlert("Portfolio item deleted successfully!");

    //refresh the users and update the portfolio
    loadUsers();
    displayUserDetails(users[userIndex]);
}

//for displaying stock details
async function displayStockDetails(model) {
    const stockData = await getStockDetails(model);

    if (stockData) {
        document.getElementById('stockName').textContent = stockData.name || "N/A";
        document.getElementById('stockCategory').textContent = stockData.category || "N/A";
        document.getElementById('stockSpecs').textContent = stockData.specifications || "N/A";
        document.getElementById('stockManufacturer').textContent = stockData.manufacturer || "N/A";
    } else {
        showAlert("Stock details not found.");
    }
}
//retrieve stockdetails by model from stocks-formatted.json
async function getStockDetails(model) {
    try {
        const response = await fetch('stocks-complete.json');
        const stocks = await response.json();
        return stocks.find(stock => stock.model === model);
    } catch (error) {
        showAlert("Error fetching stock details.");
        return null;
    }
}