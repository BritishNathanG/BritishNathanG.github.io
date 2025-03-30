// Initialize the Speech Synthesis API
const synth = window.speechSynthesis;

// Elements
const announceButton = document.getElementById('announceButton');
const announcementInput = document.getElementById('announcementInput');
const historyList = document.getElementById('announcementHistory');
const clearHistoryButton = document.getElementById('clearHistoryButton');

// Retrieve stored history from localStorage (if any)
let announcementHistory = JSON.parse(localStorage.getItem('announcementHistory')) || [];

// Available Voices
let voices = [];
const voiceSelect = document.createElement('select');
document.body.appendChild(voiceSelect);

// Populate voice select dropdown with available voices
function populateVoiceList() {
  voices = synth.getVoices();
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.textContent = voice.name;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });
}

populateVoiceList();
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = populateVoiceList;
}

// Set default voice to the first available voice
let currentVoice = voices[0] ? voices[0].name : 'Google US English';

// Function to update the history section
function updateHistory() {
  historyList.innerHTML = '';
  announcementHistory.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.timestamp}: ${entry.message}`;
    historyList.appendChild(li);
  });
}

// Function to save a new announcement to history
function saveAnnouncementToHistory(message) {
  const timestamp = new Date().toLocaleString();
  const newEntry = { message, timestamp };
  announcementHistory.push(newEntry);
  localStorage.setItem('announcementHistory', JSON.stringify(announcementHistory));
  updateHistory();
}

// Function to speak the message and save it to history
function speakMessage(message) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = voices.find(voice => voice.name === currentVoice);
  utterance.rate = 1;
  utterance.pitch = 1;
  synth.speak(utterance);

  // Save this announcement to the history after it's spoken
  saveAnnouncementToHistory(message);
}

// Manual announcement button click
announceButton.addEventListener('click', () => {
  const message = announcementInput.value;
  if (message) {
    speakMessage(message);
  }
});

// Clear History button functionality
clearHistoryButton.addEventListener('click', () => {
  localStorage.removeItem('announcementHistory');
  announcementHistory = [];
  updateHistory();
});

// Load history when the page loads
window.addEventListener('load', () => {
  updateHistory();
});
