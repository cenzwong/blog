Project Blueprint: Static Website with Client-Side SQLite Vector Search
1. Objective & Context
You are tasked with building a highly performant, modern static website deployed completely to GitHub Pages. Because GitHub Pages is a strictly static file host with no backend compute runtime or database access, the site must implement client-side search using SQLite compiled to WebAssembly (Wasm).
To maximize efficiency and minimize initial page load times, the site must read a pre-compiled SQLite database file over the network using HTTP Range Requests, allowing the browser to fetch only the specific bytes of the database index required for a query without downloading the entire database file.
2. Technical Stack Constraints
• Frontend Architecture: Static Site Generator (e.g., Astro, Hugo, Next.js SSG export, or plain HTML/JS/CSS). Choose the simplest path unless specified otherwise.
• Hosting Platform: GitHub Pages (Strictly static files; No backend Node.js, Python, or Go runtimes available at request-time; No custom HTTP response headers can be set on the server).
• Search Engine: SQLite WebAssembly (@sqlite.org/sqlite-wasm or sql.js).
• Extension Requirements: If semantic/vector search is required, the SQLite Wasm binary must include the compiled sqlite-vec extension.
• Storage Provider: Native GitHub Pages file hosting. The database file (e.g., search_index.db) will be treated as an immutable static asset updated only during the CI/CD build phase.
3. Architecture & Data Flow Diagram
[ Build Phase (GitHub Actions) ]
Markdown/Content Files ──> Script Parsers ──> Generate SQLite DB ──> Commit to /dist

[ Runtime Phase (User Browser) ]
User Query ──> Browser JS (SQLite Wasm) ──> HTTP Range Request ──> GitHub Pages CDN 
                                                                           │
User Search Results <── Parsed DB Pages <─── Returns Selected Byte Chunks <┘

4. Implementation Step-by-Step Task List
Phase 1: Build Pipeline & Index Generation
1. Write a build-time ingestion script (Node.js or Python) that runs locally or during CI/CD.
2. The script must scan all static content pages (Markdown, JSON, or HTML), parse the text, metadata, and (if applicable) generate vector embeddings for semantic search.
3. The script must initialize a local SQLite instance, construct the schema (e.g., standard text tables or virtual tables for FTS5 / vector search), insert the content data, optimize the file indexes (VACUUM; ANALYZE;), and output a single production file named search_index.db.
4. Ensure this database file is automatically placed inside the static deployment output directory (e.g., /public or /dist).
Phase 2: Client-Side Wasm Integration
1. Set up the frontend UI with a standard search bar input component.
2. Integrate the SQLite WebAssembly library inside client-side JavaScript.
3. CRITICAL: Implement an HTTP Virtual File System (VFS) client configuration. The SQLite instance must be pointed to the relative URL of search_index.db and configured to query the asset utilizing Range headers in asynchronous fetch requests.
4. Ensure the SQLite client configuration does not use multi-threaded or SharedArrayBuffer flags that require custom COOP/COEP HTTP headers, as GitHub Pages will block them.
Phase 3: Query Execution & UI Rendering
1. Write the frontend event handler to capture search inputs.
2. Translate user search string inputs into raw SQL queries (or convert input to embeddings client-side if doing semantic vector search).
3. Execute the SQL command against the client-side database layer.
4. Parse the returning JSON/Array rows of results and dynamically render them into the DOM with high scannability.
5. Instructions for the Working Agent
• Deliverable: Provide a clean, modular repository structure. Include the ingestion script file, the frontend code files, and a functioning GitHub Actions workflow file (.github/workflows/deploy.yml) that automates the generation of the SQLite index and deploys the static code to GitHub Pages.
• Coding Style: Write pure, production-grade code. Implement robust error handling for browser fetch request failures or empty database states. Keep dependencies minimal to optimize client-side bundle size. Avoid placeholders or placeholders comments—write fully realized logic.