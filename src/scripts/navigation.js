const setExpanded = (button, expanded) => {
  button.setAttribute("aria-expanded", String(expanded));
  const target = document.getElementById(button.getAttribute("aria-controls"));
  if (target) target.classList.toggle("hidden", !expanded);
};

const initializeNavigation = (root = document) => {
  root.querySelectorAll("[data-menu-button]").forEach((button) => {
    if (button.dataset.menuReady) return;
    button.dataset.menuReady = "true";
    button.addEventListener("click", () => {
      setExpanded(button, button.getAttribute("aria-expanded") !== "true");
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setExpanded(button, false);
        button.focus();
      }
    });
  });

  const mobileButton = root.querySelector("#mobile-menu-button");
  if (mobileButton && !mobileButton.dataset.menuReady) {
    mobileButton.dataset.menuReady = "true";
    mobileButton.addEventListener("click", () => {
      setExpanded(mobileButton, mobileButton.getAttribute("aria-expanded") !== "true");
    });
  }
};

document.addEventListener("clientcore:components-loaded", () => initializeNavigation());
document.addEventListener("DOMContentLoaded", () => initializeNavigation());

const observer = new MutationObserver((mutations) => {
  if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
    initializeNavigation();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });
