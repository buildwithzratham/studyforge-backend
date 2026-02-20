const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

let currentChatId = null;

async function loadChats() {
  const res = await fetch("/chats", {
    headers: { Authorization: "Bearer " + token }
  });

  const chats = await res.json();
  const chatList = document.getElementById("chatList");
  chatList.innerHTML = "";

  chats.forEach(chat => {
    const div = document.createElement("div");
    div.innerText = chat.title;
    div.onclick = () => selectChat(chat._id);
    chatList.appendChild(div);
  });

  if (chats.length > 0) {
    selectChat(chats[0]._id);
  }
}

async function createNewChat() {
  const res = await fetch("/new-chat", {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  const chats = await res.json();
  loadChats();
}

function selectChat(id) {
  currentChatId = id;
  document.getElementById("messages").innerHTML = "";
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message || !currentChatId) return;

  addMessage("user", message);
  input.value = "";

  const res = await fetch(`/chat/${currentChatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  if (res.ok) {
    addMessage("assistant", data.reply);
    document.getElementById("credits").innerText = data.credits;
  } else {
    alert(data.error);
  }
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = "message " + role;
  div.innerText = text;
  document.getElementById("messages").appendChild(div);
  div.scrollIntoView();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

loadChats();