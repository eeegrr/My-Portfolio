document.addEventListener("DOMContentLoaded", () => {
    const PROJECTS_JSON_URL = "assets/json/project-page.json";

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project");

    fetch(PROJECTS_JSON_URL)
        .then((res) => res.json())
        .then((data) => {
            if (!data || !Array.isArray(data.projects)) {
                console.error("Projects JSON is missing a 'projects' array.");
                return;
            }

            let project = null;

            if (projectId) {
                project = data.projects.find((p) => p.id === projectId);
            }

            if (!project && data.defaultProjectId) {
                project = data.projects.find((p) => p.id === data.defaultProjectId);
            }

            if (!project) {
                project = data.projects[0];
            }

            if (!project) {
                console.error("No project found.");
                return;
            }

            renderProjectPage(project);
            setupNextProjectButton(data.projects, project);
        })
        .catch((err) => console.error("Error loading projects JSON:", err));
});

function renderProjectPage(project) {
    if (!project) return;

    renderHero(project);
    renderBackground(project);
    renderSections(project.sections || []);
}

function renderHero(project) {
    setText(".work-title", project.title);

    const titleLink = document.getElementById("title-link");
    const titleButton = document.getElementById("title-button");
    const titleContainer = titleLink?.querySelector(".title-container");

    if (titleLink) {
        if (project.titleLink) {
            titleLink.href = project.titleLink;
            titleLink.style.pointerEvents = "auto";

            if (titleButton) {
                titleButton.style.display = "grid";
                titleButton.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = project.titleLink;
                };
            }
        } else {
            if (titleButton) titleButton.remove();

            if (titleContainer) {
                titleLink.replaceWith(titleContainer);
            }
        }
    }

    const metaValues = document.querySelectorAll(".work-meta .meta-value");
    if (metaValues.length >= 3) {
        handleMetaItem(metaValues[0], project.timeline);
        handleMetaItem(metaValues[1], project.contributions);
        handleMetaItem(metaValues[2], project.teammates);
    }

    const tagsContainer = document.querySelector(".work__tags");
    if (tagsContainer) {
        tagsContainer.innerHTML = "";

        if (Array.isArray(project.tags) && project.tags.length > 0) {
            project.tags.forEach((tag) => {
                const span = document.createElement("span");
                span.className = "tag";
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
        } else {
            tagsContainer.remove();
        }
    }
}

function renderBackground(project) {
    const workDetailsSection =
        document.querySelector(".work-details.section") ||
        document.querySelector(".work-details");

    if (!workDetailsSection) return;

    const bgImage = project.backgroundImage || project.backgroundImageMobile;

    if (!bgImage) {
        workDetailsSection.style.background = "";
        return;
    }

    workDetailsSection.style.background = `
        linear-gradient(to top, rgb(45, 25, 13) 0%, rgba(45, 25, 13, 0) 40%),
        url("${bgImage}") center center / cover no-repeat
    `;
}

function renderSections(sections) {
    const root = document.getElementById("dynamic-sections");
    if (!root) return;

    root.innerHTML = "";

    sections.forEach((sectionData) => {
        let sectionEl = null;

        switch (sectionData.type) {
            case "about1":
                sectionEl = buildAbout1(sectionData);
                break;
            case "about2":
                sectionEl = buildAbout2(sectionData);
                break;
            case "about3":
                sectionEl = buildAbout3(sectionData);
                break;
            default:
                console.warn("Unknown section type:", sectionData.type);
                return;
        }

        if (sectionEl) {
            root.appendChild(sectionEl);
        }
    });
}

function buildAbout1(data) {
    const template = document.getElementById("tpl-about1");
    const blockTemplate = document.getElementById("tpl-about1-block");

    if (!template || !blockTemplate) return null;

    const section = template.content.firstElementChild.cloneNode(true);

    const title = section.querySelector(".section-title");
    const left = section.querySelector(".about-left1");
    const right = section.querySelector(".about-right1");
    const image = section.querySelector(".about-image1");

    if (data.title) {
        title.textContent = data.title;
    } else {
        title.remove();
    }

    left.innerHTML = "";

    if (Array.isArray(data.blocks) && data.blocks.length > 0) {
        data.blocks.forEach((block) => {
            if (!block || (!block.subtitle && !block.description)) return;

            const blockEl = blockTemplate.content.firstElementChild.cloneNode(true);
            const subtitle = blockEl.querySelector(".about-label1");
            const description = blockEl.querySelector(".about-description1");

            if (block.subtitle) {
                subtitle.textContent = block.subtitle;
            } else {
                subtitle.remove();
            }

            if (block.description) {
                description.innerHTML = normalizeRichText(block.description);
            } else {
                description.remove();
            }

            left.appendChild(blockEl);
        });
    }

    if (!left.children.length) {
        left.remove();
    }

    if (data.image?.src) {
        image.src = data.image.src;
        image.alt = data.image.alt || "";
    } else {
        right?.remove();
    }

    if (!section.querySelector(".about-left1") && !section.querySelector(".about-right1")) {
        return null;
    }

    return section;
}

function buildAbout2(data) {
    const template = document.getElementById("tpl-about2");
    if (!template) return null;

    const section = template.content.firstElementChild.cloneNode(true);

    const title = section.querySelector(".section-title");
    const intro = section.querySelector(".about-work2__intro");
    const subtitle = section.querySelector(".about-work2__label");
    const description = section.querySelector(".about-work2__description");
    const mainImageWrapper = section.querySelector(".about-work2__main-image");
    const mainImage = mainImageWrapper?.querySelector("img");
    const gallery = section.querySelector(".about-work2__gallery");

    if (data.title) {
        title.textContent = data.title;
    } else {
        title.remove();
    }

    if (data.subtitle) {
        subtitle.textContent = data.subtitle;
    } else {
        subtitle.remove();
    }

    if (data.description) {
        description.innerHTML = normalizeRichText(data.description);
    } else {
        description.remove();
    }

    if (!data.subtitle && !data.description) {
        intro?.remove();
    }

    if (data.mainImage?.src) {
        mainImage.src = data.mainImage.src;
        mainImage.alt = data.mainImage.alt || "";
    } else {
        mainImageWrapper?.remove();
    }

    gallery.innerHTML = "";

    if (Array.isArray(data.gallery) && data.gallery.length > 0) {
        data.gallery.forEach((item) => {
            if (!item?.src) return;

            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.alt || "";
            gallery.appendChild(img);
        });
    }

    if (!gallery.children.length) {
        gallery.remove();
    }

    if (
        !section.querySelector(".about-work2__intro") &&
        !section.querySelector(".about-work2__main-image") &&
        !section.querySelector(".about-work2__gallery")
    ) {
        return null;
    }

    return section;
}

function buildAbout3(data) {
    const template = document.getElementById("tpl-about3");
    const cardTemplate = document.getElementById("tpl-about3-card");

    if (!template || !cardTemplate) return null;

    const section = template.content.firstElementChild.cloneNode(true);

    const title = section.querySelector(".section-title");
    const grid = section.querySelector(".big-projects-grid");

    if (data.title) {
        title.textContent = data.title;
    } else {
        title.remove();
    }

    grid.innerHTML = "";

    if (Array.isArray(data.cards) && data.cards.length > 0) {
        data.cards.forEach((card) => {
            if (!card || (!card.icon && !card.title && !card.text)) return;

            const cardEl = cardTemplate.content.firstElementChild.cloneNode(true);
            const icon = cardEl.querySelector(".big-projects-card__icon");
            const cardTitle = cardEl.querySelector(".big-projects-card__title");
            const text = cardEl.querySelector(".big-projects-card__text");

            if (card.icon) {
                icon.className = `big-projects-card__icon ${card.icon}`;
            } else {
                icon.remove();
            }

            if (card.title) {
                cardTitle.textContent = card.title;
            } else {
                cardTitle.remove();
            }

            if (card.text) {
                text.innerHTML = normalizeRichText(card.text);
            } else {
                text.remove();
            }

            grid.appendChild(cardEl);
        });
    }

    if (!grid.children.length) {
        return null;
    }

    return section;
}

function setupNextProjectButton(allProjects, currentProject) {
    if (!Array.isArray(allProjects) || allProjects.length <= 1 || !currentProject) {
        document.querySelector(".next-work")?.remove();
        return;
    }

    const nextButton = document.querySelector(".next-button");
    const nextSubtitle = document.querySelector(".next-subtitle");

    if (!nextButton) return;

    const currentIndex = allProjects.findIndex((p) => p.id === currentProject.id);
    if (currentIndex === -1) {
        document.querySelector(".next-work")?.remove();
        return;
    }

    const nextProject = allProjects[(currentIndex + 1) % allProjects.length];
    if (!nextProject) {
        document.querySelector(".next-work")?.remove();
        return;
    }

    if (nextSubtitle) {
        nextSubtitle.textContent = "Next project";
    }

    nextButton.textContent = nextProject.title || "Next";
    nextButton.href = `${window.location.pathname}?project=${encodeURIComponent(nextProject.id)}`;
}

function setText(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;

    if (value) {
        el.textContent = value;
    } else {
        el.remove();
    }
}

function handleMetaItem(metaValueEl, value) {
    if (!metaValueEl) return;

    const metaItem = metaValueEl.closest(".meta-item");

    if (value) {
        metaValueEl.textContent = value;
    } else {
        metaItem?.remove();
    }
}

function normalizeRichText(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean).join("<br><br>");
    }
    return value || "";
}