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

function increment(button) {
    const quantitySpan = button.parentElement.querySelector('.quantity');
    let count = parseInt(quantitySpan.textContent);
    quantitySpan.textContent = count + 1;
}

function decrement(button) {
    const quantitySpan = button.parentElement.querySelector('.quantity');
    let count = parseInt(quantitySpan.textContent);
    if (count > 0) {
        quantitySpan.textContent = count - 1;
    }
}
function addToOrder(button) {
    const card = button.closest('.card');
    const title = card.querySelector('.card-title').innerText;
    const quantity = parseInt(card.querySelector('.quantity').innerText);
    const image = card.querySelector('img').getAttribute('src');

    if (quantity === 0) {
        alert("Please select at least 1 item to order.");
        event.preventDefault(); // Stop going to order page
        return;
    }

    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    existingOrders.push({ title, quantity, image });
    localStorage.setItem("orders", JSON.stringify(existingOrders));
}

function increment(btn) {
    const quantityEl = btn.parentElement.querySelector(".quantity");
    quantityEl.innerText = parseInt(quantityEl.innerText) + 1;
}

function decrement(btn) {
    const quantityEl = btn.parentElement.querySelector(".quantity");
    const current = parseInt(quantityEl.innerText);
    if (current > 0) quantityEl.innerText = current - 1;
}



//oder view js code//
document.addEventListener('DOMContentLoaded', function() {
    const orderTableBody = document.getElementById('orderTableBody');
    const orderTotal = document.getElementById('orderTotal');
    const continueShoppingBtn = document.getElementById('continueShopping');
    const placeOrderBtn = document.getElementById('placeOrder');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    // Sample order statuses (you can modify as needed)
    const statuses = ['Pending', 'Processing', 'Completed'];
    
    // Load orders from localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    function displayOrders() {
        orderTableBody.innerHTML = '';
        
        if (orders.length === 0) {
            orderTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-message">
                            <i class="fas fa-shopping-cart fa-2x mb-3"></i>
                            <p>Your order list is empty</p>
                        </div>
                    </td>
                </tr>
            `;
            orderTotal.textContent = '$0.00';
            placeOrderBtn.disabled = true;
            return;
        }

        let total = 0;
        
        orders.forEach((order, index) => {
            const subtotal = order.price * order.quantity;
            total += subtotal;
            
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const statusClass = randomStatus.toLowerCase();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.title}</td>
                <td><img src="${order.image}" class="product-img" alt="${order.title}"></td>
                <td>$${order.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-control">
                        <button class="btn btn-sm btn-outline-secondary decrement" data-index="${index}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="form-control quantity-input" 
                               value="${order.quantity}" min="1" data-index="${index}">
                        <button class="btn btn-sm btn-outline-secondary increment" data-index="${index}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${statusClass}">${randomStatus}</span>
                </td>
                <td>
                    <button class="btn btn-action btn-outline-danger delete" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="btn btn-action btn-outline-primary update" data-index="${index}">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </td>
            `;
            orderTableBody.appendChild(row);
        });

        orderTotal.textContent = `$${total.toFixed(2)}`;
        placeOrderBtn.disabled = false;
        
        // Add event listeners to all buttons
        addEventListeners();
    }

    function addEventListeners() {
        // Quantity decrement buttons
        document.querySelectorAll('.decrement').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                if (orders[index].quantity > 1) {
                    orders[index].quantity--;
                    updateOrder(index);
                }
            });
        });

        // Quantity increment buttons
        document.querySelectorAll('.increment').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                orders[index].quantity++;
                updateOrder(index);
            });
        });

        // Quantity input changes
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const index = this.getAttribute('data-index');
                const newQuantity = parseInt(this.value);
                if (newQuantity > 0) {
                    orders[index].quantity = newQuantity;
                    updateOrder(index);
                } else {
                    this.value = orders[index].quantity;
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                orders.splice(index, 1);
                saveOrders();
                displayOrders();
            });
        });

        // Update buttons
        document.querySelectorAll('.update').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const input = document.querySelector(`.quantity-input[data-index="${index}"]`);
                const newQuantity = parseInt(input.value);
                if (newQuantity > 0) {
                    orders[index].quantity = newQuantity;
                    updateOrder(index);
                } else {
                    input.value = orders[index].quantity;
                }
            });
        });
    }

    function updateOrder(index) {
        saveOrders();
        displayOrders();
    }

    function saveOrders() {
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    continueShoppingBtn.addEventListener('click', function() {
        window.location.href = 'index.html'; // Change to your shopping page
    });

    placeOrderBtn.addEventListener('click', function() {
        // Here you would typically send the order to a server
        // For this example, we'll just show a success message
        successModal.show();
        
        // Clear orders after successful submission
        localStorage.removeItem('orders');
        orders = [];
        displayOrders();
    });

    // Initial display
    displayOrders();
});

