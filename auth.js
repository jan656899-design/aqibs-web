const GATE_KEY = "aqibsweb_unlocked";
const USERS_KEY = "aqibsweb_users";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const $ = (id) => document.getElementById(id);

function users() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(map) {
  localStorage.setItem(USERS_KEY, JSON.stringify(map));
}

function unlockSite() {
  const root = document.documentElement;
  const gate = $("gate");
  sessionStorage.setItem(GATE_KEY, "1");
  root.classList.add("unlocking");
  window.setTimeout(() => {
    root.classList.add("unlocked");
    root.classList.remove("unlocking");
    if (gate) gate.hidden = true;
  }, 420);
}

export function setupAuth() {
  if (sessionStorage.getItem(GATE_KEY) === "1") {
    document.documentElement.classList.add("unlocked");
    const gate = $("gate");
    if (gate) gate.hidden = true;
    return;
  }

  const form = $("login-form");
  const emailEl = $("gate-email");
  const passEl = $("gate-pass");
  const error = $("gate-error");
  if (!form || !emailEl || !passEl) return;

  const clearErr = () => {
    error.hidden = true;
    error.textContent = "";
    emailEl.classList.remove("is-bad");
    passEl.classList.remove("is-bad");
  };

  emailEl.addEventListener("input", clearErr);
  passEl.addEventListener("input", clearErr);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailEl.value.trim().toLowerCase();
    const password = passEl.value;

    if (!EMAIL_RE.test(email)) {
      emailEl.classList.add("is-bad");
      error.hidden = false;
      error.textContent = "Please enter a valid email id";
      emailEl.focus();
      return;
    }
    if (!password || password.length < 4) {
      passEl.classList.add("is-bad");
      error.hidden = false;
      error.textContent = "Please enter a valid password (min 4 characters)";
      passEl.focus();
      return;
    }

    const book = users();
    if (!book[email]) {
      book[email] = password;
      saveUsers(book);
      unlockSite();
      return;
    }
    if (book[email] !== password) {
      passEl.classList.add("is-bad");
      error.hidden = false;
      error.textContent = "Wrong password for this email";
      passEl.focus();
      return;
    }
    unlockSite();
  });

  emailEl.focus();
}
