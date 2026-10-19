// DOM Element References
const courseInput = document.getElementById('courseInput');
const registerBtn = document.getElementById('registerBtn');
const clearBtn = document.getElementById('clearBtn');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');

const totalProcessedEl = document.getElementById('totalProcessed');
const totalRegisteredEl = document.getElementById('totalRegistered');
const totalDuplicatesEl = document.getElementById('totalDuplicates');

const historyGrid = document.getElementById('historyGrid');
const emptyState = document.getElementById('emptyState');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const presetButtons = document.querySelectorAll('.btn-preset');

// State Tracking Metrics
let stats = {
  processed: 0,
  registered: 0,
  duplicates: 0
};

// Main Course Registration Logic Function
function processRegistration() {
  const rawInput = courseInput.value.trim();

  // Validate Input
  if (!rawInput) {
    resultText.textContent = "⚠️ Please enter registration text first.";
    return;
  }

  // Split input into Student Name and Courses list using '|'
  const parts = rawInput.split('|');

  if (parts.length < 2) {
    resultText.textContent = "⚠️ Format Error: Use 'Student Name | Course 1, Course 2'";
    return;
  }

  const studentName = parts[0].trim() || "Student";
  const coursesRaw = parts[1].split(',');

  const seenCourses = new Set();
  const outputStatuses = [];
  const cardBadgeItems = [];

  let newRegistrationsCount = 0;
  let duplicatesCount = 0;

  // Loop through courses and check for duplicates
  coursesRaw.forEach(courseStr => {
    const course = courseStr.trim();
    if (!course) return;

    const normalizedKey = course.toLowerCase();

    if (seenCourses.has(normalizedKey)) {
      outputStatuses.push(`${course} already registered`);
      cardBadgeItems.push({ name: course, isDuplicate: true });
      duplicatesCount++;
    } else {
      seenCourses.add(normalizedKey);
      outputStatuses.push(`${course} registered`);
      cardBadgeItems.push({ name: course, isDuplicate: false });
      newRegistrationsCount++;
    }
  });

  if (outputStatuses.length === 0) {
    resultText.textContent = "⚠️ No valid courses were found in the input.";
    return;
  }

  // Join result to match expected output format:
  // "Java registered | SQL registered | Java already registered"
  const formattedOutput = outputStatuses.join(' | ');
  resultText.textContent = formattedOutput;

  // Update State Dashboard Stats
  stats.processed += (newRegistrationsCount + duplicatesCount);
  stats.registered += newRegistrationsCount;
  stats.duplicates += duplicatesCount;
  updateDashboardUI();

  // Append new card record in History section
  addHistoryCard(studentName, cardBadgeItems);
}

// Update Dashboard Numbers
function updateDashboardUI() {
  totalProcessedEl.textContent = stats.processed;
  totalRegisteredEl.textContent = stats.registered;
  totalDuplicatesEl.textContent = stats.duplicates;
}

// Render Student History Card
function addHistoryCard(studentName, courseBadges) {
  if (emptyState) {
    emptyState.style.display = 'none';
  }

  const card = document.createElement('div');
  card.className = 'student-card';

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Build badge HTML tags
  const tagsHTML = courseBadges.map(item => {
    if (item.isDuplicate) {
      return `<span class="tag tag-warning">⚠️ ${item.name} (Duplicate)</span>`;
    } else {
      return `<span class="tag tag-success">✓ ${item.name}</span>`;
    }
  }).join('');

  card.innerHTML = `
    <div class="student-card-header">
      <span class="student-name">👤 ${studentName}</span>
      <span class="timestamp">${currentTime}</span>
    </div>
    <div class="course-tags">
      ${tagsHTML}
    </div>
  `;

  // Prepend card to top of list
  historyGrid.insertBefore(card, historyGrid.firstChild);
}

// Preset button handlers
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    courseInput.value = btn.getAttribute('data-sample');
  });
});

// Clear input button
clearBtn.addEventListener('click', () => {
  courseInput.value = '';
  resultText.textContent = 'Click "Process Registration" to view output string.';
});

// Copy Output text
copyBtn.addEventListener('click', () => {
  const textToCopy = resultText.textContent;
  if (textToCopy && !textToCopy.startsWith('⚠️') && !textToCopy.startsWith('Click')) {
    navigator.clipboard.writeText(textToCopy);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = originalText, 1500);
  }
});

// Clear history feed
clearHistoryBtn.addEventListener('click', () => {
  historyGrid.innerHTML = '';
  historyGrid.appendChild(emptyState);
  emptyState.style.display = 'block';

  // Reset Stats
  stats = { processed: 0, registered: 0, duplicates: 0 };
  updateDashboardUI();
});

// Event Listener for Process Button
registerBtn.addEventListener('click', processRegistration);

// Allow pressing 'Enter' key in input field
courseInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    processRegistration();
  }
});