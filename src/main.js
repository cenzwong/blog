import { createSQLiteThread, createHttpBackend } from 'sqlite-wasm-http';
import { Marked } from 'marked';

function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (error.result && error.result.message) return error.result.message;
  if (error.message) return error.message;
  return error.toString();
}


// Initialize Markdown parser
const marked = new Marked();

let db = null;
const statusBadge = document.getElementById('sqlite-status');
const statusText = document.getElementById('sqlite-status-text');
const mainView = document.getElementById('main-view');

/**
 * Update SQLite Wasm status indicator in the header
 */
function updateStatus(status, text) {
  statusBadge.className = `engine-badge status-${status}`;
  statusText.textContent = text;
}

/**
 * Execute SQL against the client-side database
 */
async function runQuery(sql, params = []) {
  if (!db) {
    throw new Error("SQLite Wasm database is not initialized yet.");
  }
  const rows = [];
  await db('exec', {
    sql: sql,
    bind: params,
    callback: (msg) => {
      if (msg.row) {
        const rowObj = {};
        msg.columnNames.forEach((col, idx) => {
          rowObj[col] = msg.row[idx];
        });
        rows.push(rowObj);
      }
    }
  });
  return rows;
}

/**
 * Initialize SQLite Wasm HTTP Range VFS Database
 */
async function initDatabase() {
  try {
    updateStatus('loading', 'SQLite Booting...');
    
    // 1. Create the HTTP VFS backend (handles byte range fetches on demand)
    const httpBackend = createHttpBackend({
      maxPageSize: 1024, // Optimized for our 1KB SQLite page size
      cacheSize: 1024, // Must align and be configured properly for some HTTP range backends
      timeout: 10000     // 10 seconds request timeout
    });
    
    // 2. Spawn SQLite Wasm thread using the HTTP backend
    db = await createSQLiteThread({ http: httpBackend });
    
    // 3. Open the static search_index.db using range requests
    // Resolve absolute URL using Vite's BASE_URL to guarantee it works on subpaths
    const dbUrl = new URL(import.meta.env.BASE_URL + 'search_index.db', window.location.origin).toString();
    
    console.log(`Connecting to remote database via range requests: ${dbUrl}`);
    await db('open', {
      filename: 'file:' + encodeURI(dbUrl),
      vfs: 'http'
    });
    
    updateStatus('connected', 'SQLite Active');
    console.log("SQLite Wasm HTTP VFS connected and ready.");
    
    // Set up routing since DB is ready
    window.addEventListener('hashchange', handleRouting);
    handleRouting(); // Render the active page
    
  } catch (error) {
    console.error("Failed to initialize SQLite Wasm database:", getErrorMessage(error));
    updateStatus('error', 'SQLite Offline');
    mainView.innerHTML = `
      <div class="error-view">
        <div class="status-dot" style="background-color: hsl(0, 85%, 60%); width: 32px; height: 32px;"></div>
        <h2>Database Connection Failed</h2>
        <p>Could not connect to the remote database using HTTP Range requests. Make sure your server supports ranges or check console log.</p>
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
      <p>Fetching posts from SQLite index...</p>
    </div>
  `;
  
  try {
    const posts = await runQuery('SELECT id, title, description, date, tags, slug FROM posts ORDER BY date DESC');
    
    if (posts.length === 0) {
      mainView.innerHTML = `
        <div class="hero-section">
          <h1>Welcome to Cenz.Blog</h1>
          <p>A statically-compiled website using client-side Wasm SQLite indexing.</p>
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
        <p>A statically-compiled website powered entirely by client-side Wasm SQLite indexing.</p>
      </div>
      
      <h2 class="section-title">Latest Articles</h2>
      <div class="posts-grid">
        ${postsHtml}
      </div>
    `;
    
  } catch (error) {
    console.error("Error loading home posts:", getErrorMessage(error));
    mainView.innerHTML = `<div class="error-view"><h2>Error Loading Posts</h2><p>${getErrorMessage(error)}</p></div>`;
  }
}

/**
 * Search View: Sleek Full-Text Search using FTS5 match snippets
 */
async function renderSearch() {
  mainView.innerHTML = `
    <div class="search-page">
      <div class="search-header">
        <h1>Static Site Search</h1>
        <p>Query the pre-compiled SQLite index using FTS5 full-text matching.</p>
      </div>
      
      <div class="search-box-container">
        <!-- SVG Search Icon -->
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" id="search-box" class="search-input" placeholder="Type keywords (e.g. SQLite, Wasm, CSS)..." autocomplete="off">
      </div>
      
      <div id="search-stats" class="search-meta-results"></div>
      <div id="search-results" class="search-results-list">
        <div class="search-empty-state">
          <h3>Ready to Search</h3>
          <p>Start typing above to trigger real-time client-side FTS5 SQL queries.</p>
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
 * Execute SQLite FTS5 Match Query
 */
async function executeSearch(query, resultsContainer, statsContainer) {
  const cleaned = query.trim().replace(/[^\w\s]/g, '');
  
  if (!cleaned) {
    statsContainer.textContent = '';
    resultsContainer.innerHTML = `
      <div class="search-empty-state">
        <h3>Ready to Search</h3>
        <p>Start typing above to trigger real-time client-side FTS5 SQL queries.</p>
      </div>
    `;
    return;
  }
  
  // Format query to match word prefixes using FTS5 rules (e.g., "sqlite range" -> "sqlite* AND range*")
  const ftsQuery = cleaned.split(/\s+/).map(word => `${word}*`).join(' AND ');
  
  try {
    const startTime = performance.now();
    
    // Run FTS5 query with match highlighting using SQLite's snippet() function
    const results = await runQuery(`
      SELECT p.title, p.slug, p.date, p.tags,
             snippet(posts_fts, 2, '<b>', '</b>', '...', 15) as match_snippet
      FROM posts p
      JOIN posts_fts f ON p.id = f.rowid
      WHERE posts_fts MATCH ?
      ORDER BY bm25(posts_fts) LIMIT 10
    `, [ftsQuery]);
    
    const duration = (performance.now() - startTime).toFixed(1);
    
    if (results.length === 0) {
      statsContainer.textContent = `0 results found in ${duration}ms`;
      resultsContainer.innerHTML = `
        <div class="search-empty-state">
          <h3>No Results Found</h3>
          <p>We couldn't find any matches for "${query}". Try searching for other terms like 'Wasm' or 'CSS'.</p>
        </div>
      `;
      return;
    }
    
    statsContainer.textContent = `${results.length} result${results.length > 1 ? 's' : ''} found in ${duration}ms`;
    
    resultsContainer.innerHTML = results.map(res => {
      return `
        <a href="#/post/${res.slug}" class="search-result-card">
          <div class="post-meta" style="margin-bottom: 8px;">
            <span class="post-date">${res.date}</span>
            <span class="post-tag">${res.tags ? res.tags.split(',')[0] : 'Tech'}</span>
          </div>
          <h3>${res.title}</h3>
          <p>${res.match_snippet}</p>
        </a>
      `;
    }).join('');
    
  } catch (error) {
    console.error("Search execution failed:", getErrorMessage(error));
    statsContainer.textContent = 'Error executing query';
    resultsContainer.innerHTML = `
      <div class="search-empty-state">
        <h3 style="color: hsl(0, 85%, 60%);">Search Error</h3>
        <p>${getErrorMessage(error)}</p>
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
      <p>Fetching article content from SQLite...</p>
    </div>
  `;
  
  try {
    const posts = await runQuery('SELECT title, description, date, tags, format, content FROM posts WHERE slug = ?', [slug]);
    
    if (posts.length === 0) {
      render404();
      return;
    }
    
    const post = posts[0];
    const tagsList = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
    
    // Render either as raw HTML or parsed Markdown depending on format
    const htmlContent = post.format === 'html' ? post.content : marked.parse(post.content);
    
    mainView.innerHTML = `
      <article class="post-view">
        <div class="post-header">
          <a href="#/" class="post-back-btn">
            &larr; Back to articles
          </a>
          <h1 class="post-title">${post.title}</h1>
          <div class="post-header-meta">
            <span><span class="date-label">Published on</span> ${post.date}</span>
            <div class="post-tags">
              ${tagsList.map(tag => `<span class="post-tag-badge">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="post-body">
          ${htmlContent}
        </div>
      </article>
    `;
    
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (error) {
    console.error("Error fetching article:", getErrorMessage(error));
    mainView.innerHTML = `<div class="error-view"><h2>Failed to Render Article</h2><p>${getErrorMessage(error)}</p></div>`;
  }
}

/**
 * About Page View: Describes the project stack
 */
function renderAbout() {
  mainView.innerHTML = `
    <div class="about-page">
      <h1>About Cenz.Blog</h1>
      <p>Cenz.Blog is a high-performance demonstration of serverless, client-side indexing. In traditional static websites, searching is either offloaded to external paid APIs (e.g. Algolia) or handled in-memory by heavy JavaScript indices that require downloading megabytes of data.</p>
      
      <p>This site solves that challenge by compiled standard SQLite to WebAssembly, running it directly inside your browser. To make this extremely bandwidth-efficient, it uses an <strong>HTTP Virtual File System (VFS)</strong> backend that intercepts SQLite file system reads and translates them into targeted HTTP <strong>Range requests</strong>.</p>
      
      <p>Instead of downloading the entire 31KB (or larger) database file, the browser only fetches the specific 1024-byte database pages required to resolve a query. This means a full-text search query can be resolved in milliseconds by downloading only a few kilobytes of index data.</p>
      
      <h2 class="section-title">The Architecture Stack</h2>
      <div class="tech-grid">
        <div class="tech-card">
          <h3>SQLite Wasm</h3>
          <p>Core query execution compiled to WebAssembly, running client-side.</p>
        </div>
        <div class="tech-card">
          <h3>HTTP VFS Range</h3>
          <p>Fetches database pages on-demand using standard HTTP Range headers.</p>
        </div>
        <div class="tech-card">
          <h3>FTS5 BM25</h3>
          <p>Native SQLite full-text search with match ranking and highlighted snippets.</p>
        </div>
        <div class="tech-card">
          <h3>Vite & CSS</h3>
          <p>Ultra-light static asset bundling with premium custom dark mode styling.</p>
        </div>
      </div>
      
      <h2 class="section-title">Database Index Statistics</h2>
      <p>At build-time, a Python compiler script runs, scanning all raw blog post Markdown files, parses the frontmatter metadata, initializes a local optimized SQLite instance, sets a 1KB page size, builds the FTS5 search indexes, and runs <code>VACUUM</code> and <code>ANALYZE</code> to build a clean <code>search_index.db</code> static asset. This file is deployed to GitHub Pages and served as a standard immutable asset.</p>
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
