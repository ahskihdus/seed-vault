// auth.js

function openLoginModal() {
  document.getElementById("loginModal").classList.add("active");
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("active");
}

function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  if (username === "admin" && password === "seedvault") {
    localStorage.setItem("loggedInUser", username);
    closeLoginModal();
    alert("Login successful!");
    updateUserDisplay();
  } else {
    errorBox.textContent = "Invalid credentials. Try again.";
  }
}

function handleLogout() {
  localStorage.removeItem("loggedInUser");
  alert("Logged out.");
  updateUserDisplay();
}

function updateUserDisplay() {
  const user = localStorage.getItem("loggedInUser");
  const header = document.querySelector(".header");

  if (user) {
    header.innerHTML = `<h2>SeedVault</h2><div>Welcome, ${user}! <a href="#" onclick="handleLogout()">Logout</a></div>`;
  } else {
    header.innerHTML = `<h2>SeedVault</h2><a href="#" onclick="openLoginModal()">Login</a>`;
  }
}

document.addEventListener("DOMContentLoaded", updateUserDisplay);
