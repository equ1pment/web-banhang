// Import data handling functions.
import { getCustomers, saveCustomers } from '../virtualData-store.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements.
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const loginLink = document.getElementById('login-link');
    
    // Handle login link click to redirect.
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'user-dashboard.html';
    });

    // Handle the registration form submission.
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMessage.textContent = ''; 

        // Get form input values.
        const name = registerForm.elements['name'].value;
        const email = registerForm.elements['email'].value;
        const phone = registerForm.elements['phone'].value;
        const address = registerForm.elements['address'].value;
        const password = registerForm.elements['password'].value;
        const confirmPassword = registerForm.elements['confirm-password'].value;

        // Validate passwords match.
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Mật khẩu xác nhận không khớp!';
            return;
        }

        // Check if email or phone already exists.
        const allCustomers = getCustomers();
        const existingCustomer = allCustomers.find(c => c.email === email || c.phone === phone);
        if (existingCustomer) {
            errorMessage.textContent = existingCustomer.email === email 
                ? 'Email này đã được sử dụng!' 
                : 'Số điện thoại này đã được sử dụng!';
            return;
        }

        // Create a new customer object.
        const newCustomer = {
            id: 'KH-' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            address: address,
            password: password,
            status: 'Hoạt động'
        };

        // Add new customer, save data, and redirect.
        allCustomers.push(newCustomer);
        saveCustomers(allCustomers);

        alert('Đăng kí thành công! Trang web sẽ đưa bạn về trang chủ để đăng nhập.');
        window.location.href = 'index.html';
    });
});
