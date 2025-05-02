let userName = "Friend";
let reminders = [];
let isBotTyping = false;
let ttsEnabled = false;
let reminderCheckInterval;
let lastInteraction = Date.now();

const content = {
  stories: [
    "Once upon a time...", // Keep your original stories
    "Long ago...", 
    "A gentle sea turtle..."
  ],
  jokes: [
    "Why don't scientists trust atoms...",
    "What do you call...",
    "Why did the scarecrow..."
  ],
  facts: [
    "A group of flamingos...",
    "Honey never spoils...",
    "Octopuses have three hearts..."
  ],
  support: [
    "I'm here for you...",
    "You're never alone...",
    "It's okay to feel..."
  ],
  motivation: [
    "You're stronger than you think...",
    "Every day is a new beginning...",
    "You’ve got this..."
  ]
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initializeChat();
  setupEventListeners();
});

function initializeChat() {
  if (!('speechSynthesis' in window)) {
    alert("⚠️ Text-to-speech is not supported in this browser. Try Chrome or Edge.");
    document.getElementById('tts-toggle').disabled = true;
  }

  userName = localStorage.getItem('userName') || prompt("Welcome! What's your name?") || "Friend";
  localStorage.setItem('userName', userName);
  renderGreeting();
  showBotMessage(`Hello ${userName}! I'm your companion bot. How can I assist you today? 😊`);
  loadReminders();
  startProactiveChecks();
}

function setupEventListeners() {
  document.getElementById('send-btn').addEventListener('click', handleUserInput);
  document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

  document.querySelectorAll('.quick-action').forEach(button => {
    button.addEventListener('click', handleQuickAction);
  });

  const ttsToggle = document.getElementById('tts-toggle');
  if (ttsToggle) {
    ttsToggle.addEventListener('click', () => {
      ttsEnabled = !ttsEnabled;
      ttsToggle.textContent = ttsEnabled ? '🔊 TTS: On' : '🔈 TTS: Off';
      
      if (ttsEnabled) {
        const testMsg = new SpeechSynthesisUtterance("Text to speech enabled");
        testMsg.volume = 0.5;
        speechSynthesis.speak(testMsg);
      }
    });
  }
}

// Message handling functions
function showTypingIndicator() {
  if (isBotTyping) return;
  isBotTyping = true;
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-indicator';
  typingDiv.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
  document.getElementById('chat-messages').appendChild(typingDiv);
  scrollToBottom();
}

function removeTypingIndicator() {
  document.querySelectorAll('.typing-indicator').forEach(el => el.remove());
  isBotTyping = false;
}

function showBotMessage(text) {
  removeTypingIndicator();
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot-message';
  messageDiv.innerHTML = `
    <div class="message-content">${text}</div>
    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;
  document.getElementById('chat-messages').appendChild(messageDiv);
  scrollToBottom();
  if (ttsEnabled) speakText(text);
}

function showUserMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user-message';
  messageDiv.innerHTML = `
    <div class="message-content">${text}</div>
    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;
  document.getElementById('chat-messages').appendChild(messageDiv);
  scrollToBottom();
}

// Core functionality
function scrollToBottom() {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleUserInput() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (text) {
    showUserMessage(text);
    processUserInput(text);
    input.value = '';
    lastInteraction = Date.now();
  }
}

function processUserInput(text) {
  showTypingIndicator();
  setTimeout(() => {
    const response = getBotResponse(text.toLowerCase());
    showBotMessage(response);
  }, 800);
}

function getBotResponse(message) {
  if (message.includes("hello") || message.includes("hi")) {
    return `Hello ${userName}! 😊 How can I help?`;
  } else if (message.includes("sad") || message.includes("lonely")) {
    return randomItem(content.support);
  } else if (message.includes("motivate")) {
    return randomItem(content.motivation);
  } else if (message.includes("story")) {
    return randomItem(content.stories);
  } else if (message.includes("joke")) {
    return `Joke: ${randomItem(content.jokes)} 😄`;
  } else if (message.includes("fact")) {
    return `Fact: ${randomItem(content.facts)} 🧠`;
  } else if (message.includes("remind")) {
    showReminderForm();
    return "Let's set up your reminder.";
  } else {
    return "Ask me for stories, jokes, reminders, or chat! 😊";
  }
}

// TTS Functionality
function speakText(text) {
  try {
    const cleanText = text.replace(/[^\w\s.,!?']/gi, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.volume = 1;
    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
    };
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Speech failed:', error);
  }
}

// Reminder system
function validateTime(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function showReminderForm() {
  const medication = prompt("What should I remind you about?");
  if (!medication) return;
  
  const time = prompt("When? (HH:MM format)");
  if (!validateTime(time)) {
    alert("Please use HH:MM format (00:00-23:59)");
    return;
  }

  reminders.push({ medication, time, triggered: false });
  saveReminders();
  startReminderChecker();
  showBotMessage(`✅ Reminder set for ${medication} at ${time}`);
}

function loadReminders() {
  const saved = localStorage.getItem('reminders');
  reminders = saved ? JSON.parse(saved) : [];
  startReminderChecker();
}

function saveReminders() {
  localStorage.setItem('reminders', JSON.stringify(reminders));
}

function startReminderChecker() {
  if (reminderCheckInterval) clearInterval(reminderCheckInterval);
  reminderCheckInterval = setInterval(checkReminders, 1000);
}

function checkReminders() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0,5);
  reminders.forEach((reminder, index) => {
    if (reminder.time === currentTime && !reminder.triggered) {
      showBotMessage(`⏰ REMINDER: ${reminder.medication}!`);
      reminders[index].triggered = true;
      saveReminders();
      setTimeout(() => reminders[index].triggered = false, 60000);
    }
  });
}

// Utility functions
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function startProactiveChecks() {
  setInterval(() => {
    const inactiveMinutes = (Date.now() - lastInteraction) / 60000;
    if (inactiveMinutes > 5) showProactiveCheck();
  }, 300000);
}

function showProactiveCheck() {
  const options = [
    { text: "Want to hear a story?", type: "story" },
    { text: "Need a joke?", type: "joke" },
    { text: "Set a reminder?", type: "reminder" }
  ];
  showBotMessage(randomItem(options).text);
  lastInteraction = Date.now();
}

function renderGreeting() {
  document.querySelector('.header-text h1').textContent = `Hello, ${userName}!`;
}
