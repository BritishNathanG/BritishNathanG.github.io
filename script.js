// Speech Synthesis API
const synth = window.speechSynthesis;

// Get Elements
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

// ✅ FIX: Properly load voices with delay
function loadVoices() {
  const voices = synth.getVoices();
  if (voices.length === 0) {
    console.log("Retrying voice load...");
    setTimeout(loadVoices, 500);
    return;
  }

  console.log("Voices Loaded:", voices.length);
  voiceSelect.innerHTML = '';
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.textContent = voice.name;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });

  // Select a default voice
  if (voices.length > 0) {
    voiceSelect.value = voices[0].name;
  }
}

// Fix voice loading for Chrome
window.speechSynthesis.onvoiceschanged = loadVoices;
setTimeout(loadVoices, 1000);

// ✅ FIX: Voice Effects
function applyEffect(text, effect) {
  switch (effect) {
    case 'echo': return text + " ... " + text;
    case 'robot': return text.split('').join(' ');
    case 'whisper': return text.toLowerCase();
    default: return text;
  }
}

// ✅ FIX: Ensure speech always works
function speakMessage(message, voice, effect) {
  if (!message.trim()) return;

  // Ensure voices are loaded
  const availableVoices = synth.getVoices();
  if (availableVoices.length === 0) {
    alert("No voices found! Please refresh.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(applyEffect(message, effect));
  utterance.voice = availableVoices.find(v => v.name === voice) || availableVoices[0];

  console.log("Speaking with voice:", utterance.voice.name);

  // Stop ongoing speech before starting
  if (synth.speaking) {
    synth.cancel();
    setTimeout(() => synth.speak(utterance), 100);
  } else {
    synth.speak(utterance);
  }

  // Play beep sound before announcement
  beepSound.play();

  // Update statistics
  stats.announcementsMade++;
  localStorage.setItem('stats', JSON.stringify(stats));
  updateStats();
}

// ✅ FIX: Update Statistics
function updateStats() {
  statsCount.textContent = stats.announcementsMade;
}
updateStats();

// ✅ FIX: Manual announcement button
announceNowButton.addEventListener('click', () => {
  speakMessage(announcementInput.value, voiceSelect.value, effectSelect.value);
});

// ✅ FIX: Schedule an announcement
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

// ✅ FIX: Countdown Timer Logic
setInterval(() => {
  if (schedules.length === 0) {
    countdownTimer.textContent = 'N/A';
    return;
  }

  const now = new Date();
  let nextAnnouncementTime = null;

  schedules.forEach(item => {
    const [hours, minutes] = item.time.split(':').map(Number);
    const scheduleTime = new Date();
    scheduleTime.setHours(hours, minutes, 0, 0);

    if (!nextAnnouncementTime || scheduleTime > now) {
      nextAnnouncementTime = scheduleTime;
    }
  });

  if (!nextAnnouncementTime) {
    countdownTimer.textContent = 'N/A';
    return;
  }

  const diff = Math.max(0, (nextAnnouncementTime - now) / 1000);
  const min = Math.floor(diff / 60);
  const sec = Math.floor(diff % 60);
  countdownTimer.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
}, 1000);

// ✅ FIX: Webhook Testing
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

// ✅ FIX: Background Music Support
bgMusicInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    bgAudio.src = url;
    bgAudio.play();
  }
});

// ✅ FIX: Enable Speech on User Interaction (Chrome Fix)
document.body.addEventListener('click', () => {
  if (!synth.speaking) {
    const testUtterance = new SpeechSynthesisUtterance("Voice activated.");
    synth.speak(testUtterance);
    console.log("Speech activated!");
  }
}, { once: true });
