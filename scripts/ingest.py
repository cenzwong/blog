import os
import re
import json

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
    json_path = os.path.join(public_dir, 'search_index.json')
    db_path = os.path.join(public_dir, 'search_index.db')
    
    # Ensure public directory exists
    os.makedirs(public_dir, exist_ok=True)
    
    # Clean up deprecated SQLite file if it exists to keep workspace tidy
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed deprecated SQLite database at {db_path}")
        
    print(f"Compiling search index to: {json_path}")
    
    posts = []
    
    # Scan all markdown and HTML files in content/
    if not os.path.exists(content_dir):
        print(f"Content directory '{content_dir}' not found.")
        return
        
    for filename in sorted(os.listdir(content_dir)):
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
            
            print(f"Processing post: '{title}' (slug: {slug}, format: {file_format})")
            posts.append({
                "title": title,
                "description": description,
                "date": date,
                "tags": tags,
                "slug": slug,
                "format": file_format,
                "content": body
            })
            
    # Sort posts by date descending so the output index matches the query expectations
    posts.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        
    print(f"JSON index compilation pipeline completed successfully! Written {len(posts)} posts.")

if __name__ == '__main__':
    main()
