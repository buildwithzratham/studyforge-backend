const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

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
  }
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
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  if (res.ok) {
    typeMessage(data.reply);
    document.getElementById("credits").innerText = data.credits;
  } else {
    alert(data.error);
  }
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = "message " + role;
  div.innerText = text;

  const messages = document.getElementById("messages");
  messages.appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}

function typeMessage(text) {
  const div = document.createElement("div");
  div.className = "message assistant";

  const messages = document.getElementById("messages");
  messages.appendChild(div);

  let i = 0;
  const speed = 15;

  function typing() {
    if (i < text.length) {
      div.innerText += text.charAt(i);
      div.scrollIntoView({ behavior: "smooth" });
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

loadHistory();