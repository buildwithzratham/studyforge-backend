const API_URL = "https://studyforge-backend-bjlh.onrender.com";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();

  if (data.reply) {
    addMessage(data.reply, "assistant");
  } else {
    addMessage("Error: " + data.error, "assistant");
  }
}

function addMessage(text, type) {
  const container = document.getElementById("messages");

  const msg = document.createElement("div");
  msg.classList.add("message", type);
  msg.innerText = text;

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
