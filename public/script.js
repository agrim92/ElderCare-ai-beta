let userName = "Friend";
let reminders = [];
let lastInteraction = Date.now();
let proactiveCheckInterval;

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    userName = prompt("Welcome! What's your name?") || "Friend";
    document.getElementById('username').textContent = userName;
    addMessage(`Hello ${userName}! I'm here to keep you company and help with reminders.`, 'bot');
    startProactiveChecks();
    loadReminders();
});

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    lastInteraction = Date.now();
}

// Proactive engagement system
function startProactiveChecks() {
    proactiveCheckInterval = setInterval(() => {
        const inactiveMinutes = (Date.now() - lastInteraction) / 60000;
        if (inactiveMinutes > 2) {
            showProactiveMessage();
        }
    }, 30000);
}

function showProactiveMessage() {
    const messages = [
        "Would you like to hear an interesting fact?",
        "How about a cheerful joke?",
        "Shall I share some good news?",
        "Would you like me to read you a short story?"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    if (confirm(randomMessage)) {
        const categories = ['story', 'joke', 'fact', 'news'];
        const category = categories[Math.floor(Math.random() * categories.length)];
        handleContent(category);
    }
}

// Reminder system with localStorage
function saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

function loadReminders() {
    const saved = localStorage.getItem('reminders');
    reminders = saved ? JSON.parse(saved) : [];
    checkReminders();
}

function checkReminders() {
    const now = new Date();
    reminders = reminders.filter(reminder => {
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);

        if (now >= reminderTime) {
            addMessage(`⏰ Reminder: Time to take your ${reminder.medication}!`, 'bot');
            return false;
        }
        return true;
    });
    saveReminders();
    setTimeout(checkReminders, 60000); // Check every minute
}

// Menu system
function showMenu() {
    const menuText = `Main Menu:
    1. 📖 Story
    2. 🗞️ News
    3. 😄 Joke
    4. 🧠 Fact
    5. Exit`;
    
    const choice = prompt(menuText);
    handleMenuChoice(choice);
}

function handleMenuChoice(choice) {
    switch(choice) {
        case '1':
            handleContent('story');
            break;
        case '2':
            handleContent('news');
            break;
        case '3':
            handleContent('joke');
            break;
        case '4':
            handleContent('fact');
            break;
        case '5':
            addMessage(`Goodbye ${userName}! Have a wonderful day! 😊`, 'bot');
            break;
        default:
            alert("Please choose 1-5");
    }
}

function handleContent(type) {
    const content = {
        story: [
            "Did you know the first computer was invented in the 1940s? It was as big as a room!",
            "My favorite story is about a cat who became a chef. His specialty? Mice cream sundaes!"
        ],
        joke: [
            "Why don't skeletons fight each other? They don't have the guts!",
            "What do you call a bear with no teeth? A gummy bear!"
        ],
        fact: [
            "Bananas are berries, but strawberries aren’t!",
            "Octopuses have three hearts and blue blood!"
        ],
        news: [
            "🌍 Local News: The community center is hosting a free classical music concert!",
            "📰 Update: New walking club forming in the park every morning"
        ]
    };

    const item = content[type][Math.floor(Math.random() * content[type].length)];
    addMessage(item, 'bot');
}

// Reminder form handling
function showReminderForm() {
    const med = prompt("What medication would you like to be reminded about?");
    const time = prompt("When should I remind you? (Use 24-hour format like 14:30)");

    if (med && time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        reminders.push({ medication: med, time: time });
        saveReminders();
        addMessage(`✅ I'll remind you to take ${med} at ${time}`, 'bot');
    } else {
        alert("Please provide valid medication name and time (HH:MM format)");
    }
}
