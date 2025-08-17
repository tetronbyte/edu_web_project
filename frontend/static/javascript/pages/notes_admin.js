/* ========= Admin Notes Management Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, formToJSON } = window.Utils;

    // DOM elements
    const form = qs('#uploadForm');
    const courseSelect = qs('#course');
    const semesterSelect = qs('#semester');
    const subjectSelect = qs('#subject');
    const dateSelect = qs('#date');
    const customDateInput = qs('#customDate');
    const fileInput = qs('#notesFile');
    const uploadArea = qs('#uploadArea');

    // Course data
    const courseSemesters = {
        '1st Year, BS': {
            'Sem 1': [
                'Intro To Calculus',
                'Physics For Data Scientists',
                'Engineering Calculations',
                'Basics Of Computing',
                'Writing For Self'
            ],
            'Sem 2': [
                'Discrete Math',
                'Intro To Probability',
                'Intro To Engg Principles',
                'Chemistry For DS',
                'Writing For Seminar'
            ]
        },
        '2nd Year, BS': {
            'Sem 3': [
                'Statistical Theory For Engineers',
                'Programming And Data Structures',
                'Introduction To Optimization',
                'Programming For Engineers'
            ],
            'Sem 4': [
                'Design Of Algorithms',
                'Database Management Systems',
                'Foundations Of Machine Learning',
                'Machine Learning Lab',
                'Biology For Engineers'
            ]
        }
    };

    // Initialize
    setupEventListeners();
    setupDragAndDrop();

    // Setup event listeners
    function setupEventListeners() {
        // Cascading dropdowns
        if (courseSelect && semesterSelect && subjectSelect) {
            courseSelect.addEventListener('change', handleCourseChange);
            semesterSelect.addEventListener('change', handleSemesterChange);
        }

        // Custom date field
        if (dateSelect && customDateInput) {
            dateSelect.addEventListener('change', handleDateChange);
        }

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }

        // Form submission
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
    }

    // Handle course selection change
    function handleCourseChange() {
        const selectedCourse = courseSelect.value;
        const semesters = courseSemesters[selectedCourse] || {};

        // Reset dependent dropdowns
        semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';
        subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';

        // Populate semesters
        Object.keys(semesters).forEach(semester => {
            const option = document.createElement('option');
            option.value = option.textContent = semester;
            semesterSelect.appendChild(option);
        });
    }

    // Handle semester selection change
    function handleSemesterChange() {
        const selectedCourse = courseSelect.value;
        const selectedSemester = semesterSelect.value;
        const subjects = (courseSemesters[selectedCourse] || {})[selectedSemester] || [];

        // Reset subject dropdown
        subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';

        // Populate subjects
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    }

    // Handle date selection change
    function handleDateChange() {
        const selectedDate = dateSelect.value;

        if (selectedDate === 'custom') {
            customDateInput.style.display = 'block';
            customDateInput.required = true;
            customDateInput.focus();
        } else {
            customDateInput.style.display = 'none';
            customDateInput.required = false;
        }
    }

    // Handle file selection
    function handleFileSelect(event) {
        const files = event.target.files;
        updateUploadAreaDisplay(files);
    }

    // Setup drag and drop functionality
    function setupDragAndDrop() {
        if (!uploadArea || !fileInput) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', handleDrop, false);

        // Click to select files
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight() {
            uploadArea.classList.add('drag-over');
        }

        function unhighlight() {
            uploadArea.classList.remove('drag-over');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            fileInput.files = files;
            updateUploadAreaDisplay(files);
        }
    }

    // Update upload area display
    function updateUploadAreaDisplay(files) {
        if (!uploadArea) return;

        if (files && files.length > 0) {
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            uploadArea.innerHTML = `
                <div class="upload-icon">📄</div>
                <p><strong>Selected files:</strong></p>
                <p class="upload-hint">${fileNames}</p>
                <p><small>Click to select different files or drag new ones here</small></p>
            `;
        } else {
            uploadArea.innerHTML = `
                <div class="upload-icon">📁</div>
                <p>Drag and drop your notes here</p>
                <p class="upload-hint">or click to browse files</p>
            `;
        }
    }

    // Handle form submission
    async function handleFormSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData = new FormData(form);
        
        // Handle custom date
        const selectedDate = dateSelect.value;
        if (selectedDate === 'custom') {
            formData.set('date', customDateInput.value);
        } else {
            formData.set('date', selectedDate);
        }

        try {
            showUploading();
            const result = await Api.admin.uploadNotes(formData);
            
            showNotification(result.message || 'Notes uploaded successfully!', 'success');
            resetForm();
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('Failed to upload notes. Please try again.', 'error');
        } finally {
            hideUploading();
        }
    }

    // Validate form
    function validateForm() {
        const course = courseSelect.value;
        const semester = semesterSelect.value;
        const subject = subjectSelect.value;
        const date = dateSelect.value;
        const customDate = customDateInput.value;
        const files = fileInput.files;

        if (!course) {
            showNotification('Please select a course.', 'error');
            courseSelect.focus();
            return false;
        }

        if (!semester) {
            showNotification('Please select a semester.', 'error');
            semesterSelect.focus();
            return false;
        }

        if (!subject) {
            showNotification('Please select a subject.', 'error');
            subjectSelect.focus();
            return false;
        }

        if (!date) {
            showNotification('Please select a date.', 'error');
            dateSelect.focus();
            return false;
        }

        if (date === 'custom' && !customDate) {
            showNotification('Please select a custom date.', 'error');
            customDateInput.focus();
            return false;
        }

        if (!files || files.length === 0) {
            showNotification('Please select at least one file to upload.', 'error');
            fileInput.focus();
            return false;
        }

        // Validate file types (optional)
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'];
        const invalidFiles = Array.from(files).filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return !allowedTypes.includes(extension);
        });

        if (invalidFiles.length > 0) {
            showNotification(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Allowed types: ${allowedTypes.join(', ')}`, 'error');
            return false;
        }

        return true;
    }

    // Show uploading state
    function showUploading() {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;
        }
    }

    // Hide uploading state
    function hideUploading() {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Upload Notes';
            submitBtn.disabled = false;
        }
    }

    // Reset form
    function resetForm() {
        if (form) {
            form.reset();
        }

        // Reset dropdowns
        if (semesterSelect) {
            semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';
        }
        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        }

        // Hide custom date
        if (customDateInput) {
            customDateInput.style.display = 'none';
            customDateInput.required = false;
        }

        // Reset upload area
        updateUploadAreaDisplay(null);
    }

    // Auto-save form data (except files)
    function autoSaveFormData() {
        if (!form) return;

        const formData = {
            course: courseSelect?.value || '',
            semester: semesterSelect?.value || '',
            subject: subjectSelect?.value || '',
            date: dateSelect?.value || '',
            customDate: customDateInput?.value || ''
        };

        Utils.storage.set('admin_notes_form', formData);
    }

    // Restore form data
    function restoreFormData() {
        const savedData = Utils.storage.get('admin_notes_form');
        if (!savedData) return;

        if (courseSelect && savedData.course) {
            courseSelect.value = savedData.course;
            handleCourseChange();
        }

        if (semesterSelect && savedData.semester) {
            setTimeout(() => {
                semesterSelect.value = savedData.semester;
                handleSemesterChange();
            }, 100);
        }

        if (subjectSelect && savedData.subject) {
            setTimeout(() => {
                subjectSelect.value = savedData.subject;
            }, 200);
        }

        if (dateSelect && savedData.date) {
            dateSelect.value = savedData.date;
            handleDateChange();
        }

        if (customDateInput && savedData.customDate) {
            customDateInput.value = savedData.customDate;
        }
    }

    // Save form data on change
    [courseSelect, semesterSelect, subjectSelect, dateSelect, customDateInput].forEach(element => {
        if (element) {
            element.addEventListener('change', autoSaveFormData);
        }
    });

    // Restore saved form data on load
    restoreFormData();

    // Clear saved data on successful upload
    form?.addEventListener('submit', () => {
        setTimeout(() => {
            Utils.storage.remove('admin_notes_form');
        }, 1000);
    });
});
