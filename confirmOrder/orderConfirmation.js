const orderRequest = [];


function displayOrderInfo() {
  console.log("hi")
  const orderInfo = document.getElementById("order-info");
  
  let orderData = '';
  const order = orderRequest[0]; // assuming the first order in the array is selected
  
  orderData += `<p><strong>Phone Number:</strong> ${order.phoneNumber}</p>`;
  orderData += `<p><strong>Name:</strong> ${order.name}</p>`;
  orderData += `<p><strong>Address:</strong> ${order.address}</p>`;
  orderData += `<p><strong>Postal Code:</strong> ${order.postalCode}</p>`; 
  
  orderData += `<h2>Order Items:</h2>`;
  for (const item of order.orderItems) {
    if(item.consumable.name) { // if it's a pizza
      orderData += `<div class="order-item"><p><strong>${item.consumable.name}</strong></p>`;
    } else if(item.consumable.brand) { // if it's a drink
      orderData += `<div class="order-item"><p><strong>${item.consumable.brand.brand} - ${item.consumable.drinkSize.size}</strong></p>`;
    }
    orderData += `<p>Quantity: ${item.quantity}</p>`;
    orderData += `<p>Price: ${item.consumable.price}</p></div><hr>`;
  }
  
  orderInfo.innerHTML = orderData;
}

  


// ... rest of your JS code ...

  

function setPickupTime(minutes, button) {
  // Remove 'selected' class from all buttons
  const buttons = document.getElementsByClassName('pickup-time');
  for(let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('selected');
  }
  
  // Add 'selected' class to the clicked button
  button.classList.add('selected');

  // ... rest of your code ...
  const currentTime = new Date();
  const pickupTime = new Date(currentTime.getTime() + minutes * 60000);
  const pickupTimeString = pickupTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  orderRequest[0].pickUpTime = pickupTimeString;
  console.log(`Pickup time set for ${pickupTimeString}`);
}
  
async function fetchOrders() {
  try {
    const response = await fetch('http://localhost:8080/api/orders/viewNonConfirmed');
    const data = await response.json();

    orderRequest.length = 0; // Clear the existing orders
    if (data.length !== 0) { // Check if the fetched data is not empty
      orderRequest.push(...data); // Push the new orders
      displayOrderInfo(); // Refresh the displayed order info
    }
  } catch (error) {
    console.error('Error:', error);
  }
}



fetchOrders(); // Fetch the orders initially

function confirmOrder() {
  const orderId = orderRequest[0].id;
  orderRequest[0].confirmed = true;
  orderRequest[0].status = "CONFIRMED";
  console.log("Order confirmed", orderRequest[0]);
  
  // Send order as a PATCH request
  fetch(`http://localhost:8080/api/orders/confirm/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderRequest[0])
  })
  .then(response => {
    // Check if the response has any content
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    } else {
      return response.json();
    }
  })
  .then(data => {
    if (data) {
      console.log(data);
    }
    fetchOrders(); // Fetch the orders again after the order is confirmed
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}





  
  function refuseOrder() {
  orderRequest[0].confirmed = false;
  orderRequest[0].status = "REFUSED";
  console.log("Order refused", orderRequest[0]);
  }
  
