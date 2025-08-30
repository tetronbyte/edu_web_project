/* ========= Creative Arena Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, validate } = window.Utils;

    // DOM elements
    const toolCards = document.querySelectorAll('.tool-card');
    const subscribeForm = qs('#subscribeForm');
    const emailInput = qs('#emailInput');

    // Initialize page
    initializeCreativeArena();

    function initializeCreativeArena() {
        setupToolCards();
        setupSubscriptionForm();
        setupComingSoonSection();
        addToolInteractions();
    }

    // Setup tool cards with hover effects and click handlers
    function setupToolCards() {
        toolCards.forEach((card, index) => {
            // Add stagger animation on load
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);

            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-12px) scale(1.02)';
                
                // Add glow effect to icon
                const icon = card.querySelector('.tool-icon');
                if (icon) {
                    icon.style.boxShadow = '0 0 30px rgba(77, 166, 255, 0.5)';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                
                const icon = card.querySelector('.tool-icon');
                if (icon) {
                    icon.style.boxShadow = 'var(--shadow-md)';
                }
            });

            // Add click handler
            card.addEventListener('click', () => {
                const toolName = card.querySelector('h3').textContent;
                handleToolClick(toolName);
            });
        });
    }

    // Setup subscription form
    function setupSubscriptionForm() {
        if (subscribeForm && emailInput) {
            subscribeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSubscription();
            });

            // Real-time email validation
            emailInput.addEventListener('input', (e) => {
                const email = e.target.value;
                const isValid = validate.email(email);
                
                if (email && !isValid) {
                    emailInput.style.borderColor = 'var(--error)';
                    showInputError(emailInput, 'Please enter a valid email address');
                } else {
                    emailInput.style.borderColor = 'var(--border-primary)';
                    hideInputError(emailInput);
                }
            });
        }
    }

    // Setup coming soon section with animated counters
    function setupComingSoonSection() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    // Add interactive effects to tool features
    function addToolInteractions() {
        const featureLists = document.querySelectorAll('.tool-features li');
        
        featureLists.forEach((feature, index) => {
            feature.addEventListener('mouseenter', () => {
                feature.style.transform = 'translateX(10px)';
                feature.style.background = 'var(--gradient-button-hover)';
            });

            feature.addEventListener('mouseleave', () => {
                feature.style.transform = 'translateX(0)';
                feature.style.background = 'transparent';
            });

            // Stagger animation
            setTimeout(() => {
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }

    // Handle tool clicks
    function handleToolClick(toolName) {
        // Show different messages based on tool
        const messages = {
            'AI Image Generator': 'AI Image Generator is coming soon! Get ready to create amazing images from text.',
            'Color Palette Generator': 'Color Palette Generator will help you create beautiful color schemes.',
            'AI Writing Assistant': 'AI Writing Assistant will help with your essays and creative writing.',
            'Music Composer': 'Music Composer will let you create melodies and beats with AI.',
            'Video Editor': 'Video Editor with AI features is in development.',
            'Presentation Maker': 'Smart Presentation Maker will create professional slides for you.'
        };

        const message = messages[toolName] || 'This tool is coming soon!';
        
        showNotification(message, 'info', { timeout: 5000 });

        // Add pulse animation to clicked card
        const clickedCard = event.currentTarget;
        clickedCard.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            clickedCard.style.animation = '';
        }, 600);
    }

    // Handle subscription
    async function handleSubscription() {
        const email = emailInput.value.trim();
        
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }

        if (!validate.email(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        try {
            // Show loading state
            const submitBtn = subscribeForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;

            // Simulate API call - replace with actual API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success
            showNotification('Successfully subscribed! You\'ll be notified when new tools are available.', 'success');
            emailInput.value = '';
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // TODO: Implement actual subscription API call
            // await Api.subscribeNotifications(email);
            
        } catch (error) {
            console.error('Subscription error:', error);
            showNotification('Failed to subscribe. Please try again.', 'error');
            
            // Reset button
            const submitBtn = subscribeForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Get Notified';
            submitBtn.disabled = false;
        }
    }

    // Animate number counter
    function animateNumber(element) {
        const finalNumber = parseInt(element.textContent);
        const duration = 2000;
        const increment = finalNumber / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= finalNumber) {
                element.textContent = finalNumber + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }

    // Input validation helpers
    function showInputError(input, message) {
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('input-error')) {
            errorElement = document.createElement('div');
            errorElement.className = 'input-error text-error';
            errorElement.style.cssText = `
                font-size: var(--font-size-sm);
                margin-top: var(--spacing-xs);
                opacity: 0;
                transition: opacity var(--transition-normal);
            `;
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        setTimeout(() => errorElement.style.opacity = '1', 100);
    }

    function hideInputError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('input-error')) {
            errorElement.style.opacity = '0';
            setTimeout(() => errorElement.remove(), 300);
        }
    }

    // Add floating animation to hero elements
    function setupFloatingAnimations() {
        const floatingElements = document.querySelectorAll('.floating-animation');
        
        floatingElements.forEach((element, index) => {
            element.style.animation = `float 3s ease-in-out infinite`;
            element.style.animationDelay = `${index * 0.5}s`;
        });
    }

    // Add scroll-triggered animations
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize additional animations
    setupFloatingAnimations();
    setupScrollAnimations();

    // Add CSS for animations if not already present
    if (!document.getElementById('creative-arena-animations')) {
        const style = document.createElement('style');
        style.id = 'creative-arena-animations';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s ease;
            }
            
            .animate-on-scroll.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .floating-animation {
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }
});
