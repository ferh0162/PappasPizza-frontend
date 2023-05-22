import { REMOTE_API as URL } from "../../settings.js";
import {
  handleHttpErrors,
} from "../../utils.js";

// Declare empty arrays to store pizzas, drinks, ingredients, and the shopping cart
const pizzas = [];
const drinks = [];
const ingredients = [];
let cart = [];

// Initialize the menu
export async function initMenu() {
  // Fetch pizzas, drinks, and ingredients from the server asynchronously
  await fetchPizza();
  await fetchDrink();
  await fetchIngredients();

  // Display the pizzas and drinks in the HTML document
  displayItems(pizzas, "pizza-list", "pizza-item");
  displayItems(drinks, "drinks-list", "drink-item");

  console.log("pizza and drinks displayed")


  // Load the cart from local storage if it exists
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCart();
    console.log("load cart")

  }
  console.log("load from local storage")

  // Add event listener to the "Clear Cart" button
  document.getElementById("clear-cart-button").addEventListener("click", () => {
    cart = [];
    updateCart();
  });

  // Add event listeners to the delivery options
  for (const option of document.getElementsByName("deliveryOptions")) {
    option.addEventListener("change", updateCart);
  }
  initWeatherStatus()
}

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

// Fetch pizzas from the server
async function fetchPizza() {
  try {
    const response = await fetch(URL + "/pizzas");
    const data = await response.json();

    // Process the fetched data and add pizzas to the array
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
    console.log(data)

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Fetch drinks from the server
async function fetchDrink() {
  try {
    const response = await fetch(URL +"/drinks");
    const data = await response.json();

    // Process the fetched data and add drinks to the array
    data.forEach((drink) => {
      drinks.push({
        id: drink.id,
        name: drink.brand,
        price: drink.price,
        size: drink.size,
      });
    });
    console.log(data)

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Fetch ingredients from the server
async function fetchIngredients() {
  // Only fetch ingredients if the array is empty
  if (ingredients.length === 0) {
    try {
      const response = await fetch(URL +"/ingredients");
      const data = await response.json();

      // Process the fetched data and add ingredients to the array
      data.forEach((ingredient) => {
        ingredients.push({
          id: ingredient.id,
          name: ingredient.name,
          price: ingredient.price,
        });
      });
      console.log(data)

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

// Display items in the HTML document
function displayItems(items, containerId, itemClass) {
  const container = document.getElementById(containerId);

  for (const item of items) {
    const div = document.createElement("div");
    div.classList.add(itemClass, "col-4");
    let additionalInfo = "";

    if (itemClass === "pizza-item") {
      // For pizzas, generate additional ingredient information
      const ingredientNames = item.ingredients.map((ingredient) => ingredient.name).join(", ");
      additionalInfo = `<p class="card-text additional-info">${ingredientNames}</p>`;

      // Generate HTML structure for pizzas
      div.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${item.id}. ${item.name}</h5>
            <p class="card-text">${item.price} kr.</p>
            ${additionalInfo}
            <button class="btn btn-custom addToCart">Add to cart</button>
          </div>
        </div>`;
    } else if (itemClass === "drink-item") {
      // Generate HTML structure for drinks
      div.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">${item.size}</p>
            <p class="card-text">${item.price} kr.</p>
            <button class="btn btn-custom addToCart">Add to cart</button>
          </div>
        </div>`;
    }

    // Add event listener to the "Add to cart" button
    div.querySelector(".addToCart").addEventListener("click", () => {
      if (itemClass === "pizza-item") {
        // If a pizza is clicked, open the ingredient modal
        openIngredientModal(item.id);
      } else {
        // Otherwise, directly add the drink to the cart
        addToCart(item.id, true);
      }
    });

    container.appendChild(div);
  }
  console.log("display items")

}

// Add an item to the cart
function addToCart(itemId, isDrink = false) {
  const item = isDrink ? drinks.find((d) => d.id === itemId) : pizzas.find((p) => p.id === itemId);
  if (!item) return;

  const extras = [];
  const checkboxes = document.querySelectorAll(`input[name="extra-ingredients-${itemId}"]:checked`);
  for (const checkbox of checkboxes) {
    const ingredientId = parseInt(checkbox.value);
    const ingredient = ingredients.find(ingredient => ingredient.id === ingredientId);
    if (ingredient) {
      extras.push(ingredient);
    }
  }

  // Check if the item with the same id and extras already exists in the cart
  const index = cart.findIndex((cartItem) => 
    cartItem.id === item.id && 
    cartItem.isDrink === isDrink &&
    JSON.stringify(cartItem.added.sort()) === JSON.stringify(extras.sort())
  );

  if (index === -1) {
    // If the item is not in the cart, add a new entry
    cart.push({ ...item, quantity: 1, isDrink: isDrink, added: extras });
  } else {
    // Otherwise, update the quantity of the existing entry
    cart[index].quantity += 1;
  }

  console.log("add to cart")

  updateCart();
}

// Remove an item from the cart
function removeFromCart(itemId, isDrink = false, extras = []) {
  // Check if the item with the same id and extras exists in the cart
  const index = cart.findIndex((cartItem) => 
    cartItem.id === itemId && 
    cartItem.isDrink === isDrink &&
    JSON.stringify(cartItem.added.sort()) === JSON.stringify(extras.sort())
  );

  if (index !== -1) {
    // Update the quantity or remove the item from the cart
    cart[index].quantity -= 1;
    if (cart[index].quantity === 0) {
      cart.splice(index, 1);
    }
    updateCart();
  }
}

// Update the cart display
function updateCart() {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  let total = 0;

  for (const item of cart) {
    const li = document.createElement("li");
    li.className = "cart-item";

    const itemDetails = item.isDrink ? `${item.size}` : `${item.id}.`;

    // Add list of added ingredients
    const addedIngredients = item.added.map(ingredient => `+ ${ingredient.name}`).join("<br>");
    const addedIngredientsHtml = addedIngredients ? `<div class="added-ingredients">${addedIngredients}</div>` : "";

    li.innerHTML = `
      <span class="item-id">${itemDetails}</span>
      <div class="item-name-wrapper">
        <span class="item-name">${item.name}</span>
        ${addedIngredientsHtml}
      </div>
      <span class="item-price">${item.price} kr.</span>
      <span class="item-quantity">x${item.quantity}</span>
    `;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerText = "X";
    removeBtn.addEventListener("click", () => removeFromCart(item.id, item.isDrink, item.added));

    li.appendChild(removeBtn);
    cartItems.appendChild(li);

    total += item.price * item.quantity;

    // Add cost of added ingredients
    for (const added of item.added) {
      total += added.price * item.quantity;
    }
  }

  // Add delivery fee if selected
  if (document.getElementById("delivery").checked) {
    total += 50;
  }

  // Update the total price in the HTML document
  document.getElementById("cart-total").innerText = total.toFixed(2);

  // Store the cart in local storage
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Open the ingredient modal for selecting additional ingredients
function openIngredientModal(pizzaId) {
  const modal = document.getElementById("ingredient-modal");
  const ingredientList = document.getElementById("ingredient-list");
  ingredientList.innerHTML = '';

  // Iterate through the ingredients and create checkboxes
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("value", ingredient.id);
    checkbox.setAttribute("id", `extra-ingredients-${ingredient.id}-${pizzaId}`);
    checkbox.setAttribute("name", `extra-ingredients-${pizzaId}`);

    const label = document.createElement("label");
    label.setAttribute("for", `extra-ingredients-${ingredient.id}-${pizzaId}`);
    label.innerText = `${ingredient.name} - ${ingredient.price} kr.`;

    const ingredientItem = document.createElement("div");
    ingredientItem.classList.add("ingredient-item");
    ingredientItem.appendChild(checkbox);
    ingredientItem.appendChild(label);

    ingredientList.appendChild(ingredientItem);
  }

  // Event listeners for the modal buttons
  document.getElementById("add-to-cart-modal").onclick = () => {
    addToCart(pizzaId);
    modal.style.display = "none";
  };

  document.getElementById("close-ingredient-modal").onclick = () => {
    modal.style.display = "none";
  };

  modal.style.display = "block";
}
