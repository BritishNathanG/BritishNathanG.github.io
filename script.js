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
const effectSelect = document.getElementById('effect');
const webhookUrlInput = document.getElementById('webhookUrl');
const testWebhookButton = document.getElementById('testWebhook');
const beepSound = document.getElementById('beep');
const bgMusicInput = document.getElementById('bgMusic');
const bgAudio = document.getElementById('bgAudio');
const statsCount = document.getElementById('statsCount');
const countdownTimer = document.getElementById('countdown');

// Load stored data
let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { announcementsMade: 0 };

// Load voices
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

// Apply voice effect
function applyEffect(text, effect) {
  switch (effect) {
    case 'echo': return text + " ... " + text;
    case 'robot': return text.split('').join(' ');
    case 'whisper': return text.toLowerCase();
    default: return text;
  }
}

// Speak message
function speakMessage(message, voice, effect) {
  if (!message.trim()) return;
  beepSound.play();
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(applyEffect(message, effect));
    utterance.voice = synth.getVoices().find(v => v.name === voice);
    synth.speak(utterance);
    stats.announcementsMade++;
    localStorage.setItem('stats', JSON.stringify(stats));
    updateStats();
  }, 1000);
}

// Update stats
function updateStats() {
  statsCount.textContent = stats.announcementsMade;
}
updateStats();

// Manual announcement
announceNowButton.addEventListener('click', () => {
  speakMessage(announcementInput.value, voiceSelect.value, effectSelect.value);
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

// Countdown timer
setInterval(() => {
  if (schedules.length === 0) {
    countdownTimer.textContent = 'N/A';
    return;
  }
  const now = new Date();
  const nextSchedule = schedules[0].time;
  const [hours, minutes] = nextSchedule.split(':');
  const nextTime = new Date();
  nextTime.setHours(hours, minutes, 0, 0);
  let diff = (nextTime - now) / 1000;
  let min = Math.floor(diff / 60);
  let sec = Math.floor(diff % 60);
  countdownTimer.textContent = `${min}:${sec}`;
}, 1000);

// Test Webhook
testWebhookButton.addEventListener('click', () => {
  fetch(webhookUrlInput.value, {
    method: 'POST',
    body: JSON.stringify({ message: "Test Announcement!" }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(data => alert('Webhook sent successfully!'))
  .catch(err => alert('Webhook failed!'));
});

// Play background music
bgMusicInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    bgAudio.src = url;
    bgAudio.play();
  }
});
