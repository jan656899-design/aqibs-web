const q = document.getElementById("q");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const cards = [...document.querySelectorAll(".card")];
const chips = [...document.querySelectorAll(".chip")];
let kind = "all";

function filter() {
  if (!q || !count || !empty) return;
  const needle = (q.value || "").trim().toLowerCase();
  let shown = 0;
  for (const card of cards) {
    const hay = `${card.dataset.name} ${card.querySelector("h2").textContent} ${card.querySelector("p").textContent}`.toLowerCase();
    const kindOk = kind === "all" || card.dataset.kind === kind;
    const hit = kindOk && (!needle || hay.includes(needle));
    card.hidden = !hit;
    if (hit) shown += 1;
  }
  empty.hidden = shown !== 0;
  count.textContent = needle || kind !== "all"
    ? `${shown} on the desk`
    : `${shown} tools on the desk`;
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    kind = chip.dataset.kind;
    chips.forEach((c) => c.classList.toggle("is-on", c === chip));
    filter();
  });
});

if (q) q.addEventListener("input", filter);
filter();
