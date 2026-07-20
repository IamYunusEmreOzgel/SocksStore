const storySection = document.querySelector(".story-section");
const storySteps = [...document.querySelectorAll(".story-step")];
const storyScenes = [...document.querySelectorAll(".story-scene")];
const storyDots = [...document.querySelectorAll(".story-dot")];

let activeStoryIndex = 0;
let storyTicking = false;

function getViewportHeight() {
    return window.visualViewport?.height || window.innerHeight;
}

function setStoryStep(index) {
    if (index === activeStoryIndex && storyScenes[index]?.classList.contains("is-active")) {
        return;
    }

    activeStoryIndex = index;
    storySteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
    storyScenes.forEach((scene, sceneIndex) => scene.classList.toggle("is-active", sceneIndex === index));
    storyDots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
}

function updateStory() {
    storyTicking = false;

    if (!storySection || storySteps.length === 0) {
        return;
    }

    const viewportHeight = getViewportHeight();
    const rect = storySection.getBoundingClientRect();
    const scrollableDistance = Math.max(storySection.offsetHeight - viewportHeight, 1);
    const progressed = Math.min(Math.max(-rect.top, 0), scrollableDistance);
    const progress = progressed / scrollableDistance;
    const exactStep = progress * storySteps.length;
    const index = Math.min(storySteps.length - 1, Math.floor(exactStep));
    const localProgress = Math.min(1, Math.max(0, exactStep - index));

    setStoryStep(index);

    storyScenes.forEach((scene, sceneIndex) => {
        scene.style.setProperty("--scene-progress", sceneIndex === index ? localProgress.toFixed(3) : "0");
    });
}

function requestStoryUpdate() {
    if (storyTicking) {
        return;
    }

    storyTicking = true;
    window.requestAnimationFrame(updateStory);
}

if (storySection && storySteps.length) {
    setStoryStep(0);
    window.addEventListener("scroll", requestStoryUpdate, { passive: true });
    window.addEventListener("resize", requestStoryUpdate);
    window.visualViewport?.addEventListener("resize", requestStoryUpdate);
    window.visualViewport?.addEventListener("scroll", requestStoryUpdate);
    requestStoryUpdate();

    storyDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            const viewportHeight = getViewportHeight();
            const availableDistance = Math.max(storySection.offsetHeight - viewportHeight, 0);
            const targetY = storySection.offsetTop + (availableDistance * index) / Math.max(storySteps.length - 1, 1);
            window.scrollTo({ top: targetY, behavior: "smooth" });
        });
    });
}