// Customer management script.

import { getCustomers, saveCustomers } from "./virtualData-store.js";

let currentCustomers = getCustomers();

function renderTable(dataToRender) {
    const tableBody = document.getElementById('customer-table-body');
    if (!tableBody) return;

    const rowsHtml = dataToRender.map(customer => {
        const isLocked = customer.status === 'Đã khóa';
        return `
        <tr>
            <td class="tr-header">${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.status}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="btn reset-btn" data-id="${customer.id}">Reset Mật khẩu</a>
                    <a href="#" class="btn lock-btn" data-id="${customer.id}">
                        ${isLocked ? 'Mở khóa' : 'Khóa'}
                    </a>
                </div>
            </td>
        </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rowsHtml;
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tableBody = document.getElementById('customer-table-body');
    const lockModal = document.getElementById('lock-modal');
    const resetModal = document.getElementById('reset-modal');
    const searchBox = document.querySelector('.search-box');

    // State
    let currentCustomerId = null; 

    // Helper Functions
    const openModal = (modal) => modal.classList.remove('hidden');
    const closeModal = (modal) => modal.classList.add('hidden');

    // Initial Render
    renderTable(currentCustomers);

    // Event Listeners
    tableBody.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;

        if (target.classList.contains('lock-btn')) {
            currentCustomerId = target.dataset.id;
            const customer = currentCustomers.find(c => c.id === currentCustomerId);
            const isLocked = customer.status === 'Đã khóa';

            document.getElementById('lock-modal-title').innerText = isLocked ? 'Xác nhận Mở khóa' : 'Xác nhận Khóa';
            document.getElementById('lock-modal-text').innerText = `Bạn có chắc muốn ${isLocked ? 'mở khóa' : 'khóa'} tài khoản của "${customer.name}" không?`;

            openModal(lockModal);
        }

        if (target.classList.contains('reset-btn')) {
            currentCustomerId = target.dataset.id;
            const customer = currentCustomers.find(c => c.id === currentCustomerId);
            
            resetModal.querySelector('p').innerText = `Bạn có chắc chắn muốn đặt lại mật khẩu cho khách hàng "${customer.name}" không?`;
            
            openModal(resetModal);
        }
    });

    document.getElementById('confirm-lock-btn').addEventListener('click', () => {
        const customerIndex = currentCustomers.findIndex(c => c.id === currentCustomerId);
        
        if (customerIndex > -1) {
            const currentStatus = currentCustomers[customerIndex].status;
            currentCustomers[customerIndex].status = (currentStatus === 'Hoạt động') ? 'Đã khóa' : 'Hoạt động';
            
            saveCustomers(currentCustomers);
            renderTable(currentCustomers);
        }
        closeModal(lockModal);
    });

    document.getElementById('confirm-reset-btn').addEventListener('click', () => {
        const customer = currentCustomers.find(c => c.id === currentCustomerId);
        if (customer) {
            alert(`Đã gửi yêu cầu reset mật khẩu thành công cho khách hàng: ${customer.name}. (Hì hì, Herta đùa đó!)`);
        }
        closeModal(resetModal);
    });

    document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            renderTable(currentCustomers);
            return;
        }

        const filteredData = currentCustomers.filter(customer => {
            return Object.values(customer).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );
        });
        renderTable(filteredData);
    });
});