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
    itemListContainer.innerHTML = '';
    remainingBadgesContainer.innerHTML = '';
    boughtBadgesContainer.innerHTML = '';

    shoppingList.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = `item-row ${index === shoppingList.length - 1 ? 'last-item' : ''}`;
        listItem.dataset.index = index;

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = item.name;
        nameInput.className = `item-name-input ${item.isBought ? 'line-through' : ''}`;
        nameInput.readOnly = item.isBought;
        nameInput.addEventListener('change', (e) => {
            item.name = e.target.value;
            renderShoppingList();
        });
        nameInput.addEventListener('click', () => {
            if (!item.isBought) {
                nameInput.focus();
            }
        });
        listItem.appendChild(nameInput);

        const quantityControls = document.createElement('div');
        quantityControls.className = 'quantity-controls';

        if (!item.isBought) {
            const minusButton = document.createElement('button');
            minusButton.className = `quantity-minus ${item.quantity === 1 ? 'disabled' : ''}`;
            minusButton.textContent = '-';
            minusButton.dataset.tooltip = item.quantity === 1 ? 'Неможливо зменшити кількість' : 'Зменшити кількість';
            minusButton.disabled = item.quantity === 1;
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

        if (!item.isBought) { 
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '&times;';
            deleteButton.dataset.tooltip = 'Видалити товар';
            deleteButton.addEventListener('click', () => {
                shoppingList.splice(index, 1);
                renderShoppingList();
            });
            itemActions.appendChild(deleteButton);
        }
        listItem.appendChild(itemActions);

        itemListContainer.appendChild(listItem);

        if (index < shoppingList.length - 1) {
            const hrElement = document.createElement('hr');
            itemListContainer.appendChild(hrElement);
        }

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
    saveShoppingList();
}

addItemButton.addEventListener('click', () => {
    const itemName = newItemNameInput.value.trim();
    if (itemName) {
        const isDuplicate = shoppingList.some(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (isDuplicate) {
            alert('Такий товар уже є в переліку!');
            return;
        }
        shoppingList.push({ name: itemName, quantity: 1, isBought: false });
        newItemNameInput.value = '';
        newItemNameInput.focus();
        renderShoppingList();
    }
});


newItemNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItemButton.click();
    }
});

window.onload = function() {
    const storedList = localStorage.getItem('shoppingList');
    if (storedList) {
        shoppingList = JSON.parse(storedList);
    } else {
        shoppingList = [
            { name: "Помідори", quantity: 2, isBought: true },
            { name: "Печиво", quantity: 2, isBought: false },
            { name: "Сир", quantity: 1, isBought: false }
        ];
    }
    renderShoppingList();
};