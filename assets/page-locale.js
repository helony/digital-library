/* Localise the interface of generated book/author pages and informational pages.
 * Load locale-complete.js before this file. Original titles and literary texts
 * are never machine-translated or replaced by this helper.
 */
(() => {
  'use strict';
  const dictionaries = window.KDL_COMPLETE;
  if (!dictionaries) return;
  const script = document.currentScript;
  const base = new URL('../', script.src);
  const params = new URL(location.href).searchParams;
  const readStoredLocale = () => { try { return localStorage.getItem('kdl_locale'); } catch { return null; } };
  let locale = [params.get('lang'), readStoredLocale(), 'en'].find(code => dictionaries[code]);
  let catalogue = window.KDL_BOOKS || null;
  const originalText = new WeakMap();
  const t = key => dictionaries[locale][key] || dictionaries.en[key] || key;
  const relativePath = location.pathname.startsWith(base.pathname) ? location.pathname.slice(base.pathname.length) : '';
  const bookSlug = relativePath.match(/^book\/([^/]+)\//)?.[1];
  const authorSlug = relativePath.match(/^authors\/([^/]+)\//)?.[1];
  const isAuthors = /^authors\/(?:index\.html)?$/.test(relativePath);
  const isAbout = /^about\/(?:index\.html)?$/.test(relativePath);
  const isPreservation = /^preservation\/(?:index\.html)?$/.test(relativePath);

  function bind(element, key, variables = {}) {
    if (!element) return;
    let value = t(key);
    for (const [name, replacement] of Object.entries(variables)) value = value.replaceAll(`{${name}}`, replacement);
    if (element.textContent !== value) element.textContent = value;
    element.lang = locale;
    element.dir = dictionaries[locale].dir;
  }
  function translatedText(element, text, language = locale) {
    if (!element) return;
    if (element.textContent !== text) element.textContent = text;
    element.lang = language;
    element.dir = dictionaries[language]?.dir || 'auto';
  }

  const phraseKeys = {
    'Authors': 'navAuthors', 'Preservation': 'navPreservation', 'About': 'navAbout',
    'BROWSE THE COLLECTION': 'exploreLibrary', 'ABOUT THE LIBRARY': 'aboutLibrary',
    'AUTHOR RECORD': 'authorRecord', 'PRESERVATION DASHBOARD': 'archiveDashboard',
    'Source & reuse': 'sourceAndRights', 'Read': 'readNow', 'Read now': 'readNow',
    'Read available section': 'readAvailable', 'Browse the catalogue': 'catalogue',
    'Browse authors': 'navAuthors', 'Back to books': 'backToBooks', 'All authors': 'allAuthors',
    'catalogue works': 'catalogueWorks', 'language varieties represented': 'representedVarieties',
    'catalogue records': 'archiveRecords', 'eligible for automatic archiving': 'archiveEligible',
    'manual-rights-review records': 'archiveManual', 'local preservation files detected': 'archiveLocal',
    'Archive manifest': 'archiveManifest', 'Latest audit JSON': 'latestAudit',
    'Work': 'work', 'Format': 'format', 'Policy': 'policy', 'Local status': 'localStatus',
    'Auto-archive eligible': 'autoArchive', 'Manual review': 'manualReview', 'Checking…': 'checking',
    'Review': 'review', 'Local copy': 'localCopy', 'External fallback': 'externalFallback',
    'Open access · Clear provenance · Preservation-first': 'footer',
    'Independent catalogue & preservation archive': 'brandSub',
    'Loading catalogue…': 'loading', 'Read PDF': 'openPdf', 'Download PDF': 'downloadPdf',
  };
  for (const [key, value] of Object.entries(dictionaries.en)) {
    if (key.startsWith('rights_')) phraseKeys[value] = key;
  }
  const interfaceSelectors = [
    '.top-nav a', '.back-link', '.page-kicker', '.source-details summary', '.details-actions a',
    '.record-list .secondary-button', '.machine-links a', '.site-footer .footer-inner > span:not(.footer-links)',
    '.brand small', '.summary-strip span', '.status-card span', '.audit-table th',
    '.audit-table td:nth-child(4)', '.status-pill', '.audit-table td[colspan]',
  ].join(',');
  function translateInterface(root = document) {
    root.querySelectorAll(interfaceSelectors).forEach(element => {
      if (element.children.length) return;
      if (!originalText.has(element)) originalText.set(element, element.textContent);
      const raw = originalText.get(element).trim();
      const leadingArrow = raw.match(/^[←→↑↓]\s*/)?.[0] || '';
      const trailingArrow = raw.match(/\s*[←→↑↓]$/)?.[0] || '';
      const phrase = raw.slice(leadingArrow.length, trailingArrow ? -trailingArrow.length : undefined).trim();
      if (phraseKeys[phrase]) {
        const label = t(phraseKeys[phrase]);
        translatedText(element, `${leadingArrow}${label}${trailingArrow}`);
      } else if (phrase === 'Catalogue JSON') translatedText(element, `${t('catalogue')} JSON`);
      else if (phrase === 'Catalogue CSV') translatedText(element, `${t('catalogue')} CSV`);
    });
    document.querySelectorAll('.directory-count').forEach(element => {
      if (!originalText.has(element)) originalText.set(element, element.textContent);
      const count = originalText.get(element).match(/^\d+/)?.[0];
      if (count) translatedText(element, `${count} ${t('works')}`);
    });
  }

  function preserveLinkLocale() {
    document.querySelectorAll('a[href]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.href);
      if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
      if (!(/\/$/.test(url.pathname) || /\.html$/.test(url.pathname))) return;
      if (locale === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', locale);
      link.href = url.href;
    });
  }

  function applyBookData() {
    if (!bookSlug || !catalogue) return;
    const book = catalogue.find(record => record.slug === bookSlug);
    if (!book) return;
    const language = book.desc?.[locale] ? locale : 'en';
    translatedText(document.querySelector('.details-description'), book.desc?.[language] || '', language);
    const paragraphs = document.querySelectorAll('.source-details > p');
    if (paragraphs[1] && dictionaries[locale][book.rightsKey]) bind(paragraphs[1], book.rightsKey);
    const metadata = paragraphs[2];
    if (metadata) translatedText(metadata, [book.year, t(book.script), book.kdlId].filter(Boolean).join(' · '));
    // Only replace our three generated policy notes. Unrecognised source prose
    // remains in its original language, and the original text survives switching.
    const policy = paragraphs[3];
    if (policy) {
      if (!originalText.has(policy)) originalText.set(policy, policy.textContent);
      const key = ['archivePolicyAutomatic', 'archivePolicyManual', 'archivePolicyLicensed']
        .find(candidate => dictionaries.en[candidate] === originalText.get(policy).trim());
      if (key) bind(policy, key);
      else { policy.lang = 'en'; policy.dir = 'ltr'; }
    }
  }

  function applyInformationalPages() {
    if (isAuthors) {
      bind(document.querySelector('main h1'), 'navAuthors');
      bind(document.querySelector('.page-lead'), 'authorsIntro');
    }
    if (authorSlug) {
      const name = document.querySelector('main h1')?.textContent || '';
      bind(document.querySelector('.page-lead'), 'readWorksBy', {author: name});
      document.querySelectorAll('.record-row p').forEach(element => {
        if (!originalText.has(element)) originalText.set(element, element.textContent);
        const raw = originalText.get(element);
        const subjects = {Poetry: 'poetry', Reference: 'reference', Religious: 'religious', Education: 'education', Folklore: 'folklore'};
        const chunks = raw.split(' · ');
        const subject = subjects[chunks.at(-1)];
        if (subject) chunks[chunks.length - 1] = t(subject);
        translatedText(element, chunks.join(' · '));
      });
    }
    if (isAbout) {
      bind(document.querySelector('main h1'), 'aboutHeading');
      bind(document.querySelector('.page-lead'), 'aboutIntro');
      const headings = document.querySelectorAll('.record-main h2');
      ['aboutFindHeading', 'aboutPreserveHeading', 'aboutRightsHeading'].forEach((key, index) => bind(headings[index], key));
      const paragraphs = document.querySelectorAll('.record-main > p');
      ['aboutFind', 'aboutPreserve', 'aboutRights', 'createdBy'].forEach((key, index) => bind(paragraphs[index], key));
      [[1, 'preservation/index.html', 'preservation'], [2, 'RIGHTS_POLICY.md', 'rightsReuse']].forEach(([index, path, key]) => {
        if (!paragraphs[index]) return;
        const link = document.createElement('a');
        link.href = new URL(path, base).href;
        link.textContent = t(key);
        paragraphs[index].append(' ', link);
      });
    }
    if (isPreservation) {
      bind(document.querySelector('main h1'), 'archiveStatus');
      bind(document.querySelector('.page-lead'), 'archiveIntro');
    }
    applyBookData();
  }

  const nav = document.querySelector('.top-nav');
  const select = document.createElement('select');
  select.className = 'page-locale-select';
  select.style.cssText = 'font:inherit;max-width:15rem;padding:.55rem;border:1px solid #d9cbb9;border-radius:.65rem;background:#fffdf8;color:#11213d;';
  for (const [code, dictionary] of Object.entries(dictionaries)) {
    const option = document.createElement('option');
    option.value = code; option.textContent = dictionary.native; option.lang = code; select.append(option);
  }
  nav?.append(select);

  function apply() {
    document.documentElement.lang = locale;
    document.documentElement.dir = dictionaries[locale].dir;
    select.value = locale;
    select.setAttribute('aria-label', t('chooseLanguage'));
    nav?.setAttribute('aria-label', t('libraryNavigation'));
    translateInterface();
    applyInformationalPages();
    preserveLinkLocale();
  }
  select.addEventListener('change', () => {
    locale = select.value;
    try { localStorage.setItem('kdl_locale', locale); } catch {}
    const url = new URL(location.href);
    if (locale === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', locale);
    history.replaceState({}, '', url);
    apply();
  });

  // Mark prose that has not yet acquired a requested translation accurately.
  document.querySelectorAll('.details-description, .source-details > p').forEach(element => {
    element.lang = 'en'; element.dir = 'ltr';
  });
  apply();
  const audit = document.getElementById('auditBody');
  if (audit) new MutationObserver(() => { translateInterface(audit); preserveLinkLocale(); })
    .observe(audit, {childList: true, subtree: true, characterData: true});

  if (bookSlug && !catalogue) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(new URL('data/catalogue-full.json', base), {signal: controller.signal, credentials: 'omit'})
      .then(response => { if (!response.ok) throw new Error('Catalogue unavailable'); return response.json(); })
      .then(data => { catalogue = data.records || []; applyBookData(); })
      .catch(() => { /* The original, language-tagged description remains readable. */ })
      .finally(() => clearTimeout(timeout));
  }
})();
