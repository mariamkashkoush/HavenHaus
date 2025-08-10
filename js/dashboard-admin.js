fetch('../data/order.json')
    .then(response => response.json())
    .then(orders => {
        const tbody = document.getElementById('orderTableBody');

        orders.foreach(order => {
            const row = document.createElement('tr');

            row.innerHTML = `
            <td>${order.userID}</td>
            <td>${order.date}</td>
            <td>${order.status}</td>
            <td>${order.cost}</td>
            <td>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>

            `;

            tbody.appendChild(row);
        });

    })
    .catch(error => {
        console.error("Error loading orders:",error);
    });