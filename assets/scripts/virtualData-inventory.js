// Manages inventory data and renders the inventory page.

import { getProducts, getInventoryTransactions } from "./virtualData-store.js";

const LOW_STOCK_THRESHOLD = 5;

function calculateInventory(transactions) {
    const inventoryMap = new Map();
    transactions.forEach(transaction => {
        const { productId, type, quantity } = transaction;
        const currentData = inventoryMap.get(productId) || { imported: 0, exported: 0 };
        if (type === 'import') {
            currentData.imported += quantity;
        } else if (type === 'export') {
            currentData.exported += quantity;
        }
        inventoryMap.set(productId, currentData);
    });

    for (let [productId, data] of inventoryMap.entries()) {
        data.stock = data.imported - data.exported;
        inventoryMap.set(productId, data);
    }
    return inventoryMap;
}

function getFullProductInventoryData(transactions) {
    const productsMasterData = getProducts();
    const inventoryMap = calculateInventory(transactions);
    
    return productsMasterData.map(product => {
        const inventoryData = inventoryMap.get(product.id) || { imported: 0, exported: 0, stock: 0 };
        return {
            ...product,
            ...inventoryData
        };
    });
}

function renderInventoryTable(data) {
    const tableBody = document.getElementById('inventory-table-body');
    if (!tableBody) return;
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa có dữ liệu tồn kho. Hãy bắt đầu bằng việc nhập hàng!</td></tr>';
        return;
    }
    tableBody.innerHTML = data.map(item => `
        <tr class="${item.stock < LOW_STOCK_THRESHOLD ? 'low-stock' : ''}">
            <td class="tr-header">${item.id}</td>
            <td>${item.name}</td>
            <td>${item.imported}</td>
            <td>${item.exported}</td>
            <td><strong>${item.stock}</strong></td>
        </tr>
    `).join('');
}

function renderLowStockAlerts(data) {
    const alertContainer = document.getElementById('low-stock-alerts');
    if (!alertContainer) return;

    const lowStockItems = data.filter(item => item.stock < LOW_STOCK_THRESHOLD && item.stock >= 0);

    if (lowStockItems.length === 0) {
        alertContainer.innerHTML = '<h2>Sản phẩm sắp hết hàng (Tồn kho &lt; 5)</h2>';
        return;
    }
    
    alertContainer.innerHTML = '<h2>Sản phẩm sắp hết hàng (Tồn kho &lt; 5)</h2>' + lowStockItems.map(item => `
        <div class="alert-item">
            <strong>${item.name} (ID: ${item.id})</strong> - Chỉ còn lại: ${item.stock}! Mau nhập thêm đi!
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('product-search');
    const filterBtn = document.getElementById('filter-btn');
    const resetBtn = document.getElementById('reset-btn');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    let allTransactions = getInventoryTransactions();
    let allProductInventory = getFullProductInventoryData(allTransactions);
    
    renderInventoryTable(allProductInventory);
    renderLowStockAlerts(allProductInventory);

    const performFilterAndSearch = () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const searchTerm = searchInput.value.toLowerCase().trim();

        let transactionsToProcess = allTransactions;

        if (startDate && endDate) {
            transactionsToProcess = allTransactions.filter(t => t.date >= startDate && t.date <= endDate);
        }
        
        let inventoryData = getFullProductInventoryData(transactionsToProcess);

        if (searchTerm) {
            inventoryData = inventoryData.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.id.toLowerCase().includes(searchTerm)
            );
        }
        
        renderInventoryTable(inventoryData);
        if (!startDate && !endDate) {
            renderLowStockAlerts(inventoryData);
        } else {
             const alertContainer = document.getElementById('low-stock-alerts');
             alertContainer.innerHTML = '<h2>Sản phẩm sắp hết hàng (Tồn kho &lt; 5)</h2><p>Cảnh báo bị vô hiệu hóa khi đang lọc theo ngày.</p>';
        }
    };

    searchInput.addEventListener('input', performFilterAndSearch);
    filterBtn.addEventListener('click', performFilterAndSearch);

    resetBtn.addEventListener('click', () => {
        startDateInput.value = '';
        endDateInput.value = '';
        searchInput.value = '';
        
        allProductInventory = getFullProductInventoryData(allTransactions);
        renderInventoryTable(allProductInventory);
        renderLowStockAlerts(allProductInventory);
    });
});
