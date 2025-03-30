// script.js

let voices = [];
let currentVoice = 0;
let currentSpeed = 1;
let currentPitch = 1;

const synth = window.speechSynthesis;
const announcementInput = document.getElementById('announcementInput');
const announceButton = document.getElementById('announceButton');
const voiceSelect = document.getElementById('voiceSelect');
const speedInput = document.getElementById('speed');
const pitchInput = document.getElementById('pitch');
const customScheduleForm = document.getElementById('customScheduleForm');
const customHourInput = document.getElementById('customHour');
const customMinuteInput = document.getElementById('customMinute');
const customMessageInput = document.getElementById('customMessage');
const countdownTimer = document.getElementById('countdownTimer');
const toggleThemeButton = document.getElementById('toggleTheme');

let userSchedules = [];

// Example pre-defined schedule (you can customize these times/messages)
const schedule = [
  { hour: 9, minute: 0, message: 'Good Morning, everyone!' },
  { hour: 12, minute: 0, message: 'It\'s lunchtime, take a break!' },
  { hour: 15, minute: 30, message: 'Time for an afternoon stretch!' },
  { hour: 18, minute: 0, message: 'Good evening, time to wrap up!' }
];

// Populate voices for speech synthesis
function populateVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.textContent = voice.name;
    option.value = index;
    voiceSelect.appendChild(option);
  });
  currentVoice = voices.length > 0 ? 0 : null;
}

function speakMessage(message) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = voices[currentVoice];
  utterance.rate = currentSpeed;
  utterance.pitch = currentPitch;
  synth.speak(utterance);
}

function updateCountdown() {
  const now = new Date();
  let nextAnnouncement = null;

  // Find the next scheduled announcement
  for (const event of [...schedule, ...userSchedules]) {
    const eventTime = new Date();
    eventTime.setHours(event.hour);
    eventTime.setMinutes(event.minute);
    eventTime.setSeconds(0);

    if (eventTime > now) {
      nextAnnouncement = eventTime;
      break;
    }
  }

  if (nextAnnouncement) {
    const timeDiff = nextAnnouncement - now;
    const minutesLeft = Math.floor(timeDiff / 60000);
    const secondsLeft = Math.floor((timeDiff % 60000) / 1000);
    countdownTimer.textContent = `Next announcement in: ${minutesLeft}m ${secondsLeft}s`;
  }
}

function checkSchedule() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  [...schedule, ...userSchedules].forEach((event) => {
    if (event.hour === currentHour && event.minute === currentMinute) {
      speakMessage(event.message);
    }
  });
}

function showNotification(message) {
  if (Notification.permission === 'granted') {
    new Notification('Scheduled Announcement', { body: message });
  }
}

function saveSettings() {
  localStorage.setItem('selectedVoice', currentVoice);
  localStorage.setItem('speed', currentSpeed);
  localStorage.setItem('pitch', currentPitch);
}

// Load settings from local storage
function loadSettings() {
  const savedVoice = localStorage.getItem('selectedVoice');
  const savedSpeed = localStorage.getItem('speed');
  const savedPitch = localStorage.getItem('pitch');

  if (savedVoice !== null) currentVoice = savedVoice;
  if (savedSpeed !== null) currentSpeed = savedSpeed;
  if (savedPitch !== null) currentPitch = savedPitch;
}

// Handle custom schedule form submission
customScheduleForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const hour = parseInt(customHourInput.value, 10);
  const minute = parseInt(customMinuteInput.value, 10);
  const message = customMessageInput.value.trim();

  if (hour >= 0 && minute >= 0 && message) {
    userSchedules.push({ hour, minute, message });
    alert('Custom announcement added!');
    saveSettings();
  }
});

// Handle theme toggle
toggleThemeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  saveSettings();
});

// Handle voice selection
voiceSelect.addEventListener('change', (e) => {
  currentVoice = e.target.value;
  saveSettings();
});

// Handle speed and pitch
speedInput.addEventListener('input', (e) => {
  currentSpeed = e.target.value;
  saveSettings();
});

pitchInput.addEventListener('input', (e) => {
  currentPitch = e.target.value;
  saveSettings();
});

// Manual announcement button click
announceButton.addEventListener('click', () => {
  const message = announcementInput.value;
  if (message) {
    speakMessage(message);
  }
});

// Load settings on page load
window.addEventListener('load', () => {
  if (speechSynthesis.getVoices().length === 0) {
    setTimeout(populateVoices, 1000);  // Retry after 1 second if voices are not loaded
  } else {
    populateVoices();
  }

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }

  loadSettings();
  updateCountdown();
  setInterval(checkSchedule, 60000); // Check every minute
  setInterval(updateCountdown, 1000); // Update countdown every second

  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
});
