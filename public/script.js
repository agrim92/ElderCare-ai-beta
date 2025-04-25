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
  document.getElementById('send-btn').addEventListener('click', handleUserInput);
  document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });
  
  // Add quick action handlers
  document.querySelectorAll('.quick-action').forEach(button => {
    button.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.action;
      handleQuickAction(action);
    });
  });
}

async function handleQuickAction(action) {
  showTypingIndicator();
  
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate typing delay
  
  switch(action) {
    case 'story':
      tellStory();
      break;
    case 'joke':
      tellJoke();
      break;
    case 'reminder':
      showReminderForm();
      break;
    case 'fact':
      tellFact();
      break;
  }
}

function tellStory() {
  const story = content.stories[Math.floor(Math.random() * content.stories.length)];
  showBotMessage(story);
}

function tellJoke() {
  const joke = content.jokes[Math.floor(Math.random() * content.jokes.length)];
  showBotMessage(`Here's a joke for you: ${joke} 😄`);
}

function tellFact() {
  const fact = content.facts[Math.floor(Math.random() * content.facts.length)];
  showBotMessage(`Did you know? ${fact} 🧠`);
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
      tellStory();
    } else if (lowerText.includes('joke')) {
      tellJoke();
    } else if (lowerText.includes('fact')) {
      tellFact();
    } else {
      showBotMessage("I'm here to help! You can ask me for:<br><br>" + 
        "📖 Stories<br>" +
        "😄 Jokes<br>" +
        "🧠 Interesting Facts<br>" +
        "⏰ Medication Reminders");
    }
  }, 800);
}

// Rest of the functionality (reminders, proactive checks, etc.) remains similar
// but should be updated to match the new UI structure
