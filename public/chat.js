const token = localStorage.getItem("token");
const messagesDiv = document.getElementById("messages");

if (!token) {
  window.location.href = "/login.html";
}

function addMessage(role, content) {
  const div = document.createElement("div");
  div.classList.add("message", role);
  div.textContent = content;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

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

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullReply = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      aiDiv.classList.remove("shimmer");
      aiDiv.innerHTML = marked.parse(fullReply);
      if (window.hljs) hljs.highlightAll();

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

      aiDiv.appendChild(document.createElement("br"));
      aiDiv.appendChild(copyBtn);
      break;
    }

    fullReply += decoder.decode(value);

    aiDiv.classList.add("shimmer");
    aiDiv.innerHTML = marked.parse(fullReply);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

function newChat() {
  messagesDiv.innerHTML = "";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

/* Particle Background */

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
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
