const API_URL = "http://localhost:8080/api/order/viewAll";

async function fetchOrders() {
    try {
        const response = await fetch(API_URL);
        const orders = await response.json();
        return orders;
    } catch (error) {
        console.error("Could not fetch orders!", error);
        return [];
    }
}

async function confirmOrder(id, confirmedCell) {
    try {
        const response = await fetch(`http://localhost:8080/api/order/confirm/${id}`, {
            method: "PATCH",
        });

        if (response.ok) {
            console.log("Order confirmed.");
            confirmedCell.textContent = "Yes"; // Update the cell content
        } else {
            console.error("Failed to confirm order.");
        }
    } catch (error) {
        console.error("Error while confirming the order:", error);
    }
}

function createTable(orders) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");
    const headers = [
        "id",
        "phoneNumber",
        "pizzas",
        "name",
        "address",
        "postalCode",
        "pickUpTime",
        "confirmed",
    ];
    const headerDisplayNames = {
        id: "Order ID",
        phoneNumber: "Phone Number",
        pizzas: "Pizza Count",
        name: "Customer Name",
        address: "Delivery Address",
        postalCode: "Postal Code",
        pickUpTime: "Pickup Time",
        confirmed: "Confirmed",
    };
    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = headerDisplayNames[header];
        headerRow.appendChild(th);
    });

    const confirmHeader = document.createElement("th");
    confirmHeader.textContent = "Confirm Order";
    headerRow.appendChild(confirmHeader);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    orders.forEach((order) => {
        const dataRow = document.createElement("tr");

        let confirmedCell;
        headers.forEach((header) => {
            const td = document.createElement("td");
            if (header === "Pizzas") {
                td.textContent = order[header].length;
            } else if (header === "pickUpTime") {
                // Format the pickUpTime
                const pickUpTime = new Date(order[header]);
                td.textContent = pickUpTime.toLocaleString();
            } else if (header === "confirmed") {
                // Format the confirmed cell
                td.textContent = order[header] ? "Yes" : "No";
                confirmedCell = td;
            } else {
                td.textContent = order[header];
            }
            dataRow.appendChild(td);
        });

        const buttonCell = document.createElement("td");
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Confirm";
        confirmButton.addEventListener("click", () => confirmOrder(order.id, confirmedCell));
        buttonCell.appendChild(confirmButton);
        dataRow.appendChild(buttonCell);

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