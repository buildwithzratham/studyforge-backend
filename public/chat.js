/* ================= AUTH CHECK ================= */

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

/* ================= LOAD HISTORY ================= */

async function loadHistory() {
  try {
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
    } else {
      console.error(data.error);
    }
  } catch (err) {
    console.error("History load error:", err);
  }
}

/* ================= ADD MESSAGE ================= */

function addMessage(role, text) {
  const div = document.createElement("div");
  div.classList.add("message", role);
  div.innerText = text;

  const messagesDiv = document.getElementById("messages");
  messagesDiv.appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}

/* ================= TYPING EFFECT ================= */

function typeMessage(text) {
  const div = document.createElement("div");
  div.classList.add("message", "assistant");

  const messagesDiv = document.getElementById("messages");
  messagesDiv.appendChild(div);

  let i = 0;
  const speed = 10;

  function typing() {
    if (i < text.length) {
      div.innerHTML = marked.parse(text.slice(0, i));
      div.scrollIntoView({ behavior: "smooth" });
      i++;
      setTimeout(typing, speed);
    } else {
      addCopyButtons();   // ✅ correct
    }
  }

  typing();   // ✅ YOU MISSED THIS LINE
}
function addCopyButtons() {
  document.querySelectorAll("pre").forEach(block => {
    if (block.querySelector(".copy-btn")) return;

    const btn = document.createElement("button");
    btn.innerText = "Copy";
    btn.className = "copy-btn";

    btn.onclick = () => {
      navigator.clipboard.writeText(block.innerText);
      btn.innerText = "Copied!";
      setTimeout(() => btn.innerText = "Copy", 1500);
    };

    block.appendChild(btn);
  });
}
/* ================= SEND MESSAGE ================= */

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";

  const response = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ message })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  const div = document.createElement("div");
  div.classList.add("message", "assistant");
  document.getElementById("messages").appendChild(div);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    div.innerHTML += marked.parse(chunk);
    div.scrollIntoView({ behavior: "smooth" });
  }

  addCopyButtons();
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