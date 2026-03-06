---
layout: default
title: Abhishek Murti | Projects
description: Computational biology, bioinformatics, and software projects by Abhishek Murti.
---

<main class="site-main">
  <header class="hero section-reveal">
    <p class="eyebrow">Computational Biology + Applied Engineering</p>
    <h1>Abhishek Murti</h1>
    <p class="hero-copy">
      I build computational tools for transcriptomics, spatial biology, and multi-omics analysis.
      This site tracks my work and automatically pulls every public project from GitHub.
    </p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="mailto:murtiabhishek@gmail.com">Email</a>
      <a class="btn btn-secondary" href="https://github.com/murti-abhishek" target="_blank" rel="noopener noreferrer">GitHub Profile</a>
      <a class="btn btn-ghost" href="https://linkedin.com/in/abhishek-murti" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    </div>
    <ul class="hero-meta">
      <li>Bioinformatician at UCSF</li>
      <li>Single-cell + spatial transcriptomics</li>
      <li>San Francisco, California</li>
    </ul>
  </header>

  <section id="projects" class="projects section-reveal">
    <div class="section-heading">
      <h2>Project Archive</h2>
      <p>All public repositories from <code>murti-abhishek</code>, searchable and sortable.</p>
    </div>

    <div class="controls">
      <label class="control search-control" for="project-search">
        <span>Search</span>
        <input id="project-search" type="search" placeholder="Find by name or description" autocomplete="off">
      </label>

      <label class="control sort-control" for="project-sort">
        <span>Sort</span>
        <select id="project-sort">
          <option value="updated">Recently Updated</option>
          <option value="stars">Most Stars</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </label>
    </div>

    <div id="language-filters" class="language-filters" aria-label="Filter projects by language"></div>
    <p id="projects-status" class="projects-status" role="status">Loading projects from GitHub...</p>

    <div id="project-grid" class="project-grid" aria-live="polite">
      <article class="project-card placeholder">
        <h3>Loading repositories...</h3>
      </article>
    </div>

    <noscript>
      <p class="projects-status">JavaScript is disabled. Browse repositories directly on <a href="https://github.com/murti-abhishek" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
    </noscript>
  </section>

  <section class="featured section-reveal">
    <div class="section-heading">
      <h2>Featured Builds</h2>
      <p>Highlighted tools currently under active development.</p>
    </div>

    <div class="featured-grid">
      <article class="featured-card">
        <h3>scAM.jl</h3>
        <p>A Julia toolkit for single-cell transcriptomics workflows, including clustering and marker discovery.</p>
        <a href="https://github.com/murti-abhishek/scAM.jl" target="_blank" rel="noopener noreferrer">Open Repository</a>
      </article>

      <article class="featured-card">
        <h3>sc-ai-hb</h3>
        <p>An AI scientist prototype that generates mechanistic hypotheses from tumor transcriptomics data.</p>
        <a href="https://github.com/murti-abhishek/sc-ai-hb" target="_blank" rel="noopener noreferrer">Open Repository</a>
      </article>

      <article class="featured-card">
        <h3>spatialzones</h3>
        <p>A Python package for graph-based spatial tumor region assignment and microenvironment analysis.</p>
        <a href="https://github.com/murti-abhishek/spatialzones" target="_blank" rel="noopener noreferrer">Open Repository</a>
      </article>
    </div>
  </section>

  <section class="research section-reveal">
    <div class="section-heading">
      <h2>Research Snapshot</h2>
      <p>Current scientific focus areas and selected publications.</p>
    </div>

    <div class="research-grid">
      <article class="panel">
        <h3>UCSF Projects</h3>
        <ul>
          <li><strong>Hepatoblastoma Tumor Atlas:</strong> Building single-cell and single-nuclei atlases to map transcriptional heterogeneity in high-risk pediatric liver cancer.</li>
          <li><strong>Autoimmune Hepatitis:</strong> Profiling periportal hepatocyte injury and immune signaling axes using human liver biopsy snRNA-seq.</li>
        </ul>
      </article>

      <article class="panel">
        <h3>Selected Publications</h3>
        <ul>
          <li><a href="https://doi.org/10.1038/s41587-024-02523-6" target="_blank" rel="noopener noreferrer">Nature Biotechnology (2025): AAV capsid prioritization in human livers</a></li>
          <li><a href="https://doi.org/10.7554/eLife.81090" target="_blank" rel="noopener noreferrer">eLife (2023): Transcriptional signatures in response to COVID-19</a></li>
          <li><a href="https://doi.org/10.26508/lsa.202201701" target="_blank" rel="noopener noreferrer">Life Science Alliance (2022): MERFISH and RNA-seq concordance</a></li>
        </ul>
      </article>
    </div>
  </section>

  <footer class="site-footer section-reveal">
    <p>Built for GitHub Pages. Updated automatically as new repositories are added.</p>
    <p class="footer-links">
      <a href="https://github.com/murti-abhishek" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://www.strava.com/athletes/84323856" target="_blank" rel="noopener noreferrer">Strava</a>
      <a href="mailto:murtiabhishek@gmail.com">Email</a>
    </p>
  </footer>
</main>
