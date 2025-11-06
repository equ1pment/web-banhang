// Virtual data management for orders.

import {
    getOrders,
    saveOrders,
    getInventoryTransactions,
    saveInventoryTransactions,
    getProducts,
    getCustomers,
    getProductImports,
    getProfitSettings
} from "./virtualData-store.js";

let allOrders = getOrders();
let allTransactions = getInventoryTransactions();
let allProducts = getProducts();
let allCustomers = getCustomers();
let sellingPrices = new Map();
let newOrderItems = [];
let newOrderTotal = 0;

const openModal = (modal) => modal.classList.remove('hidden');
const closeModal = (modal) => modal.classList.add('hidden');

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
    const costPrices = calculateAverageCostPrice();
    const profitSettings = getProfitSettings();
    const priceMap = new Map();
    allProducts.forEach(product => {
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
        priceMap.set(product.id, sellingPrice);
    });
    return priceMap;
}

function calculateAllProductStock() {
    const stockMap = new Map();
    const transactions = getInventoryTransactions();
    transactions.forEach(transaction => {
        const { productId, type, quantity } = transaction;
        const currentStock = stockMap.get(productId) || 0;
        if (type === 'import') {
            stockMap.set(productId, currentStock + quantity);
        } else if (type === 'export') {
            stockMap.set(productId, currentStock - quantity);
        }
    });
    return stockMap;
}

function renderOrdersTable(ordersToRender) {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    if (ordersToRender.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Chưa có đơn hàng nào. Hãy tạo một đơn mới!</td></tr>`;
        return;
    }

    tableBody.innerHTML = ordersToRender.map(order => {
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        return `
        <tr>
            <td class="tr-header">${order.id}</td>
            <td>${order.customer.name}</td>
            <td>${order.date}</td>
            <td>${order.total.toLocaleString('vi-VN')} VNĐ</td>
            <td><strong>${totalQuantity}</strong></td> 
            <td class="status-${order.status.replace(' ', '-')}">${order.status}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="btn approve-btn" data-id="${order.id}" ${order.status !== 'Đang xử lý' ? 'disabled' : ''}>Duyệt</a>
                    <a href="#" class="btn cancel-btn" data-id="${order.id}" ${order.status === 'Đã hủy' ? 'disabled' : ''}>Hủy</a>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

function updateTempOrderList() {
    const itemList = document.getElementById('order-items-list');
    const totalLabel = document.getElementById('order-total');

    if (newOrderItems.length === 0) {
        itemList.innerHTML = '<li>Chưa có sản phẩm nào</li>';
    } else {
        itemList.innerHTML = newOrderItems.map((item, index) => `
            <li>
                ${item.name} (SL: ${item.quantity}) - ${item.subtotal.toLocaleString('vi-VN')} VNĐ
                <button type="button" class="remove-item-btn" data-index="${index}">&times;</button>
            </li>
        `).join('');
    }

    newOrderTotal = newOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
    totalLabel.innerText = `Tổng tiền: ${newOrderTotal.toLocaleString('vi-VN')} VNĐ`;
}

function populateAddModal() {
    const customerSelect = document.getElementById('order-customer');
    const productSelect = document.getElementById('order-product');
    sellingPrices = calculateAllSellingPrices();

    customerSelect.innerHTML = allCustomers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    productSelect.innerHTML = allProducts.map(p => {
        const price = sellingPrices.get(p.id) || 0;
        return `<option value="${p.id}" data-price="${price}" data-name="${p.name}">
                    ${p.name} (Giá: ${price.toLocaleString('vi-VN')} VNĐ)
                </option>`;
    }).join('');

    newOrderItems = [];
    newOrderTotal = 0;
    updateTempOrderList();
}

document.addEventListener('DOMContentLoaded', () => {
    const addModal = document.getElementById('add-order-modal');
    const approveModal = document.getElementById('approve-modal');
    const cancelModal = document.getElementById('cancel-modal');
    const addOrderBtn = document.getElementById('add-order-btn');
    const addOrderForm = document.getElementById('add-order-form');
    const addItemBtn = document.getElementById('add-item-btn');
    const tempItemList = document.getElementById('order-items-list');
    const tableBody = document.getElementById('orders-table-body');
    const confirmApproveBtn = document.getElementById('confirm-approve-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    
    let orderIdToAction = null;

    renderOrdersTable(allOrders);

    addOrderBtn.addEventListener('click', () => {
        populateAddModal();
        openModal(addModal);
    });

    addItemBtn.addEventListener('click', () => {
        const productSelect = document.getElementById('order-product');
        const quantityInput = document.getElementById('order-quantity');
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productId = selectedOption.value;
        const productName = selectedOption.dataset.name;
        const productPrice = parseFloat(selectedOption.dataset.price);
        const quantity = parseInt(quantityInput.value);

        if (!quantity || quantity < 1) {
            alert("Số lượng phải lớn hơn 0");
            return;
        }

        const stockMap = calculateAllProductStock();
        const currentStock = stockMap.get(productId) || 0;
        const inCartQuantity = newOrderItems.filter(i => i.id === productId).reduce((sum, i) => sum + i.quantity, 0);

        if(quantity > (currentStock - inCartQuantity)) {
            alert(`Không đủ hàng! Tồn kho hiện tại: ${currentStock} (Đã thêm ${inCartQuantity} vào giỏ)`);
            return;
        }

        newOrderItems.push({
            id: productId,
            name: productName,
            quantity: quantity,
            price: productPrice,
            subtotal: productPrice * quantity
        });
        updateTempOrderList();
    });

    tempItemList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            const index = parseInt(e.target.dataset.index);
            newOrderItems.splice(index, 1);
            updateTempOrderList();
        }
    });

    addOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const customerSelect = document.getElementById('order-customer');
        const selectedCustomerOption = customerSelect.options[customerSelect.selectedIndex];
        
        if (newOrderItems.length === 0) {
            alert("Đơn hàng phải có ít nhất 1 sản phẩm!");
            return;
        }

        const newOrder = {
            id: "DH" + Date.now(),
            customer: {
                id: selectedCustomerOption.value,
                name: selectedCustomerOption.text
            },
            items: newOrderItems,
            total: newOrderTotal,
            date: new Date().toISOString().split('T')[0],
            status: "Đang xử lý"
        };

        allOrders.push(newOrder);
        saveOrders(allOrders);
        renderOrdersTable(allOrders);
        closeModal(addModal);
    });

    tableBody.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;
        
        if (target.classList.contains('approve-btn') && !target.hasAttribute('disabled')) {
            orderIdToAction = target.dataset.id;
            openModal(approveModal);
        }
        
        if (target.classList.contains('cancel-btn') && !target.hasAttribute('disabled')) {
            orderIdToAction = target.dataset.id;
            openModal(cancelModal);
        }
    });

    confirmApproveBtn.addEventListener('click', () => {
        const orderIndex = allOrders.findIndex(o => o.id === orderIdToAction);
        if (orderIndex === -1) return;
        
        const order = allOrders[orderIndex];
        if (order.status !== 'Đang xử lý') return;

        const exportTransactions = order.items.map(item => ({
            transactionId: "T-EXP-" + Date.now() + item.id,
            orderId: order.id,
            productId: item.id,
            type: 'export',
            quantity: item.quantity,
            date: new Date().toISOString().split('T')[0]
        }));

        allTransactions.push(...exportTransactions);
        order.status = "Đã duyệt";
        
        saveInventoryTransactions(allTransactions);
        saveOrders(allOrders);
        
        renderOrdersTable(allOrders);
        closeModal(approveModal);
    });

    confirmCancelBtn.addEventListener('click', () => {
        const orderIndex = allOrders.findIndex(o => o.id === orderIdToAction);
        if (orderIndex === -1) return;
        
        const order = allOrders[orderIndex];
        const originalStatus = order.status;
        
        if (originalStatus === "Đã hủy") return;

        if (originalStatus === "Đã duyệt") {
            const importTransactions = order.items.map(item => ({
                transactionId: "T-RET-" + Date.now() + item.id,
                orderId: order.id,
                productId: item.id,
                type: 'import',
                quantity: item.quantity,
                date: new Date().toISOString().split('T')[0],
                note: 'Hủy đơn hàng đã duyệt'
            }));
            
            allTransactions.push(...importTransactions);
            saveInventoryTransactions(allTransactions);
        }

        order.status = "Đã hủy";
        saveOrders(allOrders);
        
        renderOrdersTable(allOrders);
        closeModal(cancelModal);
    });

    document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal(e.target);
    });
});
