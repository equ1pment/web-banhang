// --- IMPORTS ---
import {
    getProducts, getProductImports, getProfitSettings, productTypes,
    getCart, saveCart
} from '../virtualData-store.js';
import {
    getCurrentUser, isLoggedIn
} from './auth-guard.js';

// --- DATA CALCULATION ---
function calculateAverageCostPrice() {
    const importData = getProductImports();
    const costMap = new Map();
    const importsByProduct = {};
    importData.forEach(item => {
        const productId = item.productId;
        if (!importsByProduct[productId]) importsByProduct[productId] = [];
        importsByProduct[productId].push(item.importprice);
    });
    for (const productId in importsByProduct) {
        const prices = importsByProduct[productId];
        const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        costMap.set(productId, average);
    }
    return costMap;
}

function calculateAllSellingPrices() {
    const productsMasterData = getProducts();
    const costPrices = calculateAverageCostPrice();
    const profitSettings = getProfitSettings();
    const sellingPriceMap = new Map();
    productsMasterData.forEach(product => {
        const cost = costPrices.get(product.id) || 0;
        const productProfit = profitSettings[product.id];
        const typeProfit = profitSettings[product.typeId];
        let finalProfit = 0;
        if (productProfit !== undefined && productProfit !== '') {
            finalProfit = parseFloat(productProfit);
        } else if (typeProfit !== undefined && typeProfit !== '') {
            finalProfit = parseFloat(typeProfit);
        }
        const sellingPrice = cost > 0 ? cost * (1 + finalProfit / 100) : 0;
        sellingPriceMap.set(product.id, sellingPrice);
    });
    return sellingPriceMap;
}

function getProductsWithDetails() {
    const masterProductList = getProducts();
    const sellingPriceMap = calculateAllSellingPrices();
    return masterProductList.map(product => {
        const sellingPrice = sellingPriceMap.get(product.id) || 0;
        const status = product.status || 'Hoạt động';
        const imageUrl = product.imageUrl || 'https://via.placeholder.com/300';
        const isFeatured = product.isFeatured || false;
        return { ...product, sellingPrice, status, imageUrl, isFeatured };
    });
}

// --- UI RENDERING ---
function renderCategoryLinks() {
    const container = document.querySelector('.header .section');
    if (!container) return;
    container.innerHTML = productTypes.map(type => `
        <a href="products-list.html?typeId=${type.id}" class="section-button">
            ${type.name}
        </a>
    `).join('');
}

function populateFilters(initialSearchTerm) {
    const categorySelect = document.getElementById('filter-category');
    const searchBox = document.getElementById('filter-search-box');
    searchBox.value = initialSearchTerm || '';
    productTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        categorySelect.appendChild(option);
    });
}

function performSearchAndRender() {
    const container = document.getElementById('search-results-container');
    const form = document.getElementById('filter-form');
    const searchTerm = form.elements['q'].value.toLowerCase();
    const categoryId = form.elements['category'].value;
    const minPrice = parseFloat(form.elements['minPrice'].value) || 0;
    const maxPrice = parseFloat(form.elements['maxPrice'].value) || Infinity;
    const sortOrder = form.elements['sort'].value;
    const allProducts = getProductsWithDetails();

    let results = allProducts.filter(product =>
        product.status === 'Hoạt động' &&
        (searchTerm === '' || product.name.toLowerCase().includes(searchTerm)) &&
        (categoryId === '' || product.typeId === categoryId) &&
        (product.sellingPrice >= minPrice && product.sellingPrice <= maxPrice)
    );

    if (sortOrder === 'price-asc') {
        results.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortOrder === 'price-desc') {
        results.sort((a, b) => b.sellingPrice - a.sellingPrice);
    }

    const titleHtml = `<h2 class="section-title">Kết quả tìm kiếm cho: "${searchTerm || 'Tất cả'}"</h2>`;
    let productsHtml = '';
    if (results.length === 0) {
        productsHtml = "<p style='color: white; text-align: center; width: 100%;'>Không tìm thấy sản phẩm nào phù hợp.</p>";
    } else {
        productsHtml = results.map(product => `
            <article class="card">
                <a href="user-product-detail.html?id=${product.id}" class="product-link">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <div>
                        <h3 class="product-card-name">${product.name}</h3>
                        <p class="product-card-price">${product.sellingPrice.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                </a>
                <div class="card-footer">
                    <button class="btn-add-to-cart" data-id="${product.id}">Thêm vào giỏ</button>
                </div>
            </article>
        `).join('');
    }
    container.innerHTML = titleHtml + productsHtml;
}

// --- EVENT HANDLERS ---
function handleCartEvents() {
    const productContainer = document.getElementById('search-results-container');
    if (!productContainer) return;

    productContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-to-cart')) {
            if (!isLoggedIn()) {
                alert('Bạn phải đăng nhập để thêm sản phẩm vào giỏ hàng!');
            } else {
                const currentUser = getCurrentUser();
                const productId = e.target.dataset.id;
                let myCart = getCart(currentUser.id);
                const allProducts = getProductsWithDetails();
                const productToAdd = allProducts.find(p => p.id === productId);

                if (!productToAdd) return;

                const itemInCart = myCart.find(item => item.id === productId);
                if (itemInCart) {
                    itemInCart.quantity += 1;
                } else {
                    myCart.push({
                        id: productToAdd.id, name: productToAdd.name,
                        price: productToAdd.sellingPrice, imageUrl: productToAdd.imageUrl,
                        quantity: 1
                    });
                }
                saveCart(currentUser.id, myCart);
                alert(`Đã thêm "${productToAdd.name}" vào giỏ hàng!`);
            }
        }
    });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryLinks();

    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q');
    populateFilters(searchTerm);
    performSearchAndRender();

    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearchAndRender();
    });

    handleCartEvents();
});
