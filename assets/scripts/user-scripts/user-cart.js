// User cart management
import { getCurrentUser } from './auth-guard.js';
import { getCart, saveCart } from '../virtualData-store.js';

let myCart = [];
let currentUser = null;

function renderCart() {
    const container = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!container) return;

    if (myCart.length === 0) {
        container.innerHTML = "<p>Bạn chưa có sản phẩm nào trong giỏ hàng cả!</p>";
        totalEl.textContent = "Tổng tiền: 0 VNĐ";
        checkoutBtn.classList.add('disabled');
        return;
    }

    checkoutBtn.classList.remove('disabled');
    let total = 0;
    container.innerHTML = myCart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <div class="cart-item">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
                <p class="cart-item-subtotal">${subtotal.toLocaleString('vi-VN')} VNĐ</p>
                <button class="remove-btn" data-id="${item.id}">&times;</button>
            </div>
        `;
    }).join('');

    totalEl.textContent = `Tổng tiền: ${total.toLocaleString('vi-VN')} VNĐ`;
}

function handleCartControls() {
    const container = document.getElementById('cart-items-list');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const target = e.target;
        const productId = target.dataset.id;
        if (!productId) return;

        const itemIndex = myCart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;

        if (target.classList.contains('quantity-btn')) {
            const action = target.dataset.action;
            if (action === 'increase') {
                myCart[itemIndex].quantity += 1;
            } else if (action === 'decrease') {
                myCart[itemIndex].quantity -= 1;
                if (myCart[itemIndex].quantity <= 0) {
                    myCart.splice(itemIndex, 1);
                }
            }
        }

        if (target.classList.contains('remove-btn')) {
            myCart.splice(itemIndex, 1);
        }

        saveCart(currentUser.id, myCart);
        renderCart();
    });
    
    container.addEventListener('change', (e) => {
        const target = e.target;
        if (target.classList.contains('quantity-input')) {
            const productId = target.dataset.id;
            const newQuantity = parseInt(target.value);
            
            const itemIndex = myCart.findIndex(item => item.id === productId);
            if (itemIndex === -1) return;

            if (newQuantity <= 0) {
                myCart.splice(itemIndex, 1);
            } else {
                myCart[itemIndex].quantity = newQuantity;
            }
            
            saveCart(currentUser.id, myCart);
            renderCart();
        }
    });
}

function init() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        alert("Bạn phải đăng nhập");
        window.location.href = 'user-dashboard.html';
        return;
    }

    myCart = getCart(currentUser.id);
    renderCart();
    handleCartControls();
}

document.addEventListener('DOMContentLoaded', init);
