# News & Culture sources and maintenance

This is a small, attributed collection of links about Kurdish politics, culture,
affairs, music, people and geography. It is not a breaking-news service. Approved
sources may publish relevant stories infrequently; an old publication date stays
old even when the feeds have just been checked.

## Current permission basis

### Kurdish-language reporting

VOA's [copyright statement](https://www.voanews.com/p/5338.html) was reviewed on
28 September 2026. It permits reuse of material produced exclusively by VOA, with
credit, and explicitly excludes third-party material such as AP, AFP and Reuters.
The collection uses the official RSS feeds linked from
[Dengê Amerîka](https://www.dengeamerika.com/rssfeeds) (Kurmancî) and
[دەنگی ئەمەریکا](https://www.dengiamerika.com/rssfeeds) (Soranî).
These are two language services of the same publisher, not independent editorial
perspectives. Their inclusion does not imply endorsement by this library.

`tools/refresh_kurdish_news.py` checks the policy on each refresh, then verifies
each article's canonical identity, original language, publisher, publication date,
and local author profile. Only recognized text articles are included; video-only
pages, missing bylines, wire credits and detected syndication exceptions are
excluded. Photo captions are excluded from the text check; photographs themselves
are never copied. This is a conservative automated screen, not a legal opinion;
unknown agency spellings or new page formats still require editorial review.

Only titles, bylines, dates, source names, topics and original links are published.
The article text and RSS descriptions are used transiently for checks and are not
stored. Neither headlines nor full articles are machine-translated. The page opens
with Kurdish articles; Kurmancî and Soranî interfaces default to their own variety.
The prominent **Read in** controls choose the article language independently of
the interface. Explicit choices are preserved in the page URL, and Soranî headings
have their own right-to-left direction even within an English interface.

### English-language archive

Global Voices' [attribution policy](https://globalvoices.org/about/global-voices-attribution-policy/)
was reviewed on 27 September 2026. Unless otherwise stated, Global Voices-created
content is available under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
That permission does not automatically cover work from other publishers or
third-party photos, audio and video.

The collection publishes only original titles, author names, original publication
dates, source identity and links to the original pages. No article bodies,
descriptions, photographs, audio or video are copied into the public dataset.
Titles and author names are plain text; markup is removed, and titles are not
translated. Topic labels are library classifications, not publisher endorsements.
The news page credits the source and author and links both the original article
and the license. Global Voices does not sponsor or endorse this library.

Each candidate must have an HTTPS Global Voices article URL, a matching canonical
URL on the article page, and the expected CC BY 3.0 link in the article's own
credit block. A generic site-footer license alone is insufficient. Articles with
detected republication, syndication, permission-only or other rights exceptions
are excluded, including the Syria Untold stories encountered during the pilot.
The conservative check may also exclude original articles whose photo captions
mention third-party permission; it favors exclusion when uncertain. These checks
help enforce the reviewed source policy; they cannot interpret every possible
legal notice. Review the source terms periodically and disable the source if
its reuse policy or page structure changes.

An RSS feed is a delivery mechanism, not itself a reuse license. Do not enable
other publishers merely because they provide RSS. Adding a source requires a
documented permission basis, any source-specific attribution rules, an update to
the explicit code allowlist, and tests for its per-item restrictions. The current
feed directory is [Global Voices RSS feeds](https://globalvoices.org/feeds/).
The pilot checks its documented all-stories feed plus Iran, Iraq, Syria and
Turkey feeds. The all-stories feed allows relevant diaspora and cultural stories
to enter even when the publisher does not tag them with one of those countries.

## Daily refresh

`.github/workflows/refresh-news.yml` requests a refresh every day at **07:37 and
19:37 UTC** (10:37 and 22:37 in Turkey). The second attempt provides another chance
after a delayed or missed run. It runs both source importers, validates both datasets,
and also supports GitHub Actions' **Run workflow** button. Changes to the importer,
source configuration and refresh workflow trigger an immediate refresh. After a
successful refresh workflow, the existing validated publishing workflow deploys
the resulting commit. GitHub Actions schedules can be delayed and public-repository
schedules can be disabled after 60 days of repository inactivity. If updates stop,
check Actions, enable the workflow if necessary, then use **Run workflow**. This
schedule is a best-effort daily check, not a promise of new reporting every day.

The source status and `checkedAt` show the last attempt. `lastSuccessfulCheck`
advances only when every configured feed and attempted article check succeeds.
Temporary feed/page failures preserve previously accepted items; unverified new
articles are never added. This includes HTTP 200 maintenance or challenge pages
that lack the expected article structure or canonical URL. A detected new article-level rights exception removes
that listing. A failed feed marks the source `partial` or `error`, so retained
stories cannot silently look newly refreshed. No failure changes publication dates.
The English archive keeps at most 100 newest accepted links and deduplicates
canonical URLs, including stories listed in several country feeds. Each Kurdish
service keeps up to 40 accepted articles from the past 90 days, deduplicated by
its stable article ID. The workflow emits warnings for incomplete source checks
and publishes the preserved collection with its accurate status. Its successful
completion alone does not prove that every source was reachable; inspect the
source statuses in the run summary and on the page.

## Local commands

```sh
python3 tools/refresh_news.py          # Fetch reviewed sources and atomically update data/news.json
python3 tools/refresh_news.py --check  # Validate committed data offline; never fetch or write
python3 tools/refresh_kurdish_news.py  # Update data/kurdish-news.json from reviewed Kurdish services
python3 tools/refresh_kurdish_news.py --check
python3 -m unittest discover -s tests -p 'test_news*.py'
bash tools/prepublish.sh
```

The importer uses only Python's standard library. Network failures are recorded in
the data and logs and do not erase the last good archive. Invalid configuration or
data exits nonzero before writing. `data/news-sources.json` holds the reviewed
source allowlist; `data/news.json` is the generated public record. Do not edit
publication dates to make the page look current, add snippets or media without
reviewing their rights, or add unlicensed sources to fill otherwise empty topics.
The Kurdish equivalents are `data/kurdish-news-sources.json` and
`data/kurdish-news.json`. Both importers use only Python's standard library.

Relevance is checked only in the headline and short RSS lead, never by finding an
isolated Kurdish mention somewhere in a full story. Those leads are discarded
after classification. Categories can overlap. Reports and opinion belong to
their named authors and publishers; the library provides access to the source.
