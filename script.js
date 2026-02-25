// Mobile nav toggle + footer year
(function () {
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const year = document.getElementById("year");

if (year) year.textContent = new Date().getFullYear();

if (!toggle || !nav) return;

toggle.addEventListener("click", () => {
const open = nav.classList.toggle("open");
toggle.setAttribute("aria-expanded", open ? "true" : "false");
});

// Close menu after click (mobile)
nav.querySelectorAll("a").forEach((a) => {
a.addEventListener("click", () => {
nav.classList.remove("open");
toggle.setAttribute("aria-expanded", "false");
});
});
})();
