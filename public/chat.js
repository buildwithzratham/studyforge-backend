const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

/* ================= LOAD HISTORY ================= */

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

    document.getElementById("credits").innerText = data.credits;

    data.messages.forEach(msg => {
      addMessage(msg.role, msg.content);
    });
  }
}

/* ================= ADD MESSAGE ================= */

function addMessage(role, text) {
  const div = document.createElement("div");
  div.classList.add("message", role);
  div.innerText = text;

  document.getElementById("messages").appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}

/* ================= TYPING EFFECT ================= */

function typeMessage(text) {
  const div = document.createElement("div");
  div.classList.add("message", "assistant");
  document.getElementById("messages").appendChild(div);

  let i = 0;
  const speed = 15;

  function typing() {
    if (i < text.length) {
      div.innerHTML += text.charAt(i);
      div.scrollIntoView({ behavior: "smooth" });
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}

/* ================= SEND MESSAGE ================= */

async function sendMessage() {
  const input = document.getElementById("input");
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
    typeMessage(data.reply);
    document.getElementById("credits").innerText = data.credits;
  } else {
    alert(data.error);
  }
}

/* ================= ENTER KEY ================= */

function handleEnter(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
}

/* ================= THEME TOGGLE ================= */

function toggleTheme() {
  document.body.classList.toggle("light-mode");
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

/* ================= INIT ================= */

loadHistory();