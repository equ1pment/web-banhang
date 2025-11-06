// Import necessary functions
import { getCurrentUser } from './auth-guard.js';
import { getCustomers, saveCustomers } from '../virtualData-store.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Authenticate user and redirect if not logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert("Bạn phải đăng nhập để 'xoay' trang này!");
        window.location.href = 'user-dashboard.html';
        return;
    }

    // 2. Get DOM elements
    const profileForm = document.getElementById('profile-form');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.querySelector('.logout-btn');

    // 3. Populate form with current user data
    profileForm.elements['email'].value = currentUser.email;
    profileForm.elements['name'].value = currentUser.name;
    profileForm.elements['phone'].value = currentUser.phone;

    // 4. Handle profile update form submission
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (e.submitter === logoutBtn) {
            return; 
        }

        errorMessage.textContent = '';
        const newName = profileForm.elements['name'].value;
        const newPhone = profileForm.elements['phone'].value;
        const newPassword = profileForm.elements['password'].value;
        const confirmPassword = profileForm.elements['confirm-password'].value;

        const allCustomers = getCustomers();
        const userIndex = allCustomers.findIndex(c => c.id === currentUser.id);

        if (userIndex === -1) {
            errorMessage.textContent = "Lỗi: Không tìm thấy 'búp bê' của mày!";
            return;
        }

        if (newPhone !== currentUser.phone) {
            const phoneExists = allCustomers.find(c => c.phone === newPhone);
            if (phoneExists) {
                errorMessage.textContent = "Số điện thoại này đã bị 'búp bê' khác 'chiếm'!";
                return;
            }
        }

        if (newPassword) { 
            if (newPassword !== confirmPassword) {
                errorMessage.textContent = "Mật khẩu mới không khớp!";
                return;
            }
            allCustomers[userIndex].password = newPassword;
        }

        allCustomers[userIndex].name = newName;
        allCustomers[userIndex].phone = newPhone;

        saveCustomers(allCustomers);
        sessionStorage.setItem('currentUser', JSON.stringify(allCustomers[userIndex]));

        alert("Cập nhật 'búp bê' thành công!");
        window.location.reload(); 
    });

    // 5. Handle logout button click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            sessionStorage.removeItem('currentUser');
            alert('Bạn đã đăng xuất!');
            window.location.href = 'index.html';
        });
    }
});
