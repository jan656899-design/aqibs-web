import { setupAuth } from "./auth.js";

setupAuth();

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

if (q) q.addEventListener("input", filter);
filter();
