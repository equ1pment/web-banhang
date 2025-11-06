// Import dependencies.
import { getCurrentUser } from './auth-guard.js';
import { getOrders } from '../virtualData-store.js';

// Execute when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Check if a user is logged in.
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert("Bạn phải đăng nhập!");
        window.location.href = 'user-dashboard.html';
        return;
    }

    // Get the container element and all orders.
    const container = document.getElementById('order-history-list');
    const allOrders = getOrders();

    // Filter orders for the current user and sort by most recent.
    const myOrders = allOrders
        .filter(order => order.customer.id === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display a message if the user has no orders.
    if (myOrders.length === 0) {
        container.innerHTML = "<p>Bạn chưa đặt đơn hàng nào.</p>";
        return;
    }

    // Generate and display the HTML for each order.
    container.innerHTML = myOrders.map(order => {
        // Provide default shipping info if it's missing.
        const shipping = order.shippingInfo || { address: 'Không rõ' };
        
        return `
        <div class="order-history-item">
            <div class="order-header">
                <div>
                    <h4>Đơn hàng: ${order.id}</h4>
                    <p>Ngày giao: ${order.date}</p>
                </div>
                <div>
                    <p>Tổng: <strong>${order.total.toLocaleString('vi-VN')} VNĐ</strong></p>
                    <p>Trạng thái: <span class="status-${order.status.replace(/ /g, '-')}">${order.status}</span></p>
                </div>
            </div>
            <div class="order-body">
                <p><strong>Giao đến:</strong> ${shipping.address} (${shipping.name || currentUser.name})</p>
                <p><strong>Chi tiết đơn hàng:</strong></p>
                <ul>
                    ${order.items.map(item => `
                        <li>${item.name} (x${item.quantity}) - ${item.price.toLocaleString('vi-VN')} VNĐ</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `}).join('');
});