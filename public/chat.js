const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

/* ===== LOAD HISTORY ===== */
async function loadHistory() {
  const res = await fetch("/history", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById("credits").innerText = data.credits;
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    data.messages.forEach(msg => {
      addMessage(msg.role, msg.content);
    });
  }
}

/* ===== ADD MESSAGE ===== */
function addMessage(role, text) {
  const div = document.createElement("div");
  div.classList.add("message", role);
  div.innerHTML = marked.parse(text);

  document.getElementById("messages").appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });

  addCopyButtons();
}

/* ===== TYPING EFFECT ===== */
function typeMessage(text) {
  const div = document.createElement("div");
  div.classList.add("message", "assistant");
  document.getElementById("messages").appendChild(div);

  let i = 0;
  const speed = 15;

  function typing() {
    if (i < text.length) {
      div.innerHTML = marked.parse(text.slice(0, i));
      i++;
      setTimeout(typing, speed);
    } else {
      addCopyButtons();
    }
  }

  typing();
}

/* ===== SEND MESSAGE ===== */
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

/* ===== ENTER KEY ===== */
function handleEnter(e) {
  if (e.key === "Enter") sendMessage();
}

/* ===== LOGOUT ===== */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

/* ===== COPY BUTTON ===== */
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

loadHistory();