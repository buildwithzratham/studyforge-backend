const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

let currentChatId = null;

/* ================= LOAD CHATS ================= */

async function loadChats() {
  const res = await fetch("/chats", {
    headers: { Authorization: "Bearer " + token }
  });

  const chats = await res.json();

  const chatList = document.getElementById("chatList");
  chatList.innerHTML = "";

  chats.forEach(chat => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.innerText = chat.title;
    div.onclick = () => selectChat(chat._id);
    chatList.appendChild(div);
  });

  if (chats.length > 0) {
    selectChat(chats[0]._id);
  }
}

/* ================= SELECT CHAT ================= */

async function selectChat(id) {
  currentChatId = id;

  const res = await fetch("/chats", {
    headers: { Authorization: "Bearer " + token }
  });

  const chats = await res.json();
  const chat = chats.find(c => c._id === id);

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  if (chat) {
    chat.messages.forEach(m => {
      addMessage(m.role, m.content);
    });
  }
}

/* ================= NEW CHAT ================= */

async function createNewChat() {
  await fetch("/new-chat", {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  await loadChats();
}

/* ================= SEND MESSAGE ================= */

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (!message) return;
  if (!currentChatId) {
    alert("Create or select a chat first");
    return;
  }

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

/* ================= ADD MESSAGE UI ================= */

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = "message " + role;
  div.innerText = text;

  const messages = document.getElementById("messages");
  messages.appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}


/* ============== INIT ============== */
loadChats();