async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    window.location.href = "index.html";
  } else {
    document.getElementById("message").textContent = data.message;
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
