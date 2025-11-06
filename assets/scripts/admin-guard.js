// Admin guard script.
(function() {
    // Get admin user from session storage.
    const adminUser = sessionStorage.getItem('adminUser');
    
    // If no admin user is logged in.
    if (!adminUser) {
        // Show an alert message.
        alert("Bạn phải đăng nhập Admin để 'xoay' trang này!");
        
        // Redirect to the login page.
        window.location.replace('admin-login.html');
    }
})();
