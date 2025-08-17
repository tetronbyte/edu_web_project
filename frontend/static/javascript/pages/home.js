/* ========= Public Home Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs } = window.Utils;

    // DOM elements
    const courseContainer = qs('#courseButtons');
    const semesterContainer = qs('#semesterButtons');
    const subjectContainer = qs('#subjectButtons');
    const notesContainer = qs('#notesContainer');
    const backButton = qs('#backButton');

    if (!(courseContainer && semesterContainer && subjectContainer && notesContainer)) {
        console.error('Required DOM elements not found');
        return;
    }

    // Course data
    const courses = ["1st Year, BS", "2nd Year, BS"];
    
    const semestersByCourse = {
        "1st Year, BS": ["Sem 1", "Sem 2"],
        "2nd Year, BS": ["Sem 3", "Sem 4"]
    };

    const subjectsBySemester = {
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

    // State management
    const historyStack = [];
    let selectedCourseGlobal = null;

    // Initialize
    if (backButton) backButton.style.display = 'none';
    initializeCourseButtons();

    // Initialize course buttons
    function initializeCourseButtons() {
        courses.forEach((course) => {
            const btn = document.createElement('div');
            btn.className = 'btn-dynamic';
            btn.innerText = course;
            btn.onclick = () => showSemesters(course);
            courseContainer.appendChild(btn);
        });
    }

    // Show semesters for selected course
    function showSemesters(course) {
        historyStack.push({ view: 'courseButtons' });
        selectedCourseGlobal = course;
        
        semesterContainer.style.display = 'grid';
        semesterContainer.innerHTML = '';
        
        const courseSemesters = semestersByCourse[course] || [];
        courseSemesters.forEach((semester) => {
            const semBtn = document.createElement('div');
            semBtn.className = 'btn-dynamic';
            semBtn.innerText = semester;
            semBtn.onclick = () => showSubjects(semester);
            semesterContainer.appendChild(semBtn);
        });

        // Hide other containers
        courseContainer.style.display = 'none';
        subjectContainer.style.display = 'none';
        notesContainer.style.display = 'none';
        
        if (backButton) backButton.style.display = 'inline-block';
    }

    // Show subjects for selected semester
    function showSubjects(semester) {
        historyStack.push({ 
            view: 'semesterButtons', 
            selectedCourse: selectedCourseGlobal 
        });
        
        subjectContainer.style.display = 'grid';
        subjectContainer.innerHTML = '';
        
        const subjects = subjectsBySemester[semester] || {};
        Object.entries(subjects).forEach(([displayName, folderName]) => {
            const subBtn = document.createElement('div');
            subBtn.className = 'btn-dynamic';
            subBtn.innerText = displayName;
            subBtn.onclick = () => fetchNotes(selectedCourseGlobal, semester, folderName);
            subjectContainer.appendChild(subBtn);
        });

        // Hide other containers
        semesterContainer.style.display = 'none';
        notesContainer.style.display = 'none';
        
        if (backButton) backButton.style.display = 'inline-block';
    }

    // Fetch and display notes
    async function fetchNotes(course, semester, subject) {
        historyStack.push({ 
            view: 'subjectButtons', 
            selectedCourse: course, 
            selectedSemester: semester 
        });

        // Hide other containers and show notes container
        courseContainer.style.display = 'none';
        semesterContainer.style.display = 'none';
        subjectContainer.style.display = 'none';
        notesContainer.style.display = 'grid';
        notesContainer.innerHTML = '';

        try {
            // Show loading state
            notesContainer.innerHTML = '<div class="loading">Loading notes...</div>';
            
            const notes = await Api.listNotes(course, semester, subject);
            
            notesContainer.innerHTML = '';
            
            if (notes && notes.length > 0) {
                notes.forEach((note) => {
                    const noteButton = document.createElement('button');
                    noteButton.className = 'note-button';
                    noteButton.innerText = note;
                    noteButton.onclick = () => {
                        const noteUrl = Api.getNoteFile(course, semester, subject, note);
                        window.open(noteUrl, '_blank');
                    };
                    notesContainer.appendChild(noteButton);
                });
            } else {
                notesContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>No Notes Available</h3>
                        <p>There are currently no notes available for this subject. Please check back later.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            notesContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Error Loading Notes</h3>
                    <p>Unable to load notes at this time. Please try again later.</p>
                </div>
            `;
        }

        if (backButton) backButton.style.display = 'inline-block';
    }

    // Go back to previous view
    function goBack() {
        const lastState = historyStack.pop();
        if (!lastState) return;

        // Hide all containers
        courseContainer.style.display = 'none';
        semesterContainer.style.display = 'none';
        subjectContainer.style.display = 'none';
        notesContainer.style.display = 'none';

        if (lastState.view === 'courseButtons') {
            courseContainer.style.display = 'grid';
        } else if (lastState.view === 'semesterButtons') {
            selectedCourseGlobal = lastState.selectedCourse;
            showSemesters(lastState.selectedCourse);
            historyStack.pop(); // Prevent double push
        } else if (lastState.view === 'subjectButtons') {
            showSubjects(lastState.selectedSemester);
            historyStack.pop(); // Prevent double push
        }

        // Update back button visibility
        if (backButton) {
            backButton.style.display = historyStack.length > 0 ? 'inline-block' : 'none';
        }
    }

    // Event listeners
    if (backButton) {
        backButton.addEventListener('click', goBack);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            const activeElement = document.activeElement;
            const isTyping = ['INPUT', 'TEXTAREA'].includes(activeElement.tagName) || 
                           activeElement.isContentEditable;
            
            if (!isTyping) {
                event.preventDefault();
                goBack();
            }
        }
    });
});
