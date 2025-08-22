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
    const calcEl = qs('#calculator');
    const gllmForm = qs('#gllmForm');
    const resetGraphBtn = qs('#resetGraph');
    const screenshotBtn = qs('#screenshotGraph');

    // Calculator state
    let calculator = null;
    let calculatorInitialized = false;
    let currentEquations = [];
    let conversationHistory = [];

    // Initialize
    initializeGraphingCalculator();
    setupEventListeners();
    displayWelcomeMessage();

    // Create scroll-to-bottom button (replacement)
    let scrollBtn = null;
    if (chatMessages && chatMessages.parentElement) {
        scrollBtn = document.createElement('button');
        scrollBtn.textContent = '↓';
        scrollBtn.className = 'scroll-btn';
        scrollBtn.style.display = 'none';
        chatMessages.parentElement.style.position = chatMessages.parentElement.style.position || 'relative';
        chatMessages.parentElement.appendChild(scrollBtn);

        // Show/hide on scroll
        chatMessages.addEventListener('scroll', () => {
            const nearBottom = chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 50;
            scrollBtn.style.display = nearBottom ? 'none' : 'block';
        });

        // Scroll to bottom on click
        scrollBtn.addEventListener('click', () => {
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        });
    }

    // === UI helpers ===
    function displayWelcomeMessage() {
        if (chatMessages) {
            addMessageToChat(
                'assistant',
                `Hello! I'm your AI graphing assistant. Ask me to create any mathematical equation and I'll graph it for you. I can remember our conversation and build upon previous equations!`
            );
        }
    }

    function setupEventListeners() {
        if (gllmForm) gllmForm.addEventListener('submit', handleFormSubmit);
        if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);

        if (chatInput) {
            chatInput.addEventListener('input', autoResizeTextarea);
            chatInput.addEventListener('keydown', handleKeyDown);
        }

        if (resetGraphBtn) resetGraphBtn.addEventListener('click', resetGraph);
        if (screenshotBtn) screenshotBtn.addEventListener('click', takeScreenshot);
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        handleSendMessage();
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    function autoResizeTextarea() {
        if (!chatInput) return;
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    }

    function setLoadingState(isLoading, label = 'Generating with AI...') {
        if (!sendBtn || !sendText || !sendSpinner || !chatStatus) return;

        if (isLoading) {
            sendBtn.disabled = true;
            sendText.classList.add('hidden');
            sendSpinner.classList.remove('hidden');
            chatStatus.textContent = label;
            chatStatus.className = 'status-indicator loading';
        } else {
            sendBtn.disabled = false;
            sendText.classList.remove('hidden');
            sendSpinner.classList.add('hidden');
            chatStatus.textContent = 'Ready';
            chatStatus.className = 'status-indicator';
        }
    }

    function addMessageToChat(sender, message) {
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="timestamp">${timeString}</div>
        `;

        chatMessages.appendChild(messageDiv);

        // Auto-scroll to bottom on new message
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Hide scroll button when new message brings to bottom
        if (scrollBtn) {
            scrollBtn.style.display = 'none';
        }
    }

    // Centralized AI issue reporter (prints + notifies + chat message)
    function reportAiIssue(kind, details = '') {
        const pretty = {
            api_not_configured: 'API is not configured',
            api_down: 'API is unreachable',
            api_error: 'API returned an error',
            no_ai_response: 'AI did not return any content',
            invalid_ai_output: 'AI returned invalid/empty equations',
            unknown: 'Unknown AI error'
        };
        const label = pretty[kind] || pretty.unknown;

        const extra = details ? ` Details: ${sanitize(details).slice(0, 400)}` : '';
        console.error(`AI Issue → ${kind}.${extra ? extra : ''}`);

        addMessageToChat('assistant', `⚠️ AI is unable to generate right now (${label}).${extra}`);
        showNotification(`${label}`, 'error');
    }

    // Basic sanitizer for error text
    function sanitize(s) {
        try {
            return String(s).replace(/[<>]/g, '');
        } catch {
            return '';
        }
    }

    // === Core action ===
    async function handleSendMessage() {
    if (!chatInput || !chatInput.value.trim()) {
        showNotification('Please enter a math query', 'error');
        return;
    }

    const query = chatInput.value.trim();
    setLoadingState(true);

    // Add user message
    addMessageToChat('user', query);
    conversationHistory.push({ type: 'user', message: query, timestamp: new Date() });

    try {
        const response = await window.Api.generateEquations(query);

        // --- CASE 1: API error explicitly returned from backend ---
        if (response && response.error) {
            const errorMsg = `⚠️ AI failed: ${response.error}${
                response.details ? ` (${response.details.slice(0, 100)}...)` : ''
            }`;
            addMessageToChat('assistant', errorMsg);
            showNotification(errorMsg, 'error');

            // Try legacy fallback
            return await tryFallbacks(query);
        }

        // --- CASE 2: Success but no equations ---
        if (response && response.success && Array.isArray(response.equations) && response.equations.length === 0) {
            addMessageToChat('assistant', "⚠️ AI returned no usable equations.");
            showNotification('AI gave empty response', 'error');

            // Try fallback
            return await tryFallbacks(query);
        }

        // --- CASE 3: Happy path ---
        if (response && response.success && response.equations) {
            const contextMessage = buildContextualResponse(query, response);
            addMessageToChat('assistant', contextMessage);

            conversationHistory.push({
                type: 'assistant',
                message: contextMessage,
                equations: response.equations,
                timestamp: new Date()
            });

            displayAndPlotEquations(response.equations);
            showNotification('Equations generated successfully!', 'success');

            if (response.context && Object.keys(response.context).length > 0) {
                displayContextInfo(response.context);
            }
            return;
        }

        // --- CASE 4: Completely unexpected response ---
        addMessageToChat('assistant', '⚠️ Unexpected AI response.');
        showNotification('Unexpected AI response', 'error');
        await tryFallbacks(query);

    } catch (error) {
        console.error('Primary API error:', error);
        addMessageToChat('assistant', `⚠️ AI service unreachable: ${error.message}`);
        showNotification('AI service unreachable', 'error');

        await tryFallbacks(query);
    } finally {
        setLoadingState(false);
        chatInput.value = '';
        autoResizeTextarea();
    }
}


    // Try legacy endpoint, then local samples
    async function tryFallbacks(query) {
        // 2) Legacy endpoint
        try {
            const legacy = await window.Api.generateEquationsLegacy(query);

            if (legacy && legacy.success && Array.isArray(legacy.equations) && legacy.equations.length > 0) {
                addMessageToChat('assistant', `AI is unavailable at the moment. Falling back to legacy generator for "${query}".`);
                displayAndPlotEquations(legacy.equations);
                showNotification('Equations generated (legacy mode)', 'info');
                return;
            } else {
                console.warn('Legacy fallback returned no equations or failed:', legacy);
            }
        } catch (e) {
            console.error('Legacy API error:', e);
        }

        // 3) Local samples
        const sampleEquations = generateSampleEquations(query);
        if (sampleEquations && sampleEquations.length > 0) {
            addMessageToChat('assistant', `AI is unavailable. Showing sample equations for now.`);
            displayAndPlotEquations(sampleEquations);
            showNotification('Using sample equations (AI unavailable)', 'warning');
        } else {
            addMessageToChat('assistant', `AI is unavailable and no sample equations could be generated.`);
            showNotification('No equations available', 'error');
        }
    }

    // Build contextual response based on conversation history
    function buildContextualResponse(query, response) {
        const equationCount = response.equations.length;
        const context = response.context || {};

        let message = `Great! I've generated ${equationCount} equation${equationCount > 1 ? 's' : ''} for "${query}".`;

        if (context.detected_concepts && context.detected_concepts.length > 0) {
            message += ` I detected these mathematical concepts: ${context.detected_concepts.join(', ')}.`;
        }

        if (context.previous_equations && context.previous_equations.length > 0) {
            message += ` This builds upon our previous work with ${context.previous_equations.length} equation${context.previous_equations.length > 1 ? 's' : ''}.`;
        }

        if (conversationHistory.length > 5) {
            message += ` I'm remembering our conversation to provide better suggestions.`;
        }

        return message;
    }

    // Context info (console for now)
    function displayContextInfo(context) {
        if (context.preferences && Object.keys(context.preferences).length > 0) {
            console.log('User preferences detected:', context.preferences);
        }
        if (context.detected_concepts && context.detected_concepts.length > 0) {
            console.log('Mathematical concepts in this session:', context.detected_concepts);
        }
    }

    // === Fallback sample equations ===
    function generateSampleEquations(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('quadratic') || lowerQuery.includes('parabola')) {
            return [
                { equation: 'y=x^2', description: 'Basic parabola' },
                { equation: 'y=2x^2+3x-1', description: 'Quadratic with linear term' }
            ];
        } else if (lowerQuery.includes('sine') || lowerQuery.includes('sin')) {
            return [
                { equation: 'y=\\sin(x)', description: 'Basic sine wave' },
                { equation: 'y=2\\sin(3x)', description: 'Amplitude and frequency modified' }
            ];
        } else if (lowerQuery.includes('heart') || lowerQuery.includes('love')) {
            return [
                { equation: 'x^2 + (y - \\sqrt{|x|})^2 = 1', description: 'Heart-shaped curve' }
            ];
        } else if (lowerQuery.includes('flower') || lowerQuery.includes('rose')) {
            return [
                { equation: 'r = 3\\cos(2\\theta)', description: '4-petaled rose curve' }
            ];
        } else if (lowerQuery.includes('spiral')) {
            return [
                { equation: 'r = 0.5\\theta', description: 'Archimedean spiral' }
            ];
        } else if (lowerQuery.includes('circle')) {
            return [
                { equation: 'x^2 + y^2 = 9', description: 'Circle with radius 3' }
            ];
        } else {
            return [
                { equation: 'y = x^2', description: 'Quadratic function' },
                { equation: 'y = \\sin(x)', description: 'Sine wave' }
            ];
        }
    }

    // === Desmos integration ===
    function initializeGraphingCalculator() {
        if (!calcEl) return;

        try {
            if (typeof Desmos !== 'undefined') {
                calculator = Desmos.GraphingCalculator(calcEl, {
                    expressions: true,
                    settingsMenu: true,
                    zoomButtons: true,
                    expressionsTopbar: true,
                    pointsOfInterest: true,
                    trace: true,
                    border: false,
                    keypad: false
                });

                calculatorInitialized = true;
                console.log('Desmos calculator initialized successfully');
            } else {
                setTimeout(initializeGraphingCalculator, 100);
            }
        } catch (error) {
            console.error('Failed to initialize calculator:', error);
            showNotification('Calculator initialization failed', 'error');
        }
    }

    function displayAndPlotEquations(equations) {
        if (!Array.isArray(equations) || equations.length === 0) {
            equationsList && (equationsList.innerHTML = '');
            currentEquations = [];
            showNotification('No equations to plot', 'warning');
            return;
        }
        currentEquations = equations;
        displayEquationsList(equations);
        plotEquations(equations);
    }

    function displayEquationsList(equations) {
        if (!equationsList) return;

        equationsList.innerHTML = '';

        equations.forEach((eq, index) => {
            const div = document.createElement('div');
            div.className = 'equation-item';
            div.style.borderLeftColor = getColor(index);
            div.innerHTML = `
                <div class="equation-text">${eq.equation || eq.latex}</div>
                <div class="equation-desc">${eq.description || ''}</div>
            `;

            div.addEventListener('click', () => {
                if (calculator) focusEquation(index);
            });

            equationsList.appendChild(div);
        });
    }

    function getColor(index) {
        const colors = ['#4da6ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        return colors[index % colors.length];
    }

    function plotEquations(equations) {
        if (!calculator || !calculatorInitialized) {
            console.log('Calculator not ready, retrying...');
            setTimeout(() => plotEquations(equations), 500);
            return;
        }

        try {
            calculator.setBlank();

            equations.forEach((eq, index) => {
                const latex = eq.equation || eq.latex;
                if (!latex) return; // skip invalid

                calculator.setExpression({
                    id: `eq_${index}`,
                    latex,
                    color: getColor(index),
                    lineWidth: 2,
                    lineOpacity: 0.9
                });
            });

            console.log(`Plotted ${equations.length} equations`);
            showNotification(`Graphed ${equations.length} equation${equations.length > 1 ? 's' : ''}`, 'success');

        } catch (error) {
            console.error('Error plotting equations:', error);
            showNotification('Error plotting equations', 'error');
        }
    }

    function focusEquation(index) {
        if (!calculator) return;
        try {
            const equationId = `eq_${index}`;
            console.log(`Focusing on equation ${equationId}`);
            // Add advanced focusing logic with Desmos API if needed.
        } catch (error) {
            console.error('Error focusing equation:', error);
        }
    }

    function resetGraph() {
        if (calculator) {
            calculator.setBlank();
            if (equationsList) equationsList.innerHTML = '';
            currentEquations = [];
            showNotification('Graph cleared', 'info');
        }
    }

    function takeScreenshot() {
        if (!calculator) return;
        try {
            calculator.asyncScreenshot({
                width: 1200,
                height: 800,
                targetPixelRatio: 2
            }).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `graph_${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
                showNotification('Screenshot saved!', 'success');
            });
        } catch (error) {
            console.error('Screenshot error:', error);
            showNotification('Screenshot failed', 'error');
        }
    }

    // Session stats (optional)
    async function getSessionStats() {
        try {
            const stats = await window.Api.getSessionStats();
            console.log('Session stats:', stats);
            return stats;
        } catch (error) {
            console.error('Error getting session stats:', error);
            return null;
        }
    }

    // Expose for debugging
    window.GLLM = {
        resetGraph,
        takeScreenshot,
        getSessionStats,
        conversationHistory,
        currentEquations
    };
});
