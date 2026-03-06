(() => {
  const USERNAME = "murti-abhishek";
  const FEATURED_REPOS = new Set(["scAM.jl", "sc-ai-hb", "spatialzones"]);

  const elements = {
    grid: document.getElementById("project-grid"),
    status: document.getElementById("projects-status"),
    search: document.getElementById("project-search"),
    sort: document.getElementById("project-sort"),
    filters: document.getElementById("language-filters")
  };

  if (!elements.grid || !elements.status || !elements.search || !elements.sort || !elements.filters) {
    return;
  }

  const state = {
    repos: [],
    query: "",
    language: "All",
    sort: "updated"
  };

  elements.search.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  });

  elements.sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });

  loadRepositories();

  async function loadRepositories() {
    try {
      const repos = await fetchAllRepositories(USERNAME);
      state.repos = repos
        .filter((repo) => !repo.fork)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

      renderLanguageFilters(state.repos);
      render();

      if (state.repos.length === 0) {
        elements.status.textContent = "No public repositories found.";
      }
    } catch (error) {
      elements.grid.innerHTML = "";
      elements.status.innerHTML = `Could not load repositories right now. <a href="https://github.com/${USERNAME}?tab=repositories" target="_blank" rel="noopener noreferrer">Open GitHub repositories</a>.`;
      console.error("Repository fetch failed:", error);
    }
  }

  async function fetchAllRepositories(username) {
    const all = [];

    for (let page = 1; page <= 10; page += 1) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
        {
          headers: {
            Accept: "application/vnd.github+json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const pageData = await response.json();
      all.push(...pageData);

      if (pageData.length < 100) {
        break;
      }
    }

    return all;
  }

  function renderLanguageFilters(repos) {
    const languages = new Set(["All"]);

    for (const repo of repos) {
      if (repo.language) {
        languages.add(repo.language);
      }
    }

    const sorted = Array.from(languages);
    const allIndex = sorted.indexOf("All");
    sorted.splice(allIndex, 1);
    sorted.sort((a, b) => a.localeCompare(b));
    sorted.unshift("All");

    elements.filters.innerHTML = "";

    for (const language of sorted) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.textContent = language;
      button.setAttribute("aria-pressed", language === state.language ? "true" : "false");

      if (language === state.language) {
        button.classList.add("active");
      }

      button.addEventListener("click", () => {
        state.language = language;
        for (const chip of elements.filters.querySelectorAll(".filter-chip")) {
          const active = chip.textContent === language;
          chip.classList.toggle("active", active);
          chip.setAttribute("aria-pressed", active ? "true" : "false");
        }
        render();
      });

      elements.filters.appendChild(button);
    }
  }

  function render() {
    const filtered = state.repos.filter((repo) => {
      const text = `${repo.name} ${repo.description || ""}`.toLowerCase();
      const queryMatch = !state.query || text.includes(state.query);
      const languageMatch = state.language === "All" || repo.language === state.language;
      return queryMatch && languageMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (state.sort === "stars") {
        return b.stargazers_count - a.stargazers_count;
      }

      if (state.sort === "name") {
        return a.name.localeCompare(b.name);
      }

      return new Date(b.pushed_at) - new Date(a.pushed_at);
    });

    elements.status.textContent = `Showing ${sorted.length} of ${state.repos.length} repositories.`;

    if (sorted.length === 0) {
      elements.grid.innerHTML = `
        <article class="project-card">
          <h3>No matches</h3>
          <p class="project-description">Try changing your search term or language filter.</p>
        </article>
      `;
      return;
    }

    elements.grid.innerHTML = sorted
      .map((repo) => {
        const description = repo.description
          ? escapeHtml(repo.description)
          : "No description provided yet.";

        const homepageLink = repo.homepage
          ? `<a href="${escapeAttribute(repo.homepage)}" target="_blank" rel="noopener noreferrer">Live Link</a>`
          : "";

        const featuredBadge = FEATURED_REPOS.has(repo.name)
          ? '<span class="badge badge-featured">Featured</span>'
          : "";

        return `
          <article class="project-card">
            <div class="project-title-row">
              <h3><a href="${escapeAttribute(repo.html_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a></h3>
              ${featuredBadge}
            </div>
            <p class="project-description">${description}</p>
            <ul class="project-meta">
              <li>${escapeHtml(repo.language || "Unspecified")}</li>
              <li>${repo.stargazers_count} stars</li>
              <li>Updated ${formatDate(repo.pushed_at)}</li>
            </ul>
            <div class="project-links">
              <a href="${escapeAttribute(repo.html_url)}" target="_blank" rel="noopener noreferrer">Repository</a>
              ${homepageLink}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function formatDate(input) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(input));
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
})();
