async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("https://studyforge-backend-bjlh.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Login successful!");
    window.location.href = "chat.html";
  } else {
    alert("Login failed");
  }
}

