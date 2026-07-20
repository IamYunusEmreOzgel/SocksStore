const PRODUCT_DATA_PATH = "data/products.json";

const productGrid = document.querySelector("#product-grid");
const categoryFilters = document.querySelector("#category-filters");
const productSearch = document.querySelector("#product-search");
const emptyState = document.querySelector("#empty-state");

let products = [];
let selectedCategory = "Tümü";
let searchTerm = "";

async function loadProducts() {
    try {
        const response = await fetch(PRODUCT_DATA_PATH);

        if (!response.ok) {
            throw new Error(`Ürün verileri yüklenemedi: ${response.status}`);
        }

        products = await response.json();
        createCategoryFilters();
        renderProducts();
    } catch (error) {
        console.error(error);
        productGrid.innerHTML = "";
        emptyState.hidden = false;
        emptyState.textContent = "Ürünler şu anda görüntülenemiyor.";
    }
}

function createCategoryFilters() {
    const categories = ["Tümü", ...new Set(products.map((product) => product.category))];

    categoryFilters.innerHTML = categories
        .map(
            (category) => `
                <button
                    class="filter-button ${category === selectedCategory ? "is-active" : ""}"
                    type="button"
                    data-category="${category}"
                >
                    ${category}
                </button>
            `
        )
        .join("");
}

function renderProducts() {
    const normalizedSearch = searchTerm.toLocaleLowerCase("tr-TR");

    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === "Tümü" || product.category === selectedCategory;
        const searchableText = `${product.name} ${product.code} ${product.description}`.toLocaleLowerCase("tr-TR");
        const matchesSearch = searchableText.includes(normalizedSearch);

        return matchesCategory && matchesSearch;
    });

    productGrid.innerHTML = filteredProducts
        .map((product, index) => createProductCard(product, index))
        .join("");

    emptyState.hidden = filteredProducts.length > 0;
}

function createProductVisual(product) {
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

    if (!images.length) {
        return `<div class="product-placeholder" aria-hidden="true"></div>`;
    }

    const slides = images.map((image, index) => `
        <img
            class="product-photo ${index === 0 ? "is-active" : ""}"
            src="${image}"
            alt="${index === 0 ? product.name : `${product.name} görsel ${index + 1}`}"
            loading="lazy"
            data-gallery-image="${index}"
        >
    `).join("");

    const dots = images.map((_, index) => `
        <button
            class="product-gallery-dot ${index === 0 ? "is-active" : ""}"
            type="button"
            data-gallery-go="${index}"
            aria-label="${index + 1}. görseli göster"
        ></button>
    `).join("");

    return `
        <div class="product-gallery" data-gallery-index="0" data-gallery-count="${images.length}">
            ${slides}
            ${images.length > 1 ? `
                <button class="product-gallery-button product-gallery-prev" type="button" data-gallery-direction="-1" aria-label="Önceki görsel">‹</button>
                <button class="product-gallery-button product-gallery-next" type="button" data-gallery-direction="1" aria-label="Sonraki görsel">›</button>
                <div class="product-gallery-dots">${dots}</div>
            ` : ""}
        </div>
    `;
}

function createProductCard(product, index) {
    const colorDots = product.colors
        .map(
            (color) => `
                <span
                    class="color-dot"
                    style="background-color: ${color.hex}"
                    title="${color.name}"
                    aria-label="${color.name}"
                ></span>
            `
        )
        .join("");

    const hasImages = Array.isArray(product.images) && product.images.length > 0;

    return `
        <article class="product-card is-filtering-in" style="--card-delay: ${Math.min(index * 70, 350)}ms">
            <div class="product-image ${hasImages ? "has-product-photo" : ""}" style="--product-background: ${product.background}; --product-color: ${product.primaryColor};">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
                ${createProductVisual(product)}
            </div>
            <div class="product-content">
                <div class="product-meta">
                    <span>${product.category}</span>
                    <span>${product.code}</span>
                </div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-colors" aria-label="Renk seçenekleri">
                    ${colorDots}
                </div>
            </div>
        </article>
    `;
}

function updateGallery(gallery, nextIndex) {
    const count = Number(gallery.dataset.galleryCount || 0);
    if (!count) return;

    const normalizedIndex = (nextIndex + count) % count;
    gallery.dataset.galleryIndex = String(normalizedIndex);

    gallery.querySelectorAll("[data-gallery-image]").forEach((image, index) => {
        image.classList.toggle("is-active", index === normalizedIndex);
    });

    gallery.querySelectorAll("[data-gallery-go]").forEach((dot, index) => {
        dot.classList.toggle("is-active", index === normalizedIndex);
    });
}

productGrid.addEventListener("click", (event) => {
    const gallery = event.target.closest(".product-gallery");
    if (!gallery) return;

    const directionButton = event.target.closest("[data-gallery-direction]");
    if (directionButton) {
        const currentIndex = Number(gallery.dataset.galleryIndex || 0);
        updateGallery(gallery, currentIndex + Number(directionButton.dataset.galleryDirection));
        return;
    }

    const dotButton = event.target.closest("[data-gallery-go]");
    if (dotButton) {
        updateGallery(gallery, Number(dotButton.dataset.galleryGo));
    }
});

categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");

    if (!button) {
        return;
    }

    selectedCategory = button.dataset.category;
    createCategoryFilters();
    renderProducts();
});

productSearch.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim();
    renderProducts();
});

loadProducts();
