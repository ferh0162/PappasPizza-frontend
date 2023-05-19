// Initialize the order process
export function innitOrder() {
    // Display cart items and add event listener to the user form submission
    console.log("Hello from Order");
    displayCartItems();
    document.getElementById('userForm').addEventListener('submit', saveUserInformation);
}



// Display cart items
function displayCartItems() {
    // Retrieve the cart from local storage
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        const cart = JSON.parse(storedCart);
        const cartItems = document.getElementById("cart-items");
        cartItems.innerHTML = "";
        let total = 0;
        
        // Iterate through each item in the cart and generate HTML elements for display
        for (const item of cart) {
            const li = document.createElement("li");
            li.className = "cart-item";
            const itemDetails = item.isDrink ? `${item.size}` : `${item.id}.`;

            // Create the added ingredients section with a "+" sign
            const addedList = item.added ? item.added.map(ingredient => `+${ingredient.name}`).join('<br>') : '';
            const addedPrice = item.added ? item.added.reduce((total, ingredient) => total + ingredient.price, 0) : 0;

            // Generate HTML structure for each cart item
            li.innerHTML = `
                <div class="item-id">${itemDetails}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-added">${addedList}</div>
                <div class="item-price">${item.price + addedPrice} kr.</div>
                <div class="item-quantity">x${item.quantity}</div>
            `;
    
            // Append the cart item to the cart items container
            cartItems.appendChild(li);
            total += (item.price + addedPrice) * item.quantity;
        }

        // Add 50 to the total if delivery is checked
        if (document.getElementById("delivery").checked) {
            total += 50;
        }
  
        // Update the total price in the HTML document
        document.getElementById("cart-total").innerText = total.toFixed(2);
    }
}






// Save user information
// Save user information
function saveUserInformation(event) {
    event.preventDefault();

    // Retrieve user input values
    var firstname = document.getElementById('name').value;
    var surname = document.getElementById('surname').value;
    var phone = document.getElementById('phone').value;
    var address = document.getElementById('address').value;
    var zipcode = document.getElementById('zipcode').value;
    var payment = document.getElementById('payment').value;
    var name = firstname + " " + surname;

    // Fetch the cart from local storage
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        const cart = JSON.parse(storedCart);

        // Convert the cart items into the format expected by the server
        const orderItems = cart.map(item => {
            const addedIds = item.added ? item.added.map(ingredient => ingredient.id) : []; 
            const removedIds = item.removed ? item.removed.map(ingredient => ingredient.id) : [];
            let pizzaId = null;
            let drinkId = null;
            let pizzaTypeId = null;
    
            // Checking if ingredients are present, if not it's a drink
            if (item.ingredients) {
                pizzaId = item.id;
                pizzaTypeId = item.pizzaTypeId; // assuming that pizzaTypeId is a property of item
            } else {
                drinkId = item.id;
            }
    
            return {
                pizzaId: pizzaId,
                drinkId: drinkId,
                quantity: item.quantity,
                added: addedIds,
                removed: removedIds,
                pizzaTypeId: pizzaTypeId
            };
        });

        // Create the order request
        const orderRequest = {
            creationDate: new Date().toISOString(),
            orderItems: orderItems,
            phoneNumber: phone,
            name: name,
            address: address,
            postalCode: zipcode,
            pickUpTime: new Date().toISOString(), // assuming pickUpTime is current time
            confirmed: false, // assuming order is confirmed on submission
            status: 'FRESH' // assuming order status is fresh on submission
        };

        // Send the order request to the server
        fetch("http://localhost:8080/api/orders/addOrder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderRequest)
        }).then(response => response.json()).then(data => {
            // Handle the response from the server
            console.log("Order response", data);
            localStorage.removeItem('cart'); // Clear the cart
        
            // Fetch the confirmation div and the userForm
            let confirmation = document.getElementById('confirmation');
            let userForm = document.getElementById('userForm');
            let cartDiv = document.querySelector('.card.cart');
        
            // Hide the form and cart
            userForm.style.display = 'none';
            cartDiv.style.display = 'none';
        
            // Build a string with the confirmation details
            let confirmationDetails = `
                <h2>Order Confirmation</h2>
                <p>Order Id: ${data.id}</p>
                <p>Name: ${data.name}</p>
                <p>Phone Number: ${data.phoneNumber}</p>
                <p>Address: ${data.address}</p>
                <p>Postal Code: ${data.postalCode}</p>
                <p>Pick Up Time: ${data.pickUpTime}</p>
                <p>Order Status: ${data.status === null ? 'Pending' : data.status}</p>
                <h3>Order Items:</h3>
            `;
        
            // Add information for each item in the order
            for (let item of data.orderItems) {
                let ingredients = item.consumable.ingredients ? item.consumable.ingredients.map(ing => ing.name).join(', ') : '';
                let added = item.added.map(ing => ing.name).join(', ');
                let removed = item.removed.map(ing => ing.name).join(', ');
        
                confirmationDetails += `
                    <p>Item ID: ${item.id}</p>
                    <p>Name: ${item.consumable.name}</p>
                    <p>Price: ${item.consumable.price}</p>
                    <p>Ingredients: ${ingredients}</p>
                    <p>Added: ${added}</p>
                    <p>Removed: ${removed}</p>
                    <p>Quantity: ${item.quantity}</p>
                `;
            }
        
            // Insert the confirmation details into the 'confirmation' div and display it
            confirmation.innerHTML = confirmationDetails;
            confirmation.style.display = 'block';

            // Remove the existing html fra user informationer
            document.getElementById("user-header").style.display = "none";
        }).catch(error => {
            console.error("Error:", error);
        });
    }
}
