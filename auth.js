const GATE_KEY = "aqibsweb_unlocked";
const PHONE_RE = /^[6-9]\d{9}$/;
const NAME_RE = /^[A-Za-z][A-Za-z .']{2,}$/;

const $ = (id) => document.getElementById(id);

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
  const nameEl = $("gate-name");
  const phoneEl = $("gate-phone");
  const error = $("gate-error");
  if (!form || !nameEl || !phoneEl) return;

  const clearErr = () => {
    error.hidden = true;
    error.textContent = "";
    nameEl.classList.remove("is-bad");
    phoneEl.classList.remove("is-bad");
  };

  nameEl.addEventListener("input", clearErr);
  phoneEl.addEventListener("input", () => {
    phoneEl.value = phoneEl.value.replace(/\D/g, "").slice(0, 10);
    clearErr();
  });
  phoneEl.addEventListener("paste", (e) => {
    e.preventDefault();
    phoneEl.value = String((e.clipboardData || window.clipboardData).getData("text"))
      .replace(/\D/g, "")
      .slice(0, 10);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();

    if (!NAME_RE.test(name) || name.split(/\s+/).length < 2) {
      nameEl.classList.add("is-bad");
      error.hidden = false;
      error.textContent = "Please enter your full name";
      nameEl.focus();
      return;
    }
    if (!PHONE_RE.test(phone)) {
      phoneEl.classList.add("is-bad");
      error.hidden = false;
      error.textContent = "Please enter a valid 10-digit number";
      phoneEl.focus();
      return;
    }

    sessionStorage.setItem("aqibsweb_visitor", JSON.stringify({ name, phone }));
    unlockSite();
  });

  nameEl.focus();
}
