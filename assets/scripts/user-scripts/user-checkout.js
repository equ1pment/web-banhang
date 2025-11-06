import { getCurrentUser } from './auth-guard.js';
import { getCart, saveCart, getOrders, saveOrders } from '../virtualData-store.js';

// Initialize global variables
let myCart = [];
let currentUser = null;
let cartTotal = 0;

// Renders the order summary in the checkout page.
function renderCheckoutSummary() {
    const container = document.getElementById('summary-items-list');
    const totalEl = document.getElementById('summary-total');
    if (!container) return;

    cartTotal = 0;
    container.innerHTML = myCart.map(item => {
        cartTotal += item.price * item.quantity;
        return `
            <div class="summary-item">
                <img src="${item.imageUrl}" alt="${item.name}">
                <span class="summary-item-info">
                    ${item.name} (x${item.quantity})
                </span>
                <span class="summary-item-price">
                    ${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                </span>
            </div>
        `;
    }).join('');
    totalEl.textContent = `${cartTotal.toLocaleString('vi-VN')} VNĐ`;
}

// Handles the checkout form submission and logic.
function handleCheckoutForm() {
    const form = document.getElementById('checkout-form');
    const accountAddressInput = document.getElementById('account-address');
    const newAddressForm = document.getElementById('new-address-form');
    
    accountAddressInput.value = currentUser.address || 'Mày chưa có địa chỉ!';

    form.elements['addressType'].forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'new') {
                newAddressForm.classList.remove('hidden');
            } else {
                newAddressForm.classList.add('hidden');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let shippingAddress;
        let shippingCustomerName;
        let shippingPhone;
        
        const addressType = form.elements['addressType'].value;
        if (addressType === 'new') {
            shippingCustomerName = form.elements['newName'].value;
            shippingPhone = form.elements['newPhone'].value;
            shippingAddress = form.elements['newAddress'].value;
            
            if (!shippingCustomerName || !shippingPhone || !shippingAddress) {
                alert("Bạn phải nhập đủ tên, số điện thoại và địa chỉ!");
                return;
            }
        } else {
            shippingCustomerName = currentUser.name;
            shippingPhone = currentUser.phone;
            shippingAddress = currentUser.address;
        }

        const paymentMethod = form.elements['payment'].value;

        const newOrder = {
            id: "DH" + Date.now(),
            customer: {
                id: currentUser.id,
                name: currentUser.name
            },
            items: myCart,
            total: cartTotal,
            date: new Date().toISOString().split('T')[0],
            status: "Đang xử lý",
            shippingInfo: {
                name: shippingCustomerName,
                phone: shippingPhone,
                address: shippingAddress
            },
            payment: paymentMethod
        };
        
        const allOrders = getOrders();
        allOrders.push(newOrder);
        saveOrders(allOrders);

        saveCart(currentUser.id, []);

        alert("Herta đã 'chốt' đơn! 'Xoay' sang trang xem 'sổ'...");
        window.location.href = 'user-order-history.html';
    });
}

// Initializes the page on document load.
document.addEventListener('DOMContentLoaded', () => {
    currentUser = getCurrentUser();
    if (!currentUser) {
        alert("Bạn phải đăng nhập!");
        window.location.href = 'user-dashboard.html';
        return;
    }

    myCart = getCart(currentUser.id);
    if (myCart.length === 0) {
        alert("Giỏ mày 'trống trơn', 'xoay' về mua 'búp bê' đi!");
        window.location.href = 'user-dashboard.html';
        return;
    }

    renderCheckoutSummary();
    handleCheckoutForm();
});
