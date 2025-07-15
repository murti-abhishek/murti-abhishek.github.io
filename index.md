---
layout: default
---

<link rel="stylesheet" href="/assets/style.css">

<div class="toggle-container">
  <button class="toggle-button" onclick="toggleDarkMode()">🌓 Toggle Dark Mode</button>
</div>

<script>
  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  };
  window.onload = () => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
  };
</script>

# About Me

<p align="center">
  <img src="/img/photo.png" alt="Photo of Abhishek Murti" width="180">
</p>

Hi, I’m **Abhishek Murti** — a computational biologist with a background in Chemical and Biomolecular Engineering. I completed my undergraduate degree at BITS Pilani (India) and my Master's at Cornell University in Ithaca, NY, where I transitioned from computational fluid dynamics (CFD) to computational biology.

My Master's thesis focused on systems biology, specifically developing ODE-based and constraint-based mathematical models of cell-free systems. Since then, I’ve remained deeply engaged in computational work, particularly in high-dimensional transcriptomics.

I currently work as a **bioinformatician at the University of California, San Francisco (UCSF)**. My work centers on:
- Single-cell and single-nuclei RNA sequencing
- Spatial transcriptomics
- Multi-omics data integration

I build scalable bioinformatics pipelines and develop computational tools to help uncover the molecular and cellular mechanisms driving liver health and disease, from autoimmune hepatitis to pediatric liver cancer.

[Find me on Strava 🏃‍♂️](https://www.strava.com/athletes/84323856)

[Find me on Strava 🏃‍♂️](https://www.strava.com/athletes/84323856)

<p align="center">
  <img src="/img/strava_heatmap.png" alt="Strava Heatmap" width="600">
</p>


---

# Personal Projects

### Julia Package for Single-Cell Analysis 
Developed a lightweight Julia package for analyzing single-cell transcriptomics data. The toolkit includes functionality for clustering, dimensionality reduction, visualization, and marker gene identification — inspired by Scanpy and Seurat, but designed for high performance and flexibility in Julia.
[View on GitHub](https://github.com/murti-abhishek/scAM.jl)

### AI Scientist Prototype  
Building a prototype LLM-powered agent that generates mechanistic hypotheses from tumor transcriptomics data using gene signatures, clustering, and literature context.
[View on GitHub](https://github.com/murti-abhishek/sc-ai-hb)

---

# UCSF Projects
### Hepatoblastoma Tumor Atlas  
Developing single-cell and single-nuclei atlases from fresh and frozen tumor samples to identify distinct tumor subtypes and transcriptional programs driving heterogeneity in high-risk pediatric liver cancer.

### Autoimmune Hepatitis (AIH)  
Characterizing periportal hepatocyte damage and immune interactions using snRNA-seq of human liver biopsies. Identified potential autoantigens and CD40/CD40L signaling axes driving pathology.

---

# Publications

- **AAV capsid prioritization in normal and steatotic human livers maintained by machine perfusion**  
  *Nature Biotechnology*, 2025  
  [PubMed](https://pubmed.ncbi.nlm.nih.gov/39881029) | [DOI](https://doi.org/10.1038/s41587-024-02523-6)  

- **Single nuclei characterization of pervasive transcriptional signatures across organs in response to COVID-19**  
  *eLife*, 2023  
  [PubMed](https://pubmed.ncbi.nlm.nih.gov/37830426) | [DOI](https://doi.org/10.7554/eLife.81090)  

- **Concordance of MERFISH Spatial Transcriptomics with Bulk and Single-cell RNA Sequencing**  
  *Life Science Alliance*, 2022  
  [PubMed](https://pubmed.ncbi.nlm.nih.gov/36526371) | [DOI](https://doi.org/10.26508/lsa.202201701)  

- **Perinatal liver inflammation is associated with persistent elevation of CXCL10 and its canonical receptor CXCR3 on common myeloid progenitors**  
  *bioRxiv*, 2024  
  [PubMed](https://pubmed.ncbi.nlm.nih.gov/39229070) | [bioRxiv](https://doi.org/10.1101/2024.08.15.607661)  

- **Tabula Sapiens reveals transcription factor expression, senescence effects, and sex-specific features in cell types from 28 human organs and tissues**  
  *bioRxiv*, 2024  
  [bioRxiv](https://doi.org/10.1101/2024.12.03.626516)  

---

# Contact

- [abhishekmurti@gmail.com](mailto:murtiabhishek@gmail.com)  
- [LinkedIn](https://linkedin.com/in/abhishek-murti)  
- [GitHub](https://github.com/murti-abhishek) 
