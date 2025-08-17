/* ========= Admin Login Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, validate } = window.Utils;

    // DOM elements
    const loginForm = qs('#loginForm');
    const usernameInput = qs('#username');
    const passwordInput = qs('#password');
    const submitBtn = qs('#submitBtn');
    const errorMessage = qs('#errorMessage');
    const successMessage = qs('#successMessage');

    // Initialize
    setupEventListeners();
    setupFormValidation();

    // Setup event listeners
    function setupEventListeners() {
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Enter key submission
        [usernameInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLogin(e);
                    }
                });
            }
        });

        // Clear error messages on input
        [usernameInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('input', clearMessages);
            }
        });

        // Focus username on load
        if (usernameInput) {
            usernameInput.focus();
        }
    }

    // Setup form validation
    function setupFormValidation() {
        [usernameInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('blur', validateField);
                input.addEventListener('input', () => {
                    // Remove error styling on input
                    input.classList.remove('error');
                });
            }
        });
    }

    // Validate individual field
    function validateField(event) {
        const field = event.target;
        const value = field.value.trim();

        if (!value) {
            field.classList.add('error');
            return false;
        }

        field.classList.remove('error');
        return true;
    }

    // Handle login form submission
    async function handleLogin(event) {
        event.preventDefault();

        const username = usernameInput?.value.trim() || '';
        const password = passwordInput?.value.trim() || '';

        // Clear previous messages
        clearMessages();

        // Validate inputs
        if (!validateInputs(username, password)) {
            return;
        }

        try {
            showLoading();
            
            // Create form data
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            // Attempt login
            const response = await fetch('/admin/login', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                redirect: 'manual'
            });

            if (response.ok || response.type === 'opaqueredirect') {
                // Login successful
                showSuccessMessage('Login successful! Redirecting...');
                
                // Short delay for user feedback, then redirect
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1500);
            } else {
                // Login failed
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            showErrorMessage('Invalid username or password. Please try again.');
            
            // Focus back to username for retry
            if (usernameInput) {
                usernameInput.focus();
                usernameInput.select();
            }
        } finally {
            hideLoading();
        }
    }

    // Validate form inputs
    function validateInputs(username, password) {
        let isValid = true;

        if (!username) {
            showErrorMessage('Please enter your username.');
            if (usernameInput) {
                usernameInput.classList.add('error');
                usernameInput.focus();
            }
            isValid = false;
        }

        if (!password) {
            showErrorMessage('Please enter your password.');
            if (passwordInput) {
                passwordInput.classList.add('error');
                if (isValid) passwordInput.focus(); // Only focus if username is valid
            }
            isValid = false;
        }

        if (username && username.length < 3) {
            showErrorMessage('Username must be at least 3 characters long.');
            if (usernameInput) {
                usernameInput.classList.add('error');
                usernameInput.focus();
            }
            isValid = false;
        }

        if (password && password.length < 6) {
            showErrorMessage('Password must be at least 6 characters long.');
            if (passwordInput) {
                passwordInput.classList.add('error');
                passwordInput.focus();
            }
            isValid = false;
        }

        return isValid;
    }

    // Show loading state
    function showLoading() {
        if (submitBtn) {
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
        }
    }

    // Hide loading state
    function hideLoading() {
        if (submitBtn) {
            submitBtn.textContent = 'Login';
            submitBtn.disabled = false;
        }
    }

    // Show error message
    function showErrorMessage(message) {
        clearMessages();
        
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        } else {
            showNotification(message, 'error');
        }
    }

    // Show success message
    function showSuccessMessage(message) {
        clearMessages();
        
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
        } else {
            showNotification(message, 'success');
        }
    }

    // Clear all messages
    function clearMessages() {
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        if (successMessage) {
            successMessage.style.display = 'none';
        }
    }

    // Handle password visibility toggle (if you want to add this feature)
    function setupPasswordToggle() {
        const toggleBtn = qs('#togglePassword');
        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
    }

    // Auto-focus on input errors
    function focusFirstError() {
        const errorField = qs('.error');
        if (errorField) {
            errorField.focus();
            errorField.select();
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Alt + L to focus username (login shortcut)
        if (event.altKey && event.key === 'l') {
            event.preventDefault();
            if (usernameInput) {
                usernameInput.focus();
                usernameInput.select();
            }
        }
        
        // Escape to clear form
        if (event.key === 'Escape') {
            if (loginForm) {
                loginForm.reset();
                clearMessages();
                if (usernameInput) {
                    usernameInput.focus();
                }
            }
        }
    });

    // Setup password toggle if element exists
    setupPasswordToggle();
});
