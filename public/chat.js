const API_URL = "";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

async function loadHistory() {
  const res = await fetch("/history", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();

  if (res.ok) {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    data.messages.forEach(msg => {
      addMessage(msg.role, msg.content);
    });
  }
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.classList.add("message", role);
  div.innerText = text;

  document.getElementById("messages").appendChild(div);
  div.scrollIntoView();
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (!message) return;

  addMessage("user", message);
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  if (res.ok) {
    addMessage("assistant", data.reply);
  } else {
    alert(data.error);
  }
}

function handleEnter(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

loadHistory();
