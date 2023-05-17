export function innitOrder() {
    console.log("Hello from Order");
    displayCartItems();
    document.getElementById('userForm').addEventListener('submit', saveUserInformation);
}


function displayCartItems() {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        const cart = JSON.parse(storedCart);
        const cartItems = document.getElementById("cart-items");
        cartItems.innerHTML = "";
        let total = 0;
        
        for (const item of cart) {
            const li = document.createElement("li");
            li.className = "cart-item";
            const itemDetails = item.isDrink ? `${item.size}` : `${item.id}.`;
    
            li.innerHTML = `
                <span class="item-id">${itemDetails}</span>
                <span class="item-name">${item.name}</span>
                <span class="item-price">${item.price} kr.</span>
                <span class="item-quantity">x${item.quantity}</span>
            `;
    
            cartItems.appendChild(li);
            total += item.price * item.quantity;
        }
  
        document.getElementById("cart-total").innerText = total.toFixed(2);
    }
    console.log(storedCart)
}

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
            if(item.ingredients) {
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
            console.log("Order response", data);
            localStorage.removeItem('cart'); // Clear the cart
            location.reload(); // Refresh the page
            // Redirect the user, display a confirmation message, etc.
        }).catch(error => {
            console.error("Error:", error);
        });
    }
}
