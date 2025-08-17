document.addEventListener('DOMContentLoaded', () => {
  const { qs, showNotification } = window.Utils;

  const form = qs('#uploadForm');
  const courseSelect = qs('#course');
  const semesterSelect = qs('#semester');
  const subjectSelect = qs('#subject');
  const dateSelect = qs('#date');
  const customDateInput = qs('#customDate');

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

  courseSelect?.addEventListener('change', () => {
    const semestersObj = courseSemesters[courseSelect.value] || {};
    semesterSelect.innerHTML = '-- Select Semester --';
    subjectSelect.innerHTML = '-- Select Subject --';
    Object.keys(semestersObj).forEach(sem => {
      const option = document.createElement('option');
      option.value = sem;
      option.textContent = sem;
      semesterSelect.appendChild(option);
    });
  });

  semesterSelect?.addEventListener('change', () => {
    const selectedCourse = courseSelect.value;
    const selectedSemester = semesterSelect.value;
    const subjects = (courseSemesters[selectedCourse] || {})[selectedSemester] || [];
    subjectSelect.innerHTML = '-- Select Subject --';
    subjects.forEach(sub => {
      const option = document.createElement('option');
      option.value = sub;
      option.textContent = sub;
      subjectSelect.appendChild(option);
    });
  });

  dateSelect?.addEventListener('change', () => {
    const selectedDate = dateSelect.value;
    if (selectedDate === 'custom') {
      customDateInput.style.display = 'block';
      customDateInput.setAttribute('required', 'required');
    } else {
      customDateInput.style.display = 'none';
      customDateInput.removeAttribute('required');
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedDate = dateSelect.value;
    let finalDate = '';

    if (selectedDate === 'custom') {
      finalDate = customDateInput.value;
      if (!finalDate) {
        alert('Please select a custom date.');
        return;
      }
    } else {
      finalDate = selectedDate;
    }

    const formData = new FormData(form);
    formData.set('date', finalDate);

    try {
      const data = await Api.adminUpload(formData);
      showNotification(data.message || 'Notes uploaded successfully!', 'success');
      form.reset();
      semesterSelect.innerHTML = '-- Select Semester --';
      subjectSelect.innerHTML = '-- Select Subject --';
      customDateInput.style.display = 'none';
    } catch (err) {
      console.error('Upload error:', err);
      showNotification('Failed to upload notes. Please try again.', 'error');
    }
  });

  const logoutBtn = qs('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = '/admin/logout';
    });
  }
});
