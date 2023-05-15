import { handleHttpErrors, makeOptions } from "../../utils.js";
import { LOCAL_API as URL } from "../../settings.js";



export function initEditPizza() {
  getPizzas();

}

async function getPizzas() {
    try {
        const pizzas = await fetch(URL + "/pizzas").then(handleHttpErrors);
        displayPizzas(pizzas);
    } catch (error) {
    console.log(error);
  }
}

function displayPizzas(pizzas) {
    const pizzaMenuElement = document.getElementById("pizzaMenu");
    pizzaMenuElement.innerHTML = ""; // Clear existing menu
    for (let i = 0; i < pizzas.length; i++) {
      const pizza = pizzas[i];
      const pizzaItem = document.createElement("div");
      pizzaItem.className = "card";
      pizzaItem.addEventListener("click", () => {
        openModal(pizza);
      });
      const pizzaItemContent = `
        <div class="card-body">
          <h5 class="card-title">${pizza.name}</h5>
          <p class="card-text">Pris: <span id="price_${pizza.id}">${pizza.price.toFixed(2)} kr.</span></p>
        </div>
      `;
      pizzaItem.innerHTML = pizzaItemContent;
      pizzaMenuElement.appendChild(pizzaItem);
    }
  }
  
  function openModal(pizza) {
    const editPriceInput = document.getElementById("editPrice");
    editPriceInput.value = pizza.price.toFixed(2);
  
    const modal = new bootstrap.Modal(document.getElementById("pizzaModal"));
    modal.show();
  
    document.getElementById("pizzaModalLabel").innerText = `Ændrer pizza pris - ${pizza.name}`;
    document.getElementById("editPrice").focus();
  
    // Save the pizza ID as a data attribute on the Save Changes button
    const saveChangesBtn = document.getElementById("saveChangesBtn");
  }