// --- IMPORTS ---
import {
    getProducts, getProductImports, getProfitSettings, getCart, saveCart
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
function renderFeaturedProducts() {
    const container = document.querySelector('.main-content-wrapper');
    if (!container) {
         console.error("Could not find '.main-content-wrapper'");
        return;
    }
    const allProducts = getProductsWithDetails();
    const featuredProducts = allProducts.filter(product => 
        product.isFeatured === true && product.status === 'Hoạt động'
    ).slice(0, 8);
    let headerHtml = `<h2 class="section-title">Sản phẩm nổi bật</h2>`;
    let productsHtml = '';
    if (featuredProducts.length === 0) {
        productsHtml = "<p style='color: white; text-align: center; width: 100%;'>Chưa có sản phẩm nào nổi bật.</p>";
    } else {
        productsHtml = featuredProducts.map(product => `
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
    container.innerHTML = headerHtml + productsHtml;
}

// --- EVENT HANDLING ---
function handleCartEvents() {
    const productContainer = document.querySelector('.main-content-wrapper');
    if (!productContainer) return;
    const loginModal = document.getElementById('login-modal');
    const openLoginModal = () => {
        if(loginModal) {
            loginModal.classList.remove('hidden');
            loginModal.classList.add('visible');
        }
    }
    productContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-to-cart')) {
            if (!isLoggedIn()) {
                alert('Bạn phải đăng nhập để thêm vào giỏ hàng!');
                openLoginModal(); 
            } else {
                const currentUser = getCurrentUser();
                const productId = e.target.dataset.id;
                let myCart = getCart(currentUser.id);
                const allProducts = getProductsWithDetails();
                const productToAdd = allProducts.find(p => p.id === productId);
                if (!productToAdd) {
                    alert("Lỗi: Không tìm thấy sản phẩm!");
                    return;
                }
                const itemInCart = myCart.find(item => item.id === productId);
                if (itemInCart) {
                    itemInCart.quantity += 1;
                } else {
                    myCart.push({
                        id: productToAdd.id,
                        name: productToAdd.name,
                        price: productToAdd.sellingPrice,
                        imageUrl: productToAdd.imageUrl,
                        quantity: 1
                    });
                }
                saveCart(currentUser.id, myCart);
                alert(`Đã thêm "${productToAdd.name}" vào giỏ!`);
            }
        }
    });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderFeaturedProducts();
    handleCartEvents();
});
