const GATE_KEY = "aqibsweb_unlocked";

function unlockSite() {
  document.documentElement.classList.add("unlocked");
  const gate = document.getElementById("gate");
  if (gate) gate.hidden = true;
}

function setupGate() {
  const form = document.getElementById("gate-form");
  const phone = document.getElementById("gate-phone");
  const error = document.getElementById("gate-error");
  if (!form || !phone) return;

  if (sessionStorage.getItem(GATE_KEY) === "1") {
    unlockSite();
    return;
  }

  phone.addEventListener("input", () => {
    phone.value = phone.value.replace(/\D/g, "").slice(0, 10);
    error.hidden = true;
    phone.classList.remove("is-bad");
  });

  phone.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    phone.value = String(text).replace(/\D/g, "").slice(0, 10);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = phone.value.trim();
    if (!/^[0-9]{10}$/.test(value)) {
      error.hidden = false;
      phone.classList.add("is-bad");
      phone.focus();
      return;
    }
    sessionStorage.setItem(GATE_KEY, "1");
    unlockSite();
  });

  phone.focus();
}

const q = document.getElementById("q");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const cards = [...document.querySelectorAll(".card")];

function filter() {
  if (!q || !count || !empty) return;
  const needle = (q.value || "").trim().toLowerCase();
  let shown = 0;
  for (const card of cards) {
    const hay = `${card.dataset.name} ${card.querySelector("h2").textContent} ${card.querySelector("p").textContent}`.toLowerCase();
    const hit = !needle || hay.includes(needle);
    card.hidden = !hit;
    if (hit) shown += 1;
  }
  empty.hidden = shown !== 0;
  count.textContent = needle
    ? `${shown} match${shown === 1 ? "" : "es"}`
    : `${shown} tools on the desk`;
}

setupGate();
if (q) q.addEventListener("input", filter);
filter();
