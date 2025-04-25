// Updated Chatbot Code with Functional Reminder System

let userName = "Friend";
let reminders = [];
let isBotTyping = false;
let reminderCheckInterval;
let lastInteraction = Date.now();

const content = {
  stories: [
    "Once upon a time, in a peaceful village nestled between mountains, there lived a wise old owl who could solve any problem...",
    "Long ago, a retired postman named Arthur discovered he could talk to animals. His first friend was a mischievous squirrel named Pip...",
  ],
  jokes: [
    "Why don't scientists trust atoms? Because they make up everything!",
    "What do you call a fish wearing a bowtie? Sofishticated!",
  ],
  facts: [
    "A group of flamingos is called a 'flamboyance'!",
    "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that's still edible!",
  ]
};

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
}

function handleQuickAction(event) {
  const action = event.currentTarget.dataset.action;
  showTypingIndicator();

  setTimeout(() => {
    switch(action) {
      case 'story':
        showBotMessage(content.stories[Math.floor(Math.random() * content.stories.length)]);
        break;
      case 'joke':
        showBotMessage(`Here's a joke: ${content.jokes[Math.floor(Math.random() * content.jokes.length)]} 😄`);
        break;
      case 'fact':
        showBotMessage(`Did you know? ${content.facts[Math.floor(Math.random() * content.facts.length)]} 🧠`);
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

  const chatMessages = document.getElementById('chat-messages');
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  document.querySelectorAll('.typing-indicator').forEach(indicator => indicator.remove());
  isBotTyping = false;
}

function showBotMessage(text) {
  removeTypingIndicator();
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot-message';
  messageDiv.innerHTML = `
    <div class="message-content">${text}</div>
    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;

  const chatMessages = document.getElementById('chat-messages');
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showUserMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user-message';
  messageDiv.innerHTML = `
    <div class="message-content">${text}</div>
    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;

  const chatMessages = document.getElementById('chat-messages');
  chatMessages.appendChild(messageDiv);
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
    const lowerText = text.toLowerCase();

    if (lowerText.includes('remind')) {
      showReminderForm();
    } else if (lowerText.includes('story')) {
      showBotMessage(content.stories[Math.floor(Math.random() * content.stories.length)]);
    } else if (lowerText.includes('joke')) {
      showBotMessage(`Here's a joke: ${content.jokes[Math.floor(Math.random() * content.jokes.length)]} 😄`);
    } else if (lowerText.includes('fact')) {
      showBotMessage(`Did you know? ${content.facts[Math.floor(Math.random() * content.facts.length)]} 🧠`);
    } else {
      showBotMessage("I'm here to help! You can ask me for:<br><br>📖 Stories<br>😄 Jokes<br>🧠 Interesting Facts<br>⏰ Medication Reminders");
    }
  }, 800);
}

function validateTime(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
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

  reminders.forEach((reminder, index) => {
    const reminderTime = new Date(reminder.time);

    if (!reminder.triggered && now >= reminderTime && now - reminderTime < 60000) {
      showBotMessage(`⏰ REMINDER: Time to take your ${reminder.medication}!`);
      reminders[index].triggered = true;
      saveReminders();

      setTimeout(() => {
        reminders[index].triggered = false;
        saveReminders();
      }, 24 * 60 * 60 * 1000);
    }
  });
}

function showReminderForm() {
  const medication = prompt("What would you like to be reminded about?");
  if (!medication) return;

  const time = prompt("When should I remind you? (e.g., 14:30)");
  if (!validateTime(time)) {
    alert("Please use HH:MM format (00:00 to 23:59)");
    return;
  }

  const today = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const reminderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

  reminders.push({
    medication: medication,
    time: reminderDate.toISOString(),
    triggered: false
  });

  saveReminders();
  startReminderChecker();
  showBotMessage(`✅ I'll remind you to take ${medication} at ${time}`);
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

  const choice = options[Math.floor(Math.random() * options.length)];
  showBotMessage(choice.text);
  lastInteraction = Date.now();
}

function renderGreeting() {
  document.querySelector('.header-text h1').textContent = `Hello, ${userName}!`;
}
