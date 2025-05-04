// === Course & Semester Mapping ===
let courses = ["1st Year, BS", "2nd Year, BS"];

let semestersByCourse = {
  "1st Year, BS": ["Sem 1", "Sem 2"],
  "2nd Year, BS": ["Sem 3", "Sem 4"]
};

let subjectsBySemester = {
  "Sem 1": {
    "Intro to Calculus": "IntroCalculus",
    "Physics for Data Scientists": "PhysicsData",
    "Engineering Calculations": "EnggCalcs",
    "Basics of Computing": "ComputingBasics",
    "Writing for Self": "WritingSelf"
  },
  "Sem 2": {
    "Intro to Probability Theory": "IntroToProbability",
    "Chemistry for Data Scientists": "ChemistryForDS",
    "Discrete Mathematics": "DiscreteMath",
    "Basics of Engineering Principles": "IntroToEnggPrinciples",
    "Writing seminar": "WritingSeminar"
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

// === Course Buttons ===
const courseContainer = document.getElementById('courseButtons');
courses.forEach(course => {
  const btn = document.createElement('div');
  btn.className = 'dynamic-button';
  btn.innerText = course;
  btn.onclick = () => showSemesters(course);
  courseContainer.appendChild(btn);
});

// === Show Semesters ===
let selectedCourseGlobal = null;

function showSemesters(course) {
  selectedCourseGlobal = course;
  document.getElementById('semesterButtons').style.display = 'grid';
  const semContainer = document.getElementById('semesterButtons');
  semContainer.innerHTML = '';

  const courseSemesters = semestersByCourse[course];

  courseSemesters.forEach(sem => {
    const semBtn = document.createElement('div');
    semBtn.className = 'dynamic-button';
    semBtn.innerText = sem;
    semBtn.onclick = () => showSubjects(sem);
    semContainer.appendChild(semBtn);
  });

  courseContainer.style.display = 'none';
}

// === Show Subjects ===
function showSubjects(semester) {
  document.getElementById('subjectButtons').style.display = 'grid';
  const subContainer = document.getElementById('subjectButtons');
  subContainer.innerHTML = '';

  const selectedCourse = selectedCourseGlobal;

  Object.entries(subjectsBySemester[semester]).forEach(([displayName, folderName]) => {
    const subBtn = document.createElement('div');
    subBtn.className = 'dynamic-button';
    subBtn.innerText = displayName;
    subBtn.onclick = () => fetchNotes(selectedCourse, semester, folderName);
    subContainer.appendChild(subBtn);
  });

  document.getElementById('semesterButtons').style.display = 'none';
}

// === Fetch Notes ===
function fetchNotes(course, semester, subject) {
  // Hide navigation UI
  document.getElementById('courseButtons').style.display = 'none';
  document.getElementById('semesterButtons').style.display = 'none';
  document.getElementById('subjectButtons').style.display = 'none';

  // Show notes
  const notesContainer = document.getElementById('notesContainer');
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
}
