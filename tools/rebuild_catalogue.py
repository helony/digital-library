#!/usr/bin/env python3
"""Rebuild generated KDL catalogue assets from data/catalogue-full.json."""
from __future__ import annotations
import csv, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data/catalogue-full.json'

def load():
    doc=json.loads(DATA.read_text(encoding='utf-8'))
    records=doc['records']
    ids=[r['kdlId'] for r in records]
    slugs=[r['slug'] for r in records]
    if len(ids)!=len(set(ids)):
        raise SystemExit('Duplicate kdlId found')
    if len(slugs)!=len(set(slugs)):
        raise SystemExit('Duplicate slug found')
    return doc,records

def portable(r):
    rights_notes={
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
    return {
      'kdl_id':r['kdlId'],'slug':r['slug'],'title':r['title'],'author':r['author'],'author_slug':r['authorSlug'],
      'year_display':r['year'],'year_sort':r['yearSort'],'variety':r['variety'],'language_code':r['v'],
      'script':r['script'],'subject':r['subject'],'format':r['format'],'availability':r['availability'],
      'source_institution':r['institution'],'source_url':r['source'],'remote_read_url':r['url'],
      'wikisource_title':r.get('wiki'),'rights_type':r['rightsType'],'rights_key':r['rightsKey'],
      'rights_note_en':rights_notes.get(r['rightsKey'],'See source record for rights information.'),
      'source_rights_checked':r['checked'],'catalogue_added':r['added'],
      'archive_eligible':bool(r.get('archiveEligible')),'planned_local_path':r.get('localPath'),
      'description_en':r.get('desc',{}).get('en',''),'aliases':r.get('aliases',[])
    }

def main():
    doc,records=load()
    (ROOT/'assets/catalogue-data.js').write_text(
        '/* Generated from data/catalogue-full.json. */\nwindow.KDL_BOOKS = '+json.dumps(records,ensure_ascii=False,separators=(',',':'))+';\n',
        encoding='utf-8'
    )
    ports=[portable(r) for r in records]
    (ROOT/'catalogue.json').write_text(json.dumps({
        'library':'Kurdish Digital Library','generated':doc.get('updated'),'record_count':len(records),'records':ports
    },ensure_ascii=False,indent=2),encoding='utf-8')
    fields=['kdl_id','slug','title','author','year_display','year_sort','variety','language_code','script','subject','format','availability','source_institution','source_url','rights_type','rights_note_en','source_rights_checked','catalogue_added','archive_eligible','planned_local_path','description_en']
    with (ROOT/'catalogue.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader()
        for r in ports:
            w.writerow({k:r.get(k,'') for k in fields})
    manifest={
      'generated':doc.get('updated'),
      'policy':'Only records explicitly marked archiveEligible are auto-archived. Other records require manual rights review.',
      'identifier_scheme':'KDL-<primary ISO 639-3 code>-<4 digit sequence>. Identifiers are permanent and should never be reassigned.',
      'items':[]
    }
    for r in records:
        manifest['items'].append({
          'id':r['id'],'kdl_id':r['kdlId'],'slug':r['slug'],'title':r['title'],'author':r['author'],'author_slug':r['authorSlug'],
          'format':r['format'],'eligible':bool(r.get('archiveEligible')),'rights_type':r['rightsType'],'rights_key':r['rightsKey'],
          'source':r['source'],'remote_url':r['url'],'wiki_title':r.get('wiki'),'local_path':r.get('localPath'),'checked':r['checked']
        })
    (ROOT/'archive-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    ip=ROOT/'index.html'
    text=ip.read_text(encoding='utf-8')
    text=re.sub(r'(<strong id="bookCount">)\d+(</strong>)',rf'\g<1>{len(records)}\g<2>',text)
    text=re.sub(r'(<strong id="resultsCount">)\d+(\s+verified titles</strong>)',rf'\g<1>{len(records)}\g<2>',text)
    ip.write_text(text,encoding='utf-8')
    print(f'Rebuilt {len(records)} catalogue records.')

if __name__=='__main__':
    main()
