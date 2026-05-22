import { Marked } from 'marked';

// Initialize Markdown parser
const marked = new Marked();

let posts = []; // Local in-memory store for all blog posts
const statusBadge = document.getElementById('sqlite-status');
const statusText = document.getElementById('sqlite-status-text');
const mainView = document.getElementById('main-view');

/**
 * Update search engine status indicator in the header
 */
function updateStatus(status, text) {
  statusBadge.className = `engine-badge status-${status}`;
  statusText.textContent = text;
}

/**
 * Strip Markdown headers, formatting, lists, and equations to extract clean text
 */
function stripMarkdown(md) {
  if (!md) return '';
  return md
    .replace(/\$\$[\s\S]*?\$\$/g, '') // strip display math
    .replace(/\$[^\$]+\$/g, '')    // strip inline math
    .replace(/```[\s\S]*?```/g, '') // strip code blocks
    .replace(/`([^`]+)`/g, '$1')   // strip inline code formatting
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // strip links, keep text
    .replace(/[*_#\-+>]/g, ' ')    // strip headers, lists, italics, bold chars
    .replace(/\s+/g, ' ')          // collapse whitespace
    .trim();
}

/**
 * Initialize search index by fetching precompiled JSON
 */
async function initDatabase() {
  try {
    updateStatus('loading', 'Index Booting...');
    
    // Resolve absolute URL using Vite's BASE_URL to guarantee it works on subpaths
    const jsonUrl = new URL(import.meta.env.BASE_URL + 'search_index.json', window.location.origin).toString();
    
    console.log(`Connecting to remote search index: ${jsonUrl}`);
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch search index: ${response.status} ${response.statusText}`);
    }
    
    posts = await response.json();
    console.log(`Search index successfully loaded with ${posts.length} posts.`);
    
    updateStatus('connected', 'Index Active');
    
    // Set up routing since index is ready
    window.addEventListener('hashchange', handleRouting);
    handleRouting(); // Render the active page
    
  } catch (error) {
    console.error("Failed to initialize search index:", error);
    updateStatus('error', 'Index Offline');
    mainView.innerHTML = `
      <div class="error-view">
        <div class="status-dot" style="background-color: hsl(0, 85%, 60%); width: 32px; height: 32px;"></div>
        <h2>Index Loading Failed</h2>
        <p>Could not fetch the pre-compiled search index JSON file. Please run the ingestion compiler script first or check browser console.</p>
        <button onclick="window.location.reload()" class="post-tag-badge" style="cursor: pointer; margin-top: 16px; padding: 10px 20px;">Retry Booting</button>
      </div>
    `;
  }
}

/* ==========================================================================
   SPA Client-Side Router
   ========================================================================== */
function handleRouting() {
  const hash = window.location.hash || '#/';
  
  // Update nav active styles
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  
  if (hash === '#/' || hash === '') {
    document.getElementById('nav-home')?.classList.add('active');
    renderHome();
  } else if (hash === '#/search') {
    document.getElementById('nav-search')?.classList.add('active');
    renderSearch();
  } else if (hash === '#/about') {
    document.getElementById('nav-about')?.classList.add('active');
    renderAbout();
  } else if (hash.startsWith('#/post/')) {
    const slug = hash.replace('#/post/', '');
    renderPost(slug);
  } else {
    // 404 fallback
    render404();
  }
}

/* ==========================================================================
   View Renderers
   ========================================================================== */

/**
 * Homepage View: Displays a list of all posts
 */
async function renderHome() {
  mainView.innerHTML = `
    <div class="loading-view">
      <div class="spinner"></div>
      <p>Fetching posts from JSON index...</p>
    </div>
  `;
  
  try {
    if (posts.length === 0) {
      mainView.innerHTML = `
        <div class="hero-section">
          <h1>Welcome to Cenz.Blog</h1>
          <p>A statically-compiled website using a client-side JSON index search.</p>
        </div>
        <div class="search-empty-state">
          <h3>No Posts Found</h3>
          <p>Run the content ingestion script to seed your articles database!</p>
        </div>
      `;
      return;
    }
    
    let postsHtml = posts.map(post => {
      const primaryTag = post.tags ? post.tags.split(',')[0].trim() : 'Tech';
      return `
        <a href="#/post/${post.slug}" class="post-card">
          <div>
            <div class="post-meta">
              <span class="post-date">${post.date}</span>
              <span class="post-tag">${primaryTag}</span>
            </div>
            <h3>${post.title}</h3>
            ${post.subtitle ? `<h4 class="post-card-subtitle">${post.subtitle}</h4>` : ''}
            <p>${post.description}</p>
          </div>
          <div class="post-readmore">
            Read Article <span>&rarr;</span>
          </div>
        </a>
      `;
    }).join('');
    
    mainView.innerHTML = `
      <div class="hero-section">
        <h1>Welcome to Cenz.Blog</h1>
        <p>A statically-compiled website powered entirely by a client-side JSON search index.</p>
        <a href="#/about" class="symbiosis-hero-badge glass">
          <span class="pulse-dot"></span>
          <span class="badge-text">Distilled Knowledge from AI Collaboration &rarr;</span>
        </a>
      </div>
      
      <h2 class="section-title">Latest Articles</h2>
      <div class="posts-grid">
        ${postsHtml}
      </div>
    `;
    
  } catch (error) {
    console.error("Error loading home posts:", error);
    mainView.innerHTML = `<div class="error-view"><h2>Error Loading Posts</h2><p>${error.message}</p></div>`;
  }
}

/**
 * Search View: Sleek Full-Text Search with real-time keyword highlights
 */
async function renderSearch() {
  mainView.innerHTML = `
    <div class="search-page">
      <div class="search-header">
        <h1>Static Site Search</h1>
        <p>Query the pre-compiled in-memory index using direct client-side search.</p>
      </div>
      
      <div class="search-box-container">
        <!-- SVG Search Icon -->
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" id="search-box" class="search-input" placeholder="Type keywords (e.g. PySpark, Complexity, AQE)..." autocomplete="off">
      </div>
      
      <div id="search-stats" class="search-meta-results"></div>
      <div id="search-results" class="search-results-list">
        <div class="search-empty-state">
          <h3>Ready to Search</h3>
          <p>Start typing above to trigger real-time client-side keyword search.</p>
        </div>
      </div>
    </div>
  `;

  const searchBox = document.getElementById('search-box');
  const searchResults = document.getElementById('search-results');
  const searchStats = document.getElementById('search-stats');
  let debounceTimeout = null;

  searchBox.focus();

  searchBox.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    const query = e.target.value;
    
    debounceTimeout = setTimeout(() => {
      executeSearch(query, searchResults, searchStats);
    }, 150); // Fluid 150ms debounce
  });
}

/**
 * Execute Client-Side Search
 */
async function executeSearch(query, resultsContainer, statsContainer) {
  const cleaned = query.trim().toLowerCase();
  
  if (!cleaned) {
    statsContainer.textContent = '';
    resultsContainer.innerHTML = `
      <div class="search-empty-state">
        <h3>Ready to Search</h3>
        <p>Start typing above to trigger real-time client-side keyword search.</p>
      </div>
    `;
    return;
  }
  
  const keywords = cleaned.split(/\s+/).filter(k => k.length > 0);
  if (keywords.length === 0) return;
  
  try {
    const startTime = performance.now();
    const scoredResults = [];
    
    for (const post of posts) {
      const titleLower = post.title.toLowerCase();
      const subtitleLower = (post.subtitle || '').toLowerCase();
      const descLower = post.description.toLowerCase();
      const tagsLower = post.tags.toLowerCase();
      const contentStripped = stripMarkdown(post.content);
      const contentLower = contentStripped.toLowerCase();
      
      // Verify all keywords match the post (AND search logic)
      let isMatch = true;
      for (const kw of keywords) {
        if (!titleLower.includes(kw) && 
            !subtitleLower.includes(kw) && 
            !descLower.includes(kw) && 
            !tagsLower.includes(kw) && 
            !contentLower.includes(kw)) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        // Calculate relevance score
        let score = 0;
        keywords.forEach(kw => {
          // Exact prefix matches on titles get highest weight
          if (titleLower.startsWith(kw)) score += 150;
          else if (titleLower.includes(kw)) score += 100;
          
          if (subtitleLower.includes(kw)) score += 50;
          if (descLower.includes(kw)) score += 30;
          if (tagsLower.includes(kw)) score += 20;
          
          // Add score per match in main body
          const bodyOccurrences = contentLower.split(kw).length - 1;
          score += bodyOccurrences * 5;
        });
        
        // Exact full phrase bonus
        if (titleLower.includes(cleaned)) score += 300;
        if (subtitleLower.includes(cleaned)) score += 200;
        if (descLower.includes(cleaned)) score += 150;
        if (contentLower.includes(cleaned)) score += 80;
        
        scoredResults.push({
          post,
          contentStripped,
          score
        });
      }
    }
    
    // Sort results by relevancy score descending
    scoredResults.sort((a, b) => b.score - a.score);
    
    const duration = (performance.now() - startTime).toFixed(1);
    
    if (scoredResults.length === 0) {
      statsContainer.textContent = `0 results found in ${duration}ms`;
      resultsContainer.innerHTML = `
        <div class="search-empty-state">
          <h3>No Results Found</h3>
          <p>We couldn't find any matches for "${query}". Try searching for other terms like 'PySpark' or 'Join'.</p>
        </div>
      `;
      return;
    }
    
    statsContainer.textContent = `${scoredResults.length} result${scoredResults.length > 1 ? 's' : ''} found in ${duration}ms`;
    
    resultsContainer.innerHTML = scoredResults.map(({ post, contentStripped }) => {
      // Find the character index of first matched keyword for snippet extraction
      const contentLower = contentStripped.toLowerCase();
      let matchIdx = -1;
      
      for (const kw of keywords) {
        const idx = contentLower.indexOf(kw);
        if (idx !== -1) {
          matchIdx = idx;
          break;
        }
      }
      
      let snippet = '';
      if (matchIdx !== -1) {
        // Extract 50 characters before and 110 after match index
        let startIdx = Math.max(0, matchIdx - 50);
        if (startIdx > 0) {
          const nextSpace = contentStripped.indexOf(' ', startIdx);
          if (nextSpace !== -1 && nextSpace < matchIdx) {
            startIdx = nextSpace + 1;
          }
        }
        
        let endIdx = Math.min(contentStripped.length, matchIdx + 110);
        if (endIdx < contentStripped.length) {
          const lastSpace = contentStripped.lastIndexOf(' ', endIdx);
          if (lastSpace !== -1 && lastSpace > matchIdx) {
            endIdx = lastSpace;
          }
        }
        
        snippet = contentStripped.substring(startIdx, endIdx);
        if (startIdx > 0) snippet = '...' + snippet;
        if (endIdx < contentStripped.length) snippet = snippet + '...';
      } else {
        // Default snippet fallback to post description or start of body content
        snippet = post.description || (contentStripped.substring(0, 140) + '...');
      }
      
      // Wrap all occurrences of search terms in <b> tags case-insensitively
      const escapedKeywords = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const highlightRegex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
      snippet = snippet.replace(highlightRegex, '<b>$1</b>');
      
      return `
        <a href="#/post/${post.slug}" class="search-result-card">
          <div class="post-meta" style="margin-bottom: 8px;">
            <span class="post-date">${post.date}</span>
            <span class="post-tag">${post.tags ? post.tags.split(',')[0] : 'Tech'}</span>
          </div>
          <h3>${post.title}</h3>
          ${post.subtitle ? `<h4 class="post-card-subtitle">${post.subtitle}</h4>` : ''}
          <p>${snippet}</p>
        </a>
      `;
    }).join('');
    
  } catch (error) {
    console.error("Search execution failed:", error);
    statsContainer.textContent = 'Error executing search';
    resultsContainer.innerHTML = `
      <div class="search-empty-state">
        <h3 style="color: hsl(0, 85%, 60%);">Search Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

/**
 * Article Page View: Renders a single blog post
 */
async function renderPost(slug) {
  mainView.innerHTML = `
    <div class="loading-view">
      <div class="spinner"></div>
      <p>Fetching article content...</p>
    </div>
  `;
  
  try {
    const post = posts.find(p => p.slug === slug);
    
    if (!post) {
      render404();
      return;
    }
    
    const tagsList = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
    
    // Render either as raw HTML or parsed Markdown depending on format
    let htmlContent = post.format === 'html' ? post.content : marked.parse(post.content);
    
    // Format mathematical expressions elegantly
    if (post.format !== 'html') {
      htmlContent = htmlContent
        .replace(/\$\$(.*?)\$\$/gs, (_, match) => {
          if (window.katex) {
            try {
              return window.katex.renderToString(match.trim(), { displayMode: true, throwOnError: false });
            } catch (e) {
              console.warn("KaTeX error:", e);
            }
          }
          return `<div class="math-block">${match.trim()}</div>`;
        })
        .replace(/\$(.*?)\$/g, (_, match) => {
          if (window.katex) {
            try {
              return window.katex.renderToString(match.trim(), { displayMode: false, throwOnError: false });
            } catch (e) {
              console.warn("KaTeX error:", e);
            }
          }
          // Dynamic cleanup for local mathematical formulas in fallback mode
          let clean = match.trim()
            .replace(/\\times/g, '×')
            .replace(/\\text\{([^}]+)\}/g, '$1')
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
            .replace(/\\log/g, 'log');
          return `<span class="math-inline">${clean}</span>`;
        });
    }
    
    // Create co-creation HTML if the post specifies AI collaboration
    let authorHtml = '';
    if (post.author === 'Cenz Wong & Gemini AI') {
      authorHtml = `
        <div class="meta-item author-block">
          <div class="author-avatars">
            <div class="avatar human" title="Cenz Wong">CW</div>
            <div class="avatar ai" title="Gemini AI">🤖</div>
          </div>
          <span class="author-names">Cenz &amp; Gemini AI</span>
          <span class="collaboration-badge" style="cursor: default;">
            <svg class="collab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
            Distilled Dialogue
          </span>
        </div>
      `;
    } else {
      authorHtml = `
        <div class="meta-item author-block">
          <span class="author-names" style="color: var(--text-secondary);">By ${post.author || 'Cenz Wong'}</span>
        </div>
      `;
    }

    mainView.innerHTML = `
      <article class="post-view">
        <div class="post-header">
          <a href="#/" class="post-back-btn">
            &larr; Back to articles
          </a>
          <h1 class="post-title">${post.title}</h1>
          ${post.subtitle ? `<h2 class="post-view-subtitle">${post.subtitle}</h2>` : ''}
          <div class="post-header-meta">
            <div class="meta-item">
              <span><span class="date-label">Published on</span> ${post.date}</span>
            </div>
            ${authorHtml}
            <div class="post-tags" style="margin-left: auto;">
              ${tagsList.map(tag => `<span class="post-tag-badge">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="post-body">
          ${htmlContent}
        </div>
      </article>
    `;
    
    // Dynamic programming block syntax highlighting
    if (window.hljs) {
      mainView.querySelectorAll('pre code').forEach((el) => {
        window.hljs.highlightElement(el);
      });
    }
    
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (error) {
    console.error("Error fetching article:", error);
    mainView.innerHTML = `<div class="error-view"><h2>Failed to Render Article</h2><p>${error.message}</p></div>`;
  }
}

/**
 * About Page View: Describes the project stack
 */
function renderAbout() {
  mainView.innerHTML = `
    <div class="about-page">
      <h1>About Cenz.Blog</h1>
      <p>Cenz.Blog is a high-performance demonstration of zero-overhead serverless client-side search. In traditional static websites, searching is either offloaded to external paid APIs (e.g. Algolia) or handled by heavy JavaScript libraries that require downloading megabytes of bloated indices.</p>
      
      <p>This site solves that challenge by compiling a pre-rendered metadata and full-text index into a compact static JSON file at build time. During the initial application boot, this lightweight index is fetched and stored in-memory, enabling instant search queries directly in the user's browser.</p>
      
      <p>Because there is no heavy database compilation or runtime required in the client browser, the application loads instantaneously, runs with absolute zero server latency, and remains perfectly compatible with strict static hosting environments like <strong>GitHub Pages</strong>.</p>
      
      <h2 class="section-title">The Architecture Stack</h2>
      <div class="tech-grid">
        <div class="tech-card">
          <h3>JSON Indexing</h3>
          <p>Pre-rendered index generated during the build pipeline and loaded in-memory.</p>
        </div>
        <div class="tech-card">
          <h3>Weighted Search</h3>
          <p>Instant client-side prefix matching with weighted scoring across titles, tags, and content.</p>
        </div>
        <div class="tech-card">
          <h3>HTML Snippets</h3>
          <p>Real-time snippet extraction and bold highlights styled with premium CSS colors.</p>
        </div>
        <div class="tech-card">
          <h3>Vite & CSS</h3>
          <p>Vibrant styling with neon gradients, ambient glowing orbs, and glassmorphism elements.</p>
        </div>
      </div>
      
      <h2 class="section-title">Static Compilation Pipeline</h2>
      <p>At build-time, a Python compiler script runs, scanning all raw blog post Markdown files, parses the frontmatter metadata, structures the full-text body content, sorts posts chronologically, and compiles a single optimized <code>search_index.json</code> static asset. This file is deployed to GitHub Pages and served as a standard immutable asset, giving you rapid speeds and high search precision.</p>
      
      <h2 class="section-title" style="margin-top: 48px;">Distilled Knowledge from AI: The Dialogue Synthesis</h2>
      <p>Every deep-dive article on Cenz.Blog is not simply a solo creation or a generic AI output. Instead, they are high-density, rigorous summaries born from intensive <strong>human-AI dialectics</strong>. We challenge assumptions, stress-test execution logic, verify JVM thresholds, and refine computational complexities iteratively before compiling.</p>
      
      <div class="synthesis-pipeline">
        <div class="pipeline-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h3>Human Dialectic Spark</h3>
            <p>Identifying core distributed bottlenecks or algorithmic limits (e.g., Wide Join network limits, UDF JVM border serialization penalties).</p>
          </div>
        </div>
        
        <div class="pipeline-connector">
          <div class="connector-line"></div>
        </div>
        
        <div class="pipeline-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h3>Intense Dialogue Loop</h3>
            <p>Engaging in deep, recursive Q&A with Gemini to debug heap risks, GC footprints, AQE query adjustments, and mathematical Big-O bounds.</p>
          </div>
        </div>
        
        <div class="pipeline-connector">
          <div class="connector-line"></div>
        </div>
        
        <div class="pipeline-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h3>Stress Testing & Proofs</h3>
            <p>Formulating rigorous KaTeX formulas, comparing sort buffers, and ensuring accurate hardware behavior matching real-world systems.</p>
          </div>
        </div>
        
        <div class="pipeline-connector">
          <div class="connector-line"></div>
        </div>
        
        <div class="pipeline-step">
          <div class="step-num">4</div>
          <div class="step-content">
            <h3>Static Distillation</h3>
            <p>Structuring the messy raw dialogue into highly polished, Markdown-based documentation compiled directly into our client-side search index.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render 404 page
 */
function render404() {
  mainView.innerHTML = `
    <div class="error-view">
      <h1 style="font-size: 5rem; font-weight: 800; color: var(--accent-primary);">404</h1>
      <h2>Article or Page Not Found</h2>
      <p>The page you are looking for does not exist or has been relocated.</p>
      <a href="#/" class="post-back-btn" style="margin-top: 16px;">
        &larr; Return to safety
      </a>
    </div>
  `;
}

// Boot the application database
initDatabase();
