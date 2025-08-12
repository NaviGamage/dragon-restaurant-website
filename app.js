document.addEventListener("DOMContentLoaded", () => {
    // Load header and footer
    fetch("header.html").then(res => res.text()).then(html => {
        document.getElementById("header").innerHTML = html;
        setupCartHandlers(); // Cart logic after header loads
    });

    fetch("footer.html").then(res => res.text()).then(html => {
        document.getElementById("footer").innerHTML = html;
    });
    
    // Load menu cards
    loadMenuItems();
    setupShowMoreToggle();

    // Load order-view.html table if applicable
    const orderTableBody = document.getElementById("orderTableBody");
    if (orderTableBody) loadOrderTable(orderTableBody);
});

// Load menu from menuData.js
function loadMenuItems() {
    const visibleContainer = document.getElementById("menuCards");
    const hiddenContainer = document.getElementById("moreCards");

    if (!visibleContainer || !hiddenContainer || !window.menuItems) return;

    window.menuItems.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "card m-3";
        card.style.width = "18rem";
        card.innerHTML = `
            <img src="${item.image}" class="card-img-top" alt="${item.name}">
            <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="price-tag" data-price="${item.price}">Price: Rs. ${item.price}</p>
                <p class="card-text">${item.description}</p>
                <p class="total-price fw-bold">Total: Rs. 0.00</p>
                <div class="d-flex justify-content-end align-items-center mb-3">
                    <button class="btn btn-outline-secondary btn-sm" onclick="decrement(this)">-</button>
                    <span class="mx-3 quantity">0</span>
                    <button class="btn btn-outline-secondary btn-sm" onclick="increment(this)">+</button>
                </div>
                <button class="btn btn-primary btn-lg" onclick="addToCart(this)">Add To Cart</button>
            </div>
        `;

        // First 4 in visible section, others in hidden
        if (index < 4) {
            visibleContainer.appendChild(card);
        } else {
            hiddenContainer.appendChild(card);
        }
    });
    console.log("4 in menuCards, rest in moreCards");
    console.log(document.getElementById("menuCards").children.length);
    console.log(document.getElementById("moreCards").children.length);
}

// Show More / Show Less toggle
function setupShowMoreToggle() {
    const showMoreBtn = document.getElementById("showMoreBtn");
    const moreCards = document.getElementById("moreCards");

    if (!showMoreBtn || !moreCards) return;

    showMoreBtn.addEventListener("click", () => {
        const isHidden = moreCards.style.display === "none" || moreCards.style.display === "";
        moreCards.style.display = isHidden ? "flex" : "none";
        showMoreBtn.textContent = isHidden ? "Show Less" : "Show More";
    });
}

// Quantity control for menu cards
function increment(button) {
    const qty = button.parentElement.querySelector(".quantity");
    qty.textContent = parseInt(qty.textContent) + 1;
    updateItemTotal(button);
}

function decrement(button) {
    const qty = button.parentElement.querySelector(".quantity");
    let val = parseInt(qty.textContent);
    if (val > 0) qty.textContent = val - 1;
    updateItemTotal(button);
}

function updateItemTotal(button) {
    const card = button.closest(".card");
    const price = parseFloat(card.querySelector(".price-tag").dataset.price);
    const quantity = parseInt(card.querySelector(".quantity").textContent);
    card.querySelector(".total-price").textContent = `Total: Rs. ${(price * quantity).toFixed(2)}`;
}

// Order ID Generator
function generateOrderId() {
    let orderCounter = parseInt(localStorage.getItem("orderCounter")) || 1;
    const id = `OD-${orderCounter.toString().padStart(2, "0")}`;
    localStorage.setItem("orderCounter", (orderCounter + 1).toString());
    return id;
}

// Save order to localStorage and go to order-view.html
function addToOrder(button) {
    const card = button.closest(".card");
    const quantity = parseInt(card.querySelector(".quantity").textContent);
    const price = parseFloat(card.querySelector(".price-tag").dataset.price);
    const title = card.querySelector(".card-title").textContent;

    if (!quantity || quantity <= 0) {
        alert("Please select a valid quantity.");
        return;
    }

    const order = {
        id: generateOrderId(),
        item: title,
        quantity: quantity,
        unitPrice: price,
        total: (price * quantity).toFixed(2)
    };

    let existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    existingOrders.push(order);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    window.location.href = "order-view.html";
}

// Load order-view.html table
function loadOrderTable(orderTableBody) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.forEach(order => {
        if (!order.id) return; 
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.item}</td>
            <td>${order.quantity}</td>
            <td>Rs. ${parseFloat(order.unitPrice).toFixed(2)}</td>
            <td>Rs. ${order.total}</td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">Delete</button></td>
        `;
        orderTableBody.appendChild(row);
    });
}

// Delete order from localStorage
function deleteOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders = orders.filter(order => order.id && order.id !== orderId);
    localStorage.setItem("orders", JSON.stringify(orders));
    location.reload();
}

// === CART POPUP FUNCTIONALITY ===

let cart = [];

function setupCartHandlers() {
    const cartIcon = document.getElementById("cartIcon");
    const cartPopup = document.getElementById("cartPopup");
    const closeCart = document.getElementById("closeCart");

    if (!cartIcon || !cartPopup || !closeCart) return;

    cartIcon.addEventListener("click", () => {
        cartPopup.classList.add("active");
    });

    closeCart.addEventListener("click", () => {
        cartPopup.classList.remove("active");
    });
}

function updateCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");

    if (!cartItemsContainer || !cartTotal || !cartCount) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        itemCount += item.quantity;

        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        itemDiv.innerHTML = `
            <div class="item-info">
                <h4>${item.title}</h4>
                <p>Rs. ${item.price} x ${item.quantity}</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn" onclick="decrementCartItem('${item.title}')">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="incrementCartItem('${item.title}')">+</button>
            </div>

            <div class="item-price">Rs. ${(item.price * item.quantity).toFixed(2)}
            <button class="delete-btn" onclick="deleteCartItem('${item.title}')">Delete</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    cartTotal.textContent = `Total: Rs. ${total.toFixed(2)}`;
    cartCount.textContent = itemCount;
}

function addToCart(button) {
    const card = button.closest(".card");
    const title = card.querySelector(".card-title").textContent;
    const price = parseFloat(card.querySelector(".price-tag").dataset.price);
    const quantity = parseInt(card.querySelector(".quantity").textContent);

    if (quantity <= 0) {
        alert("Please select at least 1 quantity.");
        return;
    }

    const existing = cart.find(item => item.title === title);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ title, price, quantity });
    }

    updateCart();

    // Reset quantity after adding
    card.querySelector(".quantity").textContent = "0";
    card.querySelector(".total-price").textContent = "Total: Rs. 0.00";

    cartPopup.classList.add("active");
    alert(`${quantity} ${title} added to cart!`);
}

// Cart quantity controls
function incrementCartItem(title) {
    const item = cart.find(i => i.title === title);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

function decrementCartItem(title) {
    const index = cart.findIndex(i => i.title === title);
    if (index >= 0) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCart();
    }
}

// Delete item from cart
function deleteCartItem(title) {
    cart = cart.filter(item => item.title !== title);
    updateCart();
}

document.addEventListener("DOMContentLoaded", () => {
    const chatbotIcon = document.getElementById("chatbotIcon");
    const chatbotPopup = document.getElementById("chatbotPopup");
    const closeChatbot = document.getElementById("closeChatbot");

    // Toggle chatbot when icon clicked
    chatbotIcon.addEventListener("click", () => {
        chatbotPopup.style.display = "flex"; // Show popup
        chatbotIcon.style.display = "none"; // Hide icon
    });

    // Close chatbot when close button clicked
    closeChatbot.addEventListener("click", () => {
        chatbotPopup.style.display = "none"; // Hide popup
        chatbotIcon.style.display = "block"; // Show icon
    });
});

