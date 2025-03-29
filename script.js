let voices = [];
let currentVoice = null;
let currentSpeed = 1;
let currentPitch = 1;

const announcementInput = document.getElementById('announcementInput');
const announceButton = document.getElementById('announceButton');
const voiceSelect = document.getElementById('voiceSelect');
const speedInput = document.getElementById('speed');
const pitchInput = document.getElementById('pitch');
const themeToggle = document.getElementById('themeToggle');

const synth = window.speechSynthesis;

// Set up particles.js
particlesJS('particles-js', {
  particles: {
    number: { value: 100 },
    size: { value: 3 },
    move: { speed: 1 }
  }
});

// Function to populate the voice selection
function populateVoices() {
  voices = synth.getVoices();

  // Ensure voices are loaded correctly
  if (voices.length === 0) {
    setTimeout(populateVoices, 100); // Retry after 100ms if voices aren't available
    return;
  }

  voiceSelect.innerHTML = '';
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.textContent = voice.name;
    option.value = index;
    voiceSelect.appendChild(option);
  });

  // Set default voice if available
  if (voices.length > 0) {
    currentVoice = 0; // Default to first available voice
    voiceSelect.value = currentVoice;
  }
}

// Function to speak the message
function speakMessage() {
  const message = announcementInput.value;
  if (!message) return;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = voices[currentVoice] || voices[0];
  utterance.rate = currentSpeed;
  utterance.pitch = currentPitch;

  synth.speak(utterance);
}

// Function to toggle theme
function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
}

// Event Listeners
voiceSelect.addEventListener('change', (e) => {
  currentVoice = e.target.value;
});

speedInput.addEventListener('input', (e) => {
  currentSpeed = e.target
