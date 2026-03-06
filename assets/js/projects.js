(() => {
  const USERNAME = "murti-abhishek";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupThemeToggle();
  setupRevealAnimations();
  setupCardTilt();
  syncSelectedProjects();

  function setupThemeToggle() {
    const root = document.documentElement;
    const toggleButton = document.getElementById("theme-toggle");

    if (!toggleButton) {
      return;
    }

    const iconEl = toggleButton.querySelector('[data-role="theme-icon"]');
    const labelEl = toggleButton.querySelector('[data-role="theme-label"]');

    const applyTheme = (theme) => {
      root.setAttribute("data-theme", theme);
      const nextTheme = theme === "dark" ? "light" : "dark";

      if (iconEl) {
        iconEl.textContent = nextTheme === "light" ? "SUN" : "MOON";
      }

      if (labelEl) {
        labelEl.textContent = nextTheme === "light" ? "Light Mode" : "Dark Mode";
      }

      toggleButton.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    };

    const currentTheme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(currentTheme);

    toggleButton.addEventListener("click", () => {
      const activeTheme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const nextTheme = activeTheme === "dark" ? "light" : "dark";

      applyTheme(nextTheme);

      try {
        localStorage.setItem("theme", nextTheme);
      } catch (error) {
        console.error("Could not save theme preference", error);
      }
    });
  }

  function setupRevealAnimations() {
    const items = Array.from(document.querySelectorAll(".section-reveal"));
    if (!items.length) {
      return;
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      for (const item of items) {
        item.classList.add("is-visible");
      }
      return;
    }

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    for (const item of items) {
      observer.observe(item);
    }
  }

  function setupCardTilt() {
    if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const cards = Array.from(document.querySelectorAll(".project-card"));

    for (const card of cards) {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
        card.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
        card.style.setProperty("--lift", "-6px");
      });

      const reset = () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--lift", "0px");
      };

      card.addEventListener("pointerleave", reset);
      card.addEventListener("pointerup", reset);
    }
  }

  function syncSelectedProjects() {
    const statusEl = document.getElementById("projects-status");
    const cards = Array.from(document.querySelectorAll("[data-repo]"));

    if (!cards.length || !statusEl) {
      return;
    }

    updateCards(cards, statusEl);
  }

  async function updateCards(cards, statusEl) {
    let successCount = 0;

    await Promise.all(
      cards.map(async (card) => {
        try {
          await hydrateCard(card);
          successCount += 1;
          card.classList.add("is-loaded");
        } catch (error) {
          console.error("Project sync failed", card.dataset.repo, error);
          setField(card, "language", "Language: unavailable");
          setField(card, "stars", "Stars: unavailable");
          setField(card, "updated", "Updated: unavailable");
        }
      })
    );

    if (successCount === cards.length) {
      statusEl.textContent = "Live metadata synced for all public repositories.";
      return;
    }

    if (successCount > 0) {
      statusEl.textContent = `Loaded ${successCount} of ${cards.length} repository summaries. Some GitHub metadata is temporarily unavailable.`;
      return;
    }

    statusEl.textContent = "Could not load GitHub metadata right now. Repository links are still available.";
  }

  async function hydrateCard(card) {
    const repoName = card.dataset.repo;
    if (!repoName) {
      throw new Error("Missing data-repo attribute");
    }

    const response = await fetch(`https://api.github.com/repos/${USERNAME}/${encodeURIComponent(repoName)}`, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repo = await response.json();

    setField(card, "language", `Language: ${repo.language || "Unspecified"}`);
    setField(card, "stars", `Stars: ${repo.stargazers_count}`);
    setField(card, "updated", `Updated: ${formatDate(repo.pushed_at)}`);

    const homepageLink = card.querySelector('[data-field="homepage"]');
    if (homepageLink && repo.homepage) {
      homepageLink.href = repo.homepage;
      homepageLink.style.display = "";
    }

    if (homepageLink && !repo.homepage) {
      homepageLink.style.display = "none";
    }
  }

  function setField(card, field, value) {
    const node = card.querySelector(`[data-field="${field}"]`);
    if (node) {
      node.textContent = value;
    }
  }

  function formatDate(dateInput) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(dateInput));
  }
})();
