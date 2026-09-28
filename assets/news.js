/* Licensed source titles remain in their original language. This script only
 * translates the library interface; it never generates or alters reporting. */
(() => {
  'use strict';
  const translations = {
    en: {
      title: 'News & Culture', kicker: 'A window on the Kurdish world', subtitle: 'Stories from across the Kurdish world.',
      intro: "Read original reporting in Kurmancî, Soranî and English. New links are checked daily.",
      skip: 'Skip to stories', language: 'Interface language', sourcesLink: 'About the sources', loading: 'Checking the collection…',
      stories: 'Reporting & stories', filters: 'Filter stories by topic', count: 'Stories: {count}', all: 'All stories',
      politics: 'Politics', culture: 'Culture', affairs: 'Current affairs', music: 'Music', people: 'People', geography: 'Places',
      checked: 'Last checked:', published: 'Originally published:', by: 'By', read: "Read at {source}", english: 'English',
      stale: 'The collection has not had a successful update in over three days. Previously collected stories remain available.',
      partial: 'Some source checks could not be completed. Previously collected stories remain available.',
      failed: 'The source could not be checked. Previously collected stories remain available.',
      lastSuccess: 'Last successful check:', unavailable: "This collection could not be loaded. Please try again later, or visit the sources below.",
      noStories: 'There are no stories in this selection yet. New permitted stories will appear when available.',
      archive: 'From the archive: these stories retain their original publication dates.',
      sourceKicker: 'Follow the story to its source', sourcesHeading: "Original voices. Clear sources.",
      sourcesBody: "Read the full stories at their original publishers. Each link keeps the original title, author and publication date. Topics help you browse; views belong to the named authors and sources.",
      sourceLanguage: "Choose the article language above. The headlines and linked articles stay in their original language.",
      reuse: 'Global Voices text is shared under', policy: 'Read the source’s reuse policy', back: 'Back to the library',
      articleLanguage: "Read in",
      kurdish: "Kurdish",
      policyShort: "Source policy",
      voaReuse: "VOA permits reuse of its own reporting. Third-party and wire-service material is excluded from this collection.",
    },
    kmr: {
      title: 'Nûçe û çand', kicker: 'Pencereyek li cîhana kurdî', subtitle: 'Çîrok ji her aliyê cîhana kurdî.',
      intro: "Nûçeyên orîjînal bi kurmancî, soranî û îngilîzî bixwîne. Girêdanên nû her roj tên kontrolkirin.",
      skip: 'Derbasî nivîsaran bibe', language: 'Zimanê rûkarê', sourcesLink: 'Derbarê çavkaniyan', loading: 'Berhevok tê kontrolkirin…',
      stories: 'Nûçe û nivîsar', filters: 'Nivîsaran li gorî mijarê hilbijêre', count: 'Nivîsar: {count}', all: 'Hemû nivîsar',
      politics: 'Siyaset', culture: 'Çand', affairs: 'Rûdanên rojane', music: 'Muzîk', people: 'Kesayet', geography: 'Cih',
      checked: 'Kontrola dawî:', published: 'Dîroka weşana orîjînal:', by: 'Ji aliyê', read: "Li {source} bixwîne", english: 'Îngilîzî',
      stale: 'Zêdetirî sê rojan e ku berhevok bi serkeftî nehatiye nûkirin. Nivîsarên berê hîn berdest in.',
      partial: 'Hin kontrolên çavkaniyan nehatin temamkirin. Nivîsarên berê hîn berdest in.',
      failed: 'Çavkanî nehat kontrolkirin. Nivîsarên berê hîn berdest in.',
      lastSuccess: 'Kontrola serkeftî ya dawî:', unavailable: "Berhevok nehat barkirin. Dîsa biceribîne an serdana çavkaniyên li jêr bike.",
      noStories: 'Di vê hilbijartinê de hîn nivîsar tune. Nivîsarên nû yên destûrdar dema berdest bin dê bên zêdekirin.',
      archive: 'Ji arşîvê: van nivîsaran dîroka weşana xwe ya orîjînal parastiye.',
      sourceKicker: 'Nivîsarê li çavkaniya wê bişopîne', sourcesHeading: "Dengên orîjînal. Çavkaniyên zelal.",
      sourcesBody: "Nivîsarên tevahî li çavkaniyên wan bixwîne. Her girêdan sernav, nivîskar û dîroka weşanê ya orîjînal diparêze. Mijar ji bo gerandinê ne; nêrîn ên nivîskar û çavkaniyan in.",
      sourceLanguage: "Li jor zimanê nivîsaran hilbijêre. Sernav û nivîsar bi zimanê xwe yê orîjînal dimînin.",
      reuse: 'Nivîsên Global Voices di bin vê lîsansê de tên parvekirin:', policy: 'Siyaseta bikaranîna çavkaniyê bixwîne', back: 'Vegere pirtûkxaneyê',
      articleLanguage: "Bi vî zimanî bixwîne",
      kurdish: "Kurdî",
      policyShort: "Siyaseta çavkaniyê",
      voaReuse: "VOA destûrê dide bikaranîna nûçeyên ku bixwe çêkiriye. Nivîsarên ajans û aliyên din di vê berhevokê de tune ne.",
    },
    ckb: {
      title: 'هەواڵ و کولتوور', kicker: 'پەنجەرەیەک بۆ جیهانی کوردی', subtitle: 'چیرۆک لە سەرانسەری جیهانی کوردی.',
      intro: "هەواڵی ڕەسەن بە کرمانجی، سۆرانی و ئینگلیزی بخوێنەوە. بەستەرە نوێکان ڕۆژانە پشکنین دەکرێن.",
      skip: 'بڕۆ بۆ بابەتەکان', language: 'زمانی ڕووکار', sourcesLink: 'دەربارەی سەرچاوەکان', loading: 'کۆمەڵەکە پشکنین دەکرێت…',
      stories: 'هەواڵ و بابەت', filters: 'بابەتەکان بە پێی ناوەڕۆک هەڵبژێرە', count: 'بابەت: {count}', all: 'هەموو بابەتەکان',
      politics: 'سیاسەت', culture: 'کولتوور', affairs: 'ڕووداوەکان', music: 'مۆسیقا', people: 'کەسایەتی', geography: 'شوێنەکان',
      checked: 'دوایین پشکنین:', published: 'بەرواری بڵاوکردنەوەی ڕەسەن:', by: 'نووسین:', read: "لە {source} بخوێنەوە", english: 'ئینگلیزی',
      stale: 'زیاتر لە سێ ڕۆژە کۆمەڵەکە بە سەرکەوتوویی نوێ نەکراوەتەوە. بابەتەکانی پێشوو هەر بەردەستن.',
      partial: 'هەندێک پشکنینی سەرچاوەکان تەواو نەکران. بابەتەکانی پێشوو هەر بەردەستن.',
      failed: 'سەرچاوەکە پشکنین نەکرا. بابەتەکانی پێشوو هەر بەردەستن.',
      lastSuccess: 'دوایین پشکنینی سەرکەوتوو:', unavailable: "کۆمەڵەکە بار نەکرا. دواتر هەوڵ بدەرەوە یان سەردانی سەرچاوەکانی خوارەوە بکە.",
      noStories: 'هێشتا هیچ بابەتێک لەم هەڵبژاردنەدا نییە. بابەتی نوێی ڕێگەپێدراو کە بەردەست بێت زیاد دەکرێت.',
      archive: 'لە ئەرشیفەوە: ئەم بابەتانە بەرواری بڵاوکردنەوەی ڕەسەنی خۆیان پاراستووە.',
      sourceKicker: 'بابەتەکە لە سەرچاوەکەی بخوێنەوە', sourcesHeading: "دەنگی ڕەسەن. سەرچاوەی ڕوون.",
      sourcesBody: "بابەتە تەواوەکان لە سەرچاوە ڕەسەنەکانیان بخوێنەوە. هەر بەستەرێک ناونیشان، نووسەر و بەرواری بڵاوکردنەوەی ڕەسەن دەپارێزێت. پۆلەکان بۆ گەڕانن؛ بۆچوونەکان هی نووسەر و سەرچاوەکانن.",
      sourceLanguage: "لە سەرەوە زمانی بابەتەکان هەڵبژێرە. ناونیشان و بابەتەکان بە زمانی ڕەسەنی خۆیان دەمێننەوە.",
      reuse: 'دەقی Global Voices بەم مۆڵەتە بڵاو دەکرێتەوە:', policy: 'سیاسەتی بەکارهێنانەوەی سەرچاوەکە بخوێنەوە', back: 'گەڕانەوە بۆ کتێبخانە',
      articleLanguage: "بەم زمانە بخوێنەوە",
      kurdish: "کوردی",
      policyShort: "سیاسەتی سەرچاوە",
      voaReuse: "دەنگی ئەمەریکا ڕێگە بە بەکارهێنانەوەی هەواڵی بەرهەمی خۆی دەدات. بابەتی ئاژانس و لایەنی سێیەم لەم کۆمەڵەیەدا نییە.",
    },
    diq: {
      title: 'Xeberî û kultur', kicker: 'Pencereyê cîhanê kurdî', subtitle: 'Hîkayeyî ra dorê cîhanê kurdî.',
      intro: "Xeberanê orîjînal bi kurmancî, soranî û îngilizkî biwane. Lînkê neweyî her roj kontrol benê.",
      skip: 'Şo nuşteyan', language: 'Zıwanê rûkarî', sourcesLink: 'Derheqê çıman', loading: 'Koleksiyon kontrol beno…',
      stories: 'Xeberî û nuşteyî', filters: 'Nuşteyan goreyê babetan weçîne', count: 'Nuşte: {count}', all: 'Pêro nuşteyî',
      politics: 'Siyaset', culture: 'Kultur', affairs: 'Qewimayîşî', music: 'Muzîk', people: 'Kesî', geography: 'Cayî',
      checked: 'Kontrolo peyên:', published: 'Tarîxê weşanê orîjînal:', by: 'Nuştox:', read: "{source} de biwane", english: 'Îngilizkî',
      stale: 'Hîrê rojan ra zaf o ke koleksiyon serkewteyî nêameyo newekerdene. Nuşteyê verên hîna amade yê.',
      partial: 'Tayê kontrolê çıman temam nêbî. Nuşteyê verên hîna amade yê.',
      failed: 'Çıme kontrol nêbî. Nuşteyê verên hîna amade yê.',
      lastSuccess: 'Kontrolo serkewteyîyo peyên:', unavailable: "Koleksiyon bar nêbî. Dima reyna biceribne yan çımanê cêrî ziyaret bike.",
      noStories: 'Ena weçînayîş de hîna nuşte çin o. Nuşteyê neweyê destûrdayeyî ke amade bibê zêde benê.',
      archive: 'Arşîv ra: nê nuşteyan tarîxê weşanê xo yê orîjînal pawito.',
      sourceKicker: 'Nuşte çıme xo de biwane', sourcesHeading: "Vengê orîjînal. Çimê eşkera.",
      sourcesBody: "Nuşteyanê temaman çımanê xo de biwane. Sernuşte, nuştox û tarîxê weşanê orîjînal yenê pawitene. Babetî seba gêrayîşî yê; fikrî yê nuştoxan û çıman ê.",
      sourceLanguage: "Cor de zıwanê nuşteyan weçîne. Sernuşte û nuşte bi zıwanê xo yê orîjînal manenê.",
      reuse: 'Metnê Global Voices binê na lîsansî de yeno parvekerdene:', policy: 'Siyasetê şuxulnayîşê çıme biwane', back: 'Agêre kıtabxaneyî',
      articleLanguage: "Bi nê zıwanî biwane",
      kurdish: "Kurdî",
      policyShort: "Siyasetê çıme",
      voaReuse: "VOA şuxulnayîşê xeberanê ke xo virazeno destûr dano. Nuşteyê ajansan û alîyanê bînan na koleksiyon de çin ê.",
    },
    hac: {
      title: 'هەواڵ و کولتوور', kicker: 'پەنجەرەیەک وە جیهانی کوردی', subtitle: 'چیرۆک ژە جیهانی کوردی.',
      intro: "هەواڵی ڕەسەن وە کرمانجی، سۆرانی و ئینگلیزی بخوێنەوە. بەستەری تازە هەر ڕۆ پشکنین کەرێن.",
      skip: 'بڕۆ وە بابەتی', language: 'زمانی ڕووکار', sourcesLink: 'وەبارەی سەرچاوەی', loading: 'کۆمەڵەکە پشکنین کەرێو…',
      stories: 'هەواڵ و بابەت', filters: 'بابەتی وە پێی ناوەڕۆک هەڵبژێرە', count: 'بابەت: {count}', all: 'هەموو بابەتی',
      politics: 'سیاسەت', culture: 'کولتوور', affairs: 'ڕووداو', music: 'مۆسیقا', people: 'کەسایەتی', geography: 'شوێنی',
      checked: 'دوایین پشکنین:', published: 'بەرواری بڵاوکردنەوەی ڕەسەن:', by: 'نووسین:', read: "وە {source} بخوێنەوە", english: 'ئینگلیزی',
      stale: 'زیاتر ژە سێ ڕۆ کۆمەڵەکە وە سەرکەوتوویی نوێ نەکەرێنەوە. بابەتەکانی پێشوو هەر بەردەستن.',
      partial: 'هەندێ پشکنینی سەرچاوەی تەواو نەکەرێن. بابەتەکانی پێشوو هەر بەردەستن.',
      failed: 'سەرچاوەکە پشکنین نەکەرا. بابەتەکانی پێشوو هەر بەردەستن.',
      lastSuccess: 'دوایین پشکنینی سەرکەوتوو:', unavailable: "کۆمەڵەکە بار نەبێ. دواتر هەوڵ بدەرەوە یا سەردانی سەرچاوەی خوارەوە بکە.",
      noStories: 'هێشتا هیچ بابەتێک وە ئەم هەڵبژاردنەدا نیە. بابەتی تازەی ڕێگەپێدراو کە بەردەست بوو زیاد کەرێو.',
      archive: 'ژە ئەرشیفەوە: ئەم بابەتانە بەرواری بڵاوکردنەوەی ڕەسەنی وێش هەڵگرتە.',
      sourceKicker: 'بابەت وە سەرچاوەی وێش بخوێنەوە', sourcesHeading: "دەنگی ڕەسەن. سەرچاوەی ڕوون.",
      sourcesBody: "بابەتی تەواو وە سەرچاوەی وێش بخوێنەوە. ناونیشان، نووسەر و بەرواری بڵاوکردنەوەی ڕەسەن هەڵگیرێن. پۆلەکان وە گەڕانن؛ بۆچوونەکان هی نووسەر و سەرچاوەکانن.",
      sourceLanguage: "وە سەرەوە زمانی بابەتی هەڵبژێرە. ناونیشان و بابەتی وە زمانی ڕەسەنی وێش مانێنەوە.",
      reuse: 'دەقی Global Voices وە ئەم مۆڵەتە بڵاو کەرێوە:', policy: 'سیاسەتی بەکارهێنانەوەی سەرچاوە بخوێنەوە', back: 'گەڕانەوە وە کتێبخانە',
      articleLanguage: "وە ئەم زمانە بخوێنەوە",
      kurdish: "کوردی",
      policyShort: "سیاسەتی سەرچاوە",
      voaReuse: "دەنگی ئەمەریکا ڕێگە وە بەکارهێنانەوەی هەواڵی بەرهەمی وێش داو. بابەتی ئاژانس و لایەنی سێیەم وە ئەم کۆمەڵەدا نیە.",
    },
    sdh: {
      title: 'هەواڵ و فەرهەنگ', kicker: 'پەنجەرەێگ بۆ جیهان کوردی', subtitle: 'چیرۆک لە سەرانسەر جیهان کوردی.',
      intro: "هەواڵ ئەسڵی بە کرمانجی، سۆرانی و ئینگلیسی بخوەنەوە. بەستەرە نووەیل ڕۆژانە پشکنین دەکرێن.",
      skip: 'بڕۆ بۆ بابەتەیل', language: 'زمان ڕووکار', sourcesLink: 'دەربارەی سەرچاوەیل', loading: 'کۆمەڵەکە پشکنین دەکرێ…',
      stories: 'هەواڵ و بابەت', filters: 'بابەتەیل بە پێ ناوەڕۆک هەڵبژێرە', count: 'بابەت: {count}', all: 'هەموو بابەتەیل',
      politics: 'سیاسەت', culture: 'فەرهەنگ', affairs: 'ڕووداوەیل', music: 'مۆسیقا', people: 'کەسایەتی', geography: 'شوێنەیل',
      checked: 'دوایین پشکنین:', published: 'بەروار بڵاوکردنەوەی ئەسڵی:', by: 'نووسین:', read: "لە {source} بخوەنەوە", english: 'ئینگلیسی',
      stale: 'زیاتر لە سێ ڕۆژە کۆمەڵەکە بە سەرکەوتوویی نوو نەکراوەتەوە. بابەتەیل پێشوو هەر بەردەستن.',
      partial: 'هەندێ پشکنین سەرچاوەیل تەواو نەکران. بابەتەیل پێشوو هەر بەردەستن.',
      failed: 'سەرچاوەکە پشکنین نەکرا. بابەتەیل پێشوو هەر بەردەستن.',
      lastSuccess: 'دوایین پشکنین سەرکەوتوو:', unavailable: "کۆمەڵەکە بار نەکرا. دواتر هەوڵ بدەرەوە یا سەردان سەرچاوەیل خوارەوە بکە.",
      noStories: 'هێشتا هیچ بابەتێگ لە ئەم هەڵبژاردنەدا نیە. بابەت نووی ڕێگەپێدراو کە بەردەست بوو زیاد دەکرێ.',
      archive: 'لە ئەرشیفەوە: ئەم بابەتەیلە بەروار بڵاوکردنەوەی ئەسڵی خوەیان پاراستووە.',
      sourceKicker: 'بابەت لە سەرچاوەی خوەی بخوەنەوە', sourcesHeading: "دەنگ ئەسڵی. سەرچاوەی ڕوون.",
      sourcesBody: "بابەتە تەواوەیل لە سەرچاوەی خوەیان بخوەنەوە. ناونیشان، نووسەر و بەروار بڵاوکردنەوەی ئەسڵی دەپارێزرێن. پۆلەیل بۆ گەڕانن؛ بۆچوونەکان هی نووسەرەیل و سەرچاوەیلن.",
      sourceLanguage: "لە سەرەوە زمان بابەتەیل هەڵبژێرە. ناونیشان و بابەتەیل بە زمان ئەسڵی خوەیان دەمێننەوە.",
      reuse: 'دەق Global Voices بە ئەم مۆڵەتە بڵاو دەکرێتەوە:', policy: 'سیاسەت بەکارهێنانەوەی سەرچاوە بخوەنەوە', back: 'گەڕانەوە بۆ کتێوخانە',
      articleLanguage: "بە ئەم زمانە بخوەنەوە",
      kurdish: "کوردی",
      policyShort: "سیاسەت سەرچاوە",
      voaReuse: "دەنگ ئەمەریکا ڕێگە بە بەکارهێنانەوەی هەواڵ بەرهەم خوەی دەدێ. بابەت ئاژانس و لایەن سێیەم لە ئەم کۆمەڵەیەدا نیە.",
    },
  };
  const topics = ['politics', 'culture', 'affairs', 'music', 'people', 'geography'];
  const rtl = new Set(['ckb', 'hac', 'sdh']);
  const localeDates = {en: 'en-GB', kmr: 'ku', ckb: 'ckb', diq: 'en-GB', hac: 'ckb', sdh: 'ckb'};
  const sources = {
    'global-voices': {name: 'Global Voices', host: 'globalvoices.org', language: 'en', policy: 'https://creativecommons.org/licenses/by/3.0/'},
    'voa-kmr': {name: 'Dengê Amerîka · VOA', host: 'www.dengeamerika.com', language: 'kmr', policy: 'https://www.voanews.com/p/5338.html'},
    'voa-ckb': {name: 'دەنگی ئەمەریکا · VOA', host: 'www.dengiamerika.com', language: 'ckb', policy: 'https://www.voanews.com/p/5338.html'},
  };
  const articleLanguages = ['kurdish', 'kmr', 'ckb', 'en'];
  const languageNames = {kmr: 'Kurmancî', ckb: 'سۆرانی', en: 'English'};
  const $ = selector => document.querySelector(selector);
  const storedLocale = () => { try { return localStorage.getItem('kdl_locale'); } catch { return null; } };
  const pickLocale = () => [new URL(location.href).searchParams.get('lang'), storedLocale(), 'en'].find(code => Object.hasOwn(translations, code));
  let locale = pickLocale();
  const pickArticleLanguage = () => {
    const requested = new URL(location.href).searchParams.get('articles');
    return articleLanguages.includes(requested) ? requested : ['kmr', 'ckb'].includes(locale) ? locale : 'kurdish';
  };
  let selectedLanguage = pickArticleLanguage();
  let selectedTopic = 'all';
  let collections = [];
  let items = [];
  let loaded = false;
  const t = key => translations[locale][key] || translations.en[key] || key;
  const matchesLanguage = language => selectedLanguage === 'kurdish' ? ['kmr', 'ckb'].includes(language) : language === selectedLanguage;
  const selectedItems = () => items.filter(item => matchesLanguage(item.language));
  const selectedCollections = () => collections.filter(data => data.sources.some(source => matchesLanguage(sources[source.id].language)));

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function validDate(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
  function timeNode(value, includeTime = false) {
    const options = {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'};
    if (includeTime) Object.assign(options, {hour: '2-digit', minute: '2-digit', timeZoneName: 'short'});
    const node = element('time', '', new Intl.DateTimeFormat(localeDates[locale], options).format(new Date(value)));
    node.dateTime = value;
    return node;
  }
  function safeOriginal(value, sourceId) {
    if (typeof value !== 'string' || !Object.hasOwn(sources, sourceId)) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.hostname !== sources[sourceId].host || url.username || url.password || url.port) return null;
      const pattern = sourceId === 'global-voices' ? /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/ : /^\/a\/(?:[^/]+\/)?\d+\.html$/;
      if (!pattern.test(url.pathname)) return null;
      url.hash = ''; url.search = '';
      return url.href;
    } catch { return null; }
  }
  function cleanItems(input) {
    const seen = new Set();
    return input.filter(item => {
      const url = safeOriginal(item?.url, item?.sourceId);
      if (!url || item.language !== sources[item.sourceId].language || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 600 || typeof item.author !== 'string' || !item.author.trim() || !validDate(item.publishedAt)) return false;
      const id = item.sourceId === 'global-voices' ? url : item.sourceId + url.match(/\/(\d+)\.html$/)[1];
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).map(item => ({
      url: safeOriginal(item.url, item.sourceId), title: item.title.trim(), author: item.author.trim(), publishedAt: item.publishedAt,
      sourceId: item.sourceId, language: item.language,
      topics: [...new Set((Array.isArray(item.topics) ? item.topics : []).filter(topic => topics.includes(topic)))],
    })).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }
  function renderLanguageChoices() {
    const fragment = document.createDocumentFragment();
    for (const code of articleLanguages) {
      const button = element('button', '', code === 'kurdish' ? t('kurdish') : languageNames[code]);
      button.type = 'button'; button.dataset.articleLanguage = code;
      if (code !== 'kurdish') { button.lang = code; button.dir = code === 'ckb' ? 'rtl' : 'ltr'; }
      button.setAttribute('aria-pressed', String(selectedLanguage === code));
      button.setAttribute('aria-controls', 'newsList');
      button.addEventListener('click', () => {
        selectedLanguage = code; selectedTopic = 'all';
        const url = new URL(location.href);
        url.searchParams.set('articles', code);
        history.replaceState({}, '', url);
        $('#newsArticleLanguages').querySelectorAll('button').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.articleLanguage === code)));
        renderFilters(); renderCards(); renderStatus();
      });
      fragment.append(button);
    }
    $('#newsArticleLanguages').replaceChildren(fragment);
  }
  function renderFilters() {
    const subset = selectedItems();
    const available = ['all', ...topics.filter(topic => subset.some(item => item.topics.includes(topic)))];
    if (!available.includes(selectedTopic)) selectedTopic = 'all';
    const fragment = document.createDocumentFragment();
    for (const topic of subset.length ? available : []) {
      const button = element('button', '', t(topic));
      button.type = 'button'; button.dataset.topic = topic;
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
    const visible = selectedItems().filter(item => selectedTopic === 'all' || item.topics.includes(selectedTopic));
    const fragment = document.createDocumentFragment();
    visible.forEach((item, index) => {
      const source = sources[item.sourceId];
      const card = element('article', 'news-card');
      const meta = element('div', 'news-card-top');
      const number = element('span', 'news-number', String(index + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      const language = element('span', 'news-card-language', languageNames[item.language]);
      language.lang = item.language; language.dir = item.language === 'ckb' ? 'rtl' : 'ltr';
      meta.append(number, element('span', 'news-card-topic', item.topics.map(t).join(' · ')), language);
      const heading = element('h3'); heading.lang = item.language; heading.dir = item.language === 'ckb' ? 'rtl' : 'ltr';
      const titleLink = element('a', '', item.title); titleLink.href = item.url; heading.append(titleLink);
      const byline = element('p', 'news-byline', t('by') + ' ');
      const author = element('bdi', '', item.author); author.lang = item.language;
      const credit = element('bdi', '', source.name); credit.lang = item.language;
      byline.append(author, document.createTextNode(' · '), credit);
      const published = element('p', 'news-published', t('published') + ' ');
      published.append(timeNode(item.publishedAt));
      const actions = element('div', 'news-card-actions');
      const read = element('a', 'news-original'); read.href = item.url;
      const [before, after] = t('read').split('{source}');
      read.append(document.createTextNode(before), element('bdi', '', source.name), document.createTextNode(after + ' '));
      const arrow = element('span', '', '↗'); arrow.setAttribute('aria-hidden', 'true'); read.append(arrow);
      const license = element('a', 'news-card-license', item.sourceId === 'global-voices' ? 'CC BY 3.0' : t('policyShort'));
      license.href = source.policy;
      if (item.sourceId === 'global-voices') { license.lang = 'en'; license.dir = 'ltr'; }
      actions.append(read, license); card.append(meta, heading, byline, published, actions); fragment.append(card);
    });
    $('#newsList').replaceChildren(fragment);
    const available = selectedCollections().length > 0;
    $('#newsCount').textContent = loaded && available ? t('count').replace('{count}', String(visible.length)) : '';
    $('#newsEmpty').hidden = visible.length > 0 || !loaded || !available;
    $('#newsEmpty').textContent = t('noStories');
    $('#newsArchive').hidden = !visible.length || Date.now() - Date.parse(visible[0].publishedAt) <= 90 * 86400000;
  }
  function renderStatus() {
    const updated = $('#newsUpdated'), notice = $('#newsNotice');
    updated.replaceChildren(); notice.replaceChildren(); notice.hidden = true;
    if (!loaded) { updated.textContent = t('loading'); return; }
    const selected = selectedCollections();
    if (!selected.length) { updated.textContent = t('unavailable'); return; }
    const checks = selected.map(data => data.checkedAt).sort();
    updated.append(document.createTextNode(t('checked') + ' '), timeNode(checks[0], true));
    const statuses = selected.flatMap(data => data.sources.filter(source => matchesLanguage(sources[source.id].language)).map(source => ({...source, lastSuccessfulCheck: source.lastSuccessfulCheck ?? data.lastSuccessfulCheck})));
    const lastSuccess = statuses.map(source => source.lastSuccessfulCheck).filter(validDate).sort()[0];
    const hasError = statuses.some(source => source.status === 'error');
    const hasPartial = statuses.some(source => source.status === 'partial');
    const stale = statuses.some(source => !validDate(source.lastSuccessfulCheck) || Date.now() - Date.parse(source.lastSuccessfulCheck) > 72 * 3600000);
    const message = hasError ? t('failed') : hasPartial ? t('partial') : stale ? t('stale') : '';
    if (message) {
      notice.hidden = false; notice.append(document.createTextNode(message));
      if (validDate(lastSuccess)) notice.append(document.createTextNode(' ' + t('lastSuccess') + ' '), timeNode(lastSuccess, true));
    }
  }
  function applyLocale() {
    document.documentElement.lang = locale; document.documentElement.dir = rtl.has(locale) ? 'rtl' : 'ltr';
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
    renderLanguageChoices(); renderFilters(); renderCards(); renderStatus();
  }
  $('#newsLanguage').addEventListener('change', event => {
    if (!Object.hasOwn(translations, event.target.value)) return;
    locale = event.target.value;
    try { localStorage.setItem('kdl_locale', locale); } catch { /* Works without storage. */ }
    const url = new URL(location.href);
    if (locale === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', locale);
    history.replaceState({}, '', url);
    selectedLanguage = pickArticleLanguage(); applyLocale();
  });
  window.addEventListener('popstate', () => { locale = pickLocale(); selectedLanguage = pickArticleLanguage(); applyLocale(); });
  applyLocale();
  async function load() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const entries = [
      {url: '../data/news.json', ids: ['global-voices']},
      {url: '../data/kurdish-news.json', ids: ['voa-kmr', 'voa-ckb']},
    ];
    const results = await Promise.allSettled(entries.map(async ({url, ids}) => {
      const response = await fetch(url, {cache: 'no-cache', signal: controller.signal});
      if (!response.ok) throw new Error('Collection unavailable');
      const data = await response.json();
      if (data?.schemaVersion !== 1 || !validDate(data.checkedAt) || !Array.isArray(data.items) || !Array.isArray(data.sources) || data.sources.length !== ids.length || !ids.every(id => data.sources.some(source => source?.id === id && ['ok', 'partial', 'error'].includes(source.status)))) throw new Error('Invalid collection');
      return {...data, items: data.items.filter(item => ids.includes(item?.sourceId))};
    }));
    clearTimeout(timeout);
    collections = results.filter(result => result.status === 'fulfilled').map(result => result.value);
    items = cleanItems(collections.flatMap(data => data.items)); loaded = true;
    $('#newsList').setAttribute('aria-busy', 'false'); applyLocale();
  }
  load();
})();
