
export function initIngredients(){
    loadIngredients()
    createEditForm()
}

async function loadIngredients(){
    await renderIngredients()
    await renderAddIngredients()
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

async function editIngredient(id, ingredientRequest) {
    const response = await fetch(`http://localhost:8080/api/ingredients/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ingredientRequest)
    });
    const result = await handleHttpErrors(response);
    if (result) {
        await loadIngredients();
    }
    return result;
}

async function deleteIngredient(id) {
    const response = await fetch(`http://localhost:8080/api/ingredients/${id}`, {
        method: 'DELETE'
    });
    if (response.status != 204) {
        const result = await handleHttpErrors(response);
        if (result) {
            await loadIngredients();
        }
        return result;
    } else {
        await loadIngredients();
    }
}

async function addIngredient(ingredientRequest) {
    const response = await fetch(`http://localhost:8080/api/ingredients`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ingredientRequest)
    });
    const result = await handleHttpErrors(response);
    if (result) { // assuming handleHttpErrors returns a truthy value on success
        await loadIngredients();
    }
    return result;
}
function populateEditForm(id) {
    const URL = `http://localhost:8080/api/ingredients/${id}`;
    fetch(URL)
        .then(response => response.json())
        .then(ingredient => {
            document.getElementById('editIngredientId').value = ingredient.id;
            document.getElementById('editIngredientName').value = ingredient.name;
            document.getElementById('editIngredientPrice').value = ingredient.price;
        })
        .catch(error => console.log("There was a problem with the fetch operation: " + error.message));
}

async function renderIngredients() {
    const URL = "http://localhost:8080/api/ingredients";

    try {
        const response = await fetch(URL);
        const ingredients = await response.json();
        const listDataContainer = document.querySelector("#list-data");
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
                await populateEditForm(ingredient.id);
                await loadIngredients();
            });
            let editCell = document.createElement('td');
            editCell.appendChild(editButton);
            row.appendChild(editCell);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Slet';
            deleteButton.className = 'delete-button'
            deleteButton.addEventListener('click', async () => {
                await deleteIngredient(ingredient.id);
                console.log(ingredient.id)
                await loadIngredients();
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


document.addEventListener('DOMContentLoaded', (event) => {
    renderIngredients();
});

async function renderAddIngredients(){
    try {
        const tableDataContainer = document.querySelector("#table-data");
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
            addIngredient({name: ingredientInput.value, price: priceInput.value}));
        let addCell = document.createElement('td');
        addCell.appendChild(addButton);
        row.appendChild(addCell);

        tableDataContainer.appendChild(row);

    } catch (error) {
        console.log("There was a problem with the fetch operation: " + error.message);
    }
}

function createEditForm() {
    const editContainer = document.querySelector("#edit-data");
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
            await editIngredient(idInput.value, {name: ingredientInput.value, price: priceInput.value});
            await loadIngredients();
        }
    });
    let editCell = document.createElement('td');
    editCell.appendChild(editButton);
    row.appendChild(editCell);

    editContainer.appendChild(row);
}


