document.addEventListener('DOMContentLoaded', () => {
    
    // Hard-coded admin credentials.
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'admin123';

    // Get DOM elements.
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // Add event listener if the form exists.
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // Prevent default form submission.
            e.preventDefault();
            // Clear any previous error messages.
            errorMessage.textContent = '';

            // Get input values.
            const username = loginForm.elements['username'].value;
            const password = loginForm.elements['password'].value;

            // Check credentials.
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                // On success, show an alert.
                alert("Đăng nhập thành công!");
                
                // Store admin session.
                sessionStorage.setItem('adminUser', username);
                
                // Redirect to the dashboard.
                window.location.href = 'dashboard.html';
            } else {
                // Display an error message on failure.
                errorMessage.textContent = 'Sai tên đăng nhập hoặc mật khẩu!';
            }
        });
    }
});
