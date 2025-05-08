document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const courseSelect = document.getElementById('course');
  const semesterSelect = document.getElementById('semester');
  const dateSelect = document.getElementById('date');
  const customDateInput = document.getElementById('customDate');

  // Course-to-semester mapping
  const courseSemesters = {
    "1st Year, BS": ["Sem 1", "Sem 2"],
    "2nd Year, BS": ["Sem 3", "Sem 4"]
  };

  // Update semester dropdown when course changes
  courseSelect.addEventListener("change", () => {
    const selectedCourse = courseSelect.value;
    const semesters = courseSemesters[selectedCourse] || [];

    // Clear and reset semester options
    semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';

    // Populate semesters
    semesters.forEach(sem => {
      const option = document.createElement("option");
      option.value = sem;
      option.textContent = sem;
      semesterSelect.appendChild(option);
    });
  });

  // Handle date dropdown change
  dateSelect.addEventListener('change', () => {
    const selectedDate = dateSelect.value;

    // Show the custom date input if "Custom" is selected
    if (selectedDate === 'custom') {
      customDateInput.style.display = 'block'; // Show date picker
    } else {
      customDateInput.style.display = 'none'; // Hide date picker
    }
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();  // Prevent form submission

    // Get the selected date value
    const selectedDate = dateSelect.value;
    let finalDate = '';

    // Handle different date options and format them correctly as ddmmyyyy
    if (selectedDate === 'today') {
      finalDate = 'today';
    } else if (selectedDate === 'yesterday') {
      finalDate = "yesterday";
    } else if (selectedDate === 'custom') {
      finalDate = customDateInput.value; // The selected custom date in yyyy-mm-dd format
    }

    // Append the selected date to the form data
    const formData = new FormData(form);
    formData.append('date', finalDate);  // Send the formatted date

    // Submit the form data via fetch
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
            window.location.href = "/admin"; // Redirect on success
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
});


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
          window.location.href = '/admin/logout'; // Redirect to login page
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
