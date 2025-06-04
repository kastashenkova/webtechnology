// Array to store shopping list items
let shoppingList = [];

// DOM elements
const newItemNameInput = document.getElementById('newItemName');
const addItemButton = document.getElementById('addItemButton');
const itemListContainer = document.getElementById('itemList');
const remainingBadgesContainer = document.getElementById('remainingBadges');
const boughtBadgesContainer = document.getElementById('boughtBadges');

/**
 * Saves the current shopping list to local storage.
 */
function saveShoppingList() {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

/**
 * Renders the entire shopping list and updates the status badges.
 */
function renderShoppingList() {
    // Clear existing lists
    itemListContainer.innerHTML = '';
    remainingBadgesContainer.innerHTML = '';
    boughtBadgesContainer.innerHTML = '';

    // Iterate through shoppingList array to render items
    shoppingList.forEach((item, index) => {
        // Create list item (li) for each item
        const listItem = document.createElement('li');
        listItem.className = `item-row ${index === shoppingList.length - 1 ? 'last-item' : ''}`; // Apply class for last item
        listItem.dataset.index = index; // Store index for easy access

        // Item name input
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = item.name;
        nameInput.className = `item-name-input ${item.isBought ? 'line-through' : ''}`;
        nameInput.readOnly = item.isBought; // Make read-only if bought
        nameInput.addEventListener('change', (e) => {
            item.name = e.target.value;
            renderShoppingList(); // Re-render to update badges if name changes
        });
        // Add click listener to allow editing when not bought
        nameInput.addEventListener('click', () => {
            if (!item.isBought) {
                nameInput.focus();
            }
        });
        listItem.appendChild(nameInput);

        // Quantity controls
        const quantityControls = document.createElement('div');
        quantityControls.className = 'quantity-controls';

        if (!item.isBought) { // Only show quantity controls if not bought
            const minusButton = document.createElement('button');
            minusButton.className = `quantity-minus ${item.quantity === 1 ? 'disabled' : ''}`; // Add 'disabled' class for styling
            minusButton.textContent = '-';
            minusButton.dataset.tooltip = item.quantity === 1 ? 'Неможливо зменшити кількість' : 'Зменшити кількість';
            minusButton.disabled = item.quantity === 1; // Disable if quantity is 1
            minusButton.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                    renderShoppingList();
                }
            });
            quantityControls.appendChild(minusButton);

            const quantityDisplay = document.createElement('span');
            quantityDisplay.className = 'item-quantity-display';
            quantityDisplay.textContent = item.quantity;
            quantityControls.appendChild(quantityDisplay);

            const plusButton = document.createElement('button');
            plusButton.className = 'quantity-plus';
            plusButton.textContent = '+';
            plusButton.dataset.tooltip = 'Збільшити кількість';
            plusButton.addEventListener('click', () => {
                item.quantity++;
                renderShoppingList();
            });
            quantityControls.appendChild(plusButton);
        }
        listItem.appendChild(quantityControls);

        // Item actions (status and delete buttons)
        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';

        const statusButton = document.createElement('button');
        statusButton.className = 'status-button';
        statusButton.textContent = item.isBought ? 'Куплено' : 'Не куплено';
        statusButton.dataset.tooltip = 'Змінити статус товару';
        statusButton.addEventListener('click', () => {
            item.isBought = !item.isBought;
            renderShoppingList();
        });
        itemActions.appendChild(statusButton);

        if (!item.isBought) { // Only show delete button if not bought
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '&times;'; // HTML entity for 'x'
            deleteButton.dataset.tooltip = 'Видалити товар';
            deleteButton.addEventListener('click', () => {
                shoppingList.splice(index, 1); // Remove item from array
                renderShoppingList();
            });
            itemActions.appendChild(deleteButton);
        }
        listItem.appendChild(itemActions);

        itemListContainer.appendChild(listItem);

        // Render badges
        const badge = document.createElement('span');
        badge.className = `status-badge`;

        const badgeName = document.createElement('b');
        badgeName.textContent = item.name;
        if (item.isBought) {
            const sTag = document.createElement('s');
            sTag.appendChild(badgeName);
            badge.appendChild(sTag);
        } else {
            badge.appendChild(badgeName);
        }

        const badgeQuantity = document.createElement('span');
        badgeQuantity.className = 'badge-qty';
        badgeQuantity.textContent = item.quantity;
        if (item.isBought) {
            const sTag = document.createElement('s');
            sTag.appendChild(badgeQuantity);
            badge.appendChild(sTag);
        } else {
            badge.appendChild(badgeQuantity);
        }

        if (item.isBought) {
            boughtBadgesContainer.appendChild(badge);
        } else {
            remainingBadgesContainer.appendChild(badge);
        }
    });
    saveShoppingList(); // Save state after every render
}

// Event listener for adding new items
addItemButton.addEventListener('click', () => {
    const itemName = newItemNameInput.value.trim();
    if (itemName) {
        shoppingList.push({ name: itemName, quantity: 1, isBought: false });
        newItemNameInput.value = ''; // Clear input field
        newItemNameInput.focus(); // Keep cursor in the input field
        renderShoppingList();
    }
});

// Allow adding item by pressing Enter key in the input field
newItemNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItemButton.click();
    }
});

// Initial rendering of the shopping list with example data or from local storage
window.onload = function() {
    const storedList = localStorage.getItem('shoppingList');
    if (storedList) {
        shoppingList = JSON.parse(storedList);
    } else {
        // Example initial data if no stored list
        shoppingList = [
            { name: "Помідори", quantity: 2, isBought: true },
            { name: "Печиво", quantity: 2, isBought: false },
            { name: "Сир", quantity: 1, isBought: false }
        ];
    }
    renderShoppingList();
};