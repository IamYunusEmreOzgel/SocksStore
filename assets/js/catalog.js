const CATALOG_DATA_PATH = "data/products.json";

const catalogGrid = document.querySelector("#catalog-grid");
const catalogEmpty = document.querySelector("#catalog-empty");
const resultCount = document.querySelector("#result-count");
const clearFiltersButton = document.querySelector("#clear-filters");

const controls = {
    search: document.querySelector("#catalog-search"),
    category: document.querySelector("#category-filter"),
    audience: document.querySelector("#audience-filter"),
    size: document.querySelector("#size-filter"),
    color: document.querySelector("#color-filter"),
    material: document.querySelector("#material-filter"),
    usage: document.querySelector("#usage-filter"),
    featured: document.querySelector("#featured-filter"),
    sort: document.querySelector("#sort-filter")
};

let catalogProducts = [];

function uniqueValues(items) {
    return [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
}

function fillSelect(select, values) {
    const firstOption = select.options[0].outerHTML;
    select.innerHTML = firstOption + values.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function setupFilters() {
    fillSelect(controls.category, uniqueValues(catalogProducts.map((product) => product.category)));
    fillSelect(controls.audience, uniqueValues(catalogProducts.map((product) => product.audience)));
    fillSelect(controls.size, uniqueValues(catalogProducts.flatMap((product) => product.sizes || [])));
    fillSelect(controls.color, uniqueValues(catalogProducts.flatMap((product) => product.colors.map((color) => color.name))));
    fillSelect(controls.material, uniqueValues(catalogProducts.map((product) => product.material)));
    fillSelect(controls.usage, uniqueValues(catalogProducts.map((product) => product.usage)));
}

function getFilteredProducts() {
    const searchTerm = controls.search.value.trim().toLocaleLowerCase("tr-TR");

    const filtered = catalogProducts.filter((product) => {
        const searchableText = `${product.name} ${product.code} ${product.description} ${product.category} ${product.material}`.toLocaleLowerCase("tr-TR");
        const matchesSearch = searchableText.includes(searchTerm);
        const matchesCategory = !controls.category.value || product.category === controls.category.value;
        const matchesAudience = !controls.audience.value || product.audience === controls.audience.value;
        const matchesSize = !controls.size.value || product.sizes.includes(controls.size.value);
        const matchesColor = !controls.color.value || product.colors.some((color) => color.name === controls.color.value);
        const matchesMaterial = !controls.material.value || product.material === controls.material.value;
        const matchesUsage = !controls.usage.value || product.usage === controls.usage.value;
        const matchesFeatured = !controls.featured.checked || Boolean(product.badge);

        return matchesSearch && matchesCategory && matchesAudience && matchesSize && matchesColor && matchesMaterial && matchesUsage && matchesFeatured;
    });

    return sortProducts(filtered);
}

function sortProducts(products) {
    const sorted = [...products];

    if (controls.sort.value === "name-asc") {
        sorted.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    } else if (controls.sort.value === "name-desc") {
        sorted.sort((a, b) => b.name.localeCompare(a.name, "tr"));
    } else if (controls.sort.value === "code-asc") {
        sorted.sort((a, b) => a.code.localeCompare(b.code, "tr"));
    }

    return sorted;
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

function createCatalogCard(product, index) {
    const colorDots = product.colors.map((color) => `
        <span class="color-dot" style="background-color: ${color.hex}" title="${color.name}" aria-label="${color.name}"></span>
    `).join("");

    const hasImages = Array.isArray(product.images) && product.images.length > 0;

    return `
        <article class="product-card is-filtering-in" style="--card-delay: ${index * 65}ms">
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
                <div class="catalog-card-details">
                    <span>${product.audience}</span>
                    <span>${product.sizes.join(" / ")}</span>
                    <span>${product.material}</span>
                    <span>${product.usage}</span>
                </div>
                <div class="product-colors" aria-label="Renk seçenekleri">${colorDots}</div>
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

catalogGrid.addEventListener("click", (event) => {
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

function renderCatalog() {
    const filteredProducts = getFilteredProducts();
    catalogGrid.innerHTML = filteredProducts.map(createCatalogCard).join("");
    resultCount.textContent = `${filteredProducts.length} ürün`;
    catalogEmpty.hidden = filteredProducts.length > 0;
    catalogGrid.hidden = filteredProducts.length === 0;
}

function resetFilters() {
    Object.entries(controls).forEach(([key, control]) => {
        if (key === "featured") {
            control.checked = false;
        } else if (key === "sort") {
            control.value = "default";
        } else {
            control.value = "";
        }
    });

    renderCatalog();
}

async function loadCatalog() {
    try {
        const response = await fetch(CATALOG_DATA_PATH);
        if (!response.ok) {
            throw new Error(`Katalog yüklenemedi: ${response.status}`);
        }

        catalogProducts = await response.json();
        setupFilters();
        renderCatalog();
    } catch (error) {
        console.error(error);
        catalogGrid.hidden = true;
        catalogEmpty.hidden = false;
        catalogEmpty.querySelector("h3").textContent = "Katalog şu anda görüntülenemiyor.";
        catalogEmpty.querySelector("p").textContent = "Lütfen daha sonra tekrar deneyin.";
    }
}

Object.values(controls).forEach((control) => {
    control.addEventListener(control.type === "search" ? "input" : "change", renderCatalog);
});

clearFiltersButton.addEventListener("click", resetFilters);
loadCatalog();
