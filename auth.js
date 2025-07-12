// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('authForm');

    // Check if user is already logged in
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize sample data
    initializeSampleData();

    // Form submission
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(authForm);
        const email = formData.get('email').trim();
        const password = formData.get('password');

        // Basic validation
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (!validatePassword(password)) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        handleLogin(email, password);
    });

    function handleLogin(email, password) {
        // Get users from localStorage
        const users = getFromLocalStorage('users') || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Login successful
            localStorage.setItem('currentUser', JSON.stringify(user));
            showNotification('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification('Invalid email or password', 'error');
        }
    }
});