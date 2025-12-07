
// -------------------
// User Database (In production, use proper database)
// -------------------
const users = {
  admin: { password: "seedvault", role: "admin" },
  guest: { password: "guest123", role: "guest" },
  tribe1: { password: "tribe1pass", role: "tribe1" },
  tribe2: { password: "tribe2pass", role: "tribe2" },
  tribe3: { password: "tribe3pass", role: "tribe3" }
};

// Role permissions mapping
const rolePermissions = {
  admin: {
    canView: ["all"],
    canEdit: ["all"],
    canDelete: ["all"],
    canUpload: true,
    canManageUsers: true,
    description: "Full system access"
  },
  tribe1: {
    canView: ["tribe1", "public"],
    canEdit: ["tribe1"],
    canDelete: ["tribe1"],
    canUpload: true,
    canManageUsers: false,
    description: "Tribe 1 community access"
  },
  tribe2: {
    canView: ["tribe2", "public"],
    canEdit: ["tribe2"],
    canDelete: ["tribe2"],
    canUpload: true,
    canManageUsers: false,
    description: "Tribe 2 community access"
  },
  tribe3: {
    canView: ["tribe3", "public"],
    canEdit: ["tribe3"],
    canDelete: ["tribe3"],
    canUpload: true,
    canManageUsers: false,
    description: "Tribe 3 community access"
  },
  guest: {
    canView: ["public"],
    canEdit: [],
    canDelete: [],
    canUpload: false,
    canManageUsers: false,
    description: "Public read-only access"
  }
};

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
  if (typeof document === "undefined") return;

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  const result = login(username, password);

  if (result.success) {
    localStorage.setItem("loggedInUser", username);
    localStorage.setItem("role", result.role);
    localStorage.setItem("permissions", JSON.stringify(result.permissions));
    closeLoginModal();

    // Route based on role
    if (result.role === "admin") {
      window.location.href = "admin.html";
    } else if (result.role.startsWith("tribe")) {
      window.location.href = "tribe-dashboard.html";
    } else {
      alert(`Login successful! Welcome ${username}`);
      updateUserDisplay();
    }
  } else {
    errorBox.textContent = result.message;
  }
}

function handleLogout() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");
  }
  if (typeof alert !== "undefined") alert("Logged out.");
  if (typeof window !== "undefined") window.location.href = "index.html";
}

function updateUserDisplay() {
  if (typeof document === "undefined") return;
  const user = localStorage.getItem("loggedInUser");
  const role = localStorage.getItem("role");
  const header = document.querySelector(".header");

  if (user) {
    const roleLabel = rolePermissions[role]?.description || role;
    header.innerHTML = `
      <h2>SeedVault</h2>
      <div>
        Welcome, ${user} (${roleLabel})
        <a href="#" onclick="handleLogout()">Logout</a>
      </div>`;
  } else {
    header.innerHTML = `<h2>SeedVault</h2><a href="#" onclick="openLoginModal()">Login</a>`;
  }
}

// Check if user has permission
function hasPermission(action, resource = null) {
  if (typeof localStorage === "undefined") return false;
  
  const role = localStorage.getItem("role");
  if (!role) return false;
  
  const perms = rolePermissions[role];
  if (!perms) return false;

  switch(action) {
    case "upload":
      return perms.canUpload;
    case "view":
      return resource ? 
        (perms.canView.includes("all") || perms.canView.includes(resource)) : 
        perms.canView.length > 0;
    case "edit":
      return resource ? 
        (perms.canEdit.includes("all") || perms.canEdit.includes(resource)) : 
        perms.canEdit.length > 0;
    case "delete":
      return resource ? 
        (perms.canDelete.includes("all") || perms.canDelete.includes(resource)) : 
        perms.canDelete.length > 0;
    case "manageUsers":
      return perms.canManageUsers;
    default:
      return false;
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
  const user = users[username];
  
  if (!user) {
    return { success: false, message: "Invalid username" };
  }
  
  if (user.password !== password) {
    return { success: false, message: "Invalid password" };
  }
  
  return { 
    success: true, 
    role: user.role,
    permissions: rolePermissions[user.role]
  };
}

// Export for Node.js testing
if (typeof module !== "undefined") {
  module.exports = { login, hasPermission, rolePermissions };
}
