let voices = [];
let currentVoice = null;

const synth = window.speechSynthesis;
const voiceSelect = document.getElementById('voiceSelect');
const announceButton = document.getElementById('announceButton');
const announcementInput = document.getElementById('announcementInput');

// Populate voices after the page load
function populateVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = ''; // Clear the current voice options

  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.textContent = voice.name;
    option.value = index;
    voiceSelect.appendChild(option);
  });

  // Set the default voice (if available)
  if (voices.length > 0) {
    currentVoice = voices[0]; // Default voice
    voiceSelect.value = 0; // Set the first voice as selected
  }
}

// Ensure voices are loaded
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = function() {
    populateVoices();
  };
} else {
  populateVoices(); // Fallback if no `onvoiceschanged` is supported
}

// Trigger the announcement
function speakMessage() {
  const message = announcementInput.value;
  if (!message) return;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = voices[currentVoice] || voices[0]; // Use selected or default voice
  utterance.rate = 1; // Default speed
  utterance.pitch = 1; // Default pitch

  synth.speak(utterance);
}

// Event listener to change voice
voiceSelect.addEventListener('change', function() {
  currentVoice = voices[voiceSelect.value]; // Update the selected voice
});

// Event listener for the announce button
announceButton.addEventListener('click', speakMessage);

// Initial population of voices (wait for the page to fully load)
window.addEventListener('load', () => {
  if (speechSynthesis.getVoices().length === 0) {
    // Delay loading if voices are initially empty
    setTimeout(populateVoices, 1000); // Try again after 1 second
  } else {
    populateVoices();
  }
});
