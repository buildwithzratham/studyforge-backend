async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Save token in browser
      localStorage.setItem("token", data.token);
window.location.href = "/chat.html";

      // Go to chat page
      window.location.href = "/chat.html";
    } else {
      alert(data.error || "Login failed");
    }

  } catch (err) {
    alert("Server error");
  }
}
