const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

// Get username and room from URL
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');

if (!username || !room) {
  console.error('Username or room parameter is missing in the URL.');
} else {
  console.log('Username:', username);
  console.log('Room:', room);
}

const socket = io({ query: { username, room } });


// Listen for 'roomUsers' event to update the sidebar with active room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Output room name to sidebar
function outputRoomName(room) {
  const roomName = document.getElementById('room-name');
  roomName.innerText = room;
}

// Output users to sidebar
function outputUsers(users) {
  const userList = document.getElementById('users');
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.innerText = user.username; // Display the username instead of the whole user object
    userList.appendChild(li);
  });
}

// Join chatroom


// Listen for 'message' events from the server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down 
  chatMessages.scrollTop = chatMessages.scrollHeight;

});

// Message submit 
chatForm.addEventListener('submit', (e) => {
 e.preventDefault();

 //Get message text
 const msg = e.target.elements.msg.value;

 //emit chat message to the server 
 socket.emit('chatMessage', msg);
 //clear input
 e.target.elements.msg.value = '';
 e.target.elements.msg.focus();
});

//Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `  <p class="meta"> ${message.username} <span> ${message.time} </span></p>
  <p class="text">
  ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

