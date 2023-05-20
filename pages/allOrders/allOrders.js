import {REMOTE_API as API_URL} from "../../settings.js" 
import { handleHttpErrors, makeOptions } from "../../utils.js";


export async function innitAllOrders() {

  const URL = API_URL + "/orders";
  const options = makeOptions("GET", "", true)
  try {
    const orders = await fetch(URL, options).then(handleHttpErrors);

    console.log(orders)
    const container = document.querySelector(".container");
    orders.forEach((order) => {
      const receipt = document.createElement("div");
      receipt.className = "receipt-container";
      let receiptData = '';
  
      receiptData += `<tr><th>Order ID:</th><td>${order.id}</td></tr>`;
      receiptData += `<tr><th>Creation Date:</th><td>${order.creationDate}</td></tr>`;
      receiptData += `<tr><th>Status:</th><td>${order.status}</td></tr>`;
      receiptData += `<tr><th>Phone Number:</th><td>${order.phoneNumber}</td></tr>`;
      receiptData += `<tr><th>Name:</th><td>${order.name}</td></tr>`;
      receiptData += `<tr><th>Address:</th><td>${order.address}</td></tr>`;
      receiptData += `<tr><th>Postal Code:</th><td>${order.postalCode}</td></tr>`;
      receiptData += `<tr><th>Pick Up Time:</th><td>${order.pickUpTime}</td></tr>`;
  
      order.orderItems.forEach((item) => {
        const consumable = item.consumable;

        if (consumable.ingredients) {
          let pizzaData = '';
          pizzaData += `<tr><th>Name:</th><td>${consumable.name}</td></tr>`;
          pizzaData += `<tr><th>Quantity:</th><td>${item.quantity}</td></tr>`;

          const ingredients = consumable.ingredients.map(ingredient => `<li>${ingredient.name}</li>`).join('');
          pizzaData += `<tr><th>Ingredients:</th><td><ul>${ingredients}</ul></td></tr>`;
          
          const added = item.added.map(ingredient => `<li>+ ${ingredient.name}</li>`).join('');
          if (added) {
            pizzaData += `<tr><th>Added:</th><td><ul>${added}</ul></td></tr>`;
          }

          const removed = item.removed.map(ingredient => `<li>- ${ingredient.name}</li>`).join('');
          if (removed) {
            pizzaData += `<tr><th>Removed:</th><td><ul>${removed}</ul></td></tr>`;
          }
          
          receiptData += `<tr><th colspan="2">Pizza:</th></tr>`;
          receiptData += `<tr><td colspan="2"><table>${pizzaData}</table></td></tr>`;
        }
        
        if (consumable.brand && consumable.drinkSize) {
          let drinkData = '';
          drinkData += `<tr><th>Name:</th><td>${consumable.brand.brand}</td></tr>`;
          drinkData += `<tr><th>Quantity:</th><td>${item.quantity}</td></tr>`;
          drinkData += `<tr><th>Size:</th><td>${consumable.drinkSize.size}</td></tr>`;
          
          receiptData += `<tr><th colspan="2">Drink:</th></tr>`;
          receiptData += `<tr><td colspan="2"><table>${drinkData}</table></td></tr>`;
        }
      });
  
      receipt.innerHTML = `
        <div class="logo-space">
          <h2>Fast Food Restaurant - Chef's View</h2>
        </div>
        <table>
        <tbody>${receiptData}</tbody>
        </table>
      `;
      container.appendChild(receipt);
    });
  } catch (error) {
    console.error(error);
  }
}