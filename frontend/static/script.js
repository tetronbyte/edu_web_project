// === Course & Semester Mapping ===
let courses = ["1st Year, BS", "2nd Year, BS"];

let semestersByCourse = {
  "1st Year, BS": ["Sem 1", "Sem 2"],
  "2nd Year, BS": ["Sem 3", "Sem 4"]
};

let subjectsBySemester = {
  "Sem 1": {
    "Intro to Calculus": "IntroToCalculus",
    "Physics for Data Scientists": "PhysicsForDS",
    "Engineering Calculations": "EngineeringCalculations",
    "Basics of Computing": "BasicsOfComputing",
    "Writing for Self": "WritingForSelf"
  },
  "Sem 2": {
    "Intro to Probability Theory": "IntroToProbability",
    "Chemistry for Data Scientists": "ChemistryForDS",
    "Discrete Mathematics": "DiscreteMath",
    "Basics of Engineering Principles": "IntroToEnggPrinciples",
    "Writing seminar": "WritingForSeminar"
  },
  "Sem 3": {
    "Applied Linear Algebra": "AppliedLinearAlgebra",
    "Statistical theory for Engineers": "StatisticalTheoryForEngineers",
    "Programming and Data Structures": "ProgrammingAndDataStructures",
    "Introduction to Optimization": "IntroductionToOptimization",
    "Programming for Engineers (Elective)": "ProgrammingForEngineers"
  },
  "Sem 4": {
    "Design of Algorithms": "DesignOfAlgorithms",
    "Database Management Systems": "DatabaseManagementSystems",
    "Foundations of Machine Learning": "FoundationsOfMachineLearning",
    "Machine Learning Lab": "MachineLearningLab",
    "Biology for Engineers": "BiologyForEngineers"
  }
};

// === State Management ===
let historyStack = [];
let selectedCourseGlobal = null;

// === DOM References ===
const courseContainer = document.getElementById('courseButtons');
const semesterContainer = document.getElementById('semesterButtons');
const subjectContainer = document.getElementById('subjectButtons');
const notesContainer = document.getElementById('notesContainer');
const backButton = document.getElementById('backButton');

// === Graphing Calculator Variables ===
let calculator;
let messageCount = 0;
let calculatorInitialized = false;

// === Initialize based on current page ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Check if we're on the notes page
    if (courseContainer && semesterContainer && subjectContainer && notesContainer) {
        initializeNotesPage();
    }
    
    // Check if we're on the graphing calculator page
    if (document.getElementById('calculator')) {
        console.log('Calculator element found, initializing...');
        // Add a small delay to ensure Desmos API is fully loaded
        setTimeout(initializeGraphingCalculator, 100);
    }
});

// === Notes Page Initialization ===
function initializeNotesPage() {
    // Hide back button initially
    if (backButton) backButton.style.display = 'none';

    // Initialize Course Buttons
    courses.forEach(course => {
        const btn = document.createElement('div');
        btn.className = 'dynamic-button';
        btn.innerText = course;
        btn.onclick = () => showSemesters(course);
        courseContainer.appendChild(btn);
    });
}

// === Show Semesters ===
function showSemesters(course) {
    historyStack.push({ view: 'courseButtons' });

    selectedCourseGlobal = course;
    semesterContainer.style.display = 'grid';
    semesterContainer.innerHTML = '';

    const courseSemesters = semestersByCourse[course];
    courseSemesters.forEach(sem => {
        const semBtn = document.createElement('div');
        semBtn.className = 'dynamic-button';
        semBtn.innerText = sem;
        semBtn.onclick = () => showSubjects(sem);
        semesterContainer.appendChild(semBtn);
    });

    courseContainer.style.display = 'none';
    subjectContainer.style.display = 'none';
    notesContainer.style.display = 'none';
    if (backButton) backButton.style.display = 'inline-block';
}

// === Show Subjects ===
function showSubjects(semester) {
    historyStack.push({
        view: 'semesterButtons',
        selectedCourse: selectedCourseGlobal
    });

    subjectContainer.style.display = 'grid';
    subjectContainer.innerHTML = '';

    Object.entries(subjectsBySemester[semester]).forEach(([displayName, folderName]) => {
        const subBtn = document.createElement('div');
        subBtn.className = 'dynamic-button';
        subBtn.innerText = displayName;
        subBtn.onclick = () => fetchNotes(selectedCourseGlobal, semester, folderName);
        subjectContainer.appendChild(subBtn);
    });

    semesterContainer.style.display = 'none';
    notesContainer.style.display = 'none';
    if (backButton) backButton.style.display = 'inline-block';
}

// === Fetch Notes ===
function fetchNotes(course, semester, subject) {
    historyStack.push({
        view: 'subjectButtons',
        selectedCourse: course,
        selectedSemester: semester
    });

    courseContainer.style.display = 'none';
    semesterContainer.style.display = 'none';
    subjectContainer.style.display = 'none';
    notesContainer.style.display = 'grid';
    notesContainer.innerHTML = '';

    fetch(`/notes/${encodeURIComponent(course)}/${encodeURIComponent(semester)}/${encodeURIComponent(subject)}`)
        .then(response => response.json())
        .then(notes => {
            if (notes.length > 0) {
                notes.forEach(note => {
                    const noteButton = document.createElement('button');
                    noteButton.className = 'note-button';
                    noteButton.innerText = note;
                    noteButton.onclick = () => {
                        window.open(`/notes/${encodeURIComponent(course)}/${encodeURIComponent(semester)}/${encodeURIComponent(subject)}/${encodeURIComponent(note)}`, '_blank');
                    };
                    notesContainer.appendChild(noteButton);
                });
            } else {
                notesContainer.textContent = "No notes available.";
            }
        })
        .catch(error => console.error('Error fetching notes:', error));

    if (backButton) backButton.style.display = 'inline-block';
}

// === Go Back Function ===
function goBack() {
    // Check if we're on graphing calculator page
    if (window.location.pathname === '/graphing') {
        window.history.back();
        return;
    }
    
    // Original notes page logic
    const lastState = historyStack.pop();
    if (!lastState) return;

    // Hide all views
    if (courseContainer) courseContainer.style.display = 'none';
    if (semesterContainer) semesterContainer.style.display = 'none';
    if (subjectContainer) subjectContainer.style.display = 'none';
    if (notesContainer) notesContainer.style.display = 'none';

    if (lastState.view === 'courseButtons') {
        courseContainer.style.display = 'grid';
    } else if (lastState.view === 'semesterButtons') {
        selectedCourseGlobal = lastState.selectedCourse;
        showSemesters(lastState.selectedCourse);
        historyStack.pop(); // prevent double push
    } else if (lastState.view === 'subjectButtons') {
        showSubjects(lastState.selectedSemester);
        historyStack.pop(); // prevent double push
    }

    // Update back button visibility
    if (backButton) {
        backButton.style.display = historyStack.length > 0 ? 'inline-block' : 'none';
    }
}

// === Backspace shortcut for back button ===
document.addEventListener('keydown', function (event) {
    if (event.key === 'Backspace') {
        const activeElement = document.activeElement;
        const isTyping =
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable;

        if (!isTyping) {
            event.preventDefault(); // stop browser back nav
            goBack();
        }
    }
});

// ===================== AI GRAPHING CALCULATOR FUNCTIONALITY =====================

// === Initialize Graphing Calculator ===
function initializeGraphingCalculator() {
    const elt = document.getElementById('calculator');
    if (!elt) {
        console.error('Calculator container element not found');
        return;
    }
    
    // Check if Desmos is available
    if (typeof Desmos === 'undefined') {
        console.error('Desmos API not loaded');
        // Retry after a short delay
        setTimeout(initializeGraphingCalculator, 1000);
        return;
    }
    
    try {
        console.log('Initializing Desmos calculator...');
        
        // Use the official initialization pattern from Desmos docs
        calculator = Desmos.GraphingCalculator(elt, {
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            expressionsTopbar: true,
            border: false,
            keypad: false,
            graphpaper: true,
            showResetButtonOnGraphpaper: true
        });
        
        // Verify calculator was created successfully
        if (calculator && typeof calculator.setExpression === 'function') {
            calculatorInitialized = true;
            console.log('Desmos calculator initialized successfully');
            
            // Test the calculator by setting a simple expression
            calculator.setExpression({
                id: 'test_init',
                latex: 'y = 0',
                color: '#000000',
                lineStyle: Desmos.Styles.DASHED,
                lineWidth: 1,
                lineOpacity: 0.1,
                showLabel: false
            });
            
        } else {
            console.error('Calculator initialization failed - setExpression not available');
        }
        
    } catch (error) {
        console.error('Error initializing Desmos calculator:', error);
        calculatorInitialized = false;
    }
    
    // Auto-resize chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('input', autoResizeTextarea);
        
        // Handle Enter key in chat input
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// === Auto-resize textarea ===
function autoResizeTextarea() {
    const textarea = document.getElementById('chatInput');
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
}

// === Send Message Function ===
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
    const userMessage = chatInput.value.trim();
    
    if (!userMessage) {
        showNotification('Please enter a message', 'error');
        return;
    }
    
    // Check if calculator is properly initialized
    if (!calculatorInitialized || !calculator || typeof calculator.setExpression !== 'function') {
        console.error('Calculator not properly initialized');
        addMessageToChat('bot', 'Sorry, the graphing calculator is not ready yet. Please refresh the page and try again.');
        showNotification('Calculator initialization error. Please refresh the page.', 'error');
        return;
    }
    
    // Add user message to chat
    addMessageToChat('user', userMessage);
    
    // Clear input and show loading
    chatInput.value = '';
    autoResizeTextarea();
    setLoadingState(true);
    
    try {
        const response = await fetch('/generate-equations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: userMessage })
        });
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.equations && data.equations.length > 0) {
            // Add bot response
            const botMessage = `I've generated ${data.equations.length} equation(s) for you. Check the graph!`;
            addMessageToChat('bot', botMessage);
            
            // Add equations to Desmos with additional error checking
            try {
                data.equations.forEach((eq, index) => {
                    console.log(`Adding equation ${index + 1}: ${eq.latex}`);
                    calculator.setExpression({
                        id: `equation_${Date.now()}_${index}`,
                        latex: eq.latex,
                        color: getColor(index)
                    });
                });
                
                // Show equations panel
                displayEquations(data.equations);
                showEquationsPanel();
                
                showNotification(`Successfully graphed ${data.equations.length} equation(s)`, 'success');
                
            } catch (calculatorError) {
                console.error('Error adding equations to calculator:', calculatorError);
                addMessageToChat('bot', 'The equations were generated but there was an error displaying them on the graph.');
                showNotification('Error displaying equations on graph', 'error');
            }
            
        } else {
            const errorMsg = data.error || 'No equations could be generated from your description.';
            addMessageToChat('bot', `Sorry, I couldn't generate a graph. Error: ${errorMsg}`);
            showNotification(`Failed to generate equations: ${errorMsg}`, 'error');
        }
    } catch (error) {
        console.error('Detailed error:', error);
        addMessageToChat('bot', `Sorry, I encountered an error: ${error.message}. Please check the console for details and try again.`);
        showNotification(`Connection error: ${error.message}`, 'error');
    } finally {
        setLoadingState(false);
    }
}

// === Add Message to Chat ===
function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="message-content">
            ${sender === 'user' ? '' : '<strong>AI Assistant:</strong> '}${message}
        </div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    messageCount++;
}

// === Set Loading State ===
function setLoadingState(isLoading) {
    const sendBtn = document.getElementById('sendMessage');
    const sendText = document.getElementById('sendText');
    const sendSpinner = document.getElementById('sendSpinner');
    const chatStatus = document.getElementById('chatStatus');
    
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

// === Display Equations ===
function displayEquations(equations) {
    const equationsList = document.getElementById('equationsList');
    if (!equationsList) return;
    
    equationsList.innerHTML = '';
    
    equations.forEach((eq, index) => {
        const div = document.createElement('div');
        div.className = 'equation-item';
        div.innerHTML = `
            <div class="equation-latex">${eq.latex}</div>
            <div class="equation-description">${eq.description}</div>
        `;
        equationsList.appendChild(div);
    });
}

// === Show/Hide Equations Panel ===
function showEquationsPanel() {
    const panel = document.getElementById('equationsPanel');
    if (panel) {
        panel.classList.remove('hidden');
    }
}

function toggleEquationsPanel() {
    const panel = document.getElementById('equationsPanel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

// === Clear Calculator ===
function clearCalculator() {
    if (calculatorInitialized && calculator && typeof calculator.setBlank === 'function') {
        calculator.setBlank();
        addMessageToChat('bot', 'Graph cleared! What would you like to plot next?');
    } else {
        console.error('Calculator not available for clearing');
        addMessageToChat('bot', 'Unable to clear graph. Please refresh the page.');
    }
}

// === Get Color for Graph ===
function getColor(index) {
    const colors = ['#4da6ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    return colors[index % colors.length];
}

// === Show Notification ===
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}-message`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 110px;
        right: 20px;
        z-index: 1002;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// === Add notification animations to head ===
const style = document.createElement('style');
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
if (document.head) {
    document.head.appendChild(style);
}

// Debug function to check calculator status
function checkCalculatorStatus() {
    console.log('Calculator initialized:', calculatorInitialized);
    console.log('Calculator object:', calculator);
    console.log('Desmos available:', typeof Desmos !== 'undefined');
}

// Make debug function globally available
window.checkCalculatorStatus = checkCalculatorStatus;
