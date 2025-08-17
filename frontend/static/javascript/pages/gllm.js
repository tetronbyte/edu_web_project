/* ========= GLLM (Graphing Calculator) Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification } = window.Utils;

    // DOM elements
    const chatInput = qs('#chatInput');
    const sendBtn = qs('#sendMessage');
    const sendText = qs('#sendText');
    const sendSpinner = qs('#sendSpinner');
    const chatStatus = qs('#chatStatus');
    const chatMessages = qs('#chatMessages');
    const equationsList = qs('#equationsList');
    const equationsPanel = qs('#equationsPanel');
    const calcEl = qs('#calculator');

    // Calculator state
    let calculator = null;
    let calculatorInitialized = false;

    // Initialize
    initializeGraphingCalculator();
    setupEventListeners();

    // Auto-resize textarea
    function autoResizeTextarea() {
        if (!chatInput) return;
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    }

    // Set loading state
    function setLoadingState(isLoading) {
        if (!sendBtn || !sendText || !sendSpinner || !chatStatus) return;

        if (isLoading) {
            sendBtn.disabled = true;
            sendText.classList.add('hidden');
            sendSpinner.classList.remove('hidden');
            chatStatus.textContent = 'Thinking...';
            chatStatus.className = 'status-indicator loading';
        } else {
            sendBtn.disabled = false;
            sendText.classList.remove('hidden');
            sendSpinner.classList.add('hidden');
            chatStatus.textContent = 'Ready';
            chatStatus.className = 'status-indicator';
        }
    }

    // Add message to chat
    function addMessageToChat(sender, message) {
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${sender === 'user' ? 'You' : 'AI Assistant'}</span>
                    <span class="message-time">${timeString}</span>
                </div>
                <div class="message-text">${message}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Get color for equations
    function getColor(index) {
        const colors = ['#4da6ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        return colors[index % colors.length];
    }

    // Display equations list
    function displayEquations(equations) {
        if (!equationsList) return;

        equationsList.innerHTML = '';
        equations.forEach((eq, index) => {
            const div = document.createElement('div');
            div.className = 'equation-item';
            div.innerHTML = `
                <div class="equation-latex" style="color: ${getColor(index)}">${eq.latex}</div>
                <div class="equation-description">${eq.description}</div>
            `;
            equationsList.appendChild(div);
        });
    }

    // Show equations panel
    function showEquationsPanel() {
        if (equationsPanel) {
            equationsPanel.classList.remove('hidden');
        }
    }

    // Clear calculator
    function clearCalculator() {
        if (calculatorInitialized && calculator && typeof calculator.setBlank === 'function') {
            calculator.setBlank();
            addMessageToChat('bot', 'Graph cleared! What would you like to plot next?');
        } else {
            addMessageToChat('bot', 'Unable to clear graph. Please refresh the page and try again.');
        }
    }

    // Initialize Desmos graphing calculator
    function initializeGraphingCalculator() {
        if (!calcEl) {
            console.error('Calculator element not found');
            return;
        }

        if (typeof Desmos === 'undefined') {
            // Retry in 500ms if Desmos isn't loaded yet
            setTimeout(initializeGraphingCalculator, 500);
            return;
        }

        try {
            calculator = Desmos.GraphingCalculator(calcEl, {
                expressions: true,
                settingsMenu: true,
                zoomButtons: true,
                expressionsTopbar: true,
                border: false,
                keypad: false,
                graphpaper: true,
                showResetButtonOnGraphpaper: true,
                invertedColors: true // Match dark theme
            });

            calculatorInitialized = true;
            console.log('Desmos calculator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Desmos calculator:', error);
            calculatorInitialized = false;
            
            if (calcEl) {
                calcEl.innerHTML = `
                    <div class="error-state">
                        <h3>Calculator Unavailable</h3>
                        <p>Unable to load the graphing calculator. Please refresh the page and try again.</p>
                    </div>
                `;
            }
        }
    }

    // Send message to AI
    async function sendMessage() {
        const text = chatInput?.value?.trim();
        if (!text) {
            showNotification('Please enter a message', 'error');
            return;
        }

        if (!calculatorInitialized || !calculator) {
            showNotification('Calculator not initialized. Please refresh the page.', 'error');
            return;
        }

        // Add user message
        addMessageToChat('user', text);
        chatInput.value = '';
        autoResizeTextarea();
        setLoadingState(true);

        try {
            const data = await Api.generateEquations(text);

            if (data.success && data.equations?.length) {
                const equationCount = data.equations.length;
                addMessageToChat('bot', `I've generated ${equationCount} equation${equationCount > 1 ? 's' : ''} for you.`);

                // Add equations to calculator
                data.equations.forEach((eq, index) => {
                    calculator.setExpression({
                        id: `equation_${Date.now()}_${index}`,
                        latex: eq.latex,
                        color: getColor(index)
                    });
                });

                displayEquations(data.equations);
                showEquationsPanel();
            } else {
                addMessageToChat('bot', 'I wasn\'t able to generate any equations from your input. Could you try rephrasing your request?');
            }
        } catch (error) {
            console.error('Error generating equations:', error);
            addMessageToChat('bot', `Sorry, I encountered an error: ${error.message}. Please try again.`);
        } finally {
            setLoadingState(false);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Chat input auto-resize
        if (chatInput) {
            chatInput.addEventListener('input', autoResizeTextarea);
            
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // Send button
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
    }

    // Export clear function for global access
    window.clearCalculator = clearCalculator;

    // Welcome message
    setTimeout(() => {
        addMessageToChat('bot', 'Hello! I\'m your graphing assistant. Describe a mathematical function or equation, and I\'ll graph it for you!');
    }, 1000);
});
