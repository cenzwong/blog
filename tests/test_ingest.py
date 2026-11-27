import sys
import json
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import scripts.ingest as ingest
from scripts.ingest import build_post, parse_frontmatter


class IngestionTests(unittest.TestCase):
    def test_parses_yaml_frontmatter_with_tag_list(self):
        metadata, body = parse_frontmatter('---\ntitle: Sample\ntags:\n  - Python\n  - Data Engineering\n---\nBody', 'sample.md')
        self.assertEqual(metadata['tags'], ['Python', 'Data Engineering'])
        self.assertEqual(body, 'Body')

    def test_parses_legacy_html_comment_and_comma_tags(self):
        metadata, body = parse_frontmatter('<!--\ntitle: Sample\ndescription: Summary\ndate: 2026-01-01\ntags: Python, Data\n-->\n<p>Body</p>', 'sample.html')
        post = build_post(metadata, 'sample.html', body, set())
        self.assertEqual(post['tags'], ['Python', 'Data'])
        self.assertEqual(post['format'], 'html')

    def test_rejects_missing_title_invalid_date_and_unsafe_slug(self):
        with self.assertRaisesRegex(ValueError, 'title'):
            build_post({'slug':'sample'}, 'sample.md', '', set())
        with self.assertRaises(ValueError):
            build_post({'title':'Sample','description':'Desc','date':'2026-13-45'}, 'sample.md', '', set())
        with self.assertRaisesRegex(ValueError, 'YYYY-MM-DD'):
            build_post({'title':'Sample','description':'Desc','date':'2026-W48-4'}, 'sample.md', '', set())
        with self.assertRaisesRegex(ValueError, 'unsafe slug'):
            build_post({'title':'Sample','slug':'../sample'}, 'sample.md', '', set())

    def test_rejects_duplicate_slug(self):
        seen = {'same-slug'}
        with self.assertRaisesRegex(ValueError, 'duplicate slug'):
            build_post({'title':'Sample','slug':'same-slug'}, 'sample.md', '', seen)

    def test_rejects_duplicate_titles_and_missing_seo_fields(self):
        with self.assertRaisesRegex(ValueError, 'description'):
            build_post({'title':'Sample','date':'2026-01-01'}, 'sample.md', '', set())
        with self.assertRaisesRegex(ValueError, 'date'):
            build_post({'title':'Sample','description':'Summary'}, 'sample.md', '', set())
        seen = {'title:sample'}
        with self.assertRaisesRegex(ValueError, 'duplicate article title'):
            build_post({'title':'Sample','description':'Summary','date':'2026-01-01','slug':'different'}, 'different.md', '', seen)

    def test_draft_is_preserved_for_publication_filter(self):
        post = build_post({'title':'Draft','description':'Draft summary','date':'2026-01-01','tags':['Draft'],'slug':'draft-post','draft':True}, 'draft-post.md', '', set())
        self.assertTrue(post['draft'])

    def test_normalizes_tag_list_whitespace_and_rejects_empty_tags(self):
        post = build_post({'title':'Tags','description':'Summary','date':'2026-01-01','tags':[' Python '],'author':''}, 'tags.md', '', set())
        self.assertEqual(post['tags'], ['Python'])
        self.assertEqual(post['author'], 'Cenz Wong')
        with self.assertRaisesRegex(ValueError, 'tags must be'):
            build_post({'title':'Empty Tags','description':'Summary','date':'2026-01-01','tags':['  ']}, 'empty.md', '', set())

    def test_ingestion_excludes_drafts_from_public_catalogue_and_pages_input(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            content = root / 'content'
            output = root / '.generated'
            content.mkdir()
            (content / 'published.md').write_text('---\ntitle: Published\ndescription: Public summary\ndate: 2026-01-01\ntags: Python\nslug: published\n---\nPublic body', encoding='utf-8')
            (content / 'draft.md').write_text('---\ntitle: Draft\ndescription: Draft summary\ndate: 2026-01-02\ntags: Draft\nslug: draft\ndraft: true\n---\nDraft body', encoding='utf-8')
            with patch.object(ingest, 'ROOT', root), patch.object(ingest, 'CONTENT', content), patch.object(ingest, 'OUT', output):
                ingest.main()
            posts = json.loads((output / 'posts.json').read_text(encoding='utf-8'))
            catalogue = json.loads((output / 'metadata.json').read_text(encoding='utf-8'))
            self.assertEqual([post['slug'] for post in posts], ['published'])
            self.assertEqual([post['slug'] for post in catalogue['posts']], ['published'])
            self.assertNotIn('content', catalogue['posts'][0])


if __name__ == '__main__':
    unittest.main()
