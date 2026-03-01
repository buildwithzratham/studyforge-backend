const token = localStorage.getItem("token");
const messagesDiv = document.getElementById("messages");
let currentReader = null;

if (!token) {
  window.location.href = "/login.html";
}

/* ---------------- SCROLL HELPER ---------------- */

function scrollToBottom(smooth = true) {
  messagesDiv.scrollTo({
    top: messagesDiv.scrollHeight,
    behavior: smooth ? "smooth" : "auto"
  });
}

/* ---------------- ADD MESSAGE ---------------- */

function addMessage(role, content) {
  const div = document.createElement("div");
  div.classList.add("message", role);
  div.textContent = content;
  messagesDiv.appendChild(div);
  scrollToBottom(false);
}

/* ---------------- SEND MESSAGE ---------------- */

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
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    const errorText = await response.text();
    alert(errorText);
    return;
  }

  const aiDiv = document.createElement("div");
  aiDiv.classList.add("message", "assistant");
  messagesDiv.appendChild(aiDiv);

  scrollToBottom(false);

  const reader = response.body.getReader();
  currentReader = reader;

  const decoder = new TextDecoder();
  let fullReply = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      aiDiv.innerHTML = marked.parse(fullReply);

      /* COPY BUTTON */
      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.classList.add("copy-btn");

      copyBtn.onclick = () => {
        navigator.clipboard.writeText(fullReply);
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      };

      /* REGENERATE BUTTON */
      const regenBtn = document.createElement("button");
      regenBtn.textContent = "Regenerate";
      regenBtn.classList.add("copy-btn");

      regenBtn.onclick = () => {
        document.getElementById("messageInput").value = message;
        sendMessage();
      };

      aiDiv.appendChild(document.createElement("br"));
      aiDiv.appendChild(copyBtn);
      aiDiv.appendChild(regenBtn);

      scrollToBottom();
      break;
    }

    fullReply += decoder.decode(value, { stream: true });

    aiDiv.innerHTML =
      marked.parse(fullReply) +
      '<span class="typing-cursor"></span>';

    /* SMART AUTO SCROLL */
    const isNearBottom =
      messagesDiv.scrollHeight -
      messagesDiv.scrollTop -
      messagesDiv.clientHeight < 150;

    if (isNearBottom) {
      scrollToBottom();
    }
  }
}

/* ---------------- NEW CHAT ---------------- */

function newChat() {
  messagesDiv.innerHTML = "";
}

/* ---------------- LOGOUT ---------------- */

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

/* ---------------- STOP GENERATING ---------------- */

document.getElementById("stopBtn").onclick = () => {
  if (currentReader) {
    currentReader.cancel();
  }
};

/* ---------------- PARTICLE BACKGROUND ---------------- */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 80; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2,
    dx: (Math.random() - 0.5),
    dy: (Math.random() - 0.5)
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(59,109,246,0.6)";

  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animateParticles);
}

animateParticles();
