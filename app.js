
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
    const quantity = parseInt(card.querySelector(".quantity").innerText);
    const priceTag = card.querySelector(".price-tag");
    const price = parseFloat(priceTag.getAttribute("data-price"));
    const totalElement = card.querySelector(".total-price");
    const total = quantity * price;
    totalElement.innerText = `Total: Rs. ${total.toFixed(2)}`;

}



