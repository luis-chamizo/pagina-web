const siteHeader = document.getElementById("site-header");
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.querySelector(".main-nav");
const themeToggle = document.getElementById("theme-toggle");
const backToTop = document.getElementById("back-to-top");
const yearElement = document.getElementById("year");
const revealElements = document.querySelectorAll(".reveal");
const statCounters = document.querySelectorAll(".stat-number");
const searchInput = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const videoCards = document.querySelectorAll(".video-card");
const contactForm = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");

const STORAGE_THEME_KEY = "adp-theme";

function setTheme(theme) {
  document.body.classList.toggle("dark-theme", theme === "dark");
  document.body.classList.toggle("light-theme", theme === "light");
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Desactivar modo oscuro" : "Activar modo oscuro"
  );
  localStorage.setItem(STORAGE_THEME_KEY, theme);
}

function getPreferredTheme() {
  const storedTheme = localStorage.getItem(STORAGE_THEME_KEY);
  if (storedTheme) return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateHeaderState() {
  const offset = window.scrollY;
  siteHeader.classList.toggle("scrolled", offset > 20);
}

function toggleNav() {
  const isOpen = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
}

function closeNav() {
  mainNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

function handleSmoothLinks(event) {
  if (event.target.matches(".nav-list a, .hero-actions a, .footer-nav a")) {
    event.preventDefault();
    const href = event.target.getAttribute("href");
    if (href && href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      closeNav();
    }
  }
}

function updateBackToTop() {
  const show = window.scrollY > 500;
  backToTop.classList.toggle("show", show);
}

function animateCounters() {
  statCounters.forEach((counter) => {
    const target = +counter.dataset.target;
    const current = +counter.textContent.replace("+", ""
    );
    if (current >= target) return;

    const duration = 1800;
    const stepTime = Math.max(20, Math.floor(duration / target));
    let count = 0;

    const interval = setInterval(() => {
      count += Math.ceil(target / (duration / stepTime));
      if (count >= target) {
        counter.textContent = target.toLocaleString();
        clearInterval(interval);
      } else {
        counter.textContent = count.toLocaleString();
      }
    }, stepTime);
  });
}

function filterVideos() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  videoCards.forEach((card) => {
    const title = card.dataset.title.toLowerCase();
    const cardCategory = card.dataset.category;
    const matchesQuery = !query || title.includes(query);
    const matchesCategory = category === "all" || cardCategory === category;
    card.style.display = matchesQuery && matchesCategory ? "grid" : "none";
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFeedback(message, isSuccess = true) {
  formFeedback.textContent = message;
  formFeedback.style.color = isSuccess ? "var(--success)" : "#e74c3c";
}

function resetFormFeedback() {
  formFeedback.textContent = "";
}

function handleFormSubmit(event) {
  event.preventDefault();
  resetFormFeedback();

  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const subject = contactForm.subject.value.trim();
  const message = contactForm.message.value.trim();
  let valid = true;

  [contactForm.name, contactForm.email, contactForm.subject, contactForm.message].forEach((field) => {
    field.style.borderColor = "var(--border)";
  });

  if (!name) {
    contactForm.name.style.borderColor = "#e74c3c";
    valid = false;
  }
  if (!email || !validateEmail(email)) {
    contactForm.email.style.borderColor = "#e74c3c";
    valid = false;
  }
  if (!subject) {
    contactForm.subject.style.borderColor = "#e74c3c";
    valid = false;
  }
  if (!message) {
    contactForm.message.style.borderColor = "#e74c3c";
    valid = false;
  }

  if (!valid) {
    showFeedback("Por favor completa todos los campos correctamente.", false);
    return;
  }

  contactForm.reset();
  showFeedback("¡Mensaje enviado! Nos pondremos en contacto contigo pronto.");
}

function revealOnScroll(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}

function initRevealObserver() {
  const observer = new IntersectionObserver(revealOnScroll, {
    threshold: 0.15,
  });

  revealElements.forEach((element) => observer.observe(element));
}

function init() {
  setTheme(getPreferredTheme());
  updateHeaderState();
  updateBackToTop();
  yearElement.textContent = new Date().getFullYear();
  filterVideos();
  initRevealObserver();

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  counterObserver.observe(document.querySelector(".stats-grid"));
}

navToggle.addEventListener("click", toggleNav);
mainNav.addEventListener("click", (event) => {
  if (event.target.tagName === "A") closeNav();
});
window.addEventListener("scroll", () => {
  updateHeaderState();
  updateBackToTop();
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) closeNav();
});
window.addEventListener("click", handleSmoothLinks);
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
searchInput.addEventListener("input", filterVideos);
categorySelect.addEventListener("change", filterVideos);
contactForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
  setTheme(newTheme);
});

document.addEventListener("DOMContentLoaded", init);
