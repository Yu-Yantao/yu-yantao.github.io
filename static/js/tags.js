document.addEventListener("DOMContentLoaded", function () {
    const desktopBreakpoint = 768;
    const edgePadding = 16;
    const collisionGap = 18;
    const minCloudHeight = 340;
    const maxCloudHeight = 560;
    const cloudHeightRatio = 0.44;
    const cloudHeightPerTag = 22;
    const cloudOriginYRatio = 0.42;
    const spiralTurns = 2.45;
    const spiralSearchStep = 0.035;
    const spiralMaxXRatio = 0.68;
    const denseTagThreshold = 15;
    const fontScalePerExtraTag = 0.04;
    const minFontScale = 0.86;
    const entranceDelayStep = 95;
    const entranceDelayMax = 1520;
    const entranceStartDelay = 100;
    const tagsContainer = document.querySelector(".blog-tags");

    if (!tagsContainer) return;

    const tagList = Array.from(tagsContainer.querySelectorAll(".blog-tag"));
    if (!tagList.length) return;

    const getCount = (tag) => {
        const countNode = tag.querySelector?.(".blog-tag-count");
        const countText = countNode?.textContent?.trim();
        if (countText) {
            const count = parseInt(countText, 10);
            return Number.isFinite(count) ? count : 1;
        }

        const spans = tag.querySelectorAll("span");
        const fallbackText = spans[spans.length - 1]?.textContent?.trim() || "1";
        const count = parseInt(fallbackText, 10);
        return Number.isFinite(count) ? count : 1;
    };

    const getTitle = (tag) => {
        const linkText = tag.querySelector?.("a")?.textContent?.trim();
        if (linkText) return linkText;

        return (tag.textContent || "").split("·")[0].trim();
    };

    const tagData = tagList.map((tag) => ({
        tag,
        count: getCount(tag),
        title: getTitle(tag),
    }));
    const maxCount = Math.max(...tagData.map((item) => item.count), 1);
    let hasPlayedEntrance = false;

    const reducedMotion = () => {
        return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    };

    const sortByWeight = (items) => {
        return items.slice().sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.title.localeCompare(b.title);
        });
    };

    const overlaps = (rect, placed) => {
        return placed.some((existing) => {
            return !(
                rect.x + rect.width + collisionGap <= existing.x ||
                existing.x + existing.width + collisionGap <= rect.x ||
                rect.y + rect.height + collisionGap <= existing.y ||
                existing.y + existing.height + collisionGap <= rect.y
            );
        });
    };

    const isInside = (rect, containerWidth, containerHeight) => {
        return (
            rect.x >= edgePadding &&
            rect.y >= edgePadding &&
            rect.x + rect.width <= containerWidth - edgePadding &&
            rect.y + rect.height <= containerHeight - edgePadding
        );
    };

    const clearAnimationState = (tag) => {
        tag.classList?.remove("is-pending", "is-visible");
        tag.style.animationDelay = "";
    };

    const clearInlineLayout = () => {
        tagsContainer.style.height = "";
        tagData.forEach(({ tag }) => {
            tag.style.position = "";
            tag.style.left = "";
            tag.style.top = "";
            tag.style.fontSize = "";
            tag.style.lineHeight = "";
            tag.style.zIndex = "";
            clearAnimationState(tag);
        });
    };

    const setDesktopBaseStyle = () => {
        const extraTagCount = Math.max(tagData.length - denseTagThreshold, 0);
        const fontScale = Math.max(minFontScale, 1 - extraTagCount * fontScalePerExtraTag);

        tagData.forEach(({ tag, count }) => {
            const weight = count / maxCount;
            const fontSize = (1.05 + weight * 0.45) * fontScale;
            tag.style.position = "absolute";
            tag.style.left = "0px";
            tag.style.top = "0px";
            tag.style.fontSize = `${fontSize.toFixed(2)}rem`;
            tag.style.lineHeight = "1.2";
            tag.style.zIndex = "1";
        });
    };

    const getContainerWidth = () => {
        const rect = tagsContainer.getBoundingClientRect?.();
        return Math.max(tagsContainer.clientWidth || rect?.width || 0, 320);
    };

    const getTagSize = (tag) => {
        const rect = tag.getBoundingClientRect?.();
        return {
            width: Math.ceil(rect?.width || tag.offsetWidth || 0),
            height: Math.ceil(rect?.height || tag.offsetHeight || 0),
        };
    };

    const applyGridFallback = (items, containerWidth) => {
        const positions = [];
        let x = edgePadding;
        let y = edgePadding;
        let rowHeight = 0;
        const maxX = Math.max(containerWidth - edgePadding, edgePadding);

        items.forEach((item) => {
            if (x > edgePadding && x + item.width > maxX) {
                x = edgePadding;
                y += rowHeight + collisionGap;
                rowHeight = 0;
            }

            positions.push({ item, position: { x, y, width: item.width, height: item.height } });
            x += item.width + collisionGap * 1.5;
            rowHeight = Math.max(rowHeight, item.height);
        });

        const height = Math.max(
            minCloudHeight,
            positions.reduce((max, { position }) => Math.max(max, position.y + position.height + edgePadding), 0)
        );
        tagsContainer.style.height = `${Math.ceil(height)}px`;

        return positions;
    };

    const playEntrance = (orderedItems) => {
        const motionReduced = reducedMotion();

        orderedItems.forEach(({ tag }, index) => {
            clearAnimationState(tag);

            if (!hasPlayedEntrance && !motionReduced) {
                tag.classList?.add("is-pending");
                tag.style.animationDelay = `${Math.min(index * entranceDelayStep, entranceDelayMax)}ms`;
            }
        });

        if (hasPlayedEntrance || motionReduced) {
            return;
        }

        const nextFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
        nextFrame(() => {
            nextFrame(() => {
                window.setTimeout(() => {
                    orderedItems.forEach(({ tag }) => {
                        tag.classList?.remove("is-pending");
                        tag.classList?.add("is-visible");
                    });
                    hasPlayedEntrance = true;
                }, entranceStartDelay);
            });
        });
    };

    const applyPositions = (positions) => {
        positions.forEach(({ item, position }, index) => {
            item.tag.style.left = `${Math.round(position.x)}px`;
            item.tag.style.top = `${Math.round(position.y)}px`;
            item.tag.style.zIndex = `${positions.length - index + 1}`;
        });

        playEntrance(positions.map(({ item }) => ({ tag: item.tag })));
    };

    const createSpiralModel = (containerWidth, containerHeight) => {
        const maxTheta = Math.PI * 2 * spiralTurns;
        const maxRadiusX = (containerWidth - edgePadding * 2) * spiralMaxXRatio;
        const maxRadiusY = (containerHeight - edgePadding * 2) / 2;
        const startAngle = Math.random() * Math.PI * 2;
        const direction = Math.random() < 0.5 ? -1 : 1;
        const originX = containerWidth / 2;
        const originY = containerHeight * cloudOriginYRatio;

        return {
            maxTheta,
            point(theta) {
                const progress = theta / maxTheta;
                const angle = startAngle + direction * theta;

                return {
                    x: originX + Math.cos(angle) * maxRadiusX * progress,
                    y: originY + Math.sin(angle) * maxRadiusY * progress,
                };
            },
        };
    };

    const findSpiralPositions = (items, containerWidth, containerHeight) => {
        const model = createSpiralModel(containerWidth, containerHeight);
        const placed = [];
        const positions = [];
        let spiralCursor = 0;

        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            let position = null;
            let placedStep = spiralCursor;

            for (let theta = spiralCursor; theta <= model.maxTheta; theta += spiralSearchStep) {
                const center = model.point(theta);
                const x = center.x - item.width / 2;
                const y = center.y - item.height / 2;
                const rect = { x, y, width: item.width, height: item.height };

                if (isInside(rect, containerWidth, containerHeight) && !overlaps(rect, placed)) {
                    position = rect;
                    placedStep = theta;
                    break;
                }
            }

            if (!position) return null;

            placed.push(position);
            positions.push({ item, position });
            spiralCursor = index === 0 ? 1.28 : placedStep + 0.74;
        }

        return positions;
    };

    const layoutDesktop = () => {
        setDesktopBaseStyle();

        const containerWidth = getContainerWidth();
        const rawCloudHeight = Math.round(
            containerWidth * cloudHeightRatio + Math.sqrt(tagData.length) * cloudHeightPerTag
        );
        const containerHeight = Math.max(minCloudHeight, Math.min(maxCloudHeight, rawCloudHeight));
        tagsContainer.style.height = `${containerHeight}px`;

        const measuredItems = sortByWeight(tagData).map((item) => ({
            ...item,
            ...getTagSize(item.tag),
        }));
        const spiralPositions = findSpiralPositions(measuredItems, containerWidth, containerHeight);
        const positions = spiralPositions || applyGridFallback(measuredItems, containerWidth);

        applyPositions(positions);
    };

    const layoutTags = () => {
        if (window.innerWidth < desktopBreakpoint) {
            clearInlineLayout();
            return;
        }

        layoutDesktop();
    };

    let resizeTimer;
    window.addEventListener("resize", function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(layoutTags, 120);
    });

    layoutTags();
});
