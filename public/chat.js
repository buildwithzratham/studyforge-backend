const token = localStorage.getItem("token");
const messagesDiv = document.getElementById("messages");
const creditsSpan = document.getElementById("credits");

if (!token) {
  window.location.href = "/login.html";
}

async function loadHistory() {
  const res = await fetch("/history", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();

  creditsSpan.textContent = data.credits;

  messagesDiv.innerHTML = "";

  data.messages.forEach(msg => {
    addMessage(msg.role, msg.content);
  });
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
    if (done) break;

    fullReply += decoder.decode(value);
    aiDiv.textContent = fullReply;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // reload credits after message
  loadHistory();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

loadHistory();
