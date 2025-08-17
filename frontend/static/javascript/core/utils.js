/* ========= Core Utilities ========= */

window.Utils = (() => {
    // DOM helpers
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // Throttle/debounce
    const debounce = (fn, wait = 250) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(null, args), wait);
        };
    };

    const throttle = (fn, limit = 250) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn.apply(null, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Notification system
    const ensureNotifKeyframes = () => {
        if (document.getElementById('notif-keyframes')) return;
        const style = document.createElement('style');
        style.id = 'notif-keyframes';
        style.textContent = `
            @keyframes slideIn { 
                from { transform: translateX(100%); opacity: 0; } 
                to { transform: translateX(0); opacity: 1; } 
            }
            @keyframes slideOut { 
                from { transform: translateX(0); opacity: 1; } 
                to { transform: translateX(100%); opacity: 0; } 
            }
        `;
        document.head.appendChild(style);
    };

    const showNotification = (message, type = 'success', options = {}) => {
        ensureNotifKeyframes();
        const { timeout = 3000, top = 110, right = 20 } = options;
        
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.className = `notification message-${type}`;
        el.textContent = message;
        el.style.cssText = `
            position: fixed;
            top: ${top}px;
            right: ${right}px;
            z-index: 1002;
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--radius-md);
            font-weight: var(--font-weight-semibold);
            animation: slideIn 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;

        // Apply theme-based colors
        if (type === 'success') {
            el.style.background = 'var(--success-bg)';
            el.style.border = '2px solid var(--success)';
            el.style.color = 'var(--success)';
        } else if (type === 'error') {
            el.style.background = 'var(--error-bg)';
            el.style.border = '2px solid var(--error)';
            el.style.color = 'var(--error)';
        } else if (type === 'info') {
            el.style.background = 'var(--info-bg)';
            el.style.border = '2px solid var(--info)';
            el.style.color = 'var(--info)';
        }

        document.body.appendChild(el);

        setTimeout(() => {
            if (!el.parentNode) return;
            el.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => el.remove(), 300);
        }, timeout);
    };

    // Form utilities
    const formToJSON = (form) =>
        Array.from(new FormData(form)).reduce((acc, [k, v]) => ((acc[k] = v), acc), {});

    // Date formatting
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // URL utilities
    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    // Local storage utilities
    const storage = {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('Storage not available:', e);
                return false;
            }
        },
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('Storage retrieval error:', e);
                return defaultValue;
            }
        },
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('Storage removal error:', e);
                return false;
            }
        }
    };

    // Animation utilities
    const animateElement = (element, animation, duration = 300) => {
        return new Promise((resolve) => {
            element.style.animation = `${animation} ${duration}ms ease`;
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    };

    // Validation utilities
    const validate = {
        email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        url: (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        notEmpty: (value) => value && value.trim().length > 0
    };

    return {
        qs,
        qsa,
        debounce,
        throttle,
        showNotification,
        formToJSON,
        formatDate,
        getQueryParam,
        storage,
        animateElement,
        validate
    };
})();
