// Handles product import data, rendering, and user interactions.

import {
    getProducts,
    saveProducts,
    getProductImports,
    saveProductImports,
    getInventoryTransactions,
    saveInventoryTransactions,
    productTypes
} from "./virtualData-store.js";

// --- Global State ---
let allProducts = getProducts();
let allImports = getProductImports();
let allTransactions = getInventoryTransactions();

// --- UI Functions ---
function renderTable(dataToRender) {
    const tableBody = document.getElementById('import-table-body');
    if (!tableBody) return;

    if (dataToRender.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Kho rỗng! Hãy bắt đầu bằng cách nhấn nút "Thêm" để tạo phiếu nhập hàng mới.</td></tr>`;
        return;
    }

    tableBody.innerHTML = dataToRender.map(item => `
        <tr>
            <td><input type="radio" name="select-item" value="${item.id}"></td>
            <td class="tr-header">${item.id}</td>
            <td>${item.type}</td>
            <td>${item.brand}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.importprice.toLocaleString('vi-VN')} VNĐ</td>
            <td>${item.importdate}</td>
        </tr>
    `).join('');
}

const openModal = (modal) => modal.classList.remove('hidden');
const closeModal = (modal) => modal.classList.add('hidden');

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const addModal = document.getElementById('add-modal');
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    const addBtn = document.getElementById('add-btn');
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const closeBtns = document.querySelectorAll('.close-btn, .cancel-btn');
    const addForm = document.getElementById('add-form');
    const editForm = document.getElementById('edit-form');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const searchBox = document.querySelector('.search-box');

    // --- Initial Render ---
    renderTable(allImports);

    // --- Event Listeners ---
    addBtn.addEventListener('click', () => {
        addForm.reset();
        openModal(addModal);
    });

    editBtn.addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="select-item"]:checked');
        if (!selectedRadio) {
            alert("Bạn phải 'chọn' một phiếu nhập để Herta sửa chứ!");
            return;
        }
        const itemToEdit = allImports.find(item => item.id === selectedRadio.value);

        for (const key in itemToEdit) {
            if (editForm.elements[key]) {
                editForm.elements[key].value = itemToEdit[key];
            }
        }

        const product = allProducts.find(p => p.id === itemToEdit.productId);
        if (product) {
            editForm.elements['image'].value = product.imageUrl || '';
            editForm.elements['description'].value = product.description || '';
        } else if (itemToEdit.imageUrl) {
            editForm.elements['image'].value = itemToEdit.imageUrl;
        } else {
            editForm.elements['image'].value = '';
        }

        openModal(editModal);
    });

    deleteBtn.addEventListener('click', () => {
        if (!document.querySelector('input[name="select-item"]:checked')) {
            alert("Bạn chưa 'chọn' phiếu nào để Herta 'tiễn' cả!");
            return;
        }
        openModal(deleteModal);
    });

    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newImportId = "PN" + Date.now();
        const productName = addForm.elements['name'].value;
        const productBrand = addForm.elements['brand'].value;
        const productTypeName = addForm.elements['type'].value;
        const productImageUrl = addForm.elements['image'].value;
        const productDescription = addForm.elements['description'].value;
        const quantity = parseInt(addForm.elements['quantity'].value);
        const importDate = addForm.elements['importdate'].value;

        let product = allProducts.find(p => p.name.toLowerCase() === productName.toLowerCase());
        if (!product) {
            const newProductId = "SP" + (allProducts.length + 1).toString().padStart(3, '0');
            const productType = productTypes.find(pt => pt.name === productTypeName);
            product = {
                id: newProductId,
                typeId: productType ? productType.id : 'LSP_UNKNOWN',
                name: productName,
                brand: productBrand,
                price: 0,
                status: 'Hoạt động',
                imageUrl: productImageUrl,
                description: productDescription
            };
            allProducts.push(product);
            saveProducts(allProducts);
        }

        const newImportItem = {
            id: newImportId,
            productId: product.id,
            type: productTypeName,
            brand: productBrand,
            name: productName,
            quantity: quantity,
            importprice: parseInt(addForm.elements['importprice'].value),
            importdate: importDate,
            imageUrl: productImageUrl
        };
        allImports.push(newImportItem);

        const newTransaction = {
            transactionId: "T" + Date.now(),
            importId: newImportId,
            productId: product.id,
            type: 'import',
            quantity: quantity,
            date: importDate
        };
        allTransactions.push(newTransaction);

        saveProductImports(allImports);
        saveInventoryTransactions(allTransactions);

        alert(`Đã thêm thành công phiếu nhập cho sản phẩm "${productName}"!`);
        renderTable(allImports);
        closeModal(addModal);
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const itemId = editForm.elements['id'].value;
        const itemIndex = allImports.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            const updatedImageUrl = editForm.elements['image'].value;
            const updatedDescription = editForm.elements['description'].value;

            allImports[itemIndex] = {
                ...allImports[itemIndex],
                type: editForm.elements['type'].value,
                brand: editForm.elements['brand'].value,
                name: editForm.elements['name'].value,
                quantity: parseInt(editForm.elements['quantity'].value),
                importprice: parseInt(editForm.elements['importprice'].value),
                importdate: editForm.elements['importdate'].value,
                imageUrl: updatedImageUrl
            };

            const productId = allImports[itemIndex].productId;
            const productIndex = allProducts.findIndex(p => p.id === productId);
            if (productIndex > -1) {
                allProducts[productIndex].name = editForm.elements['name'].value;
                allProducts[productIndex].brand = editForm.elements['brand'].value;
                allProducts[productIndex].imageUrl = updatedImageUrl;
                allProducts[productIndex].description = updatedDescription;
                saveProducts(allProducts);
            }

            saveProductImports(allImports);
            renderTable(allImports);
            closeModal(editModal);
        }
    });

    confirmDeleteBtn.addEventListener('click', () => {
        const selectedId = document.querySelector('input[name="select-item"]:checked').value;
        allImports = allImports.filter(item => item.id !== selectedId);
        saveProductImports(allImports);
        renderTable(allImports);
        closeModal(deleteModal);
    });

    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const filteredData = allImports.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            )
        );
        renderTable(filteredData);
    });

    closeBtns.forEach(btn => btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal'))));

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
});
