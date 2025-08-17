document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const courseSelect = document.getElementById('course');
  const semesterSelect = document.getElementById('semester');
  const subjectSelect = document.getElementById('subject'); // ✅ Fixed ID
  const dateSelect = document.getElementById('date');
  const customDateInput = document.getElementById('customDate');

  // Course-to-semester-subject mapping
  const courseSemesters = {
    "1st Year, BS": {
      "Sem 1": [
        "Intro To Calculus",
        "Physics For Data Scientists",
        "Engineering Calculations",
        "Basics Of Computing",
        "Writing For Self"
      ],
      "Sem 2": [
        "Discrete Math",
        "Intro To Probability",
        "Intro To Engg Principles",
        "Chemistry For DS",
        "Writing For Seminar"
      ]
    },
    "2nd Year, BS": {
      "Sem 3": [
        "Statistical Theory For Engineers",
        "Programming And Data Structures",
        "Introduction To Optimization",
        "Programming For Engineers"
      ],
      "Sem 4": [
        "Design Of Algorithms",
        "Database Management Systems",
        "Foundations Of Machine Learning",
        "Machine Learning Lab",
        "Biology For Engineers"
      ]
    }
  };

  // Update semester dropdown when course changes
  courseSelect.addEventListener("change", () => {
    const selectedCourse = courseSelect.value;
    const semestersObj = courseSemesters[selectedCourse] || {};

    // Reset semester and subject dropdowns
    semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';
    subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';

    // Populate semesters
    Object.keys(semestersObj).forEach(sem => {
      const option = document.createElement("option");
      option.value = sem;
      option.textContent = sem;
      semesterSelect.appendChild(option);
    });
  });

  // Update subject dropdown when semester changes
  semesterSelect.addEventListener("change", () => {
    const selectedCourse = courseSelect.value;
    const selectedSemester = semesterSelect.value;
    const subjects = (courseSemesters[selectedCourse] || {})[selectedSemester] || [];

    // Reset subject dropdown
    subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';

    // Populate subjects
    subjects.forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      subjectSelect.appendChild(option);
    });
  });

  // ────────────────
  // ✅ Date Handling
  // ────────────────
  dateSelect.addEventListener('change', () => {
    const selectedDate = dateSelect.value;

    if (selectedDate === 'custom') {
      customDateInput.style.display = 'block';
      customDateInput.setAttribute('required', 'required');
    } else {
      customDateInput.style.display = 'none';
      customDateInput.removeAttribute('required');
    }
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedDate = dateSelect.value;
    let finalDate = '';

    if (selectedDate === 'custom') {
      finalDate = customDateInput.value;
      if (!finalDate) {
        alert("Please select a custom date.");
        return;
      }
    } else {
      finalDate = selectedDate; // 'today' or 'yesterday'
    }

    const formData = new FormData(form);
    formData.set('date', finalDate); // override if already exists

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server error during upload.');
      }
      return response.json();
    })
    .then(data => {
      alert(data.message || "Notes uploaded successfully!");
      form.reset();
      semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';
      subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
      customDateInput.style.display = 'none';
    })
    .catch(error => {
      console.error('Upload error:', error);
      alert('Failed to upload notes. Please try again.');
    });
  });

  // ─────────────────────────────
  // Admin Login Handler
  // ─────────────────────────────
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!username || !password) {
        alert("Please enter both username and password.");
        return;
      }

      fetch('/admin_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Login failed.");
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          alert("Login successful!");
          window.location.href = "/admin";
        } else {
          alert(data.message || "Invalid credentials.");
        }
      })
      .catch(error => {
        console.error("Login error:", error);
        alert("Error during login. Please try again.");
      });
    });
  }

  // ─────────────────────────────
  // Logout Button Handler
  // ─────────────────────────────
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('/admin/logout', {
        method: 'GET',
      })
      .then(response => {
        if (response.ok) {
          window.location.href = '/admin/logout';
        } else {
          alert('Logout failed.');
        }
      })
      .catch(error => {
        console.error("Logout error:", error);
        alert("Error during logout. Please try again.");
      });
    });
  }
});
