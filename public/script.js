const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Add username handling
const usernameInput = document.getElementById('username-input');
const setUsernameBtn = document.getElementById('set-username');
let currentUsername = 'Anonymous';

setUsernameBtn.addEventListener('click', () => {
    const newUsername = usernameInput.value.trim();
    if (newUsername) {
        socket.emit('set username', newUsername);
        currentUsername = newUsername;
        usernameInput.value = '';
    }
});

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (message) {
        // Emit the message to the server
        socket.emit('chat message', message);
            // Clear the input
            input.value = '';
        }
    });

    // Listen for incoming messages
   // Update message display to show usernames
   socket.on('chat message', (data) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

// Handle user join notifications
socket.on('user joined', (data) => {
    const item = document.createElement('li');
    item.className = 'system-message';
    if (data.oldUsername === 'Anonymous') {
        item.textContent = `${data.newUsername} has joined the chat`;
    } else {
        item.textContent = `${data.oldUsername} is now known as ${data.newUsername}`;
    }
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

// Handle user leave notifications
socket.on('user left', (data) => {
    const item = document.createElement('li');
    item.className = 'system-message';
    item.textContent = `${data.username} has left the chat`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

   // Room handling
   const roomList = document.getElementById('room-list');
   const newRoomInput = document.getElementById('new-room');
   const createRoomBtn = document.getElementById('create-room-btn');
   let currentRoom = 'general';

   // Join room when clicking on room in the list
   roomList.addEventListener('click', (e) => {
       if (e.target.classList.contains('room')) {
           const room = e.target.dataset.room;
           socket.emit('join room', room);
           currentRoom = room;
           document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));
           e.target.classList.add('active');
       }
   });

   // Create new room
   createRoomBtn.addEventListener('click', () => {
       const roomName = newRoomInput.value.trim();
       if (roomName && !document.querySelector(`[data-room="${roomName}"]`)) {
           socket.emit('create room', roomName);
           newRoomInput.value = '';
       }
   });

   // Handle new room creation
   socket.on('room created', (roomName) => {
       const roomItem = document.createElement('li');
       roomItem.className = 'room';
       roomItem.dataset.room = roomName;
       roomItem.textContent = roomName;
       roomList.appendChild(roomItem);
   });

   // Handle room join confirmation
   socket.on('joined room', (room) => {
       const item = document.createElement('li');
       item.className = 'system-message';
       item.textContent = `You joined ${room}`;
       messages.appendChild(item);
       currentRoom = room;
       messages.scrollTop = messages.scrollHeight;
   });

   // Handle room messages
   socket.on('room message', (data) => {
       const item = document.createElement('li');
       item.className = 'system-message';
       item.textContent = data.message;
       messages.appendChild(item);
       messages.scrollTop = messages.scrollHeight;
   });