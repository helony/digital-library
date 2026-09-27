/* Licensed source titles remain in their original language. This script only
 * translates the library interface; it never generates or alters reporting. */
(() => {
  'use strict';
  const translations = {
    en: {
      title: 'News & Culture', kicker: 'A window on the Kurdish world', subtitle: 'Stories from across the Kurdish world.',
      intro: 'A small collection of reporting from Global Voices. Checked daily; new stories appear when available.',
      skip: 'Skip to stories', language: 'Interface language', sourcesLink: 'About the sources', loading: 'Checking the collection…',
      stories: 'Reporting & stories', filters: 'Filter stories by topic', count: 'Stories: {count}', all: 'All stories',
      politics: 'Politics', culture: 'Culture', affairs: 'Current affairs', music: 'Music', people: 'People', geography: 'Places',
      checked: 'Last checked:', published: 'Originally published:', by: 'By', read: 'Read at Global Voices', english: 'English',
      stale: 'The collection has not had a successful update in over three days. Previously collected stories remain available.',
      partial: 'Some source checks could not be completed. Previously collected stories remain available.',
      failed: 'The source could not be checked. Previously collected stories remain available.',
      lastSuccess: 'Last successful check:', unavailable: 'The collection could not be loaded. Please try again later, or visit Global Voices using the source link below.',
      noStories: 'There are no stories in this selection yet. New permitted stories will appear when available.',
      archive: 'From the archive: these stories retain their original publication dates.',
      sourceKicker: 'Follow the story to its source', sourcesHeading: 'A small beginning, with clear sources.',
      sourcesBody: 'This pilot links to Kurdish-related stories by Global Voices. Each story keeps its original title, author and publication date. Topics help you browse; opinions belong to the named authors.',
      sourceLanguage: 'The articles are in English. Changing the interface language does not translate them.',
      reuse: 'Global Voices text is shared under', policy: 'Read the source’s reuse policy', back: 'Back to the library',
    },
    kmr: {
      title: 'Nûçe û çand', kicker: 'Pencereyek li cîhana kurdî', subtitle: 'Çîrok ji her aliyê cîhana kurdî.',
      intro: 'Hilbijartineke biçûk ji nivîsarên Global Voices. Her roj tê kontrolkirin; nivîsarên nû dema berdest bin tên zêdekirin.',
      skip: 'Derbasî nivîsaran bibe', language: 'Zimanê rûkarê', sourcesLink: 'Derbarê çavkaniyan', loading: 'Berhevok tê kontrolkirin…',
      stories: 'Nûçe û nivîsar', filters: 'Nivîsaran li gorî mijarê hilbijêre', count: 'Nivîsar: {count}', all: 'Hemû nivîsar',
      politics: 'Siyaset', culture: 'Çand', affairs: 'Rûdanên rojane', music: 'Muzîk', people: 'Kesayet', geography: 'Cih',
      checked: 'Kontrola dawî:', published: 'Dîroka weşana orîjînal:', by: 'Ji aliyê', read: 'Li Global Voices bixwîne', english: 'Îngilîzî',
      stale: 'Zêdetirî sê rojan e ku berhevok bi serkeftî nehatiye nûkirin. Nivîsarên berê hîn berdest in.',
      partial: 'Hin kontrolên çavkaniyan nehatin temamkirin. Nivîsarên berê hîn berdest in.',
      failed: 'Çavkanî nehat kontrolkirin. Nivîsarên berê hîn berdest in.',
      lastSuccess: 'Kontrola serkeftî ya dawî:', unavailable: 'Berhevok nehat barkirin. Dîsa biceribîne an ji girêdana çavkaniyê li jêr serdana Global Voices bike.',
      noStories: 'Di vê hilbijartinê de hîn nivîsar tune. Nivîsarên nû yên destûrdar dema berdest bin dê bên zêdekirin.',
      archive: 'Ji arşîvê: van nivîsaran dîroka weşana xwe ya orîjînal parastiye.',
      sourceKicker: 'Nivîsarê li çavkaniya wê bişopîne', sourcesHeading: 'Destpêkeke biçûk, bi çavkaniyên zelal.',
      sourcesBody: 'Ev ceribandin girêdanên nivîsarên Global Voices yên derbarê kurdan pêşkêş dike. Sernav, nivîskar û dîroka weşanê tên parastin. Mijar ji bo gerandinê ne; nêrîn ên nivîskaran in.',
      sourceLanguage: 'Nivîsar bi îngilîzî ne. Guherandina zimanê rûkarê wan wernaegerîne.',
      reuse: 'Nivîsên Global Voices di bin vê lîsansê de tên parvekirin:', policy: 'Siyaseta bikaranîna çavkaniyê bixwîne', back: 'Vegere pirtûkxaneyê',
    },
    ckb: {
      title: 'هەواڵ و کولتوور', kicker: 'پەنجەرەیەک بۆ جیهانی کوردی', subtitle: 'چیرۆک لە سەرانسەری جیهانی کوردی.',
      intro: 'کۆمەڵەیەکی بچووک لە بابەتەکانی Global Voices. ڕۆژانە پشکنین دەکرێت؛ بابەتی نوێ کە بەردەست بێت زیاد دەکرێت.',
      skip: 'بڕۆ بۆ بابەتەکان', language: 'زمانی ڕووکار', sourcesLink: 'دەربارەی سەرچاوەکان', loading: 'کۆمەڵەکە پشکنین دەکرێت…',
      stories: 'هەواڵ و بابەت', filters: 'بابەتەکان بە پێی ناوەڕۆک هەڵبژێرە', count: 'بابەت: {count}', all: 'هەموو بابەتەکان',
      politics: 'سیاسەت', culture: 'کولتوور', affairs: 'ڕووداوەکان', music: 'مۆسیقا', people: 'کەسایەتی', geography: 'شوێنەکان',
      checked: 'دوایین پشکنین:', published: 'بەرواری بڵاوکردنەوەی ڕەسەن:', by: 'نووسین:', read: 'لە Global Voices بخوێنەوە', english: 'ئینگلیزی',
      stale: 'زیاتر لە سێ ڕۆژە کۆمەڵەکە بە سەرکەوتوویی نوێ نەکراوەتەوە. بابەتەکانی پێشوو هەر بەردەستن.',
      partial: 'هەندێک پشکنینی سەرچاوەکان تەواو نەکران. بابەتەکانی پێشوو هەر بەردەستن.',
      failed: 'سەرچاوەکە پشکنین نەکرا. بابەتەکانی پێشوو هەر بەردەستن.',
      lastSuccess: 'دوایین پشکنینی سەرکەوتوو:', unavailable: 'کۆمەڵەکە بار نەکرا. دواتر هەوڵ بدەرەوە یان لە بەستەری سەرچاوەکەی خوارەوە سەردانی Global Voices بکە.',
      noStories: 'هێشتا هیچ بابەتێک لەم هەڵبژاردنەدا نییە. بابەتی نوێی ڕێگەپێدراو کە بەردەست بێت زیاد دەکرێت.',
      archive: 'لە ئەرشیفەوە: ئەم بابەتانە بەرواری بڵاوکردنەوەی ڕەسەنی خۆیان پاراستووە.',
      sourceKicker: 'بابەتەکە لە سەرچاوەکەی بخوێنەوە', sourcesHeading: 'دەستپێکێکی بچووک، بە سەرچاوەی ڕوون.',
      sourcesBody: 'ئەم تاقیکردنەوەیە بەستەری بابەتە کوردییەکانی Global Voices پێشکەش دەکات. ناونیشان، نووسەر و بەرواری بڵاوکردنەوە دەپارێزرێن. پۆلەکان بۆ گەڕانن؛ بۆچوونەکان هی نووسەرەکانن.',
      sourceLanguage: 'بابەتەکان بە ئینگلیزین. گۆڕینی زمانی ڕووکار وەریان ناگێڕێت.',
      reuse: 'دەقی Global Voices بەم مۆڵەتە بڵاو دەکرێتەوە:', policy: 'سیاسەتی بەکارهێنانەوەی سەرچاوەکە بخوێنەوە', back: 'گەڕانەوە بۆ کتێبخانە',
    },
    diq: {
      title: 'Xeberî û kultur', kicker: 'Pencereyê cîhanê kurdî', subtitle: 'Hîkayeyî ra dorê cîhanê kurdî.',
      intro: 'Komêko qıckek ra nuşteyê Global Voices. Her roj kontrol beno; nuşteyê neweyî ke amade bibê, zêde benê.',
      skip: 'Şo nuşteyan', language: 'Zıwanê rûkarî', sourcesLink: 'Derheqê çıman', loading: 'Koleksiyon kontrol beno…',
      stories: 'Xeberî û nuşteyî', filters: 'Nuşteyan goreyê babetan weçîne', count: 'Nuşte: {count}', all: 'Pêro nuşteyî',
      politics: 'Siyaset', culture: 'Kultur', affairs: 'Qewimayîşî', music: 'Muzîk', people: 'Kesî', geography: 'Cayî',
      checked: 'Kontrolo peyên:', published: 'Tarîxê weşanê orîjînal:', by: 'Nuştox:', read: 'Global Voices de biwane', english: 'Îngilizkî',
      stale: 'Hîrê rojan ra zaf o ke koleksiyon serkewteyî nêameyo newekerdene. Nuşteyê verên hîna amade yê.',
      partial: 'Tayê kontrolê çıman temam nêbî. Nuşteyê verên hîna amade yê.',
      failed: 'Çıme kontrol nêbî. Nuşteyê verên hîna amade yê.',
      lastSuccess: 'Kontrolo serkewteyîyo peyên:', unavailable: 'Koleksiyon bar nêbî. Dima reyna biceribne yan lînkê çıme yê cêrî ra Global Voices ziyaret bike.',
      noStories: 'Ena weçînayîş de hîna nuşte çin o. Nuşteyê neweyê destûrdayeyî ke amade bibê zêde benê.',
      archive: 'Arşîv ra: nê nuşteyan tarîxê weşanê xo yê orîjînal pawito.',
      sourceKicker: 'Nuşte çıme xo de biwane', sourcesHeading: 'Destpêkêko qıckek, bi çımanê eşkera.',
      sourcesBody: 'Na ceribnayîş lînkanê nuşteyanê Global Voices yê derheqê kurdan dana. Sernuşte, nuştox û tarîxê weşanî yenê pawitene. Babetî seba gêrayîşî yê; fikrî yê nuştoxan ê.',
      sourceLanguage: 'Nuşteyî îngilizkî yê. Vurnayîşê zıwanê rûkarî înan tercume nêkeno.',
      reuse: 'Metnê Global Voices binê na lîsansî de yeno parvekerdene:', policy: 'Siyasetê şuxulnayîşê çıme biwane', back: 'Agêre kıtabxaneyî',
    },
    hac: {
      title: 'هەواڵ و کولتوور', kicker: 'پەنجەرەیەک وە جیهانی کوردی', subtitle: 'چیرۆک ژە جیهانی کوردی.',
      intro: 'کۆمەڵەیەکی کەم ژە بابەتەکانی Global Voices. هەر ڕۆ پشکنین کەرێو؛ بابەتی تازە کە بەردەست بوو زیاد کەرێو.',
      skip: 'بڕۆ وە بابەتی', language: 'زمانی ڕووکار', sourcesLink: 'وەبارەی سەرچاوەی', loading: 'کۆمەڵەکە پشکنین کەرێو…',
      stories: 'هەواڵ و بابەت', filters: 'بابەتی وە پێی ناوەڕۆک هەڵبژێرە', count: 'بابەت: {count}', all: 'هەموو بابەتی',
      politics: 'سیاسەت', culture: 'کولتوور', affairs: 'ڕووداو', music: 'مۆسیقا', people: 'کەسایەتی', geography: 'شوێنی',
      checked: 'دوایین پشکنین:', published: 'بەرواری بڵاوکردنەوەی ڕەسەن:', by: 'نووسین:', read: 'وە Global Voices بخوێنەوە', english: 'ئینگلیزی',
      stale: 'زیاتر ژە سێ ڕۆ کۆمەڵەکە وە سەرکەوتوویی نوێ نەکەرێنەوە. بابەتەکانی پێشوو هەر بەردەستن.',
      partial: 'هەندێ پشکنینی سەرچاوەی تەواو نەکەرێن. بابەتەکانی پێشوو هەر بەردەستن.',
      failed: 'سەرچاوەکە پشکنین نەکەرا. بابەتەکانی پێشوو هەر بەردەستن.',
      lastSuccess: 'دوایین پشکنینی سەرکەوتوو:', unavailable: 'کۆمەڵەکە بار نەبێ. دواتر هەوڵ بدەرەوە یا ژە بەستەری سەرچاوەی خوارەوە سەردانی Global Voices بکە.',
      noStories: 'هێشتا هیچ بابەتێک وە ئەم هەڵبژاردنەدا نیە. بابەتی تازەی ڕێگەپێدراو کە بەردەست بوو زیاد کەرێو.',
      archive: 'ژە ئەرشیفەوە: ئەم بابەتانە بەرواری بڵاوکردنەوەی ڕەسەنی وێش هەڵگرتە.',
      sourceKicker: 'بابەت وە سەرچاوەی وێش بخوێنەوە', sourcesHeading: 'دەستپێکێکی کەم، وە سەرچاوەی ڕوون.',
      sourcesBody: 'ئەم تاقیکردنەوەیە بەستەری بابەتە کوردییەکانی Global Voices پێشکەش کەرو. ناونیشان، نووسەر و بەرواری بڵاوکردنەوە هەڵگیرێن. پۆلەکان وە گەڕانن؛ بۆچوونەکان هی نووسەرەکانن.',
      sourceLanguage: 'بابەتەکان وە ئینگلیزین. گۆڕینی زمانی ڕووکار وەریان ناگێڕو.',
      reuse: 'دەقی Global Voices وە ئەم مۆڵەتە بڵاو کەرێوە:', policy: 'سیاسەتی بەکارهێنانەوەی سەرچاوە بخوێنەوە', back: 'گەڕانەوە وە کتێبخانە',
    },
    sdh: {
      title: 'هەواڵ و فەرهەنگ', kicker: 'پەنجەرەێگ بۆ جیهان کوردی', subtitle: 'چیرۆک لە سەرانسەر جیهان کوردی.',
      intro: 'کۆمەڵەێگ بچووک لە بابەتەیل Global Voices. ڕۆژانە پشکنین دەکرێ؛ بابەت نوو کە بەردەست بوو زیاد دەکرێ.',
      skip: 'بڕۆ بۆ بابەتەیل', language: 'زمان ڕووکار', sourcesLink: 'دەربارەی سەرچاوەیل', loading: 'کۆمەڵەکە پشکنین دەکرێ…',
      stories: 'هەواڵ و بابەت', filters: 'بابەتەیل بە پێ ناوەڕۆک هەڵبژێرە', count: 'بابەت: {count}', all: 'هەموو بابەتەیل',
      politics: 'سیاسەت', culture: 'فەرهەنگ', affairs: 'ڕووداوەیل', music: 'مۆسیقا', people: 'کەسایەتی', geography: 'شوێنەیل',
      checked: 'دوایین پشکنین:', published: 'بەروار بڵاوکردنەوەی ئەسڵی:', by: 'نووسین:', read: 'لە Global Voices بخوەنەوە', english: 'ئینگلیسی',
      stale: 'زیاتر لە سێ ڕۆژە کۆمەڵەکە بە سەرکەوتوویی نوو نەکراوەتەوە. بابەتەیل پێشوو هەر بەردەستن.',
      partial: 'هەندێ پشکنین سەرچاوەیل تەواو نەکران. بابەتەیل پێشوو هەر بەردەستن.',
      failed: 'سەرچاوەکە پشکنین نەکرا. بابەتەیل پێشوو هەر بەردەستن.',
      lastSuccess: 'دوایین پشکنین سەرکەوتوو:', unavailable: 'کۆمەڵەکە بار نەکرا. دواتر هەوڵ بدەرەوە یا لە بەستەر سەرچاوەی خوارەوە سەردان Global Voices بکە.',
      noStories: 'هێشتا هیچ بابەتێگ لە ئەم هەڵبژاردنەدا نیە. بابەت نووی ڕێگەپێدراو کە بەردەست بوو زیاد دەکرێ.',
      archive: 'لە ئەرشیفەوە: ئەم بابەتەیلە بەروار بڵاوکردنەوەی ئەسڵی خوەیان پاراستووە.',
      sourceKicker: 'بابەت لە سەرچاوەی خوەی بخوەنەوە', sourcesHeading: 'دەستپێکێگ بچووک، بە سەرچاوەی ڕوون.',
      sourcesBody: 'ئەم تاقیکردنەوەیە بەستەر بابەتەیل کوردی Global Voices پێشکەش دەکەێ. ناونیشان، نووسەر و بەروار بڵاوکردنەوە دەپارێزرێن. پۆلەیل بۆ گەڕانن؛ بۆچوونەیل هی نووسەرەیلن.',
      sourceLanguage: 'بابەتەیل بە ئینگلیسین. گۆڕین زمان ڕووکار وەریان ناگێڕێ.',
      reuse: 'دەق Global Voices بە ئەم مۆڵەتە بڵاو دەکرێتەوە:', policy: 'سیاسەت بەکارهێنانەوەی سەرچاوە بخوەنەوە', back: 'گەڕانەوە بۆ کتێوخانە',
    },
  };
  const topics = ['politics', 'culture', 'affairs', 'music', 'people', 'geography'];
  const rtl = new Set(['ckb', 'hac', 'sdh']);
  const localeDates = {en: 'en-GB', kmr: 'ku', ckb: 'ckb', diq: 'en-GB', hac: 'ckb', sdh: 'ckb'};
  const sourceId = 'global-voices';
  const licenseUrl = 'https://creativecommons.org/licenses/by/3.0/';
  const $ = selector => document.querySelector(selector);
  const storedLocale = () => { try { return localStorage.getItem('kdl_locale'); } catch { return null; } };
  const pickLocale = () => [new URL(location.href).searchParams.get('lang'), storedLocale(), 'en'].find(code => Object.hasOwn(translations, code));
  let locale = pickLocale();
  let selectedTopic = 'all';
  let collection = null;
  let items = [];
  let failedToLoad = false;
  const t = key => translations[locale][key] || translations.en[key] || key;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function validDate(value) {
    return typeof value === 'string' && Number.isFinite(Date.parse(value));
  }

  function formattedDate(value, includeTime = false) {
    const options = {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'};
    if (includeTime) Object.assign(options, {hour: '2-digit', minute: '2-digit', timeZoneName: 'short'});
    return new Intl.DateTimeFormat(localeDates[locale], options).format(new Date(value));
  }

  function timeNode(value, includeTime = false) {
    const node = element('time', '', formattedDate(value, includeTime));
    node.dateTime = value;
    return node;
  }

  function safeOriginal(value) {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.hostname !== 'globalvoices.org' || url.username || url.password || url.port) return null;
      if (!/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(url.pathname)) return null;
      url.hash = '';
      url.search = '';
      return url.href;
    } catch { return null; }
  }

  function cleanItems(input) {
    const seen = new Set();
    return input.filter(item => {
      const url = safeOriginal(item?.url);
      if (!url || item.sourceId !== sourceId || item.language !== 'en' || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 600 || typeof item.author !== 'string' || !item.author.trim() || !validDate(item.publishedAt) || seen.has(url)) return false;
      seen.add(url);
      return true;
    }).map(item => ({
      url: safeOriginal(item.url), title: item.title.trim(), author: item.author.trim(), publishedAt: item.publishedAt,
      topics: [...new Set((Array.isArray(item.topics) ? item.topics : []).filter(topic => topics.includes(topic)))],
    })).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }

  function renderFilters() {
    const available = ['all', ...topics.filter(topic => items.some(item => item.topics.includes(topic)))];
    if (!available.includes(selectedTopic)) selectedTopic = 'all';
    const fragment = document.createDocumentFragment();
    for (const topic of items.length ? available : []) {
      const button = element('button', '', t(topic));
      button.type = 'button';
      button.dataset.topic = topic;
      button.setAttribute('aria-pressed', String(selectedTopic === topic));
      button.setAttribute('aria-controls', 'newsList');
      button.addEventListener('click', () => {
        selectedTopic = topic;
        $('#newsTopics').querySelectorAll('button').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.topic === topic)));
        renderCards();
      });
      fragment.append(button);
    }
    $('#newsTopics').replaceChildren(fragment);
    $('#newsTopics').setAttribute('aria-label', t('filters'));
  }

  function renderCards() {
    const visible = items.filter(item => selectedTopic === 'all' || item.topics.includes(selectedTopic));
    const fragment = document.createDocumentFragment();
    visible.forEach((item, index) => {
      const card = element('article', 'news-card');
      const meta = element('div', 'news-card-top');
      const number = element('span', 'news-number', String(index + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      meta.append(number, element('span', 'news-card-topic', item.topics.map(t).join(' · ')), element('span', 'news-card-language', t('english')));
      const heading = element('h3');
      heading.lang = 'en';
      heading.dir = 'auto';
      const titleLink = element('a', '', item.title);
      titleLink.href = item.url;
      heading.append(titleLink);
      const byline = element('p', 'news-byline', t('by') + ' ');
      const author = element('bdi', '', item.author);
      author.lang = 'en';
      const source = element('bdi', '', 'Global Voices');
      source.lang = 'en';
      byline.append(author, document.createTextNode(' · '), source);
      const published = element('p', 'news-published', t('published') + ' ');
      published.append(timeNode(item.publishedAt));
      const actions = element('div', 'news-card-actions');
      const read = element('a', 'news-original', t('read') + ' ');
      read.href = item.url;
      const arrow = element('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      read.append(arrow);
      const license = element('a', 'news-card-license', 'CC BY 3.0');
      license.href = licenseUrl;
      license.lang = 'en';
      license.dir = 'ltr';
      actions.append(read, license);
      card.append(meta, heading, byline, published, actions);
      fragment.append(card);
    });
    $('#newsList').replaceChildren(fragment);
    $('#newsCount').textContent = collection ? t('count').replace('{count}', String(visible.length)) : '';
    $('#newsEmpty').hidden = visible.length > 0 || !collection;
    $('#newsEmpty').textContent = t('noStories');
    $('#newsArchive').hidden = !items.length || Date.now() - Date.parse(items[0].publishedAt) <= 90 * 86400000;
  }

  function renderStatus() {
    const updated = $('#newsUpdated');
    const notice = $('#newsNotice');
    updated.replaceChildren();
    notice.replaceChildren();
    notice.hidden = true;
    if (failedToLoad) {
      updated.textContent = t('unavailable');
      return;
    }
    if (!collection) { updated.textContent = t('loading'); return; }
    updated.append(document.createTextNode(t('checked') + ' '), timeNode(collection.checkedAt, true));
    const sources = collection.sources.filter(source => source.id === sourceId);
    const lastSuccess = collection.lastSuccessfulCheck;
    const stale = !validDate(lastSuccess) || Date.now() - Date.parse(lastSuccess) > 72 * 3600000;
    const hasError = sources.some(source => source.status === 'error');
    const hasPartial = sources.some(source => source.status === 'partial');
    const messages = [];
    if (hasError) messages.push(t('failed'));
    else if (hasPartial) messages.push(t('partial'));
    if (stale && !hasError && !hasPartial) messages.push(t('stale'));
    if (messages.length) {
      notice.hidden = false;
      notice.append(document.createTextNode(messages.join(' ')));
      if (validDate(lastSuccess)) notice.append(document.createTextNode(' ' + t('lastSuccess') + ' '), timeNode(lastSuccess, true));
    }
  }

  function applyLocale() {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl.has(locale) ? 'rtl' : 'ltr';
    document.title = t('title') + ' · Kurdish Digital Library';
    document.querySelectorAll('[data-news-i18n]').forEach(node => { node.textContent = t(node.dataset.newsI18n); });
    document.querySelectorAll('[data-common-i18n]').forEach(node => {
      const dictionary = window.KDL_COMPLETE;
      node.textContent = dictionary?.[locale]?.[node.dataset.commonI18n] || dictionary?.en?.[node.dataset.commonI18n] || node.textContent;
    });
    const navigationLabel = window.KDL_COMPLETE?.[locale]?.libraryNavigation || window.KDL_COMPLETE?.en?.libraryNavigation;
    if (navigationLabel) $('.top-nav').setAttribute('aria-label', navigationLabel);
    document.querySelectorAll('[data-local-link]').forEach(node => {
      const url = new URL(node.getAttribute('href'), location.href);
      if (locale === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', locale);
      node.href = url.href;
    });
    $('#newsLanguage').value = locale;
    renderFilters();
    renderCards();
    renderStatus();
  }

  $('#newsLanguage').addEventListener('change', event => {
    if (!Object.hasOwn(translations, event.target.value)) return;
    locale = event.target.value;
    try { localStorage.setItem('kdl_locale', locale); } catch { /* The page also works without storage. */ }
    const url = new URL(location.href);
    if (locale === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', locale);
    history.replaceState({}, '', url);
    applyLocale();
  });
  window.addEventListener('popstate', () => { locale = pickLocale(); applyLocale(); });
  applyLocale();

  async function load() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('../data/news.json', {cache: 'no-cache', signal: controller.signal});
      if (!response.ok) throw new Error('Collection unavailable');
      const data = await response.json();
      if (data?.schemaVersion !== 1 || !validDate(data.checkedAt) || !Array.isArray(data.items) || !Array.isArray(data.sources) || !data.sources.some(source => source.id === sourceId && ['ok', 'partial', 'error'].includes(source.status))) throw new Error('Invalid collection');
      collection = data;
      items = cleanItems(data.items);
    } catch {
      failedToLoad = true;
    } finally {
      clearTimeout(timeout);
      $('#newsList').setAttribute('aria-busy', 'false');
      applyLocale();
    }
  }
  load();
})();
