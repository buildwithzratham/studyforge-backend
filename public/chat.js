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

  // Create typing indicator bubble
  const aiDiv = document.createElement("div");
  aiDiv.classList.add("message", "assistant");

  aiDiv.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  messagesDiv.appendChild(aiDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullReply = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      // Add Copy Button
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

    // Replace typing dots with streamed text
    aiDiv.textContent = fullReply;

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

loadHistory();
