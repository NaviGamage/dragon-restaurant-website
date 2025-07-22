document.addEventListener('DOMContentLoaded', function() {
        const showMoreBtn = document.getElementById('showMoreBtn');
        const moreCards = document.querySelector('.more-cards');

        showMoreBtn.addEventListener('click', function() {
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
