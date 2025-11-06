// --- Imports ---
import {
    productTypes,
    getCustomers,
    getCart
} from '../virtualData-store.js';
import {
    getCurrentUser,
    isLoggedIn
} from './auth-guard.js';

// --- DOM Elements ---
const loginModal = document.getElementById('login-modal');

// --- Authentication Functions ---

// Opens the login modal.
function openLoginModal() {
    if (loginModal) {
        loginModal.classList.remove('hidden');
        loginModal.classList.add('visible');
    }
}

// Closes the login modal.
function closeLoginModal() {
    if (loginModal) {
        loginModal.classList.add('hidden');
        loginModal.classList.remove('visible');
    }
}

// Handles all authentication-related events.
function handleAuthEvents() {
    const loginBtn = document.getElementById('login-btn');
    const closeBtn = document.getElementById('login-close-btn');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('login-error-message');

    if (loginBtn) {
        loginBtn.addEventListener('click', openLoginModal);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLoginModal);
    }
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMessage.textContent = '';
            const emailOrPhone = loginForm.elements['emailOrPhone'].value;
            const password = loginForm.elements['password'].value;
            const allCustomers = getCustomers();
            const user = allCustomers.find(c =>
                (c.email === emailOrPhone || c.phone === emailOrPhone) &&
                c.password === password
            );
            if (user) {
                if (user.status === 'Đã khóa') {
                    errorMessage.textContent = 'Tài khoản này đã bị khóa!';
                    return;
                }
                alert(`Chào mừng trở lại, ${user.name}!`);
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                window.location.reload();
            } else {
                errorMessage.textContent = 'Sai Email/SĐT hoặc mật khẩu!';
            }
        });
    }
}

// --- UI Rendering Functions ---

// Renders product category links in the header.
function renderCategoryLinks() {
    const container = document.querySelector('.header .section');
    if (!container) {
        return;
    }
    container.innerHTML = productTypes.map(type => `
        <a href="user-product-list.html?typeId=${type.id}" class="section-button">
            ${type.name}
        </a>
    `).join('');
}

// Updates the cart item count display for the current user.
function updateCartCount(currentUser) {
    if (!currentUser) return;

    const cartCountEl = document.getElementById('cart-item-count');
    if (!cartCountEl) return;

    const myCart = getCart(currentUser.id);
    const totalItems = myCart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountEl.textContent = totalItems;

    if (totalItems > 0) {
        cartCountEl.classList.add('active');
    } else {
        cartCountEl.classList.remove('active');
    }
}

// Manages the UI state based on login status.
function handleUIState() {
    const currentUser = getCurrentUser();
    const panelFlex = document.querySelector('.panel-flex');
    if (!panelFlex) {
        return;
    }

    if (currentUser) {
        panelFlex.innerHTML = `
            <span class="welcome-user"><a href="user-profile.html" class="profile-link">${currentUser.name}</a></span>
            <a href="user-cart.html" id="cart-link" class="cart-button">
                Giỏ hàng 
                <span id="cart-item-count" class="cart-count">0</span>
            </a>
        `;
        updateCartCount(currentUser);
    } else {
        panelFlex.innerHTML = `
            <button id="login-btn" class="login-button">Đăng nhập</button>
            <a href="user-register.html" class="register-link-btn">Đăng kí</a>
        `;
        handleAuthEvents();
    }
}

// --- Component Initializers ---

// Initializes accordion menu functionality.
function initializeAccordionMenus() {
    const allTriggers = document.querySelectorAll('.menu-trigger');

    allTriggers.forEach(clickedTrigger => {
        clickedTrigger.addEventListener('click', () => {
            const clickedSubMenu = clickedTrigger.nextElementSibling;
            const isAlreadyActive = clickedTrigger.classList.contains('active');
            allTriggers.forEach(trigger => {
                trigger.classList.remove('active');
                const subMenu = trigger.nextElementSibling;
                if (subMenu && subMenu.classList.contains('sub-menu')) {
                    subMenu.classList.remove('active');
                }
            });
            if (!isAlreadyActive) {
                clickedTrigger.classList.add('active');
                if (clickedSubMenu) {
                    clickedSubMenu.classList.add('active');
                }
            }
        });
    });
}

// --- Main Execution ---

// Runs scripts after the DOM has fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryLinks();
    handleUIState();
    initializeAccordionMenus();
});
