(() => {
  const USERNAME = "murti-abhishek";

  setupThemeToggle();
  syncSelectedProjects();

  function setupThemeToggle() {
    const root = document.documentElement;
    const toggleButton = document.getElementById("theme-toggle");

    if (!toggleButton) {
      return;
    }

    const iconEl = toggleButton.querySelector('[data-role="theme-icon"]');
    const labelEl = toggleButton.querySelector('[data-role="theme-label"]');

    const updateToggleLabel = () => {
      const currentTheme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      if (iconEl) {
        iconEl.textContent = nextTheme === "light" ? "☀" : "🌙";
      }

      if (labelEl) {
        labelEl.textContent = nextTheme === "light" ? "Light Mode" : "Dark Mode";
      }

      toggleButton.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    };

    toggleButton.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      root.setAttribute("data-theme", nextTheme);

      try {
        localStorage.setItem("theme", nextTheme);
      } catch (error) {
        console.error("Could not save theme preference", error);
      }

      updateToggleLabel();
    });

    updateToggleLabel();
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
      statusEl.textContent = "Showing selected projects with live GitHub metadata.";
      return;
    }

    if (successCount > 0) {
      statusEl.textContent = `Loaded ${successCount} of ${cards.length} project summaries. Some GitHub metadata is temporarily unavailable.`;
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
