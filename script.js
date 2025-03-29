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

function populateVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.textContent = voice.name;
    option.value = index;
    voiceSelect.appendChild(option);
  });
}

function speakMessage() {
  const message = announcementInput.value;
  if (!message) return;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = voices[currentVoice] || voices[0];
  utterance.rate = currentSpeed;
  utterance.pitch = currentPitch;

  synth.speak(utterance);
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
}

voiceSelect.addEventListener('change', (e) => {
  currentVoice = e.target.value;
});

speedInput.addEventListener('input', (e) => {
  currentSpeed = e.target.value;
});

pitchInput.addEventListener('input', (e) => {
  currentPitch = e.target.value;
});

announceButton.addEventListener('click', speakMessage);
themeToggle.addEventListener('click', toggleTheme);

window.addEventListener('load', populateVoices);
