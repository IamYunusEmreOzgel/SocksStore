const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-navigation");
const navigationLinks = document.querySelectorAll(".main-navigation a");
const currentYear = document.querySelector("#current-year");
const siteHeader = document.querySelector(".site-header");
const pageIntro = document.querySelector(".page-intro");

function loadMobileMenuFixStyles() {
    if (document.querySelector('link[href="assets/css/mobile-menu-fix.css"]')) {
        return;
    }

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "assets/css/mobile-menu-fix.css";
    document.head.appendChild(stylesheet);
}

function updateMobileViewportHeight() {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--mobile-viewport-height", `${viewportHeight}px`);
}

loadMobileMenuFixStyles();
updateMobileViewportHeight();

window.addEventListener("resize", updateMobileViewportHeight, { passive: true });
window.addEventListener("orientationchange", () => {
    window.setTimeout(updateMobileViewportHeight, 150);
});
window.visualViewport?.addEventListener("resize", updateMobileViewportHeight, { passive: true });

function finishIntro() {
    document.documentElement.classList.remove("intro-loading");

    if (!pageIntro) {
        return;
    }

    pageIntro.classList.add("is-leaving");

    window.setTimeout(() => {
        pageIntro.classList.add("is-hidden");
    }, 950);
}

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishIntro();
} else {
    window.addEventListener("load", () => {
        window.setTimeout(finishIntro, 850);
    });

    window.setTimeout(finishIntro, 3000);
}

function closeMenu() {
    if (!menuToggle || !navigation) {
        return;
    }

    menuToggle.classList.remove("is-active");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    document.documentElement.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menüyü aç");
}

function openMenu() {
    if (!menuToggle || !navigation) {
        return;
    }

    updateMobileViewportHeight();
    menuToggle.classList.add("is-active");
    navigation.classList.add("is-open");
    document.body.classList.add("menu-open");
    document.documentElement.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Menüyü kapat");
}

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        navigation.classList.contains("is-open") ? closeMenu() : openMenu();
    });
}

navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation?.classList.contains("is-open")) {
        closeMenu();
        menuToggle?.focus();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeMenu();
    }
});

function updateHeaderState() {
    if (!siteHeader) {
        return;
    }

    siteHeader.classList.toggle("is-scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    },
    {
        threshold: 0.14,
        rootMargin: "0px 0px -45px 0px"
    }
);

function observeRevealElements(root = document) {
    const revealElements = root.querySelectorAll(".reveal:not([data-reveal-ready])");

    revealElements.forEach((element) => {
        element.dataset.revealReady = "true";
        revealObserver.observe(element);
    });
}

function preparePageAnimations() {
    const benefitItems = document.querySelectorAll(".benefits-grid article");
    const sectionHeadings = document.querySelectorAll(".section-heading");
    const productToolbar = document.querySelector(".product-toolbar");
    const aboutColumns = document.querySelectorAll(".about-grid > div");
    const contactCard = document.querySelector(".contact-card");
    const footerInner = document.querySelector(".footer-inner");

    benefitItems.forEach((item, index) => {
        item.classList.add("reveal");
        item.style.setProperty("--reveal-delay", `${index * 110}ms`);
    });

    sectionHeadings.forEach((heading) => heading.classList.add("reveal"));

    if (productToolbar) {
        productToolbar.classList.add("reveal");
        productToolbar.style.setProperty("--reveal-delay", "100ms");
    }

    aboutColumns.forEach((column, index) => {
        column.classList.add("reveal", index === 0 ? "reveal-left" : "reveal-right");
    });

    if (contactCard) {
        contactCard.classList.add("reveal", "reveal-scale");
    }

    if (footerInner) {
        footerInner.classList.add("reveal");
    }

    observeRevealElements();
}

window.observeRevealElements = observeRevealElements;
preparePageAnimations();

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}
