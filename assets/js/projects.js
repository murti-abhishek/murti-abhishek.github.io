(() => {
  const USERNAME = "murti-abhishek";

  const statusEl = document.getElementById("projects-status");
  const cards = Array.from(document.querySelectorAll("[data-repo]"));

  if (!cards.length || !statusEl) {
    return;
  }

  syncSelectedProjects();

  async function syncSelectedProjects() {
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
      statusEl.textContent = "Showing only your selected projects with live GitHub stats.";
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
