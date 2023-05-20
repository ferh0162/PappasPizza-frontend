import { handleHttpErrors, makeOptions} from "../../utils.js";
import { REMOTE_API as URL } from "../../settings.js";

export function initMakeAPizza() {
  document.getElementById("btn-add-pizza-modal").onclick = showPizzaModal;
  document.getElementById("btn-modal-submit-pizza").onclick = addPizza;

  getIngredients()
  getPizzas();

  const ingredientList = document.getElementById('ingredientList');
  const ingredientFilter = document.getElementById('ingredientFilter');
  
  ingredientFilter.addEventListener('input', () => {
    const filterValue = ingredientFilter.value.toLowerCase();
    const ingredients = ingredientList.getElementsByTagName('li');
  
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      const ingredientName = ingredient.textContent.toLowerCase();
      
      if (ingredientName.includes(filterValue)) {
        ingredient.style.display = 'block';
      } else {
        ingredient.style.display = 'none';
      }
    }
  });

  document.getElementById('searchInput').addEventListener("keyup", filterPizzas);
}

async function addPizza(event) {
  event.preventDefault();

  const pizzaName = document.getElementById("pizzaName").value;
  const pizzaPrice = parseFloat(document.getElementById("pizzaPrice").value);
  const selectedIngredientsList = document.getElementById("selectedIngredients");
  const selectedIngredients = Array.from(selectedIngredientsList.children).map(ingredient => ingredient.textContent);


  const newPizza = {
    name: pizzaName,
    price: pizzaPrice,
    ingredients: selectedIngredients,
  };

  const options = makeOptions("POST",newPizza,true)

  try {
    await fetch(URL + "/pizzas", options).then(handleHttpErrors);
    getPizzas();
    window.router.navigate("/lavPizza")
} catch (error) {
    console.log(error)
}

  
}

function showPizzaModal() {


    const pizzaName = document.getElementById("pizzaName").value;
    const pizzaPrice = parseFloat(document.getElementById("pizzaPrice").value);
    const selectedIngredientsList = document.getElementById("selectedIngredients");
    const selectedIngredients = Array.from(selectedIngredientsList.children).map(ingredient => ingredient.textContent);
  

    const newPizza = {
      name: pizzaName,
      price: pizzaPrice,
      ingredients: selectedIngredients,
    };
  
    
  
    const pizzaHTML = `
    <h6>Navn: ${newPizza.name}</h6>
    <p>Pris: ${newPizza.price}</p>
    <p>Toppings:</p>
    <ul>
    ${newPizza.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
    </ul>
    `;
    
    document.getElementById("modal-body").innerHTML = pizzaHTML;

  }


async function getIngredients() {
    try {
        const ingredientsJson = await fetch(URL + "/ingredients").then(handleHttpErrors);
        renderIngredients(ingredientsJson);
    } catch (error) {
          console.log(error)
      }


}

function renderIngredients(ingredients) {
    const ingredientList = document.getElementById('ingredientList');
    ingredientList.innerHTML = '';
  
    ingredients.forEach(ingredient => {
      const listItem = document.createElement('li');
      listItem.textContent = ingredient.name;
      listItem.addEventListener('click', () => moveIngredientToSelected(ingredient, listItem));
     
      listItem.classList.add('backgroundWhite')
  
      ingredientList.appendChild(listItem);
    });
  }
  
  function moveIngredientToSelected(ingredient, listItem) {
    const selectedIngredientsList = document.getElementById('selectedIngredients');
    const clonedItem = listItem.cloneNode(true);
  

    listItem.remove();
  
    clonedItem.classList.add('selected-ingredient');
    clonedItem.addEventListener('click', () => moveIngredientToAvailable(ingredient, clonedItem));
  
    selectedIngredientsList.appendChild(clonedItem);
  }
  
  function moveIngredientToAvailable(ingredient, listItem) {
    const ingredientList = document.getElementById('ingredientList');
    const clonedItem = listItem.cloneNode(true);
  

    listItem.remove();
  
    clonedItem.addEventListener('click', () => moveIngredientToSelected(ingredient, clonedItem));
  
    ingredientList.appendChild(clonedItem);
  }


  async function getPizzas() {
    try {
      const pizzaJson = await fetch(URL + "/pizzas").then(handleHttpErrors);
      renderPizzas(pizzaJson);
    } catch (error) {
        console.log(error)
    }
  }



function renderPizzas(pizzas) {
  const pizzaList = document.getElementById("pizzaManagement-pizzaList");
  pizzaList.innerHTML = "";

  pizzas.forEach((pizza) => {
    const listItem = document.createElement('li');
    listItem.classList.add('container', 'p-3', 'my-3', 'border', 'pizza-item', 'backgroundWhite');

    const pizzaName = document.createElement('h3');
    pizzaName.textContent = pizza.name;

    const pizzaPrice = document.createElement('p');
    pizzaPrice.innerHTML = `<strong>Pris:</strong> ${pizza.price} kr.`;

    const pizzaIngredients = document.createElement('p');
    const ingredientsList = pizza.ingredients.map(ingredient => ingredient.name).join(', ');
    pizzaIngredients.innerHTML = `<strong>Ingredienser:</strong> ${ingredientsList}`;

    listItem.appendChild(pizzaName);
    listItem.appendChild(pizzaPrice);
    listItem.appendChild(pizzaIngredients);

    pizzaList.appendChild(listItem);
  });
}


function filterPizzas() {
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput.value.toLowerCase();
    const pizzas = Array.from(document.getElementsByClassName('pizza-item'));
  
    pizzas.forEach(pizza => {
      const pizzaName = pizza.querySelector('h3').textContent.toLowerCase();
      if (pizzaName.includes(searchQuery)) {
        pizza.style.display = 'block'; 
      } else {
        pizza.style.display = 'none'; 
      }
    });
  }
  

