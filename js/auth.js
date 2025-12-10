
/**
 * AUTHENTICATION SYSTEM - SeedVault
 * 
 * This module provides:
 * 1. User database and authentication
 * 2. Role-based permission mapping
 * 3. Browser UI for login/logout
 * 4. Pure function for testing authentication logic
 * 
 * NOTE: In production, use a proper database with hashed passwords
 * and never store credentials in client-side code.
 */

/**
 * User credentials database
 * Format: { username: { password: string, role: string } }
 * Roles: admin, tribe1, tribe2, tribe3, guest
 * 
 * SECURITY NOTE: These are demo credentials. Production systems should:
 * - Use bcrypt or similar for password hashing
 * - Store in secure database
 * - Use OAuth/SSO for enterprise deployments
 */
const users = {
  admin: { password: "seedvault", role: "admin" },
  guest: { password: "guest123", role: "guest" },
  tribe1: { password: "tribe1pass", role: "tribe1" },
  tribe2: { password: "tribe2pass", role: "tribe2" },
  tribe3: { password: "tribe3pass", role: "tribe3" }
};

/**
 * rolePermissions - Maps user roles to access permissions
 * 
 * Permission structure:
 * - canView: Array of access levels user can view (public, tribe1/2/3, all)
 * - canEdit: Array of access levels user can edit
 * - canDelete: Array of access levels user can delete
 * - canUpload: Boolean - whether user can upload artifacts
 * - canManageUsers: Boolean - whether user can manage system users
 * - description: Human-readable role description
 * 
 * Access Levels:
 * - admin: Full system access, all artifacts
 * - tribe1/2/3: Community members, access own tribe + public
 * - guest: Read-only public access
 */
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

/**
 * handleLogin - Handles form submission from login modal
 * 
 * Process:
 * 1. Extract username/password from HTML form
 * 2. Call pure login() function for authentication
 * 3. If successful:
 *    - Store credentials in localStorage (browser session)
 *    - Route user to appropriate dashboard
 *    - Update header with logged-in user info
 * 4. If failed:
 *    - Display error message to user
 * 
 * Role-based routing:
 * - admin → admin.html (system management)
 * - tribe1/2/3 → tribe-dashboard.html (community tools)
 * - guest → remains on index.html (public read-only)
 */
function handleLogin() {
  if (typeof document === "undefined") return;

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  // Call pure authentication function
  const result = login(username, password);

  if (result.success) {
    // Store auth token in localStorage for subsequent requests
    localStorage.setItem("loggedInUser", username);
    localStorage.setItem("role", result.role);
    localStorage.setItem("permissions", JSON.stringify(result.permissions));
    closeLoginModal();

    // Route based on role to appropriate dashboard
    if (result.role === "admin") {
      window.location.href = "admin.html";
    } else if (result.role.startsWith("tribe")) {
      window.location.href = "tribe-dashboard.html";
    } else {
      alert(`Login successful! Welcome ${username}`);
      updateUserDisplay();
    }
  } else {
    // Display authentication error
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

/**
 * hasPermission - Checks if current user has permission for an action
 * 
 * Used throughout the UI to conditionally show/hide features based on user role.
 * This is client-side validation only - server must also enforce permissions!
 * 
 * Actions supported:
 * - "upload": Can user upload new artifacts?
 * - "view": Can user view artifacts (optionally of specific access level)?
 * - "edit": Can user edit artifacts (optionally of specific access level)?
 * - "delete": Can user delete artifacts (optionally of specific access level)?
 * - "manageUsers": Can user manage system users?
 * 
 * @param {string} action - Permission action to check
 * @param {string} resource - Optional access level (public, tribe1/2/3, all) for view/edit/delete
 * @returns {boolean} True if user has permission
 * 
 * Examples:
 * - hasPermission("upload") → can user upload?
 * - hasPermission("view", "tribe1") → can user view tribe1 artifacts?
 * - hasPermission("edit", "public") → can user edit public artifacts?
 */
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
      // Can view if no resource specified, or if resource is in canView array
      return resource ? 
        (perms.canView.includes("all") || perms.canView.includes(resource)) : 
        perms.canView.length > 0;
    case "edit":
      // Can edit if no resource specified, or if resource is in canEdit array
      return resource ? 
        (perms.canEdit.includes("all") || perms.canEdit.includes(resource)) : 
        perms.canEdit.length > 0;
    case "delete":
      // Can delete if no resource specified, or if resource is in canDelete array
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
 * login() - Pure function for authentication (testable, side-effect free)
 * 
 * This is a pure function that can be used in both browser and Node.js environments
 * for testing without DOM dependencies.
 * 
 * Validation logic:
 * 1. Check if username exists in users database
 * 2. Verify password matches (plain text comparison in demo - use bcrypt in production!)
 * 3. Return role and permissions if successful
 * 
 * @param {string} username - Username to authenticate
 * @param {string} password - Plain text password (should be hashed in production)
 * @returns {Object} { success: boolean, role?: string, permissions?: Object, message?: string }
 * 
 * Examples:
 * - login("admin", "seedvault") → { success: true, role: "admin", permissions: {...} }
 * - login("admin", "wrong") → { success: false, message: "Invalid password" }
 * - login("unknown", "any") → { success: false, message: "Invalid username" }
 */
function login(username, password) {
  const user = users[username];
  
  if (!user) {
    return { success: false, message: "Invalid username" };
  }
  
  // SECURITY: In production, use bcrypt.compare() for secure password verification
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
