let userName = "Friend";
let reminders = [];
let isBotTyping = false;
let ttsEnabled = false;  // Flag to track if TTS is enabled
let reminderCheckInterval;
let lastInteraction = Date.now();

const content = {
  stories: [
    "Once upon a time, in a peaceful village nestled between mountains, there lived a wise old owl who could solve any problem...",
    "Long ago, a retired postman named Arthur discovered he could talk to animals. His first friend was a mischievous squirrel named Pip...",
    "A gentle sea turtle once swam across the oceans helping lost sea creatures find their homes..."
  ],
  jokes: [
    "Why don't scientists trust atoms? Because they make up everything!",
    "What do you call a fish wearing a bowtie? Sofishticated!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!"
  ],
  facts: [
    "A group of flamingos is called a 'flamboyance'!",
    "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that's still edible!",
    "Octopuses have three hearts and blue blood!"
  ],
  support: [
    "I'm here for you whenever you need to talk.",
    "You're never alone — I'm always around to chat.",
    "It's okay to feel that way. I'm here to listen."
  ],
  motivation: [
    "You're stronger than you think. 💪",
    "Every day is a new beginning.",
    "You’ve got this! I believe in you."
  ]
};

// On page load
document.addEventListener('DOMContentLoaded', () => {
  initializeChat();
  setupEventListeners();
});

function initializeChat() {
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
    });
  }
}

function handleQuickAction(event) {
  const action = event.currentTarget.dataset.action;
  showTypingIndicator();

  setTimeout(() => {
    switch(action) {
      case 'story':
        showBotMessage(randomItem(content.stories));
        break;
      case 'joke':
        showBotMessage(`Here's a joke: ${randomItem(content.jokes)} 😄`);
        break;
      case 'fact':
        showBotMessage(`Did you know? ${randomItem(content.facts)} 🧠`);
        break;
      case 'reminder':
        showReminderForm();
        break;
    }
  }, 800);
}

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
  if (ttsEnabled) speakText(text);  // Speak text if TTS is enabled
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
  if (message.includes("hello") || message.includes("hi") || message.includes("good morning")) {
    return `Hello ${userName}! 😊 How can I help you today?`;
  } else if (message.includes("sad") || message.includes("lonely")) {
    return randomItem(content.support);
  } else if (message.includes("motivate") || message.includes("encourage")) {
    return randomItem(content.motivation);
  } else if (message.includes("story")) {
    return randomItem(content.stories);
  } else if (message.includes("joke")) {
    return `Here's a joke: ${randomItem(content.jokes)} 😄`;
  } else if (message.includes("fact")) {
    return `Did you know? ${randomItem(content.facts)} 🧠`;
  } else if (message.includes("remind")) {
    showReminderForm();
    return "Let's set up your reminder.";
  } else {
    return "I'm here to help! You can ask me for stories, jokes, reminders, or just chat. 😊";
  }
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1; // Adjust the speech rate
  speechSynthesis.speak(utterance);
}

function validateTime(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function showReminderForm() {
  const medication = prompt("What would you like to be reminded about?");
  if (!medication) return;

  const time = prompt("When should I remind you? (e.g., 14:30)");
  if (!validateTime(time)) {
    alert("Please use HH:MM format (00:00 to 23:59)");
    return;
  }

  reminders.push({ medication, time, triggered: false });
  saveReminders();
  startReminderChecker();
  showBotMessage(`✅ I'll remind you to take ${medication} at ${time}`);
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
      showBotMessage(`⏰ REMINDER: Time to take your ${reminder.medication}!`);
      reminders[index].triggered = true;
      saveReminders();

      setTimeout(() => {
        reminders[index].triggered = false;
        saveReminders();
      }, 60000);
    }
  });
}

function startProactiveChecks() {
  setInterval(() => {
    const inactiveMinutes = (Date.now() - lastInteraction) / 60000;
    if (inactiveMinutes > 5) {
      showProactiveCheck();
    }
  }, 300000);
}

function showProactiveCheck() {
  const options = [
    { text: "Would you like to hear a story?", type: "story" },
    { text: "How about a joke to cheer you up?", type: "joke" },
    { text: "Shall I remind you about any medications?", type: "reminder" }
  ];

  const choice = randomItem(options);
  showBotMessage(choice.text);
  lastInteraction = Date.now();
}

function renderGreeting() {
  document.querySelector('.header-text h1').textContent = `Hello, ${userName}!`;
}
