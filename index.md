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
      <p class="hero-location">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.06 7 13 7 13s7-7.94 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"></path>
        </svg>
        <span>San Francisco, USA</span>
      </p>
      <p class="hero-copy">
        Computational biologist and bioinformatician at UCSF with 4+ years of hands-on work in single-cell,
        single-nuclei, and spatial transcriptomics. I build production-grade analysis pipelines and research software
        for liver disease and tumor microenvironment discovery. I also develop foundation models for liver biology,
        including LiverTransformer.
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="mailto:murtiabhishek@gmail.com">Email</a>
        <a class="btn btn-secondary" href="https://github.com/murti-abhishek" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a class="btn btn-secondary" href="https://linkedin.com/in/abhishek-murti" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a class="btn btn-secondary" href="https://scholar.google.com/citations?user=DqYP1wsAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">Scholar</a>
        <a class="btn btn-secondary" href="{{ '/assets/docs/Abhishek_Murti_CV.pdf' | relative_url }}" target="_blank" rel="noopener noreferrer">CV</a>
        <a class="btn btn-secondary" href="https://www.strava.com/athletes/84323856" target="_blank" rel="noopener noreferrer">Strava</a>
      </div>
    </div>

    <aside class="hero-panel">
      <h2>Current Focus</h2>
      <ul>
        <li>Single-cell and single-nuclei RNA-seq at cohort scale</li>
        <li>Spatial transcriptomics with tumor-region assignment workflows</li>
        <li>Multi-omics integration for hepatoblastoma and autoimmune hepatitis</li>
      </ul>
      <p>I work at the intersection of computational method design and translational biology.</p>
    </aside>
  </header>

  <section id="projects" class="projects section-reveal">
    <div class="section-heading">
      <h2>Tooling and Platform Engineering</h2>
      <p>Production tools and modeling systems for transcriptomics and computational pathology.</p>
    </div>

    <div id="project-grid" class="project-grid" aria-live="polite">
      <article class="project-card">
        <p class="project-tag">Foundation Model</p>
        <h3>LiverTransformer</h3>
        <p class="project-description">Liver-specific transformer (23.6M parameters) pre-trained using masked gene prediction on 1.04M human liver cells (36K genes, 7 diseases, 125 cell types), with strong transfer to spatial transcriptomics tasks including hepatocyte zonation.</p>
        <ul class="project-meta">
          <li>Framework: PyTorch</li>
          <li>Scale: 1.04M cells from CellxGene Census</li>
          <li>Status: Active research platform (public repo pending)</li>
        </ul>
        <div class="project-links">
          <span class="project-note">Repository not published yet. Release planned after internal validation.</span>
        </div>
      </article>

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

    <p id="projects-status" class="projects-status" role="status">Syncing live metadata for public repositories...</p>
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
    <p>Building computational tools for biology and translational medicine.</p>
  </footer>
</main>
