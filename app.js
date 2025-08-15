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

    // Initialize chatbot
    initChatbot();
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

// Chatbot functionality

// document.addEventListener("DOMContentLoaded", () => {
//     const chatbotIcon = document.getElementById("chatbotIcon");
//     const chatbotPopup = document.getElementById("chatbotPopup");
//     const closeChatbot = document.getElementById("closeChatbot");
//     const userInput = document.getElementById("userInput");
//     const sendMessage = document.getElementById("sendMessage");
//     const chatbotMessages = document.getElementById("chatbotMessages");

//     // Toggle chatbot when icon clicked
//     chatbotIcon.addEventListener("click", () => {
//         chatbotPopup.style.display = "flex"; // Show popup
//         chatbotIcon.style.display = "none"; // Hide icon
//     });

//     // Close chatbot when close button clicked
//     closeChatbot.addEventListener("click", () => {
//         chatbotPopup.style.display = "none"; // Hide popup
//         chatbotIcon.style.display = "block"; // Show icon
//     });
//     // Send message when button clicked or Enter pressed
//     sendMessage.addEventListener("click", sendUserMessage);
//     userInput.addEventListener("keypress", (e) => {
//         if (e.key === "Enter") {
//             sendUserMessage();
//         }
//     });

// });

// ===== CHATBOT INTENT CLASSIFIER =====
async function initChatbot() {
    // Load TensorFlow.js if not already loaded
    if (!window.tf) {
        await loadTensorFlow();
    }
    
    // Train or load model
    let model;
    try {
        model = await loadModel();
        if (!model) {
            model = await trainModel();
            await saveModel(model);
        }
    } catch (error) {
        console.error("Error loading/creating model:", error);
        model = await trainModel();
    }
    
    // Setup chat UI handlers
    setupChatUI(model);
}

async function loadTensorFlow() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest";
        document.head.appendChild(script);
        script.onload = resolve;
    });
}

// Training data for the chatbot
const trainingData = [
    { input: "What time do you open?", output: "hours" },
    { input: "When do you close today?", output: "hours" },
    { input: "Show me your menu", output: "menu" },
    { input: "What's on the menu today?", output: "menu" },
    { input: "Can I make a reservation?", output: "reservation" },
    { input: "Book a table for 4", output: "reservation" },
    { input: "Do you have vegan options?", output: "dietary" },
    { input: "Gluten-free choices?", output: "dietary" },
    { input: "Are you open on weekends?", output: "hours" },
    { input: "What are your opening hours?", output: "hours" },
    { input: "Can I see the menu?", output: "menu" },
    { input: "What food do you serve?", output: "menu" },
    { input: "I need to book a table", output: "reservation" },
    { input: "Make a reservation for 2", output: "reservation" },
    { input: "Do you have vegetarian dishes?", output: "dietary" },
    { input: "Any dairy-free options?", output: "dietary" }
];

// Text processing functions
const tokenize = (text) => {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
};

let vocabulary, intents;

function createVocabAndIntents() {
    const vocab = new Set();
    trainingData.forEach(item => {
        tokenize(item.input).forEach(token => vocab.add(token));
    });
    vocabulary = Array.from(vocab);
    intents = [...new Set(trainingData.map(item => item.output))];
}

// Model functions
function buildModel(vocabSize, numIntents) {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
        inputShape: [vocabSize]
    }));
    
    model.add(tf.layers.dense({
        units: 16,
        activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
        units: numIntents,
        activation: 'softmax'
    }));
    
    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });
    
    return model;
}

async function trainModel() {
    createVocabAndIntents();
    
    const xs = trainingData.map(item => {
        const tokens = tokenize(item.input);
        const vector = new Array(vocabulary.length).fill(0);
        tokens.forEach(token => {
            const index = vocabulary.indexOf(token);
            if (index !== -1) vector[index] = 1;
        });
        return vector;
    });
    
    const ys = trainingData.map(item => {
        const label = new Array(intents.length).fill(0);
        label[intents.indexOf(item.output)] = 1;
        return label;
    });
    
    const xTrain = tf.tensor2d(xs);
    const yTrain = tf.tensor2d(ys);
    
    const model = buildModel(vocabulary.length, intents.length);
    
    await model.fit(xTrain, yTrain, {
        epochs: 100,
        batchSize: 4,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
            }
        }
    });
    
    xTrain.dispose();
    yTrain.dispose();
    
    return model;
}

async function predictIntent(model, text) {
    const tokens = tokenize(text);
    const vector = new Array(vocabulary.length).fill(0);
    tokens.forEach(token => {
        const index = vocabulary.indexOf(token);
        if (index !== -1) vector[index] = 1;
    });
    
    const prediction = model.predict(tf.tensor2d([vector]));
    const scores = await prediction.data();
    prediction.dispose();
    
    let maxIndex = 0;
    let maxScore = scores[0];
    for (let i = 1; i < scores.length; i++) {
        if (scores[i] > maxScore) {
            maxIndex = i;
            maxScore = scores[i];
        }
    }
    
    return {
        intent: intents[maxIndex],
        confidence: maxScore
    };
}

// Model storage functions
async function saveModel(model) {
    try {
        await model.save('localstorage://chatbot-model');
        console.log('Model saved to local storage');
    } catch (error) {
        console.error('Error saving model:', error);
    }
}

async function loadModel() {
    try {
        const models = await tf.io.listModels();
        if (models['localstorage://chatbot-model']) {
            createVocabAndIntents();
            const model = await tf.loadLayersModel('localstorage://chatbot-model');
            console.log('Model loaded from local storage');
            return model;
        }
        return null;
    } catch (error) {
        console.error('Error loading model:', error);
        return null;
    }
}

// Chat UI functions
function setupChatUI(model) {
    const chatbotIcon = document.getElementById("chatbotIcon");
    const chatbotPopup = document.getElementById("chatbotPopup");
    const closeChatbot = document.getElementById("closeChatbot");
    const userInput = document.getElementById("userInput");
    const sendMessage = document.getElementById("sendMessage");
    const chatbotMessages = document.getElementById("chatbotMessages");

    // Toggle chatbot visibility
    chatbotIcon.addEventListener("click", () => {
        chatbotPopup.style.display = "flex";
        chatbotIcon.style.display = "none";
    });
    closeChatbot.addEventListener("click", () => {
        chatbotPopup.style.display = "none";
        chatbotIcon.style.display = "block";
    });

    // Send message handler
    const sendUserMessage = async () => {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Get bot response
        const response = await getBotResponse(model, message);
        addMessage(response, 'bot');
    };

    sendMessage.addEventListener("click", sendUserMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendUserMessage();
    });
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById("chatbotMessages");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(`${sender}-message`);
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function getBotResponse(model, message) {
    try {
        const { intent, confidence } = await predictIntent(model, message);
        
        if (confidence < 0.7) {
            return "I'm not sure I understand. Can you rephrase your question?";
        }
        
        switch(intent) {
            case 'hours':
                return "We're open Monday to Friday from 11am to 10pm, and weekends from 10am to 11pm.";
            case 'menu':
                return "You can view our full menu on the menu section of our website. We offer a variety of dishes including seafood, pasta, and vegetarian options.";
            case 'reservation':
                return "To make a reservation, please call us at (123) 456-7890 or visit our reservation page.";
            case 'dietary':
                return "We offer several vegetarian, vegan, and gluten-free options. Please inform your server about any dietary restrictions.";
            default:
                return "Thanks for your message! How can I assist you further?";
        }
    } catch (error) {
        console.error("Error generating response:", error);
        return "I'm having trouble understanding. Please try again later.";
    }
}


