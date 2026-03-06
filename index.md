---
layout: default
title: Abhishek Murti | Projects
description: Computational biology, bioinformatics, and software projects by Abhishek Murti.
---

<main class="site-main">
  <header class="hero section-reveal">
    <div class="hero-copy-wrap">
      <p class="eyebrow">Computational Biology Portfolio</p>
      <h1>Abhishek Murti</h1>
      <p class="hero-copy">
        Computational biologist and bioinformatician at UCSF with 4+ years of hands-on work in single-cell,
        single-nuclei, and spatial transcriptomics. I build production-grade analysis pipelines and developer tools
        for liver disease and tumor microenvironment research.
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="mailto:murtiabhishek@gmail.com">Email</a>
        <a class="btn btn-secondary" href="https://github.com/murti-abhishek" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a class="btn btn-ghost" href="https://linkedin.com/in/abhishek-murti" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </div>

    <aside class="hero-panel">
      <h2>Current Focus</h2>
      <ul>
        <li>Single-cell and single-nuclei RNA-seq at cohort scale</li>
        <li>Spatial transcriptomics with tumor-region assignment workflows</li>
        <li>Multi-omics integration for hepatoblastoma and autoimmune hepatitis</li>
      </ul>
      <p>Based in San Francisco. I work at the intersection of computational method design and translational biology.</p>
    </aside>
  </header>

  <section id="projects" class="projects section-reveal">
    <div class="section-heading">
      <h2>Selected Projects</h2>
      <p>Only the repositories I currently want public-facing.</p>
    </div>

    <div id="project-grid" class="project-grid" aria-live="polite">
      <article class="project-card" data-repo="scAM.jl">
        <p class="project-tag">Julia Toolkit</p>
        <h3>scAM.jl</h3>
        <p class="project-description">Open-source Julia package for transcriptomics analysis from preprocessing through clustering, marker discovery, and UMAP, built as a high-performance alternative to typical R/Python workflows.</p>
        <ul class="project-meta">
          <li data-field="language">Language: loading...</li>
          <li data-field="stars">Stars: loading...</li>
          <li data-field="updated">Updated: loading...</li>
        </ul>
        <div class="project-links">
          <a href="https://github.com/murti-abhishek/scAM.jl" target="_blank" rel="noopener noreferrer">Repository</a>
          <a data-field="homepage" href="https://github.com/murti-abhishek/scAM.jl" target="_blank" rel="noopener noreferrer">Live Link</a>
        </div>
      </article>

      <article class="project-card" data-repo="sc-ai-hb">
        <p class="project-tag">AI Scientist</p>
        <h3>sc-ai-hb</h3>
        <p class="project-description">End-to-end Python framework that combines single-cell tumor profiles with LLM reasoning to classify hepatoblastoma subtypes and generate biologically interpretable hypotheses with supporting literature context.</p>
        <ul class="project-meta">
          <li data-field="language">Language: loading...</li>
          <li data-field="stars">Stars: loading...</li>
          <li data-field="updated">Updated: loading...</li>
        </ul>
        <div class="project-links">
          <a href="https://github.com/murti-abhishek/sc-ai-hb" target="_blank" rel="noopener noreferrer">Repository</a>
          <a data-field="homepage" href="https://github.com/murti-abhishek/sc-ai-hb" target="_blank" rel="noopener noreferrer">Live Link</a>
        </div>
      </article>

      <article class="project-card" data-repo="spatialzones">
        <p class="project-tag">Spatial Genomics</p>
        <h3>spatialzones</h3>
        <p class="project-description">Python package for inside/interface/outside tumor region assignment in spatial transcriptomics using nearest-neighbor context, with built-in visual diagnostics and downstream expression profiling.</p>
        <ul class="project-meta">
          <li data-field="language">Language: loading...</li>
          <li data-field="stars">Stars: loading...</li>
          <li data-field="updated">Updated: loading...</li>
        </ul>
        <div class="project-links">
          <a href="https://github.com/murti-abhishek/spatialzones" target="_blank" rel="noopener noreferrer">Repository</a>
          <a data-field="homepage" href="https://github.com/murti-abhishek/spatialzones" target="_blank" rel="noopener noreferrer">Live Link</a>
        </div>
      </article>
    </div>

    <p id="projects-status" class="projects-status" role="status">Syncing latest repository stats...</p>
  </section>

  <section class="research section-reveal">
    <div class="section-heading">
      <h2>Research Snapshot</h2>
      <p>Current focus areas and selected publications.</p>
    </div>

    <div class="research-grid">
      <article class="panel">
        <h3>UCSF Projects</h3>
        <ul>
          <li><strong>Hepatoblastoma Tumor Atlas:</strong> Building single-cell and single-nuclei atlases to map transcriptional heterogeneity and subtype-specific programs in pediatric liver cancer.</li>
          <li><strong>Autoimmune Hepatitis:</strong> Integrating bulk, single-nuclei, and spatial transcriptomics from biopsies to identify candidate autoantigens and actionable immune pathways.</li>
        </ul>
      </article>

      <article class="panel">
        <h3>Selected Publications</h3>
        <ul>
          <li><a href="https://doi.org/10.1038/s41587-024-02523-6" target="_blank" rel="noopener noreferrer">Nature Biotechnology (2025): AAV capsid prioritization in human livers</a></li>
          <li><a href="https://doi.org/10.7554/eLife.81090" target="_blank" rel="noopener noreferrer">eLife (2023): Pervasive transcriptional signatures across organs in COVID-19</a></li>
          <li><a href="https://doi.org/10.26508/lsa.202201701" target="_blank" rel="noopener noreferrer">Life Science Alliance (2022): MERFISH and RNA-seq concordance</a></li>
        </ul>
      </article>
    </div>
  </section>

  <footer class="site-footer section-reveal">
    <p>Dark mode by default, with an instant light-mode toggle for readability preferences.</p>
    <p class="footer-links">
      <a href="https://github.com/murti-abhishek" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://www.strava.com/athletes/84323856" target="_blank" rel="noopener noreferrer">Strava</a>
      <a href="mailto:murtiabhishek@gmail.com">Email</a>
    </p>
  </footer>
</main>
