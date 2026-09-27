# News & Culture sources and maintenance

This is a small, attributed collection of links about Kurdish politics, culture,
affairs, music, people and geography. It is not a breaking-news service. Approved
sources may publish relevant stories infrequently; an old publication date stays
old even when the feeds have just been checked.

## Current permission basis

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

`.github/workflows/refresh-news.yml` requests a refresh every day at **07:37 UTC**
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
The archive keeps at most 100 newest accepted links and deduplicates canonical
URLs, including stories listed in several country feeds.

## Local commands

```sh
python3 tools/refresh_news.py          # Fetch reviewed sources and atomically update data/news.json
python3 tools/refresh_news.py --check  # Validate committed data offline; never fetch or write
python3 -m unittest discover -s tests -p test_news.py
bash tools/prepublish.sh
```

The importer uses only Python's standard library. Network failures are recorded in
the data and logs and do not erase the last good archive. Invalid configuration or
data exits nonzero before writing. `data/news-sources.json` holds the reviewed
source allowlist; `data/news.json` is the generated public record. Do not edit
publication dates to make the page look current, add snippets or media without
reviewing their rights, or add unlicensed sources to fill otherwise empty topics.

Relevance is checked only in the headline and short RSS lead, never by finding an
isolated Kurdish mention somewhere in a full story. Those leads are discarded
after classification. Categories can overlap. Reports and opinion belong to
their named authors and publishers; the library provides access to the source.
