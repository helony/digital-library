#!/usr/bin/env python3
"""Generate static permanent book and author pages from data/catalogue-full.json."""
from __future__ import annotations
import html, json, shutil
from collections import defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data/catalogue-full.json'

def e(x): return html.escape(str(x or ''), quote=True)

def head(title,prefix):
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#11213d"><title>{e(title)} · Kurdish Digital Library</title><link rel="stylesheet" href="{prefix}assets/styles.css"></head><body><header class="site-header"><div class="header-inner"><a class="brand" href="{prefix}index.html"><span class="brand-mark" aria-hidden="true">▥</span><span><strong>Kurdish Digital Library</strong><small>Independent catalogue & preservation archive</small></span></a><nav class="top-nav" aria-label="Library"><a href="{prefix}authors/index.html">Authors</a><a href="{prefix}preservation/index.html">Preservation</a><a href="{prefix}about/index.html">About</a></nav></div></header>'''

def footer(prefix):
    return f'''<footer class="site-footer"><div class="shell footer-inner"><strong>Kurdish Digital Library</strong><span>Open access · Clear provenance · Preservation-first</span><span class="footer-links"><a href="{prefix}catalogue.json">JSON</a> · <a href="{prefix}catalogue.csv">CSV</a></span></div></footer></body></html>'''

RIGHTS={
  'rights_pd_old':'Underlying historical work is public domain because the author died more than 100 years ago. A Wikisource transcription may carry CC BY-SA attribution requirements.',
  'rights_pd_us':'The source identifies this pre-1931 scan as public domain in the United States. Copyright status can differ by jurisdiction.',
  'rights_pd_commons':'The source file is marked public domain or free of known copyright restrictions by Wikimedia Commons or the source archive.',
  'rights_pd_iraq':'Wikisource labels this work as public domain in Iraq. Reuse elsewhere may depend on local law.',
  'rights_1932':'This 1932 historical scan is provided for reading and research. Reuse status may vary by jurisdiction and is not treated as universally public domain.',
  'rights_historical':'The historical authors are out of copyright; a Wikisource transcription may remain under CC BY-SA.',
  'rights_wiki_pd':'The historical work is public domain; Wikisource text is available under CC BY-SA.',
  'rights_authorized_share':'The source states that the copyright holder authorized sharing. This is not the same as public domain and does not necessarily permit all reuse.',
  'rights_zazaki1899':'The 1899 historical work is public domain; the Wikisource transcription is available under CC BY-SA.'
}

def main():
    records=json.loads(DATA.read_text(encoding='utf-8'))['records']
    authors=defaultdict(list)
    for r in records: authors[r['author']].append(r)

    book_root=ROOT/'book'; author_root=ROOT/'authors'
    book_root.mkdir(exist_ok=True); author_root.mkdir(exist_ok=True)

    # Remove only generated author/book subfolders; keep author index regenerated below.
    for p in book_root.iterdir():
        if p.is_dir(): shutil.rmtree(p)
    for p in author_root.iterdir():
        if p.is_dir(): shutil.rmtree(p)

    cards=[]
    for author,works in sorted(authors.items(),key=lambda kv:kv[0].casefold()):
        slug=works[0]['authorSlug']
        cards.append(f'''<a class="directory-card" href="{e(slug)}/index.html"><span class="directory-count">{len(works)} work{'s' if len(works)!=1 else ''}</span><strong>{e(author)}</strong><span>{e(', '.join(sorted(set(w['variety'] for w in works))))}</span></a>''')
        rows=[]
        for r in sorted(works,key=lambda x:(x['yearSort'],x['title'])):
            rows.append(f'''<article class="record-row"><div><span class="record-id">{e(r['kdlId'])}</span><h3><a href="../../book/{e(r['slug'])}/index.html">{e(r['title'])}</a></h3><p>{e(r['year'])} · {e(r['variety'])} · {e(r['subject'].title())}</p></div><a class="secondary-button" href="../../book/{e(r['slug'])}/index.html">View record</a></article>''')
        d=author_root/slug; d.mkdir(parents=True,exist_ok=True)
        (d/'index.html').write_text(head(author,'../../')+f'''<main class="info-page"><div class="shell info-shell"><a class="back-link static-back" href="../index.html">← All authors</a><div class="page-kicker">AUTHOR RECORD</div><h1>{e(author)}</h1><p class="page-lead">Works by {e(author)} currently preserved or catalogued by the Kurdish Digital Library. This page intentionally avoids unverified biographical claims and focuses on the library holdings.</p><div class="summary-strip"><strong>{len(works)}</strong><span>catalogue work{'s' if len(works)!=1 else ''}</span><strong>{len(set(w['variety'] for w in works))}</strong><span>language varieties represented</span></div><section class="record-list">{''.join(rows)}</section></div></main>'''+footer('../../'),encoding='utf-8')

    (author_root/'index.html').write_text(head('Authors','../')+f'''<main class="info-page"><div class="shell info-shell"><div class="page-kicker">BROWSE THE COLLECTION</div><h1>Authors</h1><p class="page-lead">Browse the {len(authors)} authors and attributed creators currently represented in the catalogue. Each author page lists only works actually held or catalogued here.</p><div class="directory-grid">{''.join(cards)}</div></div></main>'''+footer('../'),encoding='utf-8')

    for r in records:
        d=book_root/r['slug']; d.mkdir(parents=True,exist_ok=True)
        local=r.get('localPath') or 'manual review'
        note=('This record is eligible for a library-hosted preservation copy. When the local archive file is present, the main reader prefers it over the external source.' if r.get('archiveEligible') else 'This record is not automatically mirrored by the preservation tool. The rights status requires jurisdiction-specific or manual review.')
        schema={'@context':'https://schema.org','@type':'Book','name':r['title'],'author':{'@type':'Person','name':r['author']},'datePublished':str(r['yearSort']),'identifier':r['kdlId'],'inLanguage':r['v']}
        page=head(r['title'],'../../')+f'''<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script><main class="info-page"><div class="shell info-shell"><a class="back-link static-back" href="../../index.html?book={e(r['slug'])}">← Back to catalogue</a><div class="record-hero"><aside class="details-cover tone-{e(r['tone'])}" dir="{'rtl' if r.get('rtl') else 'ltr'}"><span>{e(r['kdlId'])}</span><h2>{e(r['title'])}</h2><small>{e(r['author'])}</small></aside><article class="record-main"><div class="page-kicker">{e(r['variety'])} · {e(r['year'])}</div><h1>{e(r['title'])}</h1><p class="record-author"><a href="../../authors/{e(r['authorSlug'])}/index.html">{e(r['author'])}</a></p><p class="page-lead">{e(r.get('desc',{}).get('en',''))}</p><div class="details-actions"><a class="primary-button" href="../../index.html?book={e(r['slug'])}">Open in library</a><a class="secondary-button" href="{e(r['source'])}" target="_blank" rel="noopener">Original source ↗</a></div><dl class="metadata-table"><div><dt>Permanent ID</dt><dd>{e(r['kdlId'])}</dd></div><div><dt>Language variety</dt><dd>{e(r['variety'])}</dd></div><div><dt>Script</dt><dd>{e(r['script'])}</dd></div><div><dt>Date</dt><dd>{e(r['year'])}</dd></div><div><dt>Format</dt><dd>{e(r['format'].upper())} · {e(r['availability'])}</dd></div><div><dt>Source institution</dt><dd>{e(r['institution'])}</dd></div><div><dt>Rights checked</dt><dd>{e(r['checked'])}</dd></div><div><dt>Planned local path</dt><dd><code>{e(local)}</code></dd></div></dl><section class="rights-box {'caution' if r['rightsType']!='pd' else ''}"><h3>Copyright & reuse</h3><p>{e(RIGHTS.get(r['rightsKey'],'See source record for rights information.'))}</p></section><section class="preservation-note"><h3>Preservation status</h3><p>{e(note)}</p><p>The original source is retained as provenance even when the library stores its own preservation copy.</p></section></article></div></div></main>'''+footer('../../')
        (d/'index.html').write_text(page,encoding='utf-8')
    print(f'Generated {len(records)} book pages and {len(authors)} author pages.')

if __name__=='__main__': main()
