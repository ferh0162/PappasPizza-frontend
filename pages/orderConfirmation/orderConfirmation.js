import { makeOptions } from "../../utils.js";
import { REMOTE_API as URL } from "../../settings.js";

const orderRequest = [];

export async function initConfirmed() {
  // Fetch and display unconfirmed orders upon initialization
  await innitUnconfirmedOrders();

// Event listener for pickup time buttons
const pickupTimeButtons = document.getElementsByClassName('pickup-time');
for(let i = 0; i < pickupTimeButtons.length; i++) {
  pickupTimeButtons[i].addEventListener('click', function() {
    const minutes = parseInt(pickupTimeButtons[i].dataset.minutes);
    setPickupTime(minutes, pickupTimeButtons[i]);
  });
}

// Event listener for 'Confirm Order' button
const confirmButton = document.getElementById('confirm-order-button');
confirmButton.addEventListener('click', confirmOrder);


  // Event listener for 'Refuse Order' button
  const refuseButton = document.getElementById('refuse-order-button'); // Assuming the ID of the button is 'refuse-order-button'
  refuseButton.addEventListener('click', function() {
    refuseOrder();
  });
}


function displayOrderInfo() {
  console.log("displaying order info.")
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
  
function confirmOrder() {
  // Ensure there's an order to confirm
  if (orderRequest.length === 0) {
    console.log('No order to confirm');
    return;
  }

  const options = makeOptions("PATCH", orderRequest[0], true)
  const orderId = orderRequest[0].id;
  orderRequest[0].confirmed = true;
  orderRequest[0].status = "CONFIRMED";
  console.log("Order confirmed", orderRequest[0]);

  // Send order as a PATCH request
  fetch(URL + `/orders/confirm/${orderId}`, options)
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
    // Fetch the next unconfirmed order
    innitUnconfirmedOrders();
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

export async function innitUnconfirmedOrders() {
  const options = makeOptions("GET", '', true)
  console.log("in unconfirmed");

  try {
    const response = await fetch(URL + '/orders/viewNonConfirmed', options);
    const data = await response.json();
    console.log("end unconfirmed");

    orderRequest.length = 0; // Clear the existing orders
    if (data.length !== 0) { // Check if the fetched data is not empty
      orderRequest.push(...data); // Push the new orders

      displayOrderInfo(); // Refresh the displayed order info
    } else {
      // No orders fetched, clear the display
      const orderInfo = document.getElementById("order-info");
      orderInfo.innerHTML = '';
    }
    console.log(data);

  } catch (error) {
    console.error('Error:', error);
  }
}

  
  function refuseOrder() {
  orderRequest[0].confirmed = false;
  orderRequest[0].status = "REFUSED";
  console.log("Order refused", orderRequest[0]);
    // Fetch the next unconfirmed order
    innitUnconfirmedOrders();
  }
  
