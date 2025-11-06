// --- IMPORTS ---
import {
    getProducts, getProductImports, getProfitSettings, getCart, saveCart
} from '../virtualData-store.js';
import { getCurrentUser, isLoggedIn } from './auth-guard.js';

// --- DATA PROCESSING & PRICE CALCULATION ---

// Calculates the average cost price for each product from import data.
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

// Calculates the selling price for all products based on cost and profit settings.
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

// Retrieves all products and enriches them with calculated prices and default values.
function getProductsWithDetails() {
    const masterProductList = getProducts();
    const sellingPriceMap = calculateAllSellingPrices();
    
    return masterProductList.map(product => {
        const sellingPrice = sellingPriceMap.get(product.id) || 0;
        const status = product.status || 'Hoạt động';
        const imageUrl = product.imageUrl || 'https://via.placeholder.com/300';
        const isFeatured = product.isFeatured || false;
        const description = product.description || "Herta lười 'xoay' mô tả... Cứ coi như đây là 'búp bê' xịn nhất Trạm Không Gian. Mua đi, 'kuru kuru'~"; 
        
        return { ...product, sellingPrice, status, imageUrl, isFeatured, description };
    });
}

// --- UI RENDERING & INTERACTION ---

// Handles the login modal visibility.
const loginModal = document.getElementById('login-modal');
function openLoginModal() {
    if(loginModal) {
        loginModal.classList.remove('hidden');
        loginModal.classList.add('visible');
    }
}

// Renders the product details on the page.
function renderProductDetail(productId) {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const allProducts = getProductsWithDetails();
    const product = allProducts.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = "<h2>Herta 'xoay' gãy bánh xe mà không thấy 'búp bê' này!</h2>";
        return;
    }

    container.innerHTML = `
        <div class="product-image-gallery">
            <img src="${product.imageUrl}" alt="${product.name}">
        </div>
        <div class="product-info-panel">
            <h1 class="product-title">${product.name}</h1>
            <p class="product-brand">Thương hiệu: ${product.brand}</p>
            <p class="product-price-detail">${product.sellingPrice.toLocaleString('vi-VN')} VNĐ</p>
            
            <div class="product-description">
                <p>${product.description.replace(/\n/g, '<br>')}</p> 
            </div>
            
            <div class="product-actions">
                <input type="number" id="product-quantity" value="1" min="1">
                <button class="btn-add-to-cart-detail" data-id="${product.id}">Thêm vào giỏ</button>
            </div>
        </div>
    `;

    // Attaches event listener to the 'Add to Cart' button.
    document.querySelector('.btn-add-to-cart-detail').addEventListener('click', (e) => {
        if (!isLoggedIn()) {
            alert('Bạn phải đăng nhập để "xoay" giỏ hàng!');
            openLoginModal();
        } else {
            const currentUser = getCurrentUser();
            const quantity = parseInt(document.getElementById('product-quantity').value);
            
            let myCart = getCart(currentUser.id);
            const itemInCart = myCart.find(item => item.id === product.id);

            if (itemInCart) {
                itemInCart.quantity += quantity;
            } else {
                myCart.push({
                    id: product.id,
                    name: product.name,
                    price: product.sellingPrice,
                    imageUrl: product.imageUrl,
                    quantity: quantity
                });
            }
            saveCart(currentUser.id, myCart);
            alert(`Đã thêm ${quantity} x "${product.name}" vào giỏ!`);
        }
    });
}

// --- INITIALIZATION ---

// Initializes the page on load.
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        renderProductDetail(productId);
    } else {
        window.location.href = 'user-dashboard.html';
    }
});