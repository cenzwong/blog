import os
import re
import sqlite3

# Regex to extract frontmatter (supports --- and <!-- --> formats)
FRONTMATTER_RE = re.compile(r'^(?:---|<!--)\s*\n(.*?)\n(?:---|-->)\s*\n(.*)', re.DOTALL)

def parse_content_file(filepath):
    print(f"Reading: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = FRONTMATTER_RE.match(content)
    if not match:
        return {}, content
    
    frontmatter_str = match.group(1)
    body = match.group(2)
    
    metadata = {}
    for line in frontmatter_str.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            metadata[key] = val
            
    return metadata, body

def main():
    content_dir = 'content'
    public_dir = 'public'
    db_path = os.path.join(public_dir, 'search_index.db')
    
    # Ensure public directory exists
    os.makedirs(public_dir, exist_ok=True)
    
    # Remove existing db if present to build fresh
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database at {db_path}")
        
    print(f"Initializing SQLite database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Set page size to 1024 bytes (optimal for HTTP Range requests / chunking)
    cursor.execute("PRAGMA page_size = 1024;")
    
    # Create the posts table with format support ('md' or 'html')
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT,
        tags TEXT,
        slug TEXT UNIQUE NOT NULL,
        format TEXT DEFAULT 'md',
        content TEXT NOT NULL
    );
    """)
    
    # Create the FTS5 Virtual Table for full-text search
    cursor.execute("""
    CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
        title,
        description,
        content,
        content='posts',
        content_rowid='id'
    );
    """)
    
    # Define triggers to keep the FTS5 index in sync with the posts table
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN
        INSERT INTO posts_fts(rowid, title, description, content)
        VALUES (new.id, new.title, new.description, new.content);
    END;
    """)
    
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN
        INSERT INTO posts_fts(posts_fts, rowid, title, description, content)
        VALUES('delete', old.id, old.title, old.description, old.content);
    END;
    """)
    
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS posts_au AFTER UPDATE ON posts BEGIN
        INSERT INTO posts_fts(posts_fts, rowid, title, description, content)
        VALUES('delete', old.id, old.title, old.description, old.content);
        INSERT INTO posts_fts(rowid, title, description, content)
        VALUES(new.id, new.title, new.description, new.content);
    END;
    """)
    
    # Scan all markdown and HTML files in content/
    if not os.path.exists(content_dir):
        print(f"Content directory '{content_dir}' not found.")
        return
        
    for filename in os.listdir(content_dir):
        _, ext = os.path.splitext(filename)
        ext = ext.lower()
        if ext in ['.md', '.html', '.htm']:
            file_format = 'html' if ext in ['.html', '.htm'] else 'md'
            filepath = os.path.join(content_dir, filename)
            metadata, body = parse_content_file(filepath)
            
            title = metadata.get('title', 'Untitled Post')
            description = metadata.get('description', '')
            date = metadata.get('date', '')
            tags = metadata.get('tags', '')
            slug = metadata.get('slug', os.path.splitext(filename)[0])
            
            print(f"Inserting post: '{title}' (slug: {slug}, format: {file_format})")
            try:
                cursor.execute(
                    "INSERT INTO posts (title, description, date, tags, slug, format, content) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (title, description, date, tags, slug, file_format, body)
                )
            except sqlite3.IntegrityError as e:
                print(f"Error inserting {slug}: {e}")
                
    conn.commit()
    print("Database data committed.")
    
    # Run SQLite optimizations
    print("Optimizing database structure...")
    cursor.execute("VACUUM;")
    cursor.execute("ANALYZE;")
    print("Optimizations complete.")
    
    # Double check database page size
    cursor.execute("PRAGMA page_size;")
    page_size = cursor.fetchone()[0]
    print(f"Verified page size: {page_size} bytes (Should be 1024)")
    
    conn.close()
    print("SQLite Index ingestion pipeline completed successfully!")

if __name__ == '__main__':
    main()
