const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

// ENTER key support
document.getElementById("messageInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value;

  if (!message) return;

  const chatBox = document.getElementById("chatBox");

  chatBox.innerHTML += `<div class="message user">${message}</div>`;
  input.value = "";

  // Typing animation
  chatBox.innerHTML += `<div class="message ai" id="typing">AI is typing...</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    document.getElementById("typing").remove();

    if (res.ok) {
      chatBox.innerHTML += `<div class="message ai">${data.reply}</div>`;
    } else {
      chatBox.innerHTML += `<div class="message ai">${data.error}</div>`;
    }

    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    document.getElementById("typing").remove();
    chatBox.innerHTML += `<div class="message ai">Server error</div>`;
  }
}
