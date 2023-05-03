const pizzas = [];
const drinks = [];

async function fetchPizza() {
  try {
    const response = await fetch("http://localhost:8080/api/pizza/pizzas");
    const data = await response.json();

    data.forEach((pizza) => {
      pizzas.push({
        id: pizza.id,
        name: pizza.name,
        price: pizza.price,
        ingredients: pizza.ingredients,
      });
    });

    console.log(pizzas);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchDrink() {
  try {
    const response = await fetch("http://localhost:8080/api/pizza/drinks");
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



init();

function displayItems(items, containerId, itemClass) {
  const container = document.getElementById(containerId);

  for (const item of items) {
    const div = document.createElement("div");
    div.classList.add(itemClass, "col-4");
    let additionalInfo = "";

    if (itemClass === "pizza-item") {
      additionalInfo = `<p class="card-text additional-info"> ${item.ingredients.join(", ")}</p>`;
    } else if (itemClass === "drink-item") {
      additionalInfo = `<p class="card-text additional-info">Size: ${item.size} </p>`;
    }

    div.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${item.id}. ${item.name}</h5>
          <p class="card-text">${item.price} kr.</p>
          `+additionalInfo+`
          <button class="btn btn-custom" onclick="addToCart(${item.id}, ${itemClass === "drink-item"})">Add to cart</button>
        </div>
      </div>`;
    container.appendChild(div);
  }
}

let cart = [];

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
  
      const itemDetails = item.isDrink
        ? `${item.size}`
        : `${item.id}.`;
  
      li.innerHTML = `
        <span class="item-id">${itemDetails}</span>
        <span class="item-name">${item.name}</span>
        <span class="item-price">${item.price} kr.</span>
        <span class="item-quantity">x${item.quantity}</span>
        <button class="remove-btn" onclick="removeFromCart(${item.id}, ${item.isDrink})">X</button>
      `;
      cartItems.appendChild(li);
      total += item.price * item.quantity;
    }
  
    document.getElementById("cart-total").innerText = total.toFixed(2);
  
    // Store cart data in localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
  }
async function init() {
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
}

// Add event listeners and populate the menu items
const clearCartButton = document.getElementById("clear-cart-button");
clearCartButton.addEventListener("click", () => {
  cart = [];
  updateCart();
});