import { handleHttpErrors, makeOptions } from "../../utils.js";
import { REMOTE_API as URL } from "../../settings.js";

let loadedPizzas;

export function initEditPizzaPrice() {
  document
    .getElementById("btn-modal-submit")
    .addEventListener("click", submitFormHandler);
  document
    .getElementById("btn-modal-close")
    .addEventListener("click", closeModalHandler);
  document
    .getElementById("searchInput")
    .addEventListener("input", filterPizzas);

  // handle pizzas with event bubbling
  document
    .getElementById("pizza-list")
    .addEventListener("click", handleModalForPizza);

  getPizzas();
}

function handleModalForPizza(event) {
  const listItem = event.target.closest("li");
  if (listItem) {
    const pizzaId = parseInt(listItem.classList[5].split("-")[1]);
    const pizza = loadedPizzas.find((pizza) => pizza.id === pizzaId);
    openModal(pizza);
  }
}

function renderPizzas(pizzas) {
  const list = document.getElementById("pizza-list");

  pizzas.forEach((pizza) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "container",
      "p-3",
      "my-3",
      "border",
      `pizza-item`,
      `item-${pizza.id}`,
      `backgroundWhite`
    );

    const pizzaName = document.createElement("h3");
    pizzaName.textContent = pizza.name;

    const pizzaPrice = document.createElement("p");
    pizzaPrice.innerHTML = `<strong>Pris:</strong> ${pizza.price} kr.`;

    listItem.appendChild(pizzaName);
    listItem.appendChild(pizzaPrice);
    list.appendChild(listItem);
  });
}

function openModal(pizza) {
  const modal = document.getElementById("modal");
  const modalTitle = document.querySelector(".modal-title");
  const priceInput = document.getElementById("price");

  modal.style.display = "block";
  modalTitle.textContent = pizza.name;
  priceInput.value = pizza.price;
}

function closeModalHandler(e) {
  if (e.target.id === "btn-modal-close") {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
  }
}

function submitFormHandler(event) {
  event.preventDefault();
  const pizzaName = document.querySelector(".modal-title").textContent;
  const id = loadedPizzas.find((pizza) => pizza.name === pizzaName).id;

  const priceInput = document.getElementById("price");
  const newPrice = parseFloat(priceInput.value);
  editPizzaPricing(id, newPrice);
  const modal = document.getElementById("modal");
  modal.style.display = "none";
  window.router.navigate("redigerPizzaPriser")
}

async function editPizzaPricing(id, newPrice) {
  try {
    const options = makeOptions("PATCH", "", true);
    const response = await fetch(
      `${URL}/pizzas/${id}/price/${newPrice}`,
      options
    ).then(handleHttpErrors);
  } catch (error) {
    console.log(error);
  }
}

async function getPizzas() {
  try {
    loadedPizzas = {}
    loadedPizzas = await fetch(`${URL}/pizzas`).then(handleHttpErrors);
    renderPizzas(loadedPizzas);
  } catch (error) {
    console.log(error);
  }
}

function filterPizzas() {
  const searchInput = document.getElementById("searchInput");

  const searchQuery = searchInput.value.toLowerCase();
  const pizzas = Array.from(document.getElementsByClassName("pizza-item"));
  pizzas.forEach((pizza) => {
    const pizzaName = pizza.querySelector("h3").textContent.toLowerCase();
    const pizzaprice = pizza.querySelector("p").textContent.toLowerCase();
    if (pizzaName.includes(searchQuery) || pizzaprice.includes(searchQuery)) {
      pizza.style.display = "block";
    } else {
      pizza.style.display = "none";
    }
  });
}
