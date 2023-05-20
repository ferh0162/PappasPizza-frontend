
import { LOCAL_API as URL } from "../../settings.js";
import {
  handleHttpErrors,
} from "../../utils.js";

const pizzas = [];
const drinks = [];
let cart = [];

export async function initMenu() {
  
  await fetchPizza();
  await fetchDrink();

  displayItems(pizzas, "pizza-list", "pizza-item");
  displayItems(drinks, "drinks-list", "drink-item");

  // Check if there is cart data stored in localStorage
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCart();
  }

  // Add event listeners and populate the menu items
const clearCartButton = document.getElementById("clear-cart-button");
clearCartButton.addEventListener("click", () => {
  cart = [];
  updateCart();
});

const deliveryOptions = document.getElementsByName("deliveryOptions");
for (const option of deliveryOptions) {
  option.addEventListener("change", updateCart);
}

initWeatherStatus()

}

console.log("shoppingcart is loaded!")

async function initWeatherStatus() {
  try {
    const weatherData = await fetch(URL + "/weather").then(handleHttpErrors);

    const icon = weatherData.icon;

    document.getElementById("address-id").innerHTML =
      `Adresse: Vigerslev Allé 122, 2500 København <br>
      Tlf: 50 16 26 50`;

    document.getElementById("weatherTemp-id").innerHTML =
      ((weatherData.temperature - 273.15).toFixed(1)) + " °C";

    document.getElementById("weatherStatus-id").src =
      `https://openweathermap.org/img/wn/${icon}@2x.png`;

  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

async function fetchPizza() {
  try {
    const response = await fetch(URL + "/pizzas");
    const data = await response.json();

    data.forEach((pizza) => {
      const ingredients = pizza.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        price: ingredient.price,
      }));

      pizzas.push({
        id: pizza.id,
        name: pizza.name,
        price: pizza.price,
        ingredients: ingredients,
      });
    });

    console.log(pizzas);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};


async function fetchDrink() {
  try {
    const response = await fetch(URL +"/drinks");
    const data = await response.json();

    data.forEach((drink) => {
      drinks.push({
        id: drink.id,
        name: drink.brand,
        price: drink.price,
        size: drink.size,
      });
    });

    console.log(drinks);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function displayItems(items, containerId, itemClass) {
  const container = document.getElementById(containerId);

  for (const item of items) {
    const div = document.createElement("div");
    div.classList.add(itemClass, "col-4");
    let additionalInfo = "";

    if (itemClass === "pizza-item") {
      const ingredientNames = item.ingredients.map((ingredient) => ingredient.name).join(", ");
      additionalInfo = `<p class="card-text additional-info">${ingredientNames}</p>`;
    } else if (itemClass === "drink-item") {
      additionalInfo = `<p class="card-text additional-info">Size: ${item.size} </p>`;
    }

    div.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${item.id}. ${item.name}</h5>
          <p class="card-text">${item.price} kr.</p>
          `+additionalInfo+`
        </div>
      </div>`;

    const button = document.createElement("button");
    button.className = "btn btn-custom";
    button.innerText = "Add to cart";
    button.addEventListener("click", () => addToCart(item.id, itemClass === "drink-item"));

    div.querySelector('.card .card-body').appendChild(button);
    container.appendChild(div);
  }
}


function addToCart(itemId, isDrink = false) {
  const item = isDrink
    ? drinks.find((d) => d.id === itemId)
    : pizzas.find((p) => p.id === itemId);
  if (!item) return;

  const index = cart.findIndex(
    (cartItem) => cartItem.id === item.id && cartItem.isDrink === isDrink
  );

  if (index === -1) {
    cart.push({ ...item, quantity: 1, isDrink: isDrink });
  } else {
    cart[index].quantity += 1;
  }
  updateCart();
}

function removeFromCart(itemId, isDrink = false) {
  const index = cart.findIndex(
    (cartItem) => cartItem.id === itemId && cartItem.isDrink === isDrink
  );
  if (index !== -1) {
    cart[index].quantity -= 1;
    if (cart[index].quantity === 0) {
      cart.splice(index, 1);
    }
    updateCart();
  }
}

function updateQuantity(itemId, newQuantity) {
  const index = cart.findIndex((cartItem) => cartItem.id === itemId);
 
  if (index !== -1) {
    cart[index].quantity = newQuantity;
    updateCart();
  }
}

  function updateCart() {
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
  
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.innerText = "X";
      removeBtn.addEventListener("click", () => removeFromCart(item.id, item.isDrink));
  
      li.appendChild(removeBtn);
      cartItems.appendChild(li);
  
      total += item.price * item.quantity;
    }
  
    if (document.getElementById("delivery").checked) {
      total += 50;
    }
  
    document.getElementById("cart-total").innerText = total.toFixed(2);
    localStorage.setItem("cart", JSON.stringify(cart));
  }
