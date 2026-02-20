const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

async function loadHistory() {
  const res = await fetch("/history", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  document.getElementById("credits").innerText = data.credits;

  data.messages.forEach(m => {
    addMessage(m.role, m.content);
  });
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;

  if (document.getElementById("credits").innerText == "0") {
    alert("No credits left.");
    return;
  }

  addMessage("user", message);
  input.value = "";

  const typing = showTyping();

  const res = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ message })
  });

  typing.remove();

  const data = await res.json();

  if (res.ok) {
    addMessage("assistant", data.reply);
    document.getElementById("credits").innerText = data.credits;
  } else {
    alert(data.error);
  }
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = "message " + role;
  div.innerText = text;
  document.getElementById("messages").appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  document.getElementById("messages").appendChild(div);
  return div;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

loadHistory();