// Manages pricing calculations and UI updates.

import { productTypes, getProducts, getProductImports, getProfitSettings, saveProfitSettings } from "./virtualData-store.js";

let costPrices, profitSettings, productsMasterData;

function calculateAverageCostPrice() {
    const importData = getProductImports();
    const costMap = new Map();
    const importsByProduct = {};

    importData.forEach(item => {
        const productId = item.productId;
        if (!importsByProduct[productId]) {
            importsByProduct[productId] = [];
        }
        importsByProduct[productId].push(item.importprice);
    });

    for (const productId in importsByProduct) {
        const prices = importsByProduct[productId];
        const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        costMap.set(productId, average);
    }
    return costMap;
}

function initializeData() {
    costPrices = calculateAverageCostPrice();
    profitSettings = getProfitSettings();
    productsMasterData = getProducts();
}

function renderProfitSettingsTable() {
    const tableBody = document.getElementById('profit-settings-table-body');
    if (!tableBody) return;

    let html = '';
    productTypes.forEach(type => {
        const currentProfit = profitSettings[type.id] || 0;
        html += `
            <tr class="type-row" data-name="${type.name.toLowerCase()}">
                <td class="tr-header"><strong>Loại Sản Phẩm</strong></td>
                <td><strong>${type.name}</strong></td>
                <td><input type="number" class="profit-input" data-id="${type.id}" value="${currentProfit}" min="0"> %</td>
                <td><button class="btn save-btn" data-id="${type.id}">Lưu</button></td>
            </tr>
        `;
    });

    productsMasterData.forEach(product => {
        const currentProfit = profitSettings[product.id] || '';
        html += `
            <tr class="product-row" data-name="${product.name.toLowerCase()}" data-id="${product.id.toLowerCase()}">
                <td class="tr-header">Sản phẩm</td>
                <td>${product.name}</td>
                <td><input type="number" class="profit-input" data-id="${product.id}" value="${currentProfit}" placeholder="Mặc định theo loại" min="0"> %</td>
                <td><button class="btn save-btn" data-id="${product.id}">Lưu</button></td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

function renderPriceLookupTable(products = productsMasterData) {
    const tableBody = document.getElementById('price-lookup-table-body');
    if (!tableBody) return;

    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Chưa có sản phẩm nào. Hãy nhập hàng trước!</td></tr>`;
        return;
    }

    tableBody.innerHTML = products.map(product => {
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

        return `
            <tr>
                <td class="tr-header">${product.id}</td>
                <td>${product.name}</td>
                <td>${cost.toLocaleString('vi-VN')} VNĐ</td>
                <td>${finalProfit} %</td>
                <td><strong>${sellingPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</strong></td>
            </tr>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    renderProfitSettingsTable();
    renderPriceLookupTable();

    const settingsTableBody = document.getElementById('profit-settings-table-body');
    const searchBox = document.getElementById('product-search');

    settingsTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-btn')) {
            const id = e.target.dataset.id;
            const input = document.querySelector(`.profit-input[data-id="${id}"]`);
            const value = input.value;

            if (value === '') {
                delete profitSettings[id];
            } else {
                const profit = parseFloat(value);
                if (!isNaN(profit) && profit >= 0) {
                    profitSettings[id] = profit;
                } else {
                    alert("Tỉ lệ lợi nhuận phải là một con số không âm!");
                    return;
                }
            }
            
            saveProfitSettings(profitSettings);
            alert(`Đã cập nhật tỉ lệ lợi nhuận cho ID: ${id}`);
            
            initializeData();
            renderPriceLookupTable();
        }
    });

    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        const filteredProducts = productsMasterData.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.id.toLowerCase().includes(searchTerm)
        );
        renderPriceLookupTable(filteredProducts);

        const allSettingRows = settingsTableBody.querySelectorAll('tr');
        allSettingRows.forEach(row => {
            const name = row.dataset.name || '';
            const id = row.dataset.id || '';
            if (name.includes(searchTerm) || id.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});
