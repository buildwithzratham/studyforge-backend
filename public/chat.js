const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

/* ================= LOAD HISTORY ================= */

async function loadHistory() {
  const res = await fetch("/history", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  if (res.ok) {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    data.messages.forEach(m => {
      addMessage(m.role, m.content);
    });

    document.getElementById("credits").innerText = data.credits;
  } else {
    alert("Failed to load history");
  }
}

/* ================= SEND MESSAGE ================= */

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

/* ================= ENTER KEY SUPPORT ================= */

function handleEnter(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

/* ================= INIT ================= */

loadHistory();