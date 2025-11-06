// Renders product type cards into the container.
import { productTypes } from "./virtualData-store.js";

function renderProductTypesCard() {
    const container = document.getElementById('product-type-container');

    if (!container) {
        return;
    }

    container.innerHTML = '';

    productTypes.forEach(pType => {
        const cardElement = document.createElement('article');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <img src="${pType.src}" alt="${pType.name}">
            <h3>${pType.name}</h3>
        `;

        cardElement.addEventListener('click', () => {
            window.location.href = `quanlysp.html?typeId=${pType.id}`;
        });

        container.appendChild(cardElement);
    });
}

renderProductTypesCard();
