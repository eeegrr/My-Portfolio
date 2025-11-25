document.addEventListener("DOMContentLoaded", () => {
    // Single JSON with all projects
    const PROJECTS_JSON_URL = "assets/json/project-page.json";

    // Read ?project=etherlocked from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project");

    fetch(PROJECTS_JSON_URL)
        .then(res => res.json())
        .then(data => {
            if (!data || !Array.isArray(data.projects)) {
                console.error("Projects JSON is missing a 'projects' array.");
                return;
            }

            let project = null;

            // 1) Try to find by URL ?project=id
            if (projectId) {
                project = data.projects.find(p => p.id === projectId);
            }

            // 2) Fallback: defaultProjectId if given
            if (!project && data.defaultProjectId) {
                project = data.projects.find(p => p.id === data.defaultProjectId);
            }

            // 3) Fallback: first project in the list
            if (!project) {
                project = data.projects[0];
            }

            if (!project) {
                console.error("No project found in JSON.");
                return;
            }

            renderProjectPage(project);

            setupNextProjectButton(data.projects, project);
        })
        .catch(err => console.error("Error loading projects JSON:", err));
});


function renderProjectPage(data) {
    if (!data) return;

    // ========== HERO / INTRO ==========
    setText(".work-title", data.title);

    // ===== TITLE TEXT =====
    const titleElement = document.querySelector(".work-title");
    if (titleElement && data.title) {
        titleElement.textContent = data.title; // never remove the title
    }

    // ===== TITLE LINK / BUTTON LOGIC =====
    const titleLink = document.getElementById("title-link");
    const titleButton = document.getElementById("title-button");

    if (titleLink) {
        if (data.titleLink) {
            // Has link → title + button are clickable
            titleLink.href = data.titleLink;
            titleLink.style.pointerEvents = "auto";

            if (titleButton) {
                titleButton.style.display = "grid";

                // make sure button always navigates
                titleButton.addEventListener("click", (e) => {
                    // prevent any weird default, then follow link
                    e.preventDefault();
                    window.location.href = data.titleLink;
                });
            }
        } else {
            // No link → remove button, make title plain text
            if (titleButton) titleButton.remove();

            const titleContainer = titleLink.querySelector(".title-container");

            if (titleContainer) {
                // unwrap: replace <a> with inner .title-container
                titleLink.replaceWith(titleContainer);
            } else {
                // fallback: keep title as plain text
                titleLink.replaceWith(titleElement);
            }
        }
    }

    // Background video + optional mobile image
    const bgVideo = document.querySelector(".bg-video");
    const workDetailsSection =
        document.querySelector(".work-details.section") ||
        document.querySelector(".work-details");

    if (bgVideo) {
        const source = bgVideo.querySelector("source");
        if (data.backgroundVideo && source) {
            source.src = data.backgroundVideo;
            bgVideo.load();
        } else {
            bgVideo.remove();
        }
    }
    if (workDetailsSection && data.backgroundImageMobile) {
        const applyResponsiveBackground = () => {
            const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;

            if (isSmallScreen) {
                if (bgVideo) {
                    bgVideo.pause?.();
                    bgVideo.style.display = "none";
                }

                workDetailsSection.style.background =
                    `linear-gradient(to top, rgb(45, 25, 13) 0%, rgba(45, 25, 13, 0) 40%),
   url("${data.backgroundImageMobile}") center center / cover no-repeat`;
            } else {
                if (bgVideo && data.backgroundVideo) {
                    bgVideo.style.display = "block";
                    bgVideo.play?.().catch(() => { });
                }

                workDetailsSection.style.background = "";
            }
        };

        // Run on load and on resize
        applyResponsiveBackground();
        window.addEventListener("resize", applyResponsiveBackground);
    }

    // Meta (timeline, contributions, teammates) – removes items if missing
    const metaValues = document.querySelectorAll(".work-meta .meta-item .meta-value");
    if (metaValues.length >= 3) {
        handleMetaItem(metaValues[0], data.timeline);
        handleMetaItem(metaValues[1], data.contributions);
        handleMetaItem(metaValues[2], data.teammates);
    }

    // Logline
    const loglineEl = document.querySelector(".work-logline p");
    if (loglineEl) {
        if (data.logline) {
            loglineEl.textContent = data.logline;
        } else {
            loglineEl.closest(".work-logline")?.remove();
        }
    }

    // Tags
    const tagsContainer = document.querySelector(".work__tags");
    if (tagsContainer) {
        tagsContainer.innerHTML = "";
        if (Array.isArray(data.tags) && data.tags.length > 0) {
            data.tags.forEach(tag => {
                const span = document.createElement("span");
                span.className = "tag";
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
        } else {
            tagsContainer.remove();
        }
    }

    // ========== ABOUT / SECTIONS ==========
    const main = document.querySelector("main.main");
    if (!main || !Array.isArray(data.sections)) return;

    // Grab templates once
    const templateAbout1 = document.querySelector('section[data-template="about1"]');
    const templateAbout2 = document.querySelector('section[data-template="about2"]');
    const templateAbout3 = document.querySelector('section[data-template="about3"]');
    const templatePlayingCards = document.querySelector('section[data-template="playing-cards"]');

    const templates = {
        about1: templateAbout1,
        about2: templateAbout2,
        about3: templateAbout3,
        "playing-cards": templatePlayingCards
    };

    // Remove templates from DOM so we can rebuild from JSON
    Object.values(templates).forEach(tpl => {
        if (tpl) tpl.remove();
    });

    // Now generate sections from JSON
    data.sections.forEach(sectionData => {
        const type = sectionData.type;
        const baseTemplate = templates[type];

        if (!baseTemplate) return; // unknown layout type, skip

        const sectionClone = baseTemplate.cloneNode(true);

        switch (type) {
            case "about1":
                fillAbout1(sectionClone, sectionData);
                break;
            case "about2":
                fillAbout2(sectionClone, sectionData);
                break;
            case "about3":
                fillAbout3(sectionClone, sectionData);
                break;
            case "playing-cards":
                fillPlayingCards(sectionClone, sectionData);
                break;
            default:
                return;
        }

        // Remove template attribute so it's treated as a normal section
        sectionClone.removeAttribute("data-template");
        main.appendChild(sectionClone);
    });
}

/* ========== HELPERS ========== */

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
    if (!value) {
        metaItem?.remove();
    } else {
        metaValueEl.textContent = value;
    }
}

function setRichText(el, value) {
    if (!el) return;

    // If it's an array → treat each item as a paragraph
    if (Array.isArray(value)) {
        // Remove if empty array
        if (value.length === 0) {
            el.remove();
            return;
        }

        // Join paragraphs with line breaks
        el.innerHTML = value.join("<br><br>");
        return;
    }

    // If it's a normal string
    if (typeof value === "string" && value.trim() !== "") {
        el.textContent = value;
    } else {
        el.remove();
    }
}

/* ===== Layout: about-work1 ===== */
function fillAbout1(section, data) {
    const headingEl = section.querySelector(".about-subtitle1");
    const textEl = section.querySelector(".about-description1");
    const galleryWrapper = section.querySelector(".picture-gallery");
    const container = section.querySelector(".picture-gallery .picture-container");

    if (headingEl) {
        if (data.heading) headingEl.textContent = data.heading;
        else headingEl.remove();
    }

    if (textEl) {
        setRichText(textEl, data.text);
    }

    // Gallery images
    if (container) {
        container.innerHTML = "";
        if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
            data.galleryImages.forEach((src, index) => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = `Screenshot ${index + 1}`;
                img.className = "picture-img";
                container.appendChild(img);
            });
        } else {
            galleryWrapper?.remove(); // no images -> remove gallery + gaps
        }
    }
}

/* ===== Layout: about-work2 ===== */
function fillAbout2(section, data) {
    const headingEl = section.querySelector(".about-subtitle2");
    const textEl = section.querySelector(".about-description2");
    const mainImage = section.querySelector(".about-picture");
    const galleryWrapper = section.querySelector(".picture-gallery1");
    const container = section.querySelector(".picture-gallery1 .picture-container");

    if (headingEl) {
        if (data.heading) headingEl.textContent = data.heading;
        else headingEl.remove();
    }

    if (textEl) {
        setRichText(textEl, data.text);
    }

    // Main side image
    if (mainImage) {
        if (data.mainImage) {
            mainImage.src = data.mainImage;
        } else {
            mainImage.remove();
        }
    }

    // Gallery
    if (container) {
        container.innerHTML = "";
        if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
            data.galleryImages.forEach((src, index) => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = `Screenshot ${index + 1}`;
                img.className = "picture-img";
                container.appendChild(img);
            });
        } else {
            galleryWrapper?.remove();
        }
    }
}

/* ===== Layout: about-work3 ===== */
function fillAbout3(section, data) {
    const headingEl = section.querySelector(".about-subtitle2");
    const textEl = section.querySelector(".about-description2");
    const videoEl = section.querySelector(".about-video");
    const galleryWrapper = section.querySelector(".picture-gallery1");
    const container = section.querySelector(".picture-gallery1 .picture-container");

    if (headingEl) {
        if (data.heading) headingEl.textContent = data.heading;
        else headingEl.remove();
    }

    if (textEl) {
        setRichText(textEl, data.text);
    }

    // Video
    if (videoEl) {
        const source = videoEl.querySelector("source");
        if (data.video && source) {
            source.src = data.video;
            videoEl.load();
        } else {
            videoEl.remove();
        }
    }

    // Gallery
    if (container) {
        container.innerHTML = "";
        if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
            data.galleryImages.forEach((src, index) => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = `Screenshot ${index + 1}`;
                img.className = "picture-img";
                container.appendChild(img);
            });
        } else {
            galleryWrapper?.remove();
        }
    }
}

/* ===== Layout: about-work4 ===== */
function fillAbout4(section, data) {
    const headingEl = section.querySelector(".about-subtitle2");
    const textEl = section.querySelector(".about-description2");
    const mainImage = section.querySelector(".about-picture");
    const galleryWrapper = section.querySelector(".picture-gallery1");
    const container = section.querySelector(".picture-gallery1 .picture-container");

    if (headingEl) {
        if (data.heading) headingEl.textContent = data.heading;
        else headingEl.remove();
    }

    if (textEl) {
        setRichText(textEl, data.text);
    }

    // Main side image
    if (mainImage) {
        if (data.mainImage) {
            mainImage.src = data.mainImage;
        } else {
            mainImage.remove();
        }
    }

    // Gallery
    if (container) {
        container.innerHTML = "";
        if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
            data.galleryImages.forEach((src, index) => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = `Screenshot ${index + 1}`;
                img.className = "picture-img";
                container.appendChild(img);
            });
        } else {
            galleryWrapper?.remove();
        }
    }
}

/* ===== Layout: playing-cards ===== */
function fillPlayingCards(section, data) {
    const container = section.querySelector(".container");
    if (!container) return;

    // Clear template content
    container.innerHTML = "";

    if (!Array.isArray(data.groups) || data.groups.length === 0) {
        section.remove();
        return;
    }

    data.groups.forEach(group => {
        const groupEl = document.createElement("div");
        groupEl.className = "cards-group";

        // Icon
        if (group.icon) {
            const iconImg = document.createElement("img");
            iconImg.src = group.icon;
            iconImg.alt = group.iconAlt || "Cards icon";
            iconImg.className = "cards-icons";
            groupEl.appendChild(iconImg);
        }

        // Cards gallery
        if (Array.isArray(group.cards) && group.cards.length > 0) {
            const galleryDiv = document.createElement("div");
            galleryDiv.className = "cards-gallery";

            const cardsContainer = document.createElement("div");
            cardsContainer.className = "cards-container grid";

            group.cards.forEach((src, index) => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = `Card ${index + 1}`;
                img.className = "cards-img";
                cardsContainer.appendChild(img);
            });

            galleryDiv.appendChild(cardsContainer);
            groupEl.appendChild(galleryDiv);
        }

        container.appendChild(groupEl);
    });
}

function setupNextProjectButton(allProjects, currentProject) {
    if (!Array.isArray(allProjects) || allProjects.length <= 1 || !currentProject) {
        // If there's 0 or 1 project, hide the section
        const nextSection = document.querySelector(".next-work");
        if (nextSection) nextSection.remove();
        return;
    }

    const nextButton = document.querySelector(".next-button");
    const nextSubtitle = document.querySelector(".next-subtitle");

    if (!nextButton) return;

    // Find index of current project
    const currentIndex = allProjects.findIndex(p => p.id === currentProject.id);

    if (currentIndex === -1) {
        console.warn("Current project not found in project list for Next button.");
        return;
    }

    // Compute next project (wrap around)
    const nextIndex = (currentIndex + 1) % allProjects.length;
    const nextProject = allProjects[nextIndex];

    if (!nextProject) return;

    // Optional: keep subtitle static
    if (nextSubtitle) {
        nextSubtitle.textContent = "Next project";
    }

    // Button text – you can tweak format if you want
    nextButton.textContent = nextProject.title;

    // Build link that keeps you on the same page, just changes ?project=
    const currentPath = window.location.pathname; // e.g. /project-page.html
    nextButton.href = `${currentPath}?project=${encodeURIComponent(nextProject.id)}`;
}