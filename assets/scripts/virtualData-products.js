// Product management script.

import {
    productTypes,
    getProducts,
    saveProducts,
    getInventoryTransactions,
    getProductImports,
    getProfitSettings
} from "./virtualData-store.js";

let masterProductList = getProducts();

// --- Data Calculation Functions ---

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

function calculateAllProductStock() {
    const stockMap = new Map();
    const inventoryTransactions = getInventoryTransactions();
    inventoryTransactions.forEach(transaction => {
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

function getProductsWithDetails() {
    masterProductList = getProducts();
    const stockMap = calculateAllProductStock();
    const sellingPriceMap = calculateAllSellingPrices();

    return masterProductList.map(product => {
        const stock = stockMap.get(product.id) || 0;
        const sellingPrice = sellingPriceMap.get(product.id) || 0;
        const status = product.status || 'Hoạt động';
        const imageUrl = product.imageUrl || '';
        const isFeatured = product.isFeatured || false;
        const description = product.description || '';
        return { ...product, stock, sellingPrice, status, imageUrl, isFeatured, description };
    });
}

// --- DOM Rendering Function ---

function renderProductTable(products) {
    const tableBody = document.getElementById('product-table-body');
    if (!tableBody) return;
    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Herta không tìm thấy "búp bê" nào...</td></tr>';
        return;
    }
    const rowsHtml = products.map(product => {
        const isHidden = product.status === 'Đã ẩn';
        const imageUrl = product.imageUrl ? product.imageUrl : "https://via.placeholder.com/50";
        const isFeatured = product.isFeatured || false;
        return `
        <tr>
            <td><img src="${imageUrl}" alt="${product.name}" class="product-table-image"></td>
            <td class="tr-header">${product.id}</td>
            <td>${product.name}</td>
            <td>${product.brand}</td>
            <td>${product.sellingPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</td>
            <td>${product.stock}</td>
            <td>${product.status}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="btn edit-product-btn" data-id="${product.id}">Sửa</a>
                    <a href="#" class="btn toggle-hide-btn" data-id="${product.id}">
                        ${isHidden ? 'Hiện' : 'Ẩn'}
                    </a>
                    <a href="#" class="btn toggle-feature-btn ${isFeatured ? 'featured' : ''}" data-id="${product.id}">
                        ${isFeatured ? 'Bỏ NB' : 'Nổi bật'}
                    </a>
                </div>
            </td>
        </tr>
    `}).join('');
    tableBody.innerHTML = rowsHtml;
}

// --- Modal Helper Functions ---

const openModal = (modal) => modal.classList.remove('hidden');
const closeModal = (modal) => modal.classList.add('hidden');

// --- Main Execution and Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.querySelector('.search-box');
    const tableBody = document.getElementById('product-table-body');
    const editModal = document.getElementById('edit-product-modal');
    const editForm = document.getElementById('edit-product-form');
    const categoryTitleElement = document.getElementById('category-title');
    
    if (!tableBody) return;

    let allProductsWithDetails = getProductsWithDetails();
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('typeId');
    const category = productTypes.find(type => type.id === categoryId);

    if (category && categoryTitleElement) {
        categoryTitleElement.textContent = `Danh sách sản phẩm: ${category.name}`;
    } else if (categoryTitleElement) {
        categoryTitleElement.textContent = 'Tất cả sản phẩm';
    }

    let baseProducts = categoryId ? allProductsWithDetails.filter(product => product.typeId === categoryId) : allProductsWithDetails;
    renderProductTable(baseProducts);

    function rerenderProductTable() {
        allProductsWithDetails = getProductsWithDetails();
        baseProducts = categoryId ? allProductsWithDetails.filter(p => p.typeId === categoryId) : allProductsWithDetails;

        const searchTerm = searchBox.value.toLowerCase().trim();
        let finalProductsToRender = baseProducts;
        if (searchTerm) {
            finalProductsToRender = baseProducts.filter(product => {
                return Object.values(product).some(value =>
                    String(value).toLowerCase().includes(searchTerm)
                );
            });
        }
        renderProductTable(finalProductsToRender);
    }

    searchBox.addEventListener('input', rerenderProductTable);

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('toggle-hide-btn')) {
            e.preventDefault();
            const productId = e.target.dataset.id;
            const productIndex = masterProductList.findIndex(p => p.id === productId);
            if (productIndex === -1) return;
            const currentStatus = masterProductList[productIndex].status || 'Hoạt động';
            masterProductList[productIndex].status = (currentStatus === 'Hoạt động') ? 'Đã ẩn' : 'Hoạt động';
            saveProducts(masterProductList);
            rerenderProductTable();
        }

        if (e.target.classList.contains('edit-product-btn')) {
            e.preventDefault();
            const productId = e.target.dataset.id;
            const productToEdit = allProductsWithDetails.find(p => p.id === productId);
            if (!productToEdit) return;
            editForm.elements['id'].value = productToEdit.id;
            editForm.elements['name'].value = productToEdit.name;
            editForm.elements['brand'].value = productToEdit.brand;
            editForm.elements['imageUrl'].value = productToEdit.imageUrl || '';
            editForm.elements['description'].value = productToEdit.description || '';
            openModal(editModal);
        }

        if (e.target.classList.contains('toggle-feature-btn')) {
            e.preventDefault();
            const productId = e.target.dataset.id;
            const productIndex = masterProductList.findIndex(p => p.id === productId);
            if (productIndex === -1) return;
            const currentFeatureStatus = masterProductList[productIndex].isFeatured || false;
            masterProductList[productIndex].isFeatured = !currentFeatureStatus;
            saveProducts(masterProductList);
            rerenderProductTable();
        }
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = editForm.elements['id'].value;
        const name = editForm.elements['name'].value;
        const brand = editForm.elements['brand'].value;
        const imageUrl = editForm.elements['imageUrl'].value;
        const description = editForm.elements['description'].value;
        const productIndex = masterProductList.findIndex(p => p.id === id);
        if (productIndex > -1) {
            masterProductList[productIndex].name = name;
            masterProductList[productIndex].brand = brand;
            masterProductList[productIndex].imageUrl = imageUrl;
            masterProductList[productIndex].description = description;
        }
        saveProducts(masterProductList);
        closeModal(editModal);
        rerenderProductTable();
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
});
