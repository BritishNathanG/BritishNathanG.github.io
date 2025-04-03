// Speech Synthesis API
const synth = window.speechSynthesis;

// Elements
const announceNowButton = document.getElementById('announceNow');
const scheduleButton = document.getElementById('schedule');
const announcementInput = document.getElementById('announcementText');
const timeInput = document.getElementById('time');
const scheduleList = document.getElementById('scheduleList');
const repeatSelect = document.getElementById('repeat');
const voiceSelect = document.getElementById('voice');
const speedInput = document.getElementById('speed');
const pitchInput = document.getElementById('pitch');
const beepSound = document.getElementById('beep');
const themeToggle = document.getElementById('toggleTheme');
const historyList = document.getElementById('historyList');
const clearHistoryButton = document.getElementById('clearHistory');
const exportButton = document.getElementById('exportData');
const importInput = document.getElementById('importData');

// Load stored schedules & history
let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

// Load available voices
function loadVoices() {
  voiceSelect.innerHTML = '';
  synth.getVoices().forEach((voice) => {
    const option = document.createElement('option');
    option.textContent = voice.name;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });
}
loadVoices();
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = loadVoices;
}

// Speak a message
function speakMessage(message, voice = voiceSelect.value) {
  if (!message.trim()) return;
  beepSound.play();
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = synth.getVoices().find(v => v.name === voice);
    utterance.rate = speedInput.value;
    utterance.pitch = pitchInput.value;
    synth.speak(utterance);
    saveToHistory(message);
  }, 1000);
}

// Manual announcement
announceNowButton.addEventListener('click', () => {
  speakMessage(announcementInput.value);
});

// Save to history
function saveToHistory(message) {
  const entry = { message, timestamp: new Date().toLocaleString() };
  history.push(entry);
  localStorage.setItem('history', JSON.stringify(history));
  updateHistoryList();
}

// Update history list
function updateHistoryList() {
  historyList.innerHTML = history.map(entry => `<li>${entry.timestamp}: ${entry.message}</li>`).join('');
}
updateHistoryList();

// Clear history
clearHistoryButton.addEventListener('click', () => {
  history = [];
  localStorage.removeItem('history');
  updateHistoryList();
});

// Schedule announcement
scheduleButton.addEventListener('click', () => {
  const message = announcementInput.value;
  const time = timeInput.value;
  const repeat = repeatSelect.value;

  if (!message || !time) {
    alert('Please enter a message and time.');
    return;
  }

  schedules.push({ message, time, repeat });
  localStorage.setItem('schedules', JSON.stringify(schedules));
  updateScheduleList();
  alert(`Scheduled at ${time}`);
});

// Update the displayed schedule
function updateScheduleList() {
  scheduleList.innerHTML = schedules.map(item => `<li>${item.time} - ${item.message} (${item.repeat})</li>`).join('');
}
updateScheduleList();

// Run scheduled announcements
setInterval(() => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  schedules.forEach((item) => {
    if (item.time === currentTime) {
      speakMessage(item.message);
      
      // Handle repeating announcements
      if (item.repeat === 'hourly') {
        item.time = new Date(Date.now() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (item.repeat === 'daily') {
        item.time = new Date(Date.now() + 86400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      localStorage.setItem('schedules', JSON.stringify(schedules));
      updateScheduleList();
    }
  });
}, 60000);

// Dark mode toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Export & Import Schedule
exportButton.addEventListener('click', () => {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(schedules))}`;
  const link = document.createElement('a');
  link.href = dataStr;
  link.download = 'schedule.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

importInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    schedules = JSON.parse(e.target.result);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    updateScheduleList();
  };
  reader.readAsText(file);
});
