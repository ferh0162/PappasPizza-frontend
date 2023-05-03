const API_URL = "http://localhost:8080/api/order/viewAll"

async function fetchOrders(){
    try{
        const response = await fetch(API_URL);
        const orders = await response.json();
        return orders;}
    catch (error) {
        console.error("Could not fetch orders!", error)
        return [];
    }


}


function createTable(orders){
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");
    const headers = ["id","phoneNumber","pizzas"];
    headers.forEach(header => {
        const th = document.createElement("th")
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    orders.forEach(order => {
        const dataRow = document.createElement("tr");
        headers.forEach(header => {
            const td = document.createElement("td");
            if (header === "Pizzas") {
                td.textContent = order[header].length;
            } else {
                td.textContent = order[header];
            }
            dataRow.appendChild(td);
        });
        tbody.appendChild(dataRow);
    });
    table.appendChild(tbody);

    return table;
}

async function renderOrders() {
    const app = document.getElementById("table");
    const orders = await fetchOrders();
    app.appendChild(createTable(orders));
}

renderOrders();

