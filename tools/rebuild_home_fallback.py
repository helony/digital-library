#!/usr/bin/env python3
"""Keep the readable, no-JavaScript shelf in sync with both collections."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
e = html.escape

def main():
    records = json.loads((ROOT / 'data/catalogue-full.json').read_text())['records']
    stories = json.loads((ROOT / 'data/story-shelf.json').read_text())
    (ROOT / 'assets/story-data.js').write_text('/* Generated from data/story-shelf.json. */\nwindow.KDL_STORIES = ' + json.dumps(stories, ensure_ascii=False, separators=(',', ':')) + ';\n')
    starter = ['mem-u-zin', 'story-mame-alan', 'zembilfiros', 'makas-kurdische-studien-1900', 'diwana-melaye-ciziri', 'story-siyabend-u-xece', 'diwani-mahwi', 'kurdische-texte-transkription-1903']
    def rank(b):
        if b['slug'] in starter:
            return starter.index(b['slug'])
        return 500 if b.get('sourceOnly') else 400 if b['subject'] == 'reference' else 300 if b['subject'] == 'education' else 100 + b['id']
    previews = json.loads((ROOT / 'data/visual-previews.json').read_text())
    (ROOT / 'assets/visual-previews.js').write_text('/* Original edition previews; sources in assets/previews/README.md. */\nwindow.KDL_PREVIEWS = ' + json.dumps(previews) + ';\n')
    cards = []
    for b in sorted(records + stories, key=rank):
        url = b.get('localPath') if b.get('archiveEligible') else b['url']
        motif = b.get('motif') or {'poetry': 'love-classical', 'religious': 'mystical-medallion', 'reference': 'editorial-reference', 'education': 'editorial-reference'}.get(b['subject'], 'folk-oral')
        language = {'kmr': 'Kurmancî', 'ckb': 'Soranî', 'diq': 'Zazakî', 'hac': 'Hewramî', 'sdh': 'Kurdî Xwarîn'}[b['v']]
        note = {'partial': 'Available section', 'retelling': 'Retelling', 'reference': 'Source record'}.get(b['availability'], '')
        preview = previews.get(b['slug'])
        preview_class = 'has-scan' if preview else ''
        art = f'<img class="cover-scan" src="{e(preview)}" alt="" loading="lazy">' if preview else f'<img class="cover-ornament" src="assets/motifs/{motif}.svg" alt="" loading="lazy">'
        scan_title = f'<p class="scan-title" dir="auto">{e(b["title"])}</p>' if preview else ''
        long_class = 'long-title' if len(b['title']) > 65 else ''
        note_html = f'<span class="edition-note">{note}</span>' if note else ''
        author = 'Khan, Mohammadirad, Molin & Noorlander' if len(b['author']) > 80 else b['author']
        info = f'<a class="shelf-info" href="book/{e(b["slug"])}/index.html">Info</a>' if b.get('kdlId') else ''
        label = 'Source record' if b.get('sourceOnly') else 'Read available section' if b['availability'] == 'partial' else 'Read'
        cards.append(f'''<article class="book-card static-book-card" data-slug="{e(b['slug'])}">
<a class="cover tone-{e(b['tone'])} {long_class} {preview_class}" href="{e(url)}"><span class="cover-language">{language}{' · PDF' if b['format']=='pdf' else ''}</span><h3 class="cover-title" dir="auto">{e(b['title'])}</h3>{art}{note_html}</a>
<div class="card-body">{scan_title}<p class="book-author" dir="auto">{e(author)}</p><p class="book-summary" lang="en" dir="auto">{e(b.get("summary",b.get("desc",{})).get("en",""))}</p><div class="card-actions"><a class="shelf-read" href="{e(url)}">{label} →</a>{info}</div></div></article>''')
    p = ROOT / 'index.html'
    text = p.read_text()
    start = text.index('          <div class="book-grid" id="bookGrid"')
    end = text.index('          <div class="empty-state" id="emptyState"', start)
    text = text[:start] + '          <div class="book-grid" id="bookGrid">\n' + '\n'.join(cards) + '\n          </div>\n' + text[end:]
    p.write_text(text)
    print(f'Rebuilt shelf with {len(records)} catalogue records and {len(stories)} story entries.')

if __name__ == '__main__':
    main()
