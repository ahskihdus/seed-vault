document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");

  // Example: hide admin-only features
  const adminSections = document.querySelectorAll(".admin-only");
  adminSections.forEach((el) => {
    if (role !== "tribe1" && role !== "tribe2" && role !== "tribe3") {
      el.style.display = "none";
    }
  });

  // Example: show greeting
  const userDisplay = document.getElementById("user-role");
  if (userDisplay) userDisplay.textContent = role || "Guest";
});
