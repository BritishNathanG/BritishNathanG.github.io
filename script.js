let voices = [];
let currentVoice = null;
let currentSpeed = 1;
let currentPitch = 1;
let currentTextSize = 16;
let currentTextColor = "#ffffff";
let currentFont = "Arial";
let history = [];

const announcementInput = document.getElementById('announcementInput');
const announceButton = document.getElementById('announceButton');
const voiceSelect = document.getElementById('voiceSelect');
const speedInput = document.getElementById('speed');
const pitchInput = document.getElementById('pitch');
const themeToggle = document.getElementById('themeToggle');
const textSizeInput = document.getElementById('textSize');
const textColorInput = document.getElementById('textColor');
const fontSelect = document.getElementById('fontSelect');
const historyList = document.getElementById('historyList');

const synth = window.speechSynthesis;

// Set up particles.js
particlesJS('particles-js', {
  particles: {
    number: { value: 100 },
    size: { value: 3 },
    move: { speed: 1 },
    shape: { type: 'circle' },
    color: { value: "#ffffff" }
  }
});

// Function to populate the voice selection
function populateVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.textContent = voice.name;
    option.value = index;
    voiceSelect.appendChild(option);
  });

  // Set default voice if available
  if (voices.length > 0) {
    currentVoice = 0;
    voiceSelect.value = currentVoice;
  }
}

// Function to speak the message
function speakMessage() {
  const message = announcementInput.value;
  if (!message) return;

  // Create speech utterance
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = voices[currentVoice] || voices[0];
  utterance.rate = currentSpeed;
  utterance.pitch = currentPitch;

  // Speak the message
  synth.speak(utterance);

  // Save announcement to history
  history.push(message);
  if (history.length > 5) {
    history.shift(); // Limit history to 5 items
  }

  // Update history UI
  updateHistory();
}

// Function to toggle theme
function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
}

// Function to update history UI
function updateHistory() {
  historyList.innerHTML = '';
  history.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    historyList.appendChild(listItem);
  });
}

// Event Listeners
voiceSelect.addEventListener('change', (e) => {
  currentVoice = e.target.value;
});

speedInput.addEventListener('input', (e) => {
  currentSpeed = e.target.value;
});

pitchInput.addEventListener('input', (e) => {
  currentPitch = e.target.value;
});

textSizeInput.addEventListener('input', (e) => {
  currentTextSize = e.target.value;
  announcementInput.style.fontSize = `${currentTextSize}px`;
});

textColorInput.addEventListener('input', (e) => {
  currentTextColor = e.target.value;
  announcementInput.style.color = currentTextColor;
});

fontSelect.addEventListener('change', (e) => {
  currentFont = e.target.value;
  announcementInput.style.fontFamily = currentFont;
});

announceButton.addEventListener('click', speakMessage);
themeToggle.addEventListener('click', toggleTheme);

// Populate voices once the page is fully loaded
window.addEventListener('load', () => {
  populateVoices();

  // Watch for changes in available voices if they get updated
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      populateVoices();
    };
  }
});
