
// Show more/less functionality for additional cards
document.addEventListener('DOMContentLoaded', function () {
    const showMoreBtn = document.getElementById('showMoreBtn');
    const moreCards = document.querySelector('.more-cards');

    showMoreBtn.addEventListener('click', function () {
        if (moreCards.style.display === 'none') {
            moreCards.style.display = 'flex';
            showMoreBtn.textContent = 'Show Less';
        } else {
            moreCards.style.display = 'none';
            showMoreBtn.textContent = 'Show More';
        }
    });
});


// Increment and decrement functionality for quantity and total price

function increment(btn) {
    const quantitySpan = btn.parentElement.querySelector(".quantity");
    let quantity = parseInt(quantitySpan.innerText);
    quantity++;
    quantitySpan.innerText = quantity;

    updateTotal(btn);
}

function decrement(btn) {
    const quantitySpan = btn.parentElement.querySelector(".quantity");
    let quantity = parseInt(quantitySpan.innerText);
    if (quantity > 0) {
        quantity--;
        quantitySpan.innerText = quantity;
    }

    updateTotal(btn);
}

function updateTotal(btn) {
    const card = btn.closest(".card");
    const quantity = parseInt(card.querySelector(".quantity").textContent);
    const price = parseFloat(card.querySelector(".price-tag").dataset.price);
    card.querySelector(".total-price").textContent = `Total: Rs. ${(quantity * price).toFixed(2)}`;
}

// Function to generate a unique order ID
function generateOrderId() {    
    return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}   

// Function to handle order submission
function addToOrder(btn) {
    const card = btn.closest(".card");
    const quantity = parseInt(card.querySelector(".quantity").textContent);
    const price = parseFloat(card.querySelector(".price-tag").dataset.price);
    const itemName = card.querySelector(".card-title").textContent;
    // Validate quantity
    if (isNaN(quantity) || quantity < 0) {
        alert("Please select a valid quantity.");
        return;
    }
    const totalAmount = (price * quantity).toFixed(2);
    const orderId = "OD" + Date.now(); // simple unique order ID

    const orderData = {
        id: orderId,
        item: itemName,
        quantity: quantity,
        unitPrice: price,
        total: totalAmount
    };

    console.log(orderData); // Output

    // Save to localStorage (append to array)
    let existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    existingOrders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Redirect to order-view.html
    window.location.href = "order-view.html";

}

window.onload = function () {
    const orderTableBody = document.getElementById("orderTableBody");
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    console.log(orders); // Output

    orders.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.item}</td>
            <td>${order.quantity}</td>
            <td>Rs. ${order.unitPrice.toFixed(2)}</td>
            <td>Rs. ${order.total}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">Delete</button>
            </td>
        `;
        orderTableBody.appendChild(row);
    });
};

// Function to delete an order  
function deleteOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders = orders.filter(order => order.id !== orderId);
    orders = orders.filter(order => order.id !== undefined);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Reload the page to reflect changes
    location.reload();
}
