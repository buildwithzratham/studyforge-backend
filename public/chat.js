async function sendMessage() {
  const message = document.getElementById("message").value;
  const token = localStorage.getItem("token");

  const res = await fetch("https://studyforge-backend-bjlh.onrender.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  document.getElementById("reply").innerText = data.reply;
  document.getElementById("credits").innerText = 
    "Credits left: " + data.credits;
}

