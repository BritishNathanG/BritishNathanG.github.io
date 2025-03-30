// Initialize the Speech Synthesis API
const synth = window.speechSynthesis;

// Elements
const announceButton = document.getElementById('announceButton');
const announcementInput = document.getElementById('announcementInput');
const historyList = document.getElementById('announcementHistory');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const scheduleButton = document.getElementById('scheduleButton');
const scheduleTimeInput = document.getElementById('scheduleTime');
const scheduleRepeatSelect = document.getElementById('scheduleRepeat');
const scheduleVoiceSelect = document.getElementById('scheduleVoice');
const upcomingAnnouncementsList = document.getElementById('upcomingAnnouncements');

// Retrieve stored history and upcoming announcements from localStorage (if any)
let announcementHistory = JSON.parse(localStorage.getItem('announcementHistory')) || [];
let upcomingAnnouncements = JSON.parse(localStorage.getItem('upcomingAnnouncements')) || [];

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
    scheduleVoiceSelect.appendChild(option);
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

// Function to update the upcoming announcements list
function updateUpcoming() {
  upcomingAnnouncementsList.innerHTML = '';
  upcomingAnnouncements.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${entry.timestamp} - ${entry.message}`;
    upcomingAnnouncementsList.appendChild(li);
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
function speakMessage(message, voice = currentVoice) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = voices.find(v => v.name === voice);
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

// Function to schedule an announcement
function scheduleAnnouncement(time, message, repeat = 'none', voice = currentVoice) {
  const [hours, minutes] = time.split(':');
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0); // Set the scheduled time

  // Calculate time difference between now and the scheduled time
  const now = new Date();
  const delay = scheduledTime - now;

  // If the scheduled time is in the future, schedule the announcement
  if (delay > 0) {
    const scheduleDetails = { message, timestamp: scheduledTime.toLocaleString(), repeat };
    upcomingAnnouncements.push(scheduleDetails);
    localStorage.setItem('upcomingAnnouncements', JSON.stringify(upcomingAnnouncements));
    updateUpcoming();

    setTimeout(() => {
      speakMessage(message, voice);

      // Handle repeating announcements
      if (repeat === 'hourly') {
        scheduleAnnouncement(time, message, repeat, voice);
      } else if (repeat === 'daily') {
        const nextDay = new Date(scheduledTime);
        nextDay.setDate(nextDay.getDate() + 1);
        scheduleAnnouncement(nextDay.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), message, repeat, voice);
      }
    }, delay);
  } else {
    alert("Please choose a future time for the announcement.");
  }
}

// Scheduled announcement button click
scheduleButton.addEventListener('click', () => {
  const scheduledTime = scheduleTimeInput.value;
  const message = announcementInput.value;
  const repeat = scheduleRepeatSelect.value;
  const voice = scheduleVoiceSelect.value === 'default' ? currentVoice : scheduleVoiceSelect.value;

  if (scheduledTime && message) {
    scheduleAnnouncement(scheduledTime, message, repeat, voice);
    alert(`Announcement scheduled for ${scheduledTime}`);
  }
});

// Load history and upcoming announcements when the page loads
window.addEventListener('load', () => {
  updateHistory();
  updateUpcoming();
});
