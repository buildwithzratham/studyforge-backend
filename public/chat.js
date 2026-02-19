// Check if logged in
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value;

  if (!message) return;

  const chatBox = document.getElementById("chatBox");

  chatBox.innerHTML += `<div class="message user">${message}</div>`;
  input.value = "";

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

    if (res.ok) {
      chatBox.innerHTML += `<div class="message ai">${data.reply}</div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    } else {
      chatBox.innerHTML += `<div class="message ai">${data.error}</div>`;
    }

  } catch (err) {
    chatBox.innerHTML += `<div class="message ai">Server error</div>`;
  }
}
