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
function typeText(element, text, speed = 20) {
  element.innerHTML = "";
  let i = 0;

  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
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

const aiMessage = document.createElement("div");
aiMessage.className = "message assistant";
document.getElementById("chatBox").appendChild(aiMessage);

typeText(aiMessage, data.reply);

document.getElementById("creditsBox").innerText =
  "Credits: " + data.credits;

    document.getElementById("typing").remove();
    
} catch (err) {
    console.error(err);
    document.getElementById("typing")?.remove();
    chatBox.innerHTML += `<div class="message ai">Server error</div>`;
   }
}
