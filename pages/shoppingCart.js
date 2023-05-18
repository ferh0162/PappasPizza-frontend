const pizzas = [];
const drinks = [];
const ingredients = [];
let cart = [];

export async function initMenu() {
  await fetchPizza();
  await fetchDrink();
  await fetchIngredients();

  displayItems(pizzas, "pizza-list", "pizza-item");
  displayItems(drinks, "drinks-list", "drink-item");

  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCart();
  }

  document.getElementById("clear-cart-button").addEventListener("click", () => {
    cart = [];
    updateCart();
  });

  for (const option of document.getElementsByName("deliveryOptions")) {
    option.addEventListener("change", updateCart);
  }
}

async function fetchPizza() {
  try {
    const response = await fetch("http://localhost:8080/api/pizzas");
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
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchDrink() {
  try {
    const response = await fetch("http://localhost:8080/api/drinks");
    const data = await response.json();

    data.forEach((drink) => {
      drinks.push({
        id: drink.id,
        name: drink.brand,
        price: drink.price,
        size: drink.size,
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchIngredients() {
  if (ingredients.length === 0) {
    try {
      const response = await fetch("http://localhost:8080/api/ingredients");
      const data = await response.json();

      data.forEach((ingredient) => {
        ingredients.push({
          id: ingredient.id,
          name: ingredient.name,
          price: ingredient.price,
        });
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
      additionalInfo = `<p class="card-text additional-info">Ingredients: ${ingredientNames}</p>`;

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

    div.querySelector(".addToCart").addEventListener("click", () => {
      if (itemClass === "pizza-item") {
        openIngredientModal(item.id);
      } else {
        addToCart(item.id, true);
      }
    });

    container.appendChild(div);
  }
}



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
    cart.push({ ...item, quantity: 1, isDrink: isDrink, added: extras });
  } else {
    cart[index].quantity += 1;
  }

  updateCart();
}

function removeFromCart(itemId, isDrink = false, extras = []) {
  // Check if the item with the same id and extras exists in the cart
  const index = cart.findIndex((cartItem) => 
    cartItem.id === itemId && 
    cartItem.isDrink === isDrink &&
    JSON.stringify(cartItem.added.sort()) === JSON.stringify(extras.sort())
  );

  if (index !== -1) {
    cart[index].quantity -= 1;
    if (cart[index].quantity === 0) {
      cart.splice(index, 1);
    }
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

  if (document.getElementById("delivery").checked) {
    total += 50;
  }

  document.getElementById("cart-total").innerText = total.toFixed(2);
  localStorage.setItem("cart", JSON.stringify(cart));
}

function openIngredientModal(pizzaId) {
  const modal = document.getElementById("ingredient-modal");
  const ingredientList = document.getElementById("ingredient-list");
  ingredientList.innerHTML = '';

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

  document.getElementById("add-to-cart-modal").onclick = () => {
    addToCart(pizzaId);
    modal.style.display = "none";
  };

  document.getElementById("close-ingredient-modal").onclick = () => {
    modal.style.display = "none";
  };

  modal.style.display = "block";
}


