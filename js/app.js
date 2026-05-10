import { Storage } from './storage.js';
const qs = (selector) =>
  document.querySelector(selector);

// ===============================
// LIVE CLOCK
// ===============================

let clockInterval;

function initClock() {

  const liveClock =
    qs("#liveClock");

  if (!liveClock) return;

  function updateClock() {

    const now = new Date();

    liveClock.textContent =
      now.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        }
      );
  }

  updateClock();

  clearInterval(clockInterval);

  clockInterval =
    setInterval(updateClock, 1000);
}

// ===============================
// CURRENT DATE
// ===============================

function initDate() {
  const dateEl = document.getElementById("currentDate");
  if (!dateEl) return;
  
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

// ===============================
// THEME TOGGLE
// ===============================

function initThemeToggle() {

  const themeBtn =
    qs("#themeToggle");

  if (!themeBtn) return;

  const savedTheme =
    localStorage.getItem(
      "spd_theme"
    );

  // Apply saved theme
  if (savedTheme === "dark") {

    document.body.classList.add(
      "dark"
    );
  }

  updateThemeIcon();

  themeBtn.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "dark"
      );

      const isDark =
        document.body.classList.contains(
          "dark"
        );

      localStorage.setItem(
        "spd_theme",
        isDark ? "dark" : "light"
      );

      updateThemeIcon();
    }
  );

  function updateThemeIcon() {

    const isDark =
      document.body.classList.contains(
        "dark"
      );

    themeBtn.textContent =
      isDark ? "☀️" : "🌙";
  }
}

// ===============================
// SIDEBAR
// ===============================

function initSidebar() {

  const sidebar =
    qs("#sidebar");

  const sidebarToggle =
    qs("#sidebarToggle");

  if (!sidebar ||
      !sidebarToggle) return;

  sidebarToggle.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "collapsed"
      );
    }
  );
}


// ===============================
// PROFILE MANAGER
// ===============================

function initProfileManager() {
  const profileDiv = document.querySelector('.sidebar-profile');
  if (!profileDiv) return;

  profileDiv.style.cursor = 'pointer';
  profileDiv.title = 'Click to edit profile';

  // Load from Storage
  let user = Storage.get(Storage.KEYS.USER) || { name: 'Rahul Sharma', course: 'B.Tech M&C · Sem 2', avatarData: '' };
  
  function updateDOM() {
    const nameEls = document.querySelectorAll('.profile-name');
    const courseEls = document.querySelectorAll('.profile-course');
    const avatarEls = document.querySelectorAll('.profile-avatar');
    const greetingEl = document.getElementById('greetingText');

    nameEls.forEach(el => el.textContent = user.name);
    courseEls.forEach(el => el.textContent = user.course);
    
    // Auto-generate initials
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEls.forEach(el => {
      if (user.avatarData) {
        el.textContent = '';
        el.style.backgroundImage = `url(${user.avatarData})`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.color = 'transparent';
      } else {
        el.style.backgroundImage = 'none';
        el.textContent = initials;
        el.style.color = '';
      }
    });

    if (greetingEl) {
      // Keep "Good morning/afternoon, etc." and just replace name
      const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
      greetingEl.textContent = `Good ${timeOfDay}, ${user.name}.`;
    }
  }

  updateDOM();

  // Create Modal
  profileDiv.addEventListener('click', () => {
    // Check if modal exists
    if(document.getElementById('profileEditModal')) {
      document.getElementById('profileEditModal').classList.add('open', 'show');
      return;
    }

    const modalHTML = `
      <div class="modal-overlay open show" id="profileEditModal">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">Edit Profile</h2>
            <button class="modal-close" id="profileCloseBtn">×</button>
          </div>
          <div class="modal-body" style="display:flex; flex-direction:column; gap:15px;">
            <div>
              <label class="modal-label">Full Name</label>
              <input type="text" class="modal-input" id="profileNameInput" value="${user.name}">
            </div>
            <div>
              <label class="modal-label">Course / Tagline</label>
              <input type="text" class="modal-input" id="profileCourseInput" value="${user.course}">
            </div>
            <div>
              <label class="modal-label">Profile Picture</label>
              <input type="file" class="modal-input" id="profilePicInput" accept="image/*" style="padding: 8px;">
            </div>
          </div>
          <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button class="modal-btn-cancel" id="profileCancelBtn">Cancel</button>
            <button class="modal-btn-confirm" id="profileSaveBtn">Save Changes</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('profileEditModal');
    
    document.getElementById('profileCloseBtn').addEventListener('click', () => modal.classList.remove('open', 'show'));
    document.getElementById('profileCancelBtn').addEventListener('click', () => modal.classList.remove('open', 'show'));
    
    document.getElementById('profileSaveBtn').addEventListener('click', () => {
      user.name = document.getElementById('profileNameInput').value.trim() || 'User';
      user.course = document.getElementById('profileCourseInput').value.trim() || '';
      
      const fileInput = document.getElementById('profilePicInput');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          user.avatarData = e.target.result;
          Storage.set(Storage.KEYS.USER, user);
          updateDOM();
          modal.classList.remove('open', 'show');
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        Storage.set(Storage.KEYS.USER, user);
        updateDOM();
        modal.classList.remove('open', 'show');
      }
    });
  });
}


// ===============================
// BACKGROUND MESH
// ===============================

function initBackgroundMesh() {
  if (document.querySelector('.bg-mesh')) return;
  const mesh1 = document.createElement('div');
  mesh1.className = 'bg-mesh';
  const mesh2 = document.createElement('div');
  mesh2.className = 'bg-mesh-2';
  document.body.appendChild(mesh1);
  document.body.appendChild(mesh2);
}

// ===============================
// INIT APP
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initDate();
    initClock();
    initThemeToggle();
    initSidebar();
    initProfileManager();
    initBackgroundMesh();
  }
);