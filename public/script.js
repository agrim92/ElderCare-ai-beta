let userName = "Friend";
let reminders = [];
let recognition;
let isListening = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
    setupVoiceRecognition();
});

function initializeChat() {
    userName = localStorage.getItem('userName') || prompt("Welcome! What's your name?") || "Friend";
    localStorage.setItem('userName', userName);
    
    renderGreeting();
    showBotMessage(`Hello ${userName}! I'm here to help you with reminders and keep you company. 
        You can ask me for stories, jokes, or facts!`);
    
    loadReminders();
    startProactiveChecks();
    
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });
}

function renderGreeting() {
    document.querySelector('.header-info h1').textContent = `Hello, ${userName}!`;
}

function showBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
        <div class="message-time">${getCurrentTime()}</div>
    `;
    document.getElementById('chat-messages').appendChild(messageDiv);
    scrollToBottom();
}

function showUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
        <div class="message-time">${getCurrentTime()}</div>
    `;
    document.getElementById('chat-messages').appendChild(messageDiv);
    scrollToBottom();
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
        showBotMessage("I'm here to help! You can ask me for:<br>" + 
            "- Stories 📖<br>- Jokes 😄<br>- Facts 🧠<br>" + 
            "Or set reminders with ⏰");
    }
}

// Voice Recognition
function setupVoiceRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('user-input').value = transcript;
        handleUserInput();
    };

    recognition.onerror = () => {
        document.body.classList.remove('voice-active');
        isListening = false;
    };
}

function startVoiceInput() {
    if (!isListening) {
        recognition.start();
        document.body.classList.add('voice-active');
        isListening = true;
    }
}

// Enhanced Reminder System
function showReminderForm() {
    const medication = prompt("What would you like to be reminded about?");
    if (!medication) return;

    const time = prompt("When should I remind you? (e.g., 14:30)");
    if (!validateTime(time)) {
        alert("Please use HH:MM format");
        return;
    }

    reminders.push({ medication, time });
    saveReminders();
    showBotMessage(`✅ I'll remind you to ${medication} at ${time}`);
    updateRemindersList();
}

function updateRemindersList() {
    const list = document.getElementById('reminders-list');
    list.innerHTML = reminders.map((reminder, index) => `
        <div class="reminder-item">
            <span>⏰ ${reminder.medication} at ${reminder.time}</span>
            <button onclick="deleteReminder(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function deleteReminder(index) {
    reminders.splice(index, 1);
    saveReminders();
    updateRemindersList();
}

// Proactive Engagement
function startProactiveChecks() {
    setInterval(() => {
        const inactiveMinutes = (Date.now() - lastInteraction) / 60000;
        if (inactiveMinutes > 5) {
            showProactiveCheck();
        }
    }, 300000); // Check every 5 minutes
}

function showProactiveCheck() {
    const options = [
        { text: "Would you like to hear a story?", type: "story" },
        { text: "How about a joke to cheer you up?", type: "joke" },
        { text: "Shall I remind you about any medications?", type: "reminder" }
    ];
    
    const choice = options[Math.floor(Math.random() * options.length)];
    showBotMessage(choice.text);
    setTimeout(() => {
        if (choice.type === 'reminder') {
            showReminderForm();
        } else {
            handleContent(choice.type);
        }
    }, 1500);
}

// Helper Functions
function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    const chatWindow = document.getElementById('chat-messages');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
}
