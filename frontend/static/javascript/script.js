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

// === Hide back button initially
backButton.style.display = 'none';

// === Initialize Course Buttons ===
courses.forEach(course => {
  const btn = document.createElement('div');
  btn.className = 'dynamic-button';
  btn.innerText = course;
  btn.onclick = () => showSemesters(course);
  courseContainer.appendChild(btn);
});

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
  backButton.style.display = 'inline-block';
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
  backButton.style.display = 'inline-block';
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

  backButton.style.display = 'inline-block';
}

// === Go Back Function ===
function goBack() {
  const lastState = historyStack.pop();
  if (!lastState) return;

  // Hide all views
  courseContainer.style.display = 'none';
  semesterContainer.style.display = 'none';
  subjectContainer.style.display = 'none';
  notesContainer.style.display = 'none';

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
  backButton.style.display = historyStack.length > 0 ? 'inline-block' : 'none';
}
