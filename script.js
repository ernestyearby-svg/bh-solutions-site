// Minimal JS: highlight active nav link based on data-page on <body>

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.dataset.page;
  if (!currentPage) return;

  document.querySelectorAll(".nav-link[data-nav]").forEach((link) => {
    if (link.dataset.nav === currentPage) {
      link.classList.add("is-active");
    }
  });
});
