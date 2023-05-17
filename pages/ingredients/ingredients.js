import { REMOTE_API as URL } from "../../settings.js";


export function initIngredients(){
    const ingredientComponent = document.querySelector('ingredient-component');
    if (ingredientComponent) {
        ingredientComponent.loadIngredients();
        ingredientComponent.createEditForm();
    }
}


class IngredientComponent extends HTMLElement {
    constructor() {
        super();
        this.renderIngredients = renderIngredients.bind(this);
        this.renderAddIngredients = renderAddIngredients.bind(this);
        this.createEditForm = createEditForm.bind(this);
        this.loadIngredients = loadIngredients.bind(this);
        this.addIngredient = addIngredient.bind(this);
        this.populateEditForm = populateEditForm.bind(this);
        this.deleteIngredient = deleteIngredient.bind(this);
        this.editIngredient = editIngredient.bind(this);



        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

        // Create a template element and add your HTML to it
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                @import '../../styles/ingredient.css';
            </style>
            <div class="container">
                <h1>Ingrediens Liste</h1>
                <div class="flex-container">
                    <div class="left-side">
                        <table>
                            <tbody id="list-data">
                            </tbody>
                        </table>
                    </div>
                    <div class="right-side">
                        <div class="upper-side">
                            <table>
                                <tbody id="table-data">
                                </tbody>
                            </table>
                        </div>
                        <div class="lower-side">
                            <table>
                                <tbody id="edit-data">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append the template content to the shadow root
        shadow.appendChild(template.content.cloneNode(true));
    }
}

// Define the new element
customElements.define('ingredient-component', IngredientComponent);



async function loadIngredients(){
    await this.renderIngredients();
    await this.renderAddIngredients();
}


async function handleHttpErrors(response) {
    if (!response.ok) {
        let errorMessage = `${response.status} (${response.statusText})`;

        let errorData = null;
        if (response.headers.get('content-type').includes('application/json')) {
            const responseData = await response.json();
            errorMessage = `${errorMessage}: ${responseData.message}`;
            errorData = responseData.errors;
        }

        const error = new Error(errorMessage);
        error.data = errorData;
        throw error;
    }
    console.log(response.headers)
    if (response.headers.get('content-type').includes('application/json')) {
        return await response.json();
    }

    return response;
}

async function deleteIngredient(id) {
    try{
    const response = await fetch(URL + `/ingredients/${id}`, {
        method: 'DELETE'
    });
    if (response.status != 204) {
        const result = await handleHttpErrors(response);
        if (result) {
            await loadIngredients.call(this);
        }
        return result;
    } else {
        await loadIngredients.call(this);
    }
}catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);

    }
}

async function addIngredient(ingredientRequest) {
    try {
        const response = await fetch(URL + `/ingredients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ingredientRequest)
        });
        const result = await handleHttpErrors(response);
        if (result) { // assuming handleHttpErrors returns a truthy value on success
            await loadIngredients.call(this);
        }
        return result;
    } catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);

    }
}

async function editIngredient(id, ingredientRequest) {
    try {
        const response = await fetch(URL + `/ingredients/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ingredientRequest)
        });
        const result = await handleHttpErrors(response);
        if (result) {
            await loadIngredients.call(this);
        }
        return result;
    } catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);

    }
}

async function populateEditForm(id) {
    try {
    await fetch(URL + `/ingredients/${id}`)
        .then(response => response.json())
        .then(ingredient => {
            this.shadowRoot.getElementById('editIngredientId').value = ingredient.id;
            this.shadowRoot.getElementById('editIngredientName').value = ingredient.name;
            this.shadowRoot.getElementById('editIngredientPrice').value = ingredient.price;
        })
        .catch(error => console.log("There was a problem with the fetch operation: " + error.message));
}catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);

    }
}


async function renderIngredients() {

    try {
        const response = await fetch(URL + "/ingredients");
        const ingredients = await response.json();
        const listDataContainer = this.shadowRoot.querySelector("#list-data");
        listDataContainer.innerHTML = '';

        let headerRow = document.createElement('tr');
        headerRow.className = 'tr';
        ['ID', 'Ingrediens', 'Pris', 'Rediger', 'Slet'].forEach(headerText => {
            let header = document.createElement('th');
            header.className = 'th';
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        listDataContainer.appendChild(headerRow);

        ingredients.forEach((ingredient) => {
            let row = document.createElement('tr');
            row.className = 'tr';

            let idCell = document.createElement('td');
            idCell.className = 'td';
            idCell.textContent = ingredient.id;
            row.appendChild(idCell);

            let nameCell = document.createElement('td');
            nameCell.className = 'td';
            nameCell.textContent = ingredient.name;
            row.appendChild(nameCell);

            let priceCell = document.createElement('td');
            priceCell.className = 'td';
            priceCell.textContent = ingredient.price;
            row.appendChild(priceCell);

            let editButton = document.createElement('button');
            editButton.textContent = 'Rediger';
            editButton.className = 'edit-button';
            editButton.addEventListener('click', async () => {
                await this.populateEditForm(ingredient.id);
                await this.loadIngredients();
            });
            let editCell = document.createElement('td');
            editCell.appendChild(editButton);
            row.appendChild(editCell);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Slet';
            deleteButton.className = 'delete-button'
            deleteButton.addEventListener('click', async () => {
                await this.deleteIngredient(ingredient.id);
                await this.loadIngredients();
            });
            let deleteCell = document.createElement('td');
            deleteCell.appendChild(deleteButton);
            row.appendChild(deleteCell);

            listDataContainer.appendChild(row);
        });

    } catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);

    }
}


async function renderAddIngredients(){

    try {
        const tableDataContainer = this.shadowRoot.querySelector("#table-data");
        tableDataContainer.innerHTML = '';
        let headerRow = document.createElement('tr');
        headerRow.className = 'tr';
        ['Ingrediens','Pris','Tilføj'].forEach(headerText => {
            let header = document.createElement('th');
            header.className = 'th';
            header.textContent = headerText;
            headerRow.appendChild(header)
        });
        tableDataContainer.appendChild(headerRow);

        let row = document.createElement('tr');
        row.className = 'tr';

        let ingredientInput = document.createElement('input');
        ingredientInput.className = 'input-field';
        let ingredientCell = document.createElement('td');
        ingredientCell.className = 'td';
        ingredientCell.appendChild(ingredientInput);
        row.appendChild(ingredientCell);

        let priceInput = document.createElement('input');
        priceInput.className = 'input-field';
        let priceCell = document.createElement('td');
        priceCell.className = 'td';
        priceCell.appendChild(priceInput);
        row.appendChild(priceCell);

        let addButton = document.createElement('button');
        addButton.textContent = 'Tilføj';
        addButton.className = 'add-button';
        addButton.addEventListener('click', () =>
            this.addIngredient({name: ingredientInput.value, price: priceInput.value}));
        let addCell = document.createElement('td');
        addCell.appendChild(addButton);
        row.appendChild(addCell);

        tableDataContainer.appendChild(row);

    } catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);
    }
}
function createEditForm() {

    const editContainer = this.shadowRoot.querySelector("#edit-data");
    editContainer.innerHTML = '';
    let headerRow = document.createElement('tr');

    headerRow.className = 'tr';
    ['ID', 'Ingrediens', 'Pris', 'Rediger'].forEach(headerText => {
        let header = document.createElement('th');
        header.className = 'th';
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    editContainer.appendChild(headerRow);
    let row = document.createElement('tr');

    row.className = 'tr';
    let idInput = document.createElement('input');

    idInput.id = 'editIngredientId';
    idInput.className = 'input-field';
    let idCell = document.createElement('td');

    idCell.className = 'td';
    idCell.appendChild(idInput);
    row.appendChild(idCell);
    let ingredientInput = document.createElement('input');

    ingredientInput.id = 'editIngredientName';
    ingredientInput.className = 'input-field';
    let ingredientCell = document.createElement('td');
    ingredientCell.className = 'td';
    ingredientCell.appendChild(ingredientInput);
    row.appendChild(ingredientCell);
    let priceInput = document.createElement('input');

    priceInput.id = 'editIngredientPrice';
    priceInput.className = 'input-field';
    let priceCell = document.createElement('td');
    priceCell.className = 'td';
    priceCell.appendChild(priceInput);
    row.appendChild(priceCell);
    let editButton = document.createElement('button');

    editButton.textContent = 'Rediger';
    editButton.className = 'edit-button';
    editButton.addEventListener('click', async () =>{
        if (idInput.value) {
            await this.editIngredient(idInput.value, {name: ingredientInput.value, price: priceInput.value});
            await this.loadIngredients();
        }
    });
    let editCell = document.createElement('td');
    editCell.appendChild(editButton);
    row.appendChild(editCell);
    editContainer.appendChild(row);

}
document.addEventListener('DOMContentLoaded', (event) => {
    initIngredients();
});

