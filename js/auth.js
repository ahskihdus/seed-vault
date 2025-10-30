// auth.js

// -------------------
// Browser-side logic
// -------------------

function openLoginModal() {
  if (typeof document !== "undefined") {
    document.getElementById("loginModal").classList.add("active");
  }
}

function closeLoginModal() {
  if (typeof document !== "undefined") {
    document.getElementById("loginModal").classList.remove("active");
  }
}

function handleLogin() {
  if (typeof document === "undefined") return; // skip if running in Node (tests)
  
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  const result = login(username, password);

  if (result.success) {
    localStorage.setItem("loggedInUser", username);
    closeLoginModal();
    alert("Login successful!");
    updateUserDisplay();
  } else {
    errorBox.textContent = result.message;
  }
}

function handleLogout() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("loggedInUser");
  }
  if (typeof alert !== "undefined") alert("Logged out.");
  if (typeof document !== "undefined") updateUserDisplay();
}

function updateUserDisplay() {
  if (typeof document === "undefined") return; // skip in tests
  const user = localStorage.getItem("loggedInUser");
  const header = document.querySelector(".header");

  if (user) {
    header.innerHTML = `<h2>SeedVault</h2><div>Welcome, ${user}! <a href="#" onclick="handleLogout()">Logout</a></div>`;
  } else {
    header.innerHTML = `<h2>SeedVault</h2><a href="#" onclick="openLoginModal()">Login</a>`;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", updateUserDisplay);
}


/**
 * login() - pure function for authentication
 * Works in both browser and Node environments.
 */
function login(username, password) {
  if (username === "admin" && password === "seedvault") {
    return { success: true, role: "admin" };
  }
  return { success: false, message: "Invalid credentials" };
}

// ✅ Export only for Node.js testing
if (typeof module !== "undefined") {
  module.exports = { login };
}
