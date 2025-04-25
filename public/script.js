let userName = "Friend";
let reminders = [];
let isBotTyping = false;

// Content database
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
  // Send button and Enter key
  document.getElementById('send-btn').addEventListener('click', handleUserInput);
  document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

  // Quick action buttons
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
  typingDiv.innerHTML = `
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  `;
  
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicators = document.querySelectorAll('.typing-indicator');
  typingIndicators.forEach(indicator => indicator.remove());
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
      showBotMessage("I'm here to help! You can ask me for:<br><br>" + 
        "📖 Stories<br>" +
        "😄 Jokes<br>" +
        "🧠 Interesting Facts<br>" +
        "⏰ Medication Reminders");
    }
  }, 800);
}

// Reminder System
// Add this at the top with other variables
let reminderCheckInterval;

// Update the loadReminders function
function loadReminders() {
  const saved = localStorage.getItem('reminders');
  reminders = saved ? JSON.parse(saved) : [];
  startReminderChecker();
}

// Add this new function
function startReminderChecker() {
  if (reminderCheckInterval) clearInterval(reminderCheckInterval);
  reminderCheckInterval = setInterval(checkReminders, 1000); // Check every second
}

// Update the checkReminders function
function checkReminders() {
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  reminders.forEach((reminder, index) => {
    if (reminder.time === currentTime && !reminder.triggered) {
      showBotMessage(`⏰ REMINDER: Time to take your ${reminder.medication}!`);
      reminders[index].triggered = true; // Mark as triggered
      saveReminders();
      
      // Reset for next day
      setTimeout(() => {
        reminders[index].triggered = false;
        saveReminders();
      }, 60000); // Reset after 1 minute
    }
  });
}

// Update the showReminderForm function
function showReminderForm() {
  const medication = prompt("What would you like to be reminded about?");
  if (!medication) return;

  const time = prompt("When should I remind you? (e.g., 14:30)");
  if (!validateTime(time)) {
    alert("Please use HH:MM format (00:00 to 23:59)");
    return;
  }

  reminders.push({
    medication: medication,
    time: time,
    triggered: false
  });
  
  saveReminders();
  startReminderChecker(); // Restart checker with new reminder
  showBotMessage(`✅ I'll remind you to take ${medication} at ${time}`);
}

// Proactive Engagement
function startProactiveChecks() {
  setInterval(() => {
    const inactiveMinutes = (Date.now() - lastInteraction) / 60000;
    if (inactiveMinutes > 5) {
      showProactiveCheck();
    }
  }, 300000);
}

let lastInteraction = Date.now();

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
