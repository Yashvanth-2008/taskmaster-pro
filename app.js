/* ============================================================
   app.js — TaskMaster v3
   New features: Edit task, Search, Sort, Notifications,
   User dropdown, Password show/hide, Progress bar
   ============================================================ */

/* ─── 1. STATE ──────────────────────────────────────────── */
let currentUser           = null;
let tasks                 = [];
let currentFilter         = "all";
let currentPriorityFilter = null;
let activeViewMode        = "all";
let searchQuery           = "";
let sortMode              = "default";
let sidebarIsOpen         = false;


/* ─── 2. AUTH: Tab Switcher ─────────────────────────────── */
function switchTab(tab) {
  const isSignIn = tab === "signin";
  document.querySelectorAll(".tab-btn").forEach((b, i) =>
    b.classList.toggle("active", isSignIn ? i === 0 : i === 1)
  );
  document.getElementById("signin-panel").classList.toggle("active",  isSignIn);
  document.getElementById("signup-panel").classList.toggle("active", !isSignIn);
  document.getElementById("auth-headline").textContent = isSignIn ? "Welcome back."  : "Join TaskMaster.";
  document.getElementById("auth-sub").textContent      = isSignIn ? "Sign in to your workspace." : "Create your account.";
}


/* ─── 3. AUTH: Toggle Password Visibility ───────────────── */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "fa-solid fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fa-solid fa-eye";
  }
}


/* ─── 4. AUTH: Sign In ──────────────────────────────────── */
// TODO: Replace loginUser() with Firebase signInWithEmailAndPassword
function handleSignIn() {
  const email = document.getElementById("signin-email").value.trim();
  const pass  = document.getElementById("signin-password").value;
  if (!email || !pass) { showToast("⚠️", "Please fill in all fields"); return; }
  loginUser({ name: email.split("@")[0], email });
}


/* ─── 5. AUTH: Sign Up ──────────────────────────────────── */
// TODO: Replace loginUser() with Firebase createUserWithEmailAndPassword
function handleSignUp() {
  const name  = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const pass  = document.getElementById("signup-password").value;
  if (!name || !email || !pass) { showToast("⚠️", "Please fill in all fields"); return; }
  if (pass.length < 8)          { showToast("⚠️", "Password min 8 characters"); return; }
  loginUser({ name, email });
}


/* ─── 6. AUTH: Google Sign In ───────────────────────────── */
// TODO: Replace with Firebase GoogleAuthProvider signInWithPopup
function handleGoogle() {
  loginUser({ name: "Google User", email: "user@gmail.com" });
}


/* ─── 7. AUTH: Login Success ────────────────────────────── */
function loginUser(user) {
  currentUser = user;

  // Set avatar letter everywhere
  const letter = user.name[0].toUpperCase();
  document.getElementById("user-avatar").textContent    = letter;
  document.getElementById("menu-avatar").textContent    = letter;
  document.getElementById("menu-name").textContent      = user.name;
  document.getElementById("menu-email").textContent     = user.email;

  // Switch pages
  document.getElementById("auth-page").classList.remove("active");
  document.getElementById("app-page").classList.add("active");

  // Date
  document.getElementById("view-date").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Show notification dot (demo)
  document.getElementById("notif-dot").classList.add("show");

  loadSampleTasks();
  renderTasksWithFilters();
  showToast("👋", `Welcome back, ${user.name}!`);
}


/* ─── 8. AUTH: Logout ───────────────────────────────────── */
// TODO: Add Firebase signOut() before resetting state
function handleLogout() {
  currentUser = null; tasks = [];
  currentFilter = "all"; currentPriorityFilter = null;
  activeViewMode = "all"; searchQuery = ""; sortMode = "default";

  document.getElementById("app-page").classList.remove("active");
  document.getElementById("auth-page").classList.add("active");
  closeUserMenu();
  showToast("👋", "Logged out");
}


/* ─── 9. TASKS: Sample Data ─────────────────────────────── */
// TODO: Replace with Firestore getDocs query
function loadSampleTasks() {
  tasks = [];
}


/* ─── 10. VIEW: Sidebar Navigation ─────────────────────── */
function setView(view, el) {
  activeViewMode        = view;
  currentPriorityFilter = null;

  document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
  el.classList.add("active");

  const titles = { all: "All Tasks", today: "Today", upcoming: "Upcoming", done: "Completed" };
  document.getElementById("view-title").textContent = titles[view] || "All Tasks";

  closeSidebar();
  renderTasksWithFilters();
}

function filterByPriority(priority, el) {
  currentPriorityFilter = priority;
  activeViewMode        = null;

  document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
  el.classList.add("active");

  document.getElementById("view-title").textContent =
    priority.charAt(0).toUpperCase() + priority.slice(1) + " Priority";

  closeSidebar();
  renderTasksWithFilters();
}


/* ─── 11. FILTER CHIPS ──────────────────────────────────── */
function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  renderTasksWithFilters();
}


/* ─── 12. SORT ──────────────────────────────────────────── */
function handleSort() {
  sortMode = document.getElementById("sort-select").value;
  renderTasksWithFilters();
}


/* ─── 13. SEARCH ────────────────────────────────────────── */
function handleSearch() {
  searchQuery = document.getElementById("search-input").value.toLowerCase().trim();
  renderTasksWithFilters();
}

function toggleSearch() {
  const wrap = document.getElementById("search-bar-wrap");
  const isOpen = wrap.classList.contains("open");
  if (isOpen) {
    closeSearch();
  } else {
    wrap.classList.add("open");
    setTimeout(() => document.getElementById("search-input").focus(), 150);
  }
}

function closeSearch() {
  const wrap = document.getElementById("search-bar-wrap");
  wrap.classList.remove("open");
  document.getElementById("search-input").value = "";
  searchQuery = "";
  renderTasksWithFilters();
}


/* ─── 14. NOTIFICATIONS (demo) ──────────────────────────── */
function showNotifications() {
  showToast("🔔", "No new notifications");
}


/* ─── 15. USER MENU ─────────────────────────────────────── */
function toggleUserMenu() {
  const menu = document.getElementById("user-menu");
  menu.classList.toggle("open");
}
function closeUserMenu() {
  document.getElementById("user-menu").classList.remove("open");
}
// Close user menu when clicking outside
document.addEventListener("click", (e) => {
  const menu   = document.getElementById("user-menu");
  const avatar = document.getElementById("user-avatar");
  if (menu && !menu.contains(e.target) && !avatar.contains(e.target)) {
    menu.classList.remove("open");
  }
});


/* ─── 16. RENDER: Main render function ──────────────────── */
function renderTasksWithFilters() {
  let list = [...tasks];

  // View filter
  if (activeViewMode === "today") {
    const t = new Date().toISOString().split("T")[0];
    list = list.filter(t2 => t2.due === t);
  } else if (activeViewMode === "upcoming") {
    const t = new Date().toISOString().split("T")[0];
    list = list.filter(t2 => t2.due > t && !t2.done);
  } else if (activeViewMode === "done") {
    list = list.filter(t2 => t2.done);
  }

  // Priority filter
  if (currentPriorityFilter) list = list.filter(t => t.priority === currentPriorityFilter);

  // Completion filter
  if (currentFilter === "pending") list = list.filter(t => !t.done);
  if (currentFilter === "done")    list = list.filter(t =>  t.done);

  // Search filter
  if (searchQuery) {
    list = list.filter(t =>
      t.title.toLowerCase().includes(searchQuery) ||
      t.category.toLowerCase().includes(searchQuery) ||
      (t.notes || "").toLowerCase().includes(searchQuery)
    );
  }

  // Sort
  if (sortMode === "priority") {
    const ord = { high: 0, medium: 1, low: 2 };
    list.sort((a, b) => ord[a.priority] - ord[b.priority]);
  } else if (sortMode === "date") {
    list.sort((a, b) => (a.due || "").localeCompare(b.due || ""));
  } else if (sortMode === "name") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  updateStats();
  updateSidebarStats();
  buildTaskListHTML(list);
}


/* ─── 17. BUILD TASK HTML ───────────────────────────────── */
function buildTaskListHTML(list) {
  const container = document.getElementById("task-list");

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-emoji">✨</span>
        <h3>${searchQuery ? "No results found" : "No tasks here"}</h3>
        <p>${searchQuery ? "Try a different search term" : "Add a task to get started!"}</p>
      </div>`;
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  container.innerHTML = list.map((task, i) => {
    const isOverdue = task.due && task.due < today && !task.done;
    const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    return `
    <div class="task-item ${task.done ? "done" : ""}" style="animation-delay:${i * .04}s">

      <!-- Checkbox -->
      <div class="task-check ${task.done ? "done" : ""}" onclick="toggleTask(${task.id})">
        ${task.done ? '<i class="fa-solid fa-check"></i>' : ""}
      </div>

      <!-- Task content -->
      <div class="task-info">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span class="priority-pill ${task.priority}">
            <i class="fa-solid fa-circle" style="font-size:8px"></i>
            ${priorityLabel}
          </span>
          <span class="task-tag">
            <i class="fa-solid fa-tag"></i> ${task.category}
          </span>
          ${task.due ? `
          <span class="task-due ${isOverdue ? "overdue" : ""}">
            <i class="fa-solid fa-calendar${isOverdue ? "-xmark" : ""}"></i>
            ${isOverdue ? "Overdue · " : ""}${formatDate(task.due)}
          </span>` : ""}
        </div>
        ${task.notes ? `<div class="task-notes-preview"><i class="fa-solid fa-note-sticky"></i> ${task.notes}</div>` : ""}
      </div>

      <!-- Action buttons -->
      <div class="task-actions">
        <button class="task-btn edit" onclick="openEditModal(${task.id})" title="Edit">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="task-btn del" onclick="deleteTask(${task.id})" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>

    </div>`;
  }).join("");
}


/* ─── 18. STATS ─────────────────────────────────────────── */
function updateStats() {
  const total  = tasks.length;
  const done   = tasks.filter(t => t.done).length;
  const pct    = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("stat-total").textContent   = total;
  document.getElementById("stat-done").textContent    = done;
  document.getElementById("stat-pct").textContent     = pct + "%";
  document.getElementById("badge-all").textContent    = tasks.filter(t => !t.done).length;

  // Progress bars
  ["progress-fill", "sp-fill"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.width = pct + "%";
  });
  const pl = document.getElementById("progress-label");
  if (pl) pl.textContent = `${pct}% complete`;
  const spPct = document.getElementById("sp-pct");
  if (spPct) spPct.textContent = pct + "%";
}

function updateSidebarStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = total - done;
  const ss = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  ss("ss-total", total);
  ss("ss-done", done);
  ss("ss-pending", pending);
}


/* ─── 19. TOGGLE TASK DONE ──────────────────────────────── */
// TODO: Update Firestore: updateDoc(doc(db,"tasks",id), { done: newVal })
function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) {
    t.done = !t.done;
    renderTasksWithFilters();
    showToast(t.done ? "✅" : "↩️", t.done ? "Task completed!" : "Task reopened");
  }
}


/* ─── 20. DELETE TASK ───────────────────────────────────── */
// TODO: deleteDoc(doc(db,"tasks",id))
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasksWithFilters();
  showToast("🗑", "Task deleted");
}


/* ─── 21. MODAL: Add Task ───────────────────────────────── */
function openModal() {
  document.getElementById("task-due").value = new Date().toISOString().split("T")[0];
  document.getElementById("task-modal").classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("task-title-input").focus(), 120);
}

function closeModal() {
  document.getElementById("task-modal").classList.remove("open");
  document.body.style.overflow = "";
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById("task-modal")) closeModal();
}

// TODO: Also call Firebase addDoc in saveTask
function saveTask() {
  const title = document.getElementById("task-title-input").value.trim();
  if (!title) { showToast("⚠️", "Please enter a task title"); return; }

  const newTask = {
    id:       Date.now(),
    title,
    priority: document.getElementById("task-priority").value,
    category: document.getElementById("task-category").value,
    due:      document.getElementById("task-due").value,
    notes:    document.getElementById("task-notes").value.trim(),
    done:     false,
  };

  tasks.unshift(newTask);
  renderTasksWithFilters();
  closeModal();

  // Reset form
  document.getElementById("task-title-input").value = "";
  document.getElementById("task-notes").value        = "";
  document.getElementById("task-priority").value     = "medium";

  showToast("✅", "Task added!");
}


/* ─── 22. MODAL: Edit Task ──────────────────────────────── */
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById("edit-task-id").value    = id;
  document.getElementById("edit-title").value      = task.title;
  document.getElementById("edit-priority").value   = task.priority;
  document.getElementById("edit-category").value   = task.category;
  document.getElementById("edit-due").value        = task.due || "";

  document.getElementById("edit-modal").classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("edit-title").focus(), 120);
}

function closeEditModal() {
  document.getElementById("edit-modal").classList.remove("open");
  document.body.style.overflow = "";
}

function handleEditOverlayClick(e) {
  if (e.target === document.getElementById("edit-modal")) closeEditModal();
}

// TODO: Also call Firebase updateDoc in saveEditTask
function saveEditTask() {
  const id   = parseInt(document.getElementById("edit-task-id").value);
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newTitle = document.getElementById("edit-title").value.trim();
  if (!newTitle) { showToast("⚠️", "Title cannot be empty"); return; }

  task.title    = newTitle;
  task.priority = document.getElementById("edit-priority").value;
  task.category = document.getElementById("edit-category").value;
  task.due      = document.getElementById("edit-due").value;

  renderTasksWithFilters();
  closeEditModal();
  showToast("✏️", "Task updated!");
}


/* ─── 23. SIDEBAR DRAWER (mobile/tablet) ────────────────── */
function toggleSidebar() {
  sidebarIsOpen ? closeSidebar() : openSidebar();
}

function openSidebar() {
  sidebarIsOpen = true;
  const sidebar   = document.getElementById("sidebar");
  const overlay   = document.getElementById("sidebar-overlay");
  const hamburger = document.getElementById("hamburger-btn");

  sidebar.classList.add("open");
  overlay.classList.add("visible");
  hamburger.classList.add("sidebar-open");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebarIsOpen = false;
  const sidebar   = document.getElementById("sidebar");
  const overlay   = document.getElementById("sidebar-overlay");
  const hamburger = document.getElementById("hamburger-btn");

  sidebar.classList.remove("open");
  overlay.classList.remove("visible");
  hamburger.classList.remove("sidebar-open");
  document.body.style.overflow = "";
}


/* ─── 24. MOBILE BOTTOM NAV ─────────────────────────────── */
function mobileNav(view, el) {
  document.querySelectorAll(".bnav-item").forEach(i => i.classList.remove("active"));
  el.classList.add("active");

  activeViewMode        = view;
  currentPriorityFilter = null;

  const titles = { all: "All Tasks", today: "Today", upcoming: "Upcoming", done: "Completed" };
  document.getElementById("view-title").textContent = titles[view];

  renderTasksWithFilters();
}


/* ─── 25. UTILITY: Format Date ──────────────────────────── */
function formatDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}


/* ─── 26. UTILITY: Toast ────────────────────────────────── */
let toastTimer = null;
function showToast(icon, msg) {
  document.getElementById("toast-icon").textContent = icon;
  document.getElementById("toast-msg").textContent  = msg;
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}


/* ─── 27. KEYBOARD SHORTCUTS ────────────────────────────── */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeEditModal();
    closeSidebar();
    closeSearch();
  }
  // Ctrl/Cmd + K = open search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    toggleSearch();
  }
  // Ctrl/Cmd + N = new task
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    openModal();
  }
});

// Enter to save in add-modal
document.getElementById("task-title-input").addEventListener("keydown", e => {
  if (e.key === "Enter") saveTask();
});

// Enter to save in edit-modal
document.getElementById("edit-title").addEventListener("keydown", e => {
  if (e.key === "Enter") saveEditTask();
});


/* ─── 28. INIT ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("view-date").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

 
});
