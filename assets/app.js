/* Catalogue UI; records load from assets/catalogue-data.js. */
const LOCALES = {
  en: {label:'English', native:'English', dir:'ltr', navAuthors:'Authors', navPreservation:'Preservation', navAbout:'About', brandSub:'Open books across Kurdish languages and scripts', eyebrow:'Open books across Kurdish languages and scripts', headline:'Find your next book', intro:'Browse verified public-domain and open-access works. Every title includes its source and reuse status.', glance:'THE COLLECTION AT A GLANCE', openBooks:'core titles', kurdishVarieties:'Kurdish varieties', displayLanguages:'display languages', rightsChecked:'Rights checked', suggest:'Suggest a book', catalogue:'Catalogue', searchCatalogue:'Search library', searchPlaceholder:'Search titles, authors, stories, languages, or sources', bookLanguage:'Book language', subject:'Subject', sortBooks:'Sort books', allVarieties:'All varieties', allSubjects:'All subjects', allScripts:'All scripts', allFormats:'All formats', allAvailability:'All availability', poetry:'Poetry & classics', reference:'Language & reference', religious:'Religious literature', education:'Education & lexicography', folklore:'Folklore & narrative', sortCatalogue:'Catalogue order', sortTitle:'Title A–Z', sortAuthor:'Author A–Z', sortOldest:'Oldest first', sortNewest:'Newest first', sortRecent:'Recently added', moreFilters:'More filters', fewerFilters:'Fewer filters', clearFilters:'Clear filters', script:'Script', format:'Format', availability:'Availability', latin:'Latin', arabic:'Arabic-based', mixed:'Mixed scripts', wiki:'Wikisource text', pdf:'PDF scan', full:'Full text / scan', partial:'Partial work', catalogueNote:'Core catalogue first; story shelves below. Search checks both.', verifiedTitles:'verified titles', libraryMatches:'library matches', readOnline:'Read online', readAvailable:'Read available section', openPdf:'Read PDF', downloadPdf:'Download PDF', details:'Details', source:'Source', publicDomain:'Public domain', regionalPD:'Public domain / jurisdiction note', rightsReview:'Reuse needs jurisdiction check', partialBadge:'Available section', noResults:'No matching books', noResultsHelp:'Try removing a filter or searching a different spelling.', backCatalogue:'Back to catalogue', description:'Description', languageVariety:'Language variety', bookScript:'Script', publicationDate:'Publication / composition date', readingFormats:'Reading & download formats', sourceInstitution:'Source institution', rightsReuse:'Copyright & reuse', rightsCheckedDate:'Source / rights last checked', shareLink:'Shareable link', copyLink:'Copy link', copied:'Copied', chooseLanguage:'Choose the language you want to browse', languageHelp:'You can change this at any time. Right-to-left scripts are supported throughout the library.', suggestTitle:'Suggest a public-domain Kurdish work', suggestHelp:'Suggestions are reviewed before anything is added. Submitting a form never publishes a book automatically.', formTitle:'Book or work title', formAuthor:'Author', formVariety:'Kurdish variety', formSource:'Exact source URL', formRights:'Rights or public-domain evidence URL', formEmail:'Your email (optional)', formNotes:'Notes', netlifyNote:'This moderated form is ready for Netlify Forms. If you host elsewhere, connect it to your preferred form service.', submitSuggestion:'Submit suggestion', closeReader:'Library', readingWidth:'Width', openOriginal:'Open original source', previousSection:'Previous section', nextSection:'Next section', loading:'Loading…', readerFailed:'The in-site reader could not load this source.', readerFallback:'Open the original source instead.', pdfFallback:'If the PDF does not appear below, open it full screen or download it directly.', openFullScreen:'Open full screen', partialNotice:'This catalogue record points to an available section rather than a complete edition.', footer:'Open access · Clear sources · Every Kurdish variety welcome', rights_pd_old:'The underlying historical work is in the public domain because the author died more than 100 years ago. The Wikisource transcription is reusable under CC BY-SA; check the source page for attribution terms.', rights_pd_old_scan:'The underlying historical work is in the public domain because the author died more than 100 years ago. Check the source for terms applying to this scan.', rights_pd_us:'The source identifies this pre-1931 scan as public domain in the United States. Copyright can differ by country, so reuse outside the U.S. should be checked locally.', rights_pd_commons:'The source file is marked public domain / free of known copyright restrictions by Wikimedia Commons or the source archive.', rights_pd_iraq:'Wikisource labels this work as public domain in Iraq. Reuse elsewhere may depend on the law of the country where you are using it.', rights_1932:'This 1932 historical scan is provided for reading and research. Its reuse status can vary by jurisdiction, so the library does not label the downloadable scan as universally public domain.', rights_historical:'The historical authors are out of copyright; the Wikisource transcription remains available under CC BY-SA.', rights_wiki_pd:'The historical work is public domain; Wikisource text is available under CC BY-SA.', authorizedShare:'Sharing permitted', rights_authorized_share:'The source states that the copyright holder has authorized sharing of this file. This is not the same as public domain; reuse beyond the source\'s stated permission may require separate permission.', rights_zazaki1899:'The 1899 historical work is public domain; the Wikisource transcription is available under CC BY-SA.'},
  kmr: {label:'Kurmancî', native:'Kurmancî', dir:'ltr', navAuthors:'Nivîskar', navPreservation:'Parastin', navAbout:'Derbarê', brandSub:'Pirtûkên vekirî di nav ziman û nivîsên kurdî de', eyebrow:'Pirtûkên vekirî di nav ziman û nivîsên kurdî de', headline:'Pirtûka xwe ya din bibîne', intro:'Berhemên milkê giştî û gihîştina vekirî yên hatine kontrolkirin bigere. Her sernav çavkanî û rewşa bikaranînê nîşan dide.', glance:'KURTEYA KOLEKSİYONÊ', openBooks:'sernavên bingehîn', kurdishVarieties:'cureyên kurdî', displayLanguages:'zimanên pêşandanê', rightsChecked:'Maf hatin kontrolkirin', suggest:'Pirtûkek pêşniyar bike', catalogue:'Katalog', searchCatalogue:'Di pirtûkxaneyê de bigere', searchPlaceholder:'Sernav, nivîskar, çîrok, ziman an çavkanî bigere', bookLanguage:'Zimanê pirtûkê', subject:'Mijar', sortBooks:'Pirtûkan rêz bike', allVarieties:'Hemû cure', allSubjects:'Hemû mijar', allScripts:'Hemû nivîs', allFormats:'Hemû format', allAvailability:'Hemû gihîştin', poetry:'Helbest & klasîk', reference:'Ziman & çavkanî', religious:'Edebiyata olî', education:'Perwerde & ferheng', folklore:'Folklor & çîrok', sortCatalogue:'Rêza katalogê', sortTitle:'Sernav A–Z', sortAuthor:'Nivîskar A–Z', sortOldest:'Kevintir pêşî', sortNewest:'Nûtir pêşî', sortRecent:'Nû hatine zêdekirin', moreFilters:'Parzûnên din', fewerFilters:'Parzûn kêm bike', clearFilters:'Parzûnan paqij bike', script:'Nivîs', format:'Format', availability:'Gihîştin', latin:'Latînî', arabic:'Bingeh-erebî', mixed:'Nivîsên tevlihev', wiki:'Teksta Wîkîçavkaniyê', pdf:'Skan PDF', full:'Teksta / skana tevahî', partial:'Berhema qismî', catalogueNote:'Kataloga bingehîn li pêş e; refên çîrokan li jêr in. Gerdûn li her duyan digere.', verifiedTitles:'sernavên kontrolkirî', libraryMatches:'encam li pirtûkxaneyê', readOnline:'Serhêl bixwîne', readAvailable:'Beşa berdest bixwîne', openPdf:'PDF bixwîne', downloadPdf:'PDF daxîne', details:'Agahî', source:'Çavkanî', publicDomain:'Milkê giştî', regionalPD:'Milkê giştî / têbîniya herêmî', rightsReview:'Bikaranîn divê herêmî were kontrolkirin', partialBadge:'Beşa berdest', noResults:'Pirtûk nehat dîtin', noResultsHelp:'Parzûnek rake an bi rastnivîsek din bigere.', backCatalogue:'Vegere katalogê', description:'Ravekirin', languageVariety:'Cureya zimanî', bookScript:'Nivîs', publicationDate:'Dema weşan / nivîsînê', readingFormats:'Formatên xwendin û daxistinê', sourceInstitution:'Saziya çavkaniyê', rightsReuse:'Maf û bikaranîn', rightsCheckedDate:'Dema dawî ya kontrola çavkanî / mafan', shareLink:'Girêdana parvekirinê', copyLink:'Girêdanê kopî bike', copied:'Hat kopîkirin', chooseLanguage:'Zimanê ku dixwazî pê bigerî hilbijêre', languageHelp:'Tu dikarî her dem biguherînî. Nivîsên ji rastê ber bi çepê di tevahiya pirtûkxaneyê de tên piştgirîkirin.', suggestTitle:'Berhemeke kurdî ya milkê giştî pêşniyar bike', suggestHelp:'Pêşniyar berî zêdekirinê tên kontrolkirin. Şandin tu berhemê bixwe naxe ser malperê.', formTitle:'Navê pirtûkê an berhemê', formAuthor:'Nivîskar', formVariety:'Cureya kurdî', formSource:'Girêdana tam a çavkaniyê', formRights:'Girêdana delîla mafan / milkê giştî', formEmail:'E-nameya te (ne mecbûrî)', formNotes:'Têbînî', netlifyNote:'Ev forma kontrolkirî ji bo Netlify Forms amade ye. Heke li cîhek din mêvandarî bikî, wê bi servîsa forma xwe ve girêde.', submitSuggestion:'Pêşniyarê bişîne', closeReader:'Pirtûkxane', readingWidth:'Firehî', openOriginal:'Çavkaniya orîjînal veke', previousSection:'Beşa berê', nextSection:'Beşa din', loading:'Tê barkirin…', readerFailed:'Xwendevana nav malperê nikarîbû vê çavkaniyê bar bike.', readerFallback:'Li şûna wê çavkaniya orîjînal veke.', pdfFallback:'Heke PDF li jêr xuya neke, wê tam ekran veke an rasterast daxîne.', openFullScreen:'Tam ekran veke', partialNotice:'Ev tomara katalogê beşeke berdest nîşan dide, ne çapeke tevahî.', footer:'Gihîştina vekirî · Çavkaniyên zelal · Hemû cureyên kurdî bi xêr hatin', rights_pd_old:'Berhema dîrokî milkê giştî ye ji ber ku nivîskar zêdetirî 100 sal in mirî ye. Transkrîpsiyona Wîkîçavkaniyê bi CC BY-SA tê parvekirin; şertên navdêrkirinê li çavkaniyê bibîne.', rights_pd_old_scan:'Berhema dîrokî milkê giştî ye ji ber ku nivîskar zêdetirî 100 sal in mirî ye. Ji bo şertên vê skanê li çavkaniyê binêre.', rights_pd_us:'Çavkanî vê skana berî 1931ê wek milkê giştî li Dewletên Yekbûyî nîşan dide. Maf ji welatekî bo welatekî diguhere.', rights_pd_commons:'Dosyaya çavkaniyê li Wikimedia Commons an arşîva çavkaniyê wek milkê giştî / bê sînorkirinên naskirî hatiye nîşankirin.', rights_pd_iraq:'Wîkîçavkanî vê berhemê li Iraqê wek milkê giştî nîşan dide. Li welatên din dibe ku şert cuda bin.', rights_1932:'Ev skana dîrokî ya 1932an ji bo xwendin û lêkolînê tê dayîn. Rewşa dubare-bikaranînê dibe ku li gorî welat biguhere.', rights_historical:'Nivîskarên dîrokî êdî di bin mafê nivîskarî de nînin; teksta Wîkîçavkaniyê bi CC BY-SA tê dayîn.', rights_wiki_pd:'Berhema dîrokî milkê giştî ye; teksta Wîkîçavkaniyê bi CC BY-SA tê dayîn.', authorizedShare:'Parvekirin destûrdayî ye', rights_authorized_share:'Çavkanî dibêje xwediyê mafê telîfê destûr daye ku ev dosya were parvekirin. Ev ne wek milkê giştî ye; bikaranîna derveyî destûra ku çavkanî dibêje dibe ku destûra din bixwaze.', rights_zazaki1899:'Berhema dîrokî ya 1899an milkê giştî ye; teksta Wîkîçavkaniyê bi CC BY-SA tê dayîn.'},
  ckb: {label:'سۆرانی', native:'سۆرانی', dir:'rtl', navAuthors:'نووسەران', navPreservation:'پاراستن', navAbout:'دەربارە', brandSub:'کتێبی کراوە لە زمان و نووسینە جیاوازەکانی کوردی', eyebrow:'کتێبی کراوە لە زمان و نووسینە جیاوازەکانی کوردی', headline:'کتێبی داهاتووت بدۆزەوە', intro:'لە بەرهەمە مڵکی گشتی و دەستگەیشتنە کراوە پشکنراوەکان بگەڕێ. هەر ناونیشانێک سەرچاوە و دۆخی دووبارە بەکارهێنان پیشان دەدات.', glance:'کۆمەڵەکە لە یەک نیگادا', openBooks:'ناونیشانی سەرەکی', kurdishVarieties:'جۆری کوردی', displayLanguages:'زمانی پیشاندان', rightsChecked:'مافەکان پشکنراون', suggest:'پێشنیاری کتێب', catalogue:'کاتەلۆگ', searchCatalogue:'گەڕان لە کتێبخانە', searchPlaceholder:'ناونیشان، نووسەر، چیرۆک، زمان یان سەرچاوە بگەڕێ', bookLanguage:'زمانی کتێب', subject:'بابەت', sortBooks:'ڕیزکردنی کتێب', allVarieties:'هەموو جۆرەکان', allSubjects:'هەموو بابەتەکان', allScripts:'هەموو نووسینەکان', allFormats:'هەموو فۆرماتەکان', allAvailability:'هەموو بەردەستییەکان', poetry:'شیعر و کلاسیک', reference:'زمان و سەرچاوە', religious:'ئەدەبی دینی', education:'پەروەردە و فەرهەنگ', folklore:'فۆلکلۆر و چیرۆک', sortCatalogue:'ڕیزی کاتەلۆگ', sortTitle:'ناونیشان A–Z', sortAuthor:'نووسەر A–Z', sortOldest:'کۆنترین یەکەم', sortNewest:'نوێترین یەکەم', sortRecent:'تازە زیادکراو', moreFilters:'پاڵێوەری زیاتر', fewerFilters:'پاڵێوەر کەم بکەوە', clearFilters:'پاککردنەوەی پاڵێوەرەکان', script:'نووسین', format:'فۆرمات', availability:'بەردەستی', latin:'لاتینی', arabic:'بنەمای عەرەبی', mixed:'نووسینی تێکەڵ', wiki:'دەقی ویکی‌سەرچاوە', pdf:'سکانی PDF', full:'دەق / سکانی تەواو', partial:'بەشی بەردەست', catalogueNote:'کاتەلۆگی سەرەکی لە پێشە؛ ڕەفەکانی چیرۆک لە خوارەوەن. گەڕان هەردووکیان دەگرێتەوە.', verifiedTitles:'ناونیشانی پشکنراو', libraryMatches:'ئەنجامی گەڕان لە کتێبخانە', readOnline:'لە ئۆنلاین بخوێنەوە', readAvailable:'بەشی بەردەست بخوێنەوە', openPdf:'PDF بخوێنەوە', downloadPdf:'PDF دابگرە', details:'وردەکاری', source:'سەرچاوە', publicDomain:'مڵکی گشتی', regionalPD:'مڵکی گشتی / تێبینی ناوچەیی', rightsReview:'دووبارە بەکارهێنان پێویستی بە پشکنینی یاسایی هەیە', partialBadge:'بەشی بەردەست', noResults:'هیچ کتێبێک نەدۆزرایەوە', noResultsHelp:'پاڵێوەرێک لابە یان بە شێوەیەکی دیکە بگەڕێ.', backCatalogue:'گەڕانەوە بۆ کاتەلۆگ', description:'وەسف', languageVariety:'جۆری زمان', bookScript:'نووسین', publicationDate:'بەرواری بڵاوکردنەوە / نووسین', readingFormats:'فۆرماتی خوێندنەوە و داگرتن', sourceInstitution:'دامەزراوەی سەرچاوە', rightsReuse:'ماف و دووبارە بەکارهێنان', rightsCheckedDate:'دوایین پشکنینی سەرچاوە / ماف', shareLink:'بەستەری هاوبەشکردن', copyLink:'کۆپی بەستەر', copied:'کۆپی کرا', chooseLanguage:'زمانی گەڕان هەڵبژێرە', languageHelp:'هەر کات دەتوانیت بگۆڕیت. نووسینی ڕاست بۆ چەپ لە تەواوی کتێبخانەکەدا پشتگیری دەکرێت.', suggestTitle:'پێشنیاری بەرهەمێکی کوردی مڵکی گشتی بکە', suggestHelp:'پێشنیارەکان پێش زیادکردن پشکنین دەکرێن. ناردنی فۆرم هیچ بەرهەمێک خۆکار بڵاوناکاتەوە.', formTitle:'ناوی کتێب یان بەرهەم', formAuthor:'نووسەر', formVariety:'جۆری کوردی', formSource:'بەستەری ڕاستەوخۆی سەرچاوە', formRights:'بەستەری بەڵگەی ماف / مڵکی گشتی', formEmail:'ئیمەیڵی تۆ (ئارەزوومەندانە)', formNotes:'تێبینی', netlifyNote:'ئەم فۆرمە پشکنراوە بۆ Netlify Forms ئامادەیە. ئەگەر شوێنێکی تر میوانداری بکەیت، بە خزمەتگوزاری فۆرمی خۆت پەیوەستی بکە.', submitSuggestion:'ناردنی پێشنیار', closeReader:'کتێبخانە', readingWidth:'پانی', openOriginal:'سەرچاوەی ڕەسەن بکەرەوە', previousSection:'بەشی پێشوو', nextSection:'بەشی دواتر', loading:'بارکردن…', readerFailed:'خوێنەرەوەی ناو ماڵپەڕ نەیتوانی ئەم سەرچاوەیە بار بکات.', readerFallback:'لە جیاتی ئەوە سەرچاوەی ڕەسەن بکەرەوە.', pdfFallback:'ئەگەر PDF لە خوارەوە دەرنەکەوت، بە شاشەی تەواو بیکەرەوە یان ڕاستەوخۆ دایبگرە.', openFullScreen:'شاشەی تەواو', partialNotice:'ئەم تۆماری کاتەلۆگە بەشێکی بەردەست نیشان دەدات، نە چاپێکی تەواو.', footer:'دەستگەیشتنی کراوە · سەرچاوەی ڕوون · هەموو جۆرە کوردییەکان بەخێربێن', rights_pd_old:'بەرهەمە مێژووییەکە مڵکی گشتییە چونکە نووسەر زیاتر لە ١٠٠ ساڵە کۆچی دوایی کردووە. دەقی ویکی‌سەرچاوە بە CC BY-SA بەردەستە.', rights_pd_old_scan:'بەرهەمە مێژووییەکە مڵکی گشتییە چونکە نووسەر زیاتر لە ١٠٠ ساڵە کۆچی دوایی کردووە. بۆ مەرجەکانی ئەم سکانە سەرچاوەکە ببینە.', rights_pd_us:'سەرچاوەکە ئەم سکانی پێش ١٩٣١ە لە ئەمریکا وەک مڵکی گشتی نیشان دەدات. لە وڵاتانی دیکە دۆخی ماف دەتوانێت جیاواز بێت.', rights_pd_commons:'فایلی سەرچاوە لە Wikimedia Commons یان ئەرشیفەکە وەک مڵکی گشتی / بێ سنوورداری ناسراو نیشان کراوە.', rights_pd_iraq:'ویکی‌سەرچاوە ئەم بەرهەمە لە عێراق وەک مڵکی گشتی نیشان دەدات؛ لە شوێنی دیکە یاسا دەتوانێت جیاواز بێت.', rights_1932:'ئەم سکانی مێژووییەی ١٩٣٢ بۆ خوێندنەوە و توێژینەوە پێشکەش دەکرێت. دۆخی دووبارە بەکارهێنان لە وڵاتێک بۆ وڵاتێکی تر جیاوازە.', rights_historical:'نووسەرە مێژووییەکان لە مافی نووسەر دەرچوون؛ دەقی ویکی‌سەرچاوە بە CC BY-SA بەردەستە.', rights_wiki_pd:'بەرهەمە مێژووییەکە مڵکی گشتییە؛ دەقی ویکی‌سەرچاوە بە CC BY-SA بەردەستە.', authorizedShare:'ڕێگە بە هاوبەشکردن دراوە', rights_authorized_share:'سەرچاوەکە دەڵێت خاوەنی مافی لەبەرگرتنەوە ڕێگەی بە هاوبەشکردنی ئەم فایلە داوە. ئەمە بە مانای مڵکی گشتی نییە؛ بەکارهێنانی زیاتر لەو ڕێگەپێدانەی سەرچاوەکە دەڵێت لەوانەیە پێویستی بە مۆڵەتی جیاواز هەبێت.', rights_zazaki1899:'بەرهەمە مێژووییەکەی ١٨٩٩ مڵکی گشتییە؛ دەقی ویکی‌سەرچاوە بە CC BY-SA بەردەستە.'},
  diq: {label:'Zazakî', native:'Zazakî / Kirmanckî', dir:'ltr', navAuthors:'Nuştoxî', navPreservation:'Arşîvkerdış', navAbout:'Derheq', brandSub:'Kıtabê akerdey Kurdî zıwan û herfanê cı bi cıyan de', eyebrow:'Kıtabê akerdey Kurdî zıwan û herfanê cı bi cıyan de', headline:'Kıtabê xo yê bıdım bıvêne', intro:'Xebatanê milkê umumi û akerdeyê kontrolkerdeyan de cı geyrê. Her sername çıme û rewşa heqan nışan dano.', glance:'KOLEKSİYON YO KILM', openBooks:'sernameyê bingeyî', kurdishVarieties:'varyantê Kurdî', displayLanguages:'zıwanê ramanışi', rightsChecked:'Heq kontrol biyi', suggest:'Kıtab pêşniyar ke', catalogue:'Katalog', searchCatalogue:'Kıtabxane de cı geyrê', searchPlaceholder:'Sername, nuskar, çîrok, zıwan ya zi çıme cı geyrê', bookLanguage:'Zıwanê kıtabi', subject:'Babete', sortBooks:'Kıtaban rêz ke', allVarieties:'Pêro varyanti', allSubjects:'Pêro babeti', allScripts:'Pêro herfi', allFormats:'Pêro formati', allAvailability:'Pêro berdestî', poetry:'Şiir û klasiki', reference:'Zıwan û referans', religious:'Edebiyatê dînî', education:'Perwerde û ferheng', folklore:'Folklor û vate', sortCatalogue:'Rêza katalogi', sortTitle:'Sername A–Z', sortAuthor:'Nuskar A–Z', sortOldest:'Kehanî verê', sortNewest:'Newî verê', sortRecent:'Newey zêde biyi', moreFilters:'Parzûnê bini', fewerFilters:'Parzûn kêm ke', clearFilters:'Parzûnan pak ke', script:'Herf', format:'Format', availability:'Berdestî', latin:'Latînî', arabic:'Erebî esas', mixed:'Herfê têkil', wiki:'Nuşteyê Wikiçıme', pdf:'Skanê PDF', full:'Nuşte / skanê pêro', partial:'Parçeyê berdest', catalogueNote:'Katalogê bingeyî ver de yo; rafê çîrokan cêr de yê. Geyrayış her di de cı geyreno.', verifiedTitles:'sernameyê kontrolkerde', libraryMatches:'encamê kıtabxaneyî', readOnline:'Online bıwane', readAvailable:'Parçeyê berdest bıwane', openPdf:'PDF bıwane', downloadPdf:'PDF ronê', details:'Detay', source:'Çıme', publicDomain:'Milkê umumi', regionalPD:'Milkê umumi / notê herêmî', rightsReview:'Bıkarnayış lazımo goreyê welat kontrol bibo', partialBadge:'Parçeyê berdest', noResults:'Kıtab nêvineya', noResultsHelp:'Parzûnek bıerze ya zi nuşteyê bini cı geyrê.', backCatalogue:'Katalog ra peyser', description:'Şınasnayış', languageVariety:'Varyantê zıwani', bookScript:'Herf', publicationDate:'Tarixê weşan / nuştışi', readingFormats:'Formatê wanayış û ronayışi', sourceInstitution:'Enstituya çıme', rightsReuse:'Heq û reyna bıkarnayış', rightsCheckedDate:'Tarixê peyên ê kontrolê çıme / heqan', shareLink:'Linkê parvekerdışi', copyLink:'Link kopya ke', copied:'Kopya biyo', chooseLanguage:'Zıwanê ke şıma raştîyê de cı geyrê weçîne', languageHelp:'Şıma her wext eşkenê bıvurnê. Herfê rast ra çep pêro kıtabxane de piştgirî benê.', suggestTitle:'Xebatê Kurdî yê milkê umumi pêşniyar ke', suggestHelp:'Pêşniyari verê zêdekerdışi kontrol benê. Form şandış tu xebat xo ra nêweşaneno.', formTitle:'Nameyê kıtabi ya xebati', formAuthor:'Nuskar', formVariety:'Varyantê Kurdî', formSource:'URLê rast ê çıme', formRights:'URLê delîlê heqan / milkê umumi', formEmail:'E-mailê to (opsiyonel)', formNotes:'Noti', netlifyNote:'Na forma moderasyonî qandê Netlify Forms amade ya. Heke hostê bini de bıdê, bi servîsê formê xo ra girê de.', submitSuggestion:'Pêşniyar bışe', closeReader:'Kıtabxane', readingWidth:'Herayî', openOriginal:'Çımeyê orijînal akerê', previousSection:'Parçeyê verên', nextSection:'Parçeyê bıdım', loading:'Bar beno…', readerFailed:'Wanoxê malperî nêeşkeno na çıme bar kero.', readerFallback:'Çımeyê orijînal akerê.', pdfFallback:'Heke PDF cêr de nêaseno, tam ekran akerê ya zi rast ronê.', openFullScreen:'Tam ekran', partialNotice:'Na tomara katalogi tenê parçeyê berdest nışan dano, çapê pêro nêyo.', footer:'Gıştî ra akerde · Çıme yo aşkere · Pêro varyantê Kurdî xeyr ameyê', rights_pd_old:'Xebatê tarixî milkê umumi de yo çımkî nuskar ra 100 serre ra zêde vefat kerdo. Nuşteyê Wikiçıme CC BY-SA de yo.', rights_pd_old_scan:'Xebatê tarixî milkê umumi de yo çımkî nuskar ra 100 serre ra zêde vefat kerdo. Şertê na skanî rê çıme bıvêne.', rights_pd_us:'Çıme na skanê verê 1931î Amerîka de milkê umumi nışan dano. Welatanê bini de heq eşkenê cı bê cı bo.', rights_pd_commons:'Dosyaya çıme Wikimedia Commons ya zi arşîv de milkê umumi / bê sînorkerdişê zanaye nışan bıya.', rights_pd_iraq:'Wikiçıme na xebat Iraq de milkê umumi nışan dano; welatanê bini de qanun eşkeno cı bê cı bo.', rights_1932:'Na skanê tarixî yê 1932 qandê wanayış û cigêrayışi yo. Rewşa reyna bıkarnayış goreyê welat eşkena bıvurna.', rights_historical:'Nuskarê tarixî êdî telîf de nîyê; nuşteyê Wikiçıme CC BY-SA de yo.', rights_wiki_pd:'Xebatê tarixî milkê umumi de yo; nuşteyê Wikiçıme CC BY-SA de yo.', authorizedShare:'Parvekerdiş rê dayeyo', rights_authorized_share:'Çıme vano ke xwediyê heqê telîfê qandê parvekerdişê na dosyaya destûr dayo. Na milkê umumi nêya; bıkarnayışê tewr zêde beno ke destûrê bînê lazım bibo.', rights_zazaki1899:'Xebatê tarixî yê 1899 milkê umumi de yo; nuşteyê Wikiçıme CC BY-SA de yo.'},
  hac: {label:'هەورامی', native:'هەورامی / گۆرانی', dir:'rtl', navAuthors:'نووسەران', navPreservation:'پاراستن', navAbout:'دەربارە', brandSub:'کتێبە کراوەکان لە زمان و نووسینە کوردییەکان', eyebrow:'کتێبە کراوەکان لە زمان و نووسینە کوردییەکان', headline:'کتێبی دوات پیدا بکە', intro:'لە بەرهەمە مڵکی گشتی و دەستگەیشتنە کراوەکان بگەڕێ. هەر ناونیشان سەرچاوە و زانیاری مافەکانی هەیە.', glance:'کۆمەڵەکە بە کورتی', openBooks:'ناونیشانی سەرەکی', kurdishVarieties:'جۆری کوردی', displayLanguages:'زمانی ڕووکار', rightsChecked:'مافەکان پشکنراون', suggest:'پێشنیاری کتێب', catalogue:'کاتەلۆگ', searchCatalogue:'گەڕان لە کتێبخانە', searchPlaceholder:'ناونیشان، نووسەر، چیرۆک، زمان یان سەرچاوە بگەڕێ', bookLanguage:'زمانی کتێب', subject:'بابەت', sortBooks:'ڕیزکردن', allVarieties:'هەموو جۆرەکان', allSubjects:'هەموو بابەتەکان', allScripts:'هەموو نووسینەکان', allFormats:'هەموو فۆرماتەکان', allAvailability:'هەموو بەردەستییەکان', poetry:'شیعر و کلاسیک', reference:'زمان و سەرچاوە', religious:'ئەدەبی دینی', education:'پەروەردە و فەرهەنگ', folklore:'فۆلکلۆر و چیرۆک', sortCatalogue:'ڕیزی کاتەلۆگ', sortTitle:'ناونیشان', sortAuthor:'نووسەر', sortOldest:'کۆنترین', sortNewest:'نوێترین', sortRecent:'تازە زیادکراو', moreFilters:'پاڵێوەری زیاتر', fewerFilters:'پاڵێوەری کەمتر', clearFilters:'پاککردنەوە', script:'نووسین', format:'فۆرمات', availability:'بەردەستی', latin:'لاتینی', arabic:'بنەمای عەرەبی', mixed:'تێکەڵ', wiki:'دەقی ویکی‌سەرچاوە', pdf:'سکانی PDF', full:'تەواو', partial:'بەشی بەردەست', catalogueNote:'کاتەلۆگی سەرەکی لە پێشە؛ ڕەفەکانی چیرۆک لە خوارەوەن. گەڕان هەردووکیان دەگرێتەوە.', verifiedTitles:'ناونیشانی پشکنراو', libraryMatches:'ئەنجامی گەڕان لە کتێبخانە', readOnline:'بخوێنەوە', readAvailable:'بەشی بەردەست بخوێنەوە', openPdf:'PDF بخوێنەوە', downloadPdf:'PDF دابگرە', details:'وردەکاری', source:'سەرچاوە', publicDomain:'مڵکی گشتی', regionalPD:'مڵکی گشتی / تێبینی ناوچەیی', rightsReview:'پێویستی بە پشکنین هەیە', partialBadge:'بەشی بەردەست', noResults:'هیچ کتێبێک نەدۆزرایەوە', noResultsHelp:'پاڵێوەرێک لابە یان گەڕانێکی تر بکە.', backCatalogue:'گەڕانەوە بۆ کاتەلۆگ', description:'وەسف', languageVariety:'جۆری زمان', bookScript:'نووسین', publicationDate:'بەرواری بەرهەم', readingFormats:'فۆرماتەکان', sourceInstitution:'دامەزراوەی سەرچاوە', rightsReuse:'ماف و دووبارە بەکارهێنان', rightsCheckedDate:'دوایین پشکنین', shareLink:'بەستەری هاوبەشکردن', copyLink:'کۆپی بەستەر', copied:'کۆپی کرا', chooseLanguage:'زمانی ڕووکار هەڵبژێرە', languageHelp:'هەر کات دەتوانیت بگۆڕیت. نووسینی ڕاست بۆ چەپ پشتگیری دەکرێت.', suggestTitle:'پێشنیاری بەرهەمێکی کوردی مڵکی گشتی بکە', suggestHelp:'پێشنیارەکان پێش زیادکردن پشکنین دەکرێن.', formTitle:'ناوی بەرهەم', formAuthor:'نووسەر', formVariety:'جۆری کوردی', formSource:'سەرچاوەی ڕاستەوخۆ', formRights:'بەڵگەی ماف', formEmail:'ئیمەیڵ (ئارەزوومەندانە)', formNotes:'تێبینی', netlifyNote:'ئەم فۆرمە بۆ Netlify Forms ئامادەیە.', submitSuggestion:'ناردن', closeReader:'کتێبخانە', readingWidth:'پانی', openOriginal:'سەرچاوەی ڕەسەن', previousSection:'بەشی پێشوو', nextSection:'بەشی دواتر', loading:'بارکردن…', readerFailed:'خوێنەرەوە نەیتوانی سەرچاوەکە بار بکات.', readerFallback:'سەرچاوەی ڕەسەن بکەرەوە.', pdfFallback:'ئەگەر PDF دەرنەکەوت، بە شاشەی تەواو بیکەرەوە یان دایبگرە.', openFullScreen:'شاشەی تەواو', partialNotice:'ئەم تۆمارە بەشێکی بەردەست نیشان دەدات.', footer:'دەستگەیشتنی کراوە · سەرچاوەی ڕوون · هەموو جۆرە کوردییەکان بەخێربێن', rights_pd_old:'بەرهەمە مێژووییەکە مڵکی گشتییە؛ دەقی ویکی‌سەرچاوە بە CC BY-SA بەردەستە.', rights_pd_old_scan:'بەرهەمە مێژووییەکە مڵکی گشتییە؛ بۆ مەرجەکانی ئەم سکانە سەرچاوەکە ببینە.', rights_pd_us:'سکانەکە لە ئەمریکا وەک مڵکی گشتی نیشان دراوە؛ لە شوێنی دیکە پشکنین بکە.', rights_pd_commons:'سەرچاوەکە وەک مڵکی گشتی نیشان دراوە.', rights_pd_iraq:'ویکی‌سەرچاوە لە عێراق وەک مڵکی گشتی نیشانی دەدات.', rights_1932:'سکانی ١٩٣٢ بۆ خوێندنەوەیە؛ دووبارە بەکارهێنان بە یاسای ناوچەکەت پشکنە.', rights_historical:'نووسەرە مێژووییەکان لە مافی نووسەر دەرچوون؛ دەقی ویکی‌سەرچاوە CC BY-SA ـە.', rights_wiki_pd:'بەرهەمەکە مڵکی گشتییە؛ دەقی ویکی‌سەرچاوە CC BY-SA ـە.', authorizedShare:'ڕێگە بە هاوبەشکردن دراوە', rights_authorized_share:'سەرچاوەکە دەڵێت خاوەنی ماف ڕێگەی بە هاوبەشکردنی ئەم فایلە داوە. ئەمە مڵکی گشتی نییە؛ بەکارهێنانی زیاتر لە ڕێگەپێدانە دیاریکراوەکەدا لەوانەیە مۆڵەتی تر بخوازێت.', rights_zazaki1899:'بەرهەمی ١٨٩٩ مڵکی گشتییە؛ دەقی ویکی‌سەرچاوە CC BY-SA ـە.'},
  sdh: {label:'کوردی خوارین', native:'کوردی خوارین / کەڵهوڕی', dir:'rtl', navAuthors:'نووسەران', navPreservation:'پاراستن', navAbout:'دەربارە', brandSub:'کتێبە کراوەکان لە جۆر و نووسینە کوردییەکان', eyebrow:'کتێبە کراوەکان لە جۆر و نووسینە کوردییەکان', headline:'کتێبی دوات پیدا بکە', intro:'لە بەرهەمە مڵکی گشتی و دەستگەیشتنە کراوە پشکنراوەکان بگەڕێ؛ هەر ناونیشان سەرچاوە و دۆخی ماف پیشان دەدات.', glance:'کۆمەڵەکە بە کورتی', openBooks:'ناونیشانی سەرەکی', kurdishVarieties:'جۆری کوردی', displayLanguages:'زمانی ڕووکار', rightsChecked:'ماف پشکنراوە', suggest:'پێشنیاری کتێب', catalogue:'کاتەلۆگ', searchCatalogue:'گەڕان لە کتێبخانە', searchPlaceholder:'ناونیشان، نووسەر، چیرۆک، زمان یان سەرچاوە بگەڕێ', bookLanguage:'زمانی کتێب', subject:'بابەت', sortBooks:'ڕیزکردنی کتێب', allVarieties:'هەموو جۆرەکان', allSubjects:'هەموو بابەتەکان', allScripts:'هەموو نووسینەکان', allFormats:'هەموو فۆرماتەکان', allAvailability:'هەموو بەردەستییەکان', poetry:'شیعر و کلاسیک', reference:'زمان و سەرچاوە', religious:'ئەدەبی دینی', education:'پەروەردە و فەرهەنگ', folklore:'فۆلکلۆر و چیرۆک', sortCatalogue:'ڕیزی کاتەلۆگ', sortTitle:'ناونیشان', sortAuthor:'نووسەر', sortOldest:'کۆنترین', sortNewest:'نوێترین', sortRecent:'تازە زیادکراو', moreFilters:'پاڵێوەری زیاتر', fewerFilters:'پاڵێوەری کەمتر', clearFilters:'پاککردنەوەی پاڵێوەر', script:'نووسین', format:'فۆرمات', availability:'بەردەستی', latin:'لاتینی', arabic:'بنەمای عەرەبی', mixed:'تێکەڵ', wiki:'دەقی ویکی‌سەرچاوە', pdf:'سکانی PDF', full:'تەواو', partial:'بەشی بەردەست', catalogueNote:'کاتەلۆگی سەرەکی لە پێشە؛ ڕەفەکانی چیرۆک لە خوارەوەن. گەڕان هەردووکیان دەگرێتەوە.', verifiedTitles:'ناونیشانی پشکنراو', libraryMatches:'ئەنجامی گەڕان لە کتێبخانە', readOnline:'بخوێنەوە', readAvailable:'بەشی بەردەست بخوێنەوە', openPdf:'PDF بخوێنەوە', downloadPdf:'PDF دابگرە', details:'وردەکاری', source:'سەرچاوە', publicDomain:'مڵکی گشتی', regionalPD:'مڵکی گشتی / تێبینی ناوچەیی', rightsReview:'پێویستی بە پشکنین هەیە', partialBadge:'بەشی بەردەست', noResults:'هیچ کتێبێک نەدۆزرایەوە', noResultsHelp:'پاڵێوەرێک لابە یان گەڕانێکی تر بکە.', backCatalogue:'گەڕانەوە بۆ کاتەلۆگ', description:'وەسف', languageVariety:'جۆری زمان', bookScript:'نووسین', publicationDate:'بەرواری بەرهەم', readingFormats:'فۆرماتەکان', sourceInstitution:'دامەزراوەی سەرچاوە', rightsReuse:'ماف و دووبارە بەکارهێنان', rightsCheckedDate:'دوایین پشکنین', shareLink:'بەستەری هاوبەشکردن', copyLink:'کۆپی بەستەر', copied:'کۆپی کرا', chooseLanguage:'زمانی ڕووکار هەڵبژێرە', languageHelp:'هەر کات دەتوانیت بگۆڕیت. نووسینی ڕاست بۆ چەپ پشتگیری دەکرێت.', suggestTitle:'پێشنیاری بەرهەمێکی کوردی مڵکی گشتی بکە', suggestHelp:'پێشنیارەکان پێش زیادکردن پشکنین دەکرێن و خۆکار بڵاوناکرێنەوە.', formTitle:'ناوی بەرهەم', formAuthor:'نووسەر', formVariety:'جۆری کوردی', formSource:'سەرچاوەی ڕاستەوخۆ', formRights:'بەڵگەی ماف', formEmail:'ئیمەیڵ (ئارەزوومەندانە)', formNotes:'تێبینی', netlifyNote:'ئەم فۆرمە بۆ Netlify Forms ئامادەیە.', submitSuggestion:'ناردن', closeReader:'کتێبخانە', readingWidth:'پانی', openOriginal:'سەرچاوەی ڕەسەن', previousSection:'بەشی پێشوو', nextSection:'بەشی دواتر', loading:'بارکردن…', readerFailed:'خوێنەرەوە نەیتوانی سەرچاوەکە بار بکات.', readerFallback:'سەرچاوەی ڕەسەن بکەرەوە.', pdfFallback:'ئەگەر PDF دەرنەکەوت، بە شاشەی تەواو بیکەرەوە یان دایبگرە.', openFullScreen:'شاشەی تەواو', partialNotice:'ئەم تۆمارە بەشێکی بەردەست نیشان دەدات.', footer:'دەستگەیشتنی کراوە · سەرچاوەی ڕوون · هەموو جۆرە کوردییەکان بەخێربێن', rights_pd_old:'بەرهەمە مێژووییەکە مڵکی گشتییە؛ دەقی ویکی‌سەرچاوە بە CC BY-SA بەردەستە.', rights_pd_old_scan:'بەرهەمە مێژووییەکە مڵکی گشتییە؛ بۆ مەرجەکانی ئەم سکانە سەرچاوەکە ببینە.', rights_pd_us:'سکانەکە لە ئەمریکا وەک مڵکی گشتی نیشان دراوە؛ لە شوێنی دیکە پشکنین بکە.', rights_pd_commons:'سەرچاوەکە وەک مڵکی گشتی نیشان دراوە.', rights_pd_iraq:'ویکی‌سەرچاوە لە عێراق وەک مڵکی گشتی نیشانی دەدات.', rights_1932:'سکانی ١٩٣٢ بۆ خوێندنەوەیە؛ دووبارە بەکارهێنان بە یاسای ناوچەکەت پشکنە.', rights_historical:'نووسەرە مێژووییەکان لە مافی نووسەر دەرچوون؛ دەقی ویکی‌سەرچاوە CC BY-SA ـە.', rights_wiki_pd:'بەرهەمەکە مڵکی گشتییە؛ دەقی ویکی‌سەرچاوە CC BY-SA ـە.', authorizedShare:'ڕێگە بە هاوبەشکردن دراوە', rights_authorized_share:'سەرچاوەکە دەڵێت خاوەنی ماف ڕێگەی بە هاوبەشکردنی ئەم فایلە داوە. ئەمە مڵکی گشتی نییە؛ بەکارهێنانی زیاتر لە ڕێگەپێدانە دیاریکراوەکەدا لەوانەیە مۆڵەتی تر بخوازێت.', rights_zazaki1899:'بەرهەمی ١٨٩٩ مڵکی گشتییە؛ دەقی ویکی‌سەرچاوە CC BY-SA ـە.'}
};

for(const [code,labels] of Object.entries(window.KDL_INTERFACE||{}))Object.assign(LOCALES[code],labels);
for(const [code,labels] of Object.entries(window.KDL_COMPLETE||{}))Object.assign(LOCALES[code],labels);
const safeStorage=window.KDLDiscovery.storage;

const BOOKS = [...(window.KDL_BOOKS || []), ...(window.KDL_STORIES || [])].map(b=>({...b,preview:window.KDL_PREVIEWS?.[b.slug]}));

const VARIETIES = [
  ['all','allVarieties'], ['kmr','Kurmancî'], ['ckb','Soranî / کوردیی ناوەندی'], ['diq','Zazakî / Kirmanckî'], ['hac','Hewramî / Goranî'], ['sdh','Kurdî Xwarîn / Southern Kurdish']
];
const SUBJECTS = [['all','allSubjects'],['poetry','poetry'],['reference','reference'],['religious','religious'],['education','education'],['folklore','folklore']];
const SCRIPTS = [['all','allScripts'],['latin','latin'],['arabic','arabic'],['mixed','mixed']];
const FORMATS = [['all','allFormats'],['wiki','wiki'],['pdf','pdf'],['web','webStory']];
const AVAIL = [['all','allAvailability'],['full','full'],['partial','partial'],['retelling','retelling']];
const SORTS = [['catalogue','sortCatalogue'],['title','sortTitle'],['author','sortAuthor'],['year-asc','sortOldest'],['year-desc','sortNewest'],['recent','sortRecent']];

const state = {mode:'all',locale: safeStorage.getItem('kdl_locale') || 'en', q:'',browse:'all',performer:'',limit:24, variety:'all', subject:'all', script:'all', format:'all', availability:'all', sort:'catalogue'};
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const t = key => (LOCALES[state.locale] && LOCALES[state.locale][key]) || LOCALES.en[key] || key;
const desc = b => b.desc?.[state.locale] || b.desc?.en || '';
const bookBySlug = slug => BOOKS.find(b=>b.slug===slug);
const archiveBase = b => `books/${b.slug}`;
const localPdfUrl = b => `${archiveBase(b)}/book.pdf`;
const localTextUrl = b => `${archiveBase(b)}/content.html`;
const archiveEligible = b => b.archiveEligible===true;
async function urlExists(url,signal){try{await window.KDLReader.fetchText(url,{method:'HEAD',timeout:4000,signal});return true}catch{return false}}
const normalizeText=window.KDLDiscovery.normalize;
function subjectLabel(v){return t(v)}
function scriptLabel(v){return t(v)}
function formatLabel(v){return t(v)}
function availabilityLabel(v){return t(v)}
function rightsLabel(b){if(b.licenseLabel)return b.licenseLabel; if(b.rightsKey==='rights_cc_by_nc_external')return 'CC BY-NC 4.0'; if(b.rightsKey==='rights_cc_by_3')return 'CC BY 3.0'; if(b.rightsType==='pd')return t('publicDomain'); if(b.rightsType==='regional')return t('regionalPD'); if(b.rightsType==='licensed')return t('authorizedShare'); return t('rightsReview')}
function rightsClass(b){return b.rightsType==='check'?'caution':'rights'}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function buildOptions(select, data){select.innerHTML=data.map(([value,keyOrLabel])=>`<option value="${value}">${escapeHtml(LOCALES.en[keyOrLabel] ? t(keyOrLabel) : keyOrLabel)}</option>`).join('')}
function applyLocale(){
  const locale=LOCALES[state.locale]||LOCALES.en; document.documentElement.lang=state.locale; document.documentElement.dir=locale.dir; document.body.dir=locale.dir;
  $('#languageButtonLabel').textContent=locale.label;
  $$('[data-close-dialog]').forEach(el=>el.setAttribute('aria-label',t('close')));
  $$('.footer-links a,.top-nav a[href*="index.html"]').forEach(a=>{const u=new URL(a.href);u.searchParams.set('lang',state.locale);a.href=u.href});
  $$('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)}); $$('[data-i18n-placeholder]').forEach(el=>{el.placeholder=t(el.dataset.i18nPlaceholder)});
  buildOptions($('#varietyFilter'),VARIETIES); buildOptions($('#subjectFilter'),SUBJECTS); buildOptions($('#sortFilter'),SORTS); buildOptions($('#scriptFilter'),SCRIPTS); buildOptions($('#formatFilter'),FORMATS); buildOptions($('#availabilityFilter'),AVAIL);
  $('#varietyFilter').value=state.variety; $('#subjectFilter').value=state.subject; $('#sortFilter').value=state.sort; $('#scriptFilter').value=state.script; $('#formatFilter').value=state.format; $('#availabilityFilter').value=state.availability;
  renderLanguageGrid(); renderCatalogue(); const openBook=new URL(location.href).searchParams.get('book'); if(openBook) showDetails(openBook,false);
}

function renderLanguageGrid(){
  $('#languageGrid').innerHTML=Object.entries(LOCALES).map(([code,l])=>`<button class="language-option" type="button" data-locale="${code}" aria-current="${code===state.locale}"><strong>${escapeHtml(l.native)}</strong><small>${escapeHtml(l.label)}</small></button>`).join('');
  $$('.language-option').forEach(btn=>btn.addEventListener('click',()=>{state.locale=btn.dataset.locale; safeStorage.setItem('kdl_locale',state.locale); closeDialog('languageDialog'); applyLocale(); updateUrl();}));
}

function permanentRecordUrl(b){return `book/${b.slug}/index.html?lang=${state.locale}`}
function authorRecordUrl(b){return `authors/${b.authorSlug}/index.html?lang=${state.locale}`}
function bookSearchText(b){
  return normalizeText([
    b.kdlId,b.slug,b.title||'Untitled record',b.author||'',b.authorSlug||'',
    b.variety||'',b.v||'',b.institution||'',b.year||'',b.subject||'',subjectLabel(b.subject),
    b.script||'',scriptLabel(b.script),b.format||'',formatLabel(b.format),
    b.availability||'',availabilityLabel(b.availability),b.source||'',b.url||'',
    ...(b.aliases||[]),...Object.values(b.desc||{})
  ].join(' '));
}

function matchesSearchText(searchText,query){
  const tokens=normalizeText(query).split(/\s+/).filter(Boolean);
  return !tokens.length||tokens.every(token=>searchText.includes(token));
}

const STARTER_BOOKS=['mem-u-zin','story-mame-alan','zembilfiros','makas-kurdische-studien-1900','diwana-melaye-ciziri','story-siyabend-u-xece','diwani-mahwi','kurdische-texte-transkription-1903'];
function filteredBooks(){
  const q=normalizeText(state.q);
  let items=BOOKS.filter(b=>!b.sourceOnly&&(state.variety==='all'||b.v===state.variety||(state.variety==='ckb'&&b.variety.includes('Soranî'))||(state.variety==='diq'&&b.variety.includes('Zazakî')))&&(state.subject==='all'||b.subject===state.subject)&&(state.script==='all'||b.script===state.script)&&(state.format==='all'||b.format===state.format)&&(state.availability==='all'||b.availability===state.availability));
  if(state.browse==='saved')items=items.filter(b=>personalShelf.saved[b.slug]);
  else if(!['all','recent'].includes(state.browse))items=items.filter(b=>(b.browseTags||[]).includes(state.browse));
  if(q)items=items.filter(b=>matchesSearchText(bookSearchText(b),q));
  const collator=new Intl.Collator(state.locale,{sensitivity:'base',numeric:true});
  const rank=b=>{const index=STARTER_BOOKS.indexOf(b.slug);return index>=0?index: b.sourceOnly?500:b.subject==='reference'?400:b.subject==='education'?300:100+b.id};
  items.sort((a,b)=>{switch(state.browse==='recent'?'recent':state.sort){case'title':return collator.compare(a.title,b.title);case'author':return collator.compare(a.author,b.author)||collator.compare(a.title,b.title);case'year-asc':return (a.yearSort||9999)-(b.yearSort||9999);case'year-desc':return (b.yearSort||0)-(a.yearSort||0);case'recent':return b.added.localeCompare(a.added)||b.id-a.id;default:return rank(a)-rank(b)}});return items;
}
function motifFor(b){return b.motif||({folklore:'folk-oral',poetry:'love-classical',religious:'mystical-medallion',education:'editorial-reference',reference:'editorial-reference'}[b.subject])||'folk-oral'}
function shelfDescription(b){
  const locale=state.locale;
  const lang=b.summary?.[locale]||b.desc?.[locale]?locale:'en';
  const text=b.summary?.[lang]||b.desc?.[lang]?.split(/(?<=[.!?])\s+/)[0]||'';
  return text?`<p class="book-summary" lang="${lang}" dir="auto">${escapeHtml(text)}</p>`:'';
}
function readLabel(b){return b.sourceOnly?t('sourceOnly'):t('readNow')}
function readingUrl(b){return b.format==='web'&&!b.localStory?b.url:`?read=${encodeURIComponent(b.slug)}&lang=${state.locale}`}
let dengbejExpanded=false;
function markMode(){
  $$('[data-library-mode]').forEach(button=>{const active=button.dataset.libraryMode===state.mode;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active))});
  renderDengbej();renderSpoken();
  if(state.mode!=='voices')$$('#voicesBrowsePanel video').forEach(video=>video.pause());
  $('#catalogue').hidden=state.mode==='voices';$('#voicesBrowsePanel').hidden=state.mode!=='voices';$('#moreFiltersButton').hidden=state.mode==='voices';
}
function renderCatalogue(){
  const items=filteredBooks();renderDiscovery(items);
  $('#resultsCount').textContent=`${items.length} ${t('showBooks')}${state.q?' · '+searchRecordings(state.q).length+' '+t('recordings'):''}`;
  const count=['variety','subject','script','format','availability'].filter(k=>state[k]!=='all').length;
  $('#filterCount').textContent=count;$('#filterCount').hidden=!count;
  $('#readingStart').hidden=state.mode!=='all'||Boolean(state.q)||count>0||state.browse!=='all';
  $('#clearFiltersButton').hidden=!count&&!state.q&&state.sort==='catalogue'&&state.browse==='all';
  $('#emptyState').hidden=items.length>0||(!!state.q&&searchRecordings(state.q).length>0);
  $('#loadMoreBooks').hidden=items.length<=state.limit;
  $('#emptyState strong').textContent=state.browse==='saved'?t('noSavedBooks'):t('noResults');
  $('#bookGrid').innerHTML=items.slice(0,state.limit).map(b=>{
    const external=b.format==='web'&&!b.localStory;
    const note=b.availability==='partial'?t('partialBadge'):b.availability==='retelling'?t('retelling'):b.sourceOnly?t('sourceOnly'):'';
    const language=VARIETIES.find(x=>x[0]===b.v)?.[1]?.split(' / ')[0]||b.variety;
    const author=(b.author||'').length>80?'Khan, Mohammadirad, Molin & Noorlander':b.author;
    return `<article class="book-card" data-slug="${b.slug}"><a class="cover tone-${b.tone} ${b.preview?'has-scan':''} ${(b.title||'').length>65?'long-title':''} ${external?'':'read-book'}" href="${escapeHtml(readingUrl(b))}" data-slug="${b.slug}" aria-label="${escapeHtml(readLabel(b)+': '+b.title)}" ${external?'target="_blank" rel="noopener"':''}><span class="cover-language">${escapeHtml(language)}${b.format==='pdf'?' · PDF':''}</span><h3 class="cover-title" dir="${b.rtl?'rtl':'auto'}">${escapeHtml(b.title)}</h3>${b.preview?`<img class="cover-scan" src="${escapeHtml(b.preview)}" alt="" loading="lazy">`:`<img class="cover-ornament" src="assets/motifs/${motifFor(b)}.svg" alt="" loading="lazy" aria-hidden="true">`}${note?`<span class="edition-note">${escapeHtml(note)}</span>`:''}</a><div class="card-body">${b.preview?`<p class="scan-title" dir="auto">${escapeHtml(b.title)}</p>`:''}<p class="book-author" dir="auto">${escapeHtml(author)}</p>${shelfDescription(b)}<div class="card-actions">${saveButton(b)}<a class="shelf-read ${external?'':'read-book'}" data-slug="${b.slug}" href="${escapeHtml(readingUrl(b))}" ${external?'target="_blank" rel="noopener"':''}>${escapeHtml(readLabel(b))} <span aria-hidden="true">${external?'↗':'→'}</span></a>${b.format==='pdf'?`<a class="shelf-download" data-download="${b.slug}" href="${escapeHtml(window.KDLDiscovery.preferredFile(b))}" ${archiveEligible(b)?'download':'target="_blank" rel="noopener"'} aria-label="${escapeHtml(t('downloadPdf')+': '+b.title)}" title="${escapeHtml(t('downloadPdf'))}">↓</a>`:''}<button class="shelf-info details-book" type="button" data-slug="${b.slug}" aria-label="${escapeHtml(t('aboutBook')+': '+b.title)}">${escapeHtml(t('bookInfo'))}</button></div></div></article>`;
  }).join('');
  $$('.read-book',$('#bookGrid')).forEach(el=>el.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openReader(bookBySlug(el.dataset.slug))}));
  $$('.details-book',$('#bookGrid')).forEach(el=>el.addEventListener('click',()=>showDetails(el.dataset.slug)));
  bindDiscoveryActions($('#bookGrid'));markMode();
}

function updateUrl(extra={}){
  const u=new URL(location.href); const params=u.searchParams; params.delete('book');params.delete('read');params.delete('mode');params.delete('performer');params.delete('recording');params.delete('chapter');if(state.mode==='voices')params.set('mode','voices');
  [['browse',state.browse==='all'?'':state.browse],['performer',state.performer],['q',state.q],['language',state.variety==='all'?'':state.variety],['subject',state.subject==='all'?'':state.subject],['script',state.script==='all'?'':state.script],['format',state.format==='all'?'':state.format],['availability',state.availability==='all'?'':state.availability],['sort',state.sort==='catalogue'?'':state.sort],['lang',state.locale==='en'?'':state.locale]].forEach(([k,v])=>v?params.set(k,v):params.delete(k));
  Object.entries(extra).forEach(([k,v])=>v?params.set(k,v):params.delete(k)); history.replaceState({},'',u);
}
function readUrlState(){ const p=new URL(location.href).searchParams; state.q=p.get('q')||'';state.browse=p.get('browse')||'all';state.performer=p.get('performer')||'';state.limit=24;state.mode=p.get('mode')==='voices'?'voices':'all'; state.variety=p.get('language')||'all'; state.subject=p.get('subject')||'all'; state.script=p.get('script')||'all'; state.format=p.get('format')||'all'; state.availability=p.get('availability')||'all'; state.sort=p.get('sort')||'catalogue'; if(state.mode!=='voices')state.mode=state.format==='pdf'?'pdf':state.subject==='folklore'?'stories':state.subject==='poetry'?'poetry':'all'; if(p.get('lang')&&LOCALES[p.get('lang')]){state.locale=p.get('lang');safeStorage.setItem('kdl_locale',state.locale);} $('#searchInput').value=state.q;$('#dengbejSearch').value=''; }
function syncFilter(key,value){state.limit=24;state[key]=value;if(key==='subject'||key==='format')state.mode=state.format==='pdf'?'pdf':state.subject==='folklore'?'stories':state.subject==='poetry'?'poetry':'all';renderCatalogue();updateUrl();}
function startGlobalSearch(value){
  // A new query starts across every record; filters chosen afterward still apply.
  if(value.trim()&&!state.q){
    const selects={variety:'varietyFilter',subject:'subjectFilter',script:'scriptFilter',format:'formatFilter',availability:'availabilityFilter'};
    Object.entries(selects).forEach(([key,id])=>{state[key]='all';$('#'+id).value='all'});
  }
  state.mode='all';state.browse='all';state.performer='';syncFilter('q',value);
}

function resolveBookFile(b){return window.KDLDiscovery.preferredFile(b)}
async function downloadBook(b){const target=await resolveBookFile(b);const a=document.createElement('a');a.href=target;a.target='_blank';a.rel='noopener';if(target.startsWith('books/'))a.download='';document.body.appendChild(a);a.click();a.remove();}

let detailsFocus=null, catalogueScroll=0;
function showDetails(slug,push=true){
 const b=bookBySlug(slug);if(!b)return;
 if(push){detailsFocus=document.activeElement;catalogueScroll=window.scrollY;}
 $('#cataloguePage').hidden=true;$('#detailsPage').hidden=false;window.scrollTo({top:0,behavior:'instant'});
 const author=b.authorSlug?`<a href="${authorRecordUrl(b)}">${escapeHtml(b.author)}</a>`:escapeHtml(b.author);
 const external=b.format==='web'&&!b.localStory;
 $('#detailsContent').innerHTML=`<article class="details-main"><h1 id="detailsTitle" tabindex="-1" dir="auto">${escapeHtml(b.title)}</h1><p class="details-byline">${author} · ${escapeHtml(b.variety)}</p><p class="details-description">${escapeHtml(desc(b))}</p>${b.availability==='retelling'?`<p>${escapeHtml(t('storyNotice'))}</p>`:''}<div class="details-actions">${saveButton(b)}<a class="primary-button" id="detailsRead" href="${escapeHtml(readingUrl(b))}" ${external?'target="_blank" rel="noopener"':''}>${escapeHtml(readLabel(b))} →</a>${b.format==='pdf'?`<button class="secondary-button" id="detailsDownload" type="button">↓ ${escapeHtml(t('downloadPdf'))}</button>`:''}</div>${relatedPerformanceHtml(b)}<button type="button" class="text-button" data-report-book="${b.slug}">${escapeHtml(t('reportProblem'))}</button><details class="source-details"><summary>${escapeHtml(t('sourceAndRights'))}</summary><p><a href="${escapeHtml(b.source||b.url)}" target="_blank" rel="noopener">${escapeHtml(b.institution||t('source'))} ↗</a></p>${b.rightsKey?`<p>${escapeHtml(t(b.rightsKey))}</p>`:''}${b.license?`<p><a href="${escapeHtml(b.license)}" target="_blank" rel="noopener">${escapeHtml(b.licenseLabel)} ↗</a></p>`:''}<p>${escapeHtml(b.year||'')}${b.kdlId?' · '+escapeHtml(b.kdlId):''}</p>${b.authorSlug?`<a href="${permanentRecordUrl(b)}">${escapeHtml(t('details'))} →</a>`:''}</details></article>`;
 bindDiscoveryActions($('#detailsContent'));
 if(!external)$('#detailsRead').addEventListener('click',e=>{e.preventDefault();openReader(b)});
 $('#detailsDownload')?.addEventListener('click',()=>downloadBook(b));
 if(push){const u=new URL(location.href);u.searchParams.delete('read');u.searchParams.set('book',slug);history.pushState({book:slug},'',u);$('#detailsTitle').focus();}
}
function closeDetails(){
 $('#detailsPage').hidden=true;$('#cataloguePage').hidden=false;
 const u=new URL(location.href);u.searchParams.delete('book');history.replaceState({},'',u);
 window.scrollTo({top:catalogueScroll,behavior:'instant'});detailsFocus?.focus({preventScroll:true});
}

let lastFocus=null,pendingInitialRead=null;
function openDialog(id){const d=$('#'+id);lastFocus=document.activeElement;d.hidden=false;document.body.classList.add('modal-open');const card=$('.dialog-card',d);card.focus();trapSetup(d)}
function closeDialog(id){
 const d=$('#'+id);d.hidden=true;if($('#reader').hidden&&!$$('.dialog-backdrop').some(dialog=>!dialog.hidden))document.body.classList.remove('modal-open');if(lastFocus&&lastFocus.focus)lastFocus.focus();
 if(id==='languageDialog'){
  safeStorage.setItem('kdl_locale',state.locale);
  if(pendingInitialRead){const slug=pendingInitialRead;pendingInitialRead=null;queueMicrotask(()=>{const u=new URL(location.href);u.searchParams.set('read',slug);history.replaceState({},'',u);openReader(bookBySlug(slug),false)});}
 }
}
function trapSetup(container){const focusables=$$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',container).filter(x=>!x.disabled&&!x.hidden); if(!focusables.length)return; container.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();closeDialog(container.id);return} if(e.key!=='Tab')return; const first=focusables[0],last=focusables[focusables.length-1]; if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}

let readerBook=null, readerSections=[], currentSection=-1, readerFont=Number(safeStorage.getItem('kdl_reader_font')||20), wideReader=safeStorage.getItem('kdl_reader_wide')==='1';
let readerController=null,pdfSession=null,progressTimer=null,restoringProgress=false,readerChapter='';
const personalShelf=window.KDLDiscovery.readObject('kdl_personal_shelf',{saved:{},progress:{}});
personalShelf.saved=personalShelf.saved&&typeof personalShelf.saved==='object'&&!Array.isArray(personalShelf.saved)?personalShelf.saved:{};personalShelf.progress=personalShelf.progress&&typeof personalShelf.progress==='object'&&!Array.isArray(personalShelf.progress)?personalShelf.progress:{};
function beginReaderLoad(){
 clearTimeout(progressTimer);restoringProgress=true;readerController?.abort();
 const controller=new AbortController();readerController=controller;
 return {signal:controller.signal,current:()=>readerController===controller&&!controller.signal.aborted};
}
function applyReaderPrefs(){document.documentElement.style.setProperty('--reader-size',readerFont+'px');document.documentElement.style.setProperty('--reader-width',wideReader?'1040px':'780px')}
let readerFocus=null;
async function openReader(b,push=true){
 if(!b)return;
 if(b.format==='web'&&!b.localStory){location.href=b.url;return;}
 captureTextProgress();pdfSession?.destroy?.();pdfSession=null;readerController?.abort();readerFocus=document.activeElement;readerBook=b;readerSections=[];currentSection=-1;
 $('#reader').hidden=false;$('#reader').classList.toggle('is-pdf',b.format==='pdf');document.body.classList.add('modal-open');
 $('#readerSave').dataset.save=b.slug;updateSaveButton($('#readerSave'),b);
 $('#readerRelated').hidden=!MEDIA.recordings.some(r=>(r.relatedBooks||[]).includes(b.slug));
 $('#readerTitle').textContent=b.title;$('#readerSubtitle').textContent=b.author;
 window.dispatchEvent(new CustomEvent('kdl-reader-open',{detail:{book:b}}));
 $('#readerOriginal').href=b.source||b.url;$('#readerNav').hidden=true;$('#readerDownload').hidden=true;$('#readerContents').hidden=true;
 for(const id of ['fontDown','fontUp','readerWidth'])$('#'+id).hidden=b.format==='pdf';
 $('#readerContent').innerHTML=`<div class="reader-loading" role="status">${escapeHtml(t('loading'))}</div>`;$('#readerContent').scrollTop=0;
 $('#readerClose').focus();applyReaderPrefs();
 if(push){const u=new URL(location.href);u.searchParams.set('read',b.slug);u.searchParams.delete('recording');u.searchParams.delete('chapter');const saved=personalShelf.progress[b.slug];if(saved?.chapter)u.searchParams.set('chapter',saved.chapter);history.pushState({read:b.slug},'',u);}
 if(b.format==='pdf'){
   const load=beginReaderLoad();
   const readUrl=await resolveBookFile(b);
   if(!load.current())return;await renderPdf(b,readUrl);
 }else if(b.localStory)await renderStory(b);else{
   const chapter=new URL(location.href).searchParams.get('chapter')||(!location.hash?personalShelf.progress[b.slug]?.chapter:'');
   const linked=chapter&&window.KDLReader.wikiLink('https://wikisource.org/wiki/'+encodeURIComponent(chapter),b.wiki);
   await renderWiki(b,linked?.page||b.wiki);
 }
}
function closeReader(update=true){
 captureTextProgress();clearTimeout(progressTimer);pdfSession?.destroy?.();pdfSession=null;
 readerController?.abort();readerController=null;
 $('#reader').hidden=true;$('#readerContent').replaceChildren();document.body.classList.remove('modal-open');readerBook=null;readerSections=[];currentSection=-1;readerChapter='';
 if(update){const u=new URL(location.href);u.searchParams.delete('read');u.searchParams.delete('chapter');history.replaceState({},'',u);}
 readerFocus?.focus({preventScroll:true});renderContinueReading();
}
function renderReaderError(b,retry,sourceUrl=b.source||b.url){
 $('#readerNav').hidden=true;
 $('#readerContent').innerHTML=`<div class="reader-error" role="alert"><p>${escapeHtml(t('readerFailed'))}</p><div class="reader-recovery"><button class="primary-button" type="button" data-reader-retry>${escapeHtml(t('retryRead'))}</button><a class="secondary-button" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(t('openOriginal'))} ↗</a></div></div>`;
 $('[data-reader-retry]').addEventListener('click',retry);
}
function renderNativePdf(b,readUrl=b.url){
 const download=$('#readerDownload');download.href=readUrl;download.hidden=false;if(!readUrl.startsWith('books/')){download.target='_blank';download.rel='noopener'}else{download.removeAttribute('target');download.removeAttribute('rel')}
 $('#readerContent').innerHTML=`<p class="native-pdf-note">${escapeHtml(t('nativePdfNote'))}</p><div class="pdf-fallback"><span>${escapeHtml(t('pdfHelp'))}</span><a href="${escapeHtml(readUrl)}" target="_blank" rel="noopener">${escapeHtml(t('openFullScreen'))} ↗</a><button type="button" class="text-button" data-reader-retry>${escapeHtml(t('retryRead'))}</button></div><iframe class="pdf-frame" title="${escapeHtml(b.title)} PDF" src="${escapeHtml(readUrl)}#page=${personalShelf.progress[b.slug]?.page||b.startPage||1}&view=FitH"></iframe>`;
 $('[data-reader-retry]').addEventListener('click',()=>renderPdf(b,readUrl));
 $('.pdf-frame').addEventListener('error',()=>{if(readerBook===b)renderReaderError(b,()=>renderPdf(b,readUrl),readUrl)},{once:true});
}
async function renderStory(b){
 const load=beginReaderLoad();
 $('#readerContent').innerHTML=`<div class="reader-loading" role="status">${escapeHtml(t('loading'))}</div>`;
 try{
  const html=await window.KDLReader.fetchText(b.url,{signal:load.signal});
  if(!load.current())return;
  const doc=new DOMParser().parseFromString(html,'text/html');
  const article=doc.querySelector('.story-reader');if(!article)throw new Error('Story text missing');
  article.querySelectorAll('script,style,iframe,object,embed,form,.reader-controls').forEach(el=>el.remove());
  article.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(a=>{if(/^on/i.test(a.name))el.removeAttribute(a.name)}));
  article.querySelectorAll('a[href]').forEach(a=>{a.href=new URL(a.getAttribute('href'),new URL(b.url,location.href)).href});
  article.querySelectorAll('img[src]').forEach(img=>{img.src=new URL(img.getAttribute('src'),new URL(b.url,location.href)).href});
  article.className='reader-article'+(article.querySelector('.illustrated-page')?' illustrated-story':'');article.dir=b.rtl?'rtl':'ltr';
  $('#readerContent').replaceChildren(article);restoreTextProgress(b);
 }catch(error){if(load.current())renderReaderError(b,()=>renderStory(b))}
}
function openWikiChapter(b,page,hash=''){
 captureTextProgress();const u=new URL(location.href);u.searchParams.set('read',b.slug);
 if(window.KDLReader.normalizeWikiPage(page)===window.KDLReader.normalizeWikiPage(b.wiki))u.searchParams.delete('chapter');else u.searchParams.set('chapter',page);
 history.pushState({read:b.slug},'',u);renderWiki(b,page,hash);
}
function bindWikiChapters(b,page){
 $$('#readerContent a[href]').forEach(link=>{
  const chapter=window.KDLReader.wikiLink(link.href,b.wiki);
  if(!chapter)return;
  // Keep a real, shareable URL for opening chapters in a new tab too.
  const url=new URL(location.href);url.searchParams.set('read',b.slug);
  if(chapter.page===window.KDLReader.normalizeWikiPage(b.wiki))url.searchParams.delete('chapter');else url.searchParams.set('chapter',chapter.page);
  url.hash=chapter.hash;link.href=url.href;link.removeAttribute('target');link.removeAttribute('rel');
  link.addEventListener('click',event=>{
   if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   event.preventDefault();
   if(chapter.page===window.KDLReader.normalizeWikiPage(page)&&chapter.hash){scrollToReaderAnchor(chapter.hash);return}
   openWikiChapter(b,chapter.page,chapter.hash);
  });
 });
}
function scrollToReaderAnchor(hash){
 if(!hash)return;
 try{const target=document.getElementById(decodeURIComponent(hash.replace(/^#/,'')));if(target&&$('#readerContent').contains(target))target.scrollIntoView({block:'start'})}catch{}
}
async function renderWiki(b,page,hash=''){
 const load=beginReaderLoad();
 const atContents=window.KDLReader.normalizeWikiPage(page)===window.KDLReader.normalizeWikiPage(b.wiki);
 const sourceUrl=atContents?(b.source||b.url):'https://wikisource.org/wiki/'+encodeURIComponent(page.replace(/ /g,'_'));
 $('#readerContents').hidden=atContents;$('#readerContents').onclick=()=>openWikiChapter(b,b.wiki);
 $('#readerOriginal').href=sourceUrl;$('#readerNav').hidden=true;readerSections=[];currentSection=-1;
 $('#readerContent').scrollTop=0;
 $('#readerContent').innerHTML=`<div class="reader-loading" role="status">${escapeHtml(t('loading'))}</div>`;
 const showArticle=html=>{
  $('#readerContent').innerHTML=(b.availability==='partial'?`<div class="partial-banner">${escapeHtml(t('partialNotice'))}</div>`:'')+`<article class="reader-article" dir="${b.rtl?'rtl':'ltr'}">${html}</article>`;
  readerChapter=atContents?'':window.KDLReader.normalizeWikiPage(page);
  bindWikiChapters(b,page);if(hash||location.hash){restoringProgress=false;scrollToReaderAnchor(hash||location.hash);captureTextProgress()}else restoreTextProgress(b,readerChapter);
 };
 if(atContents&&archiveEligible(b)){
  try{
   const html=await window.KDLReader.fetchText(localTextUrl(b),{signal:load.signal,timeout:6000});
   if(!load.current())return;
   showArticle(html);
   try{
    const meta=JSON.parse(await window.KDLReader.fetchText(`${archiveBase(b)}/metadata.json`,{signal:load.signal,timeout:4000}));
    if(load.current())setReaderSections(meta.sections||[]);
   }catch{}
   return;
  }catch{if(!load.current())return}
 }
 try{
  const api=`https://wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=text%7Csections%7Cdisplaytitle&format=json&origin=*`;
  const raw=await window.KDLReader.fetchText(api,{signal:load.signal});
  if(!load.current())return;
  const data=window.KDLReader.parseWikiResponse(raw);
  if(data.error||!data.parse?.text?.['*'])throw new Error(data.error?.info||'Wikisource text missing');
  const doc=new DOMParser().parseFromString(data.parse.text['*'],'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,form,input,button,link,meta,.mw-editsection,.navbox,.metadata,.noprint,.catlinks,.printfooter,.sistersitebox,.ws-noexport').forEach(n=>n.remove());
  doc.querySelectorAll('[style]').forEach(el=>{const s=el.getAttribute('style')||'';if(/position\s*:\s*(fixed|absolute)/i.test(s))el.removeAttribute('style')});
  doc.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(a=>{if(/^on/i.test(a.name)||['srcset','loading'].includes(a.name))el.removeAttribute(a.name)}));
  doc.querySelectorAll('img[src]').forEach(img=>{img.src=new URL(img.getAttribute('src'),sourceUrl).href});
  doc.querySelectorAll('a[href]').forEach(link=>{
   const href=link.getAttribute('href');
   if(href.startsWith('#'))return;
   const url=new URL(href,sourceUrl);if(!['https:','http:'].includes(url.protocol)){link.removeAttribute('href');return}
   link.href=url.href;link.target='_blank';link.rel='noopener';
  });
  showArticle(doc.body.innerHTML);setReaderSections(data.parse.sections||[]);
 }catch(error){if(load.current())renderReaderError(b,()=>renderWiki(b,page,hash),sourceUrl)}
}
function setReaderSections(sections){readerSections=sections.filter(s=>s.anchor&&s.line).map(s=>({anchor:s.anchor,title:s.line.replace(/<[^>]+>/g,'')}));currentSection=readerSections.length?0:-1;setupSectionNav()}
function setupSectionNav(){const nav=$('#readerNav');if(!readerSections.length){nav.hidden=true;return}nav.hidden=false;updateSectionControls();}
function updateSectionControls(){const prev=$('#prevSection'),next=$('#nextSection');prev.disabled=currentSection<=0;next.disabled=currentSection>=readerSections.length-1;$('#sectionLabel').textContent=readerSections[currentSection]?.title||'';}
function goSection(delta){if(!readerSections.length)return;currentSection=Math.max(0,Math.min(readerSections.length-1,currentSection+delta));const section=readerSections[currentSection];const target=document.getElementById(section.anchor)||document.querySelector(`[id="${CSS.escape(section.anchor)}"]`);if(target)target.scrollIntoView({behavior:'smooth',block:'start'});updateSectionControls();}

function initEvents(){
 initDiscoveryEvents();
  $('#dengbejSearch').addEventListener('input',renderDengbej);
  $('#dengbejToggle').addEventListener('click',()=>{dengbejExpanded=!dengbejExpanded;renderDengbej()});
  $('#dengbejClear').addEventListener('click',()=>{$('#dengbejSearch').value='';renderDengbej();$('#dengbejSearch').focus()});
  $$('[data-featured-read]').forEach(link=>link.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openReader(bookBySlug(link.dataset.featuredRead))}));
  document.querySelector('.site-header a[href="#catalogue"]')?.addEventListener('click',()=>{if(!$('#detailsPage').hidden)closeDetails();setMode('all')});
  $('#searchInput').addEventListener('input',e=>startGlobalSearch(e.target.value)); $('#varietyFilter').addEventListener('change',e=>syncFilter('variety',e.target.value)); $('#subjectFilter').addEventListener('change',e=>syncFilter('subject',e.target.value)); $('#sortFilter').addEventListener('change',e=>syncFilter('sort',e.target.value)); $('#scriptFilter').addEventListener('change',e=>syncFilter('script',e.target.value)); $('#formatFilter').addEventListener('change',e=>syncFilter('format',e.target.value)); $('#availabilityFilter').addEventListener('change',e=>syncFilter('availability',e.target.value));
  $('#moreFiltersButton').addEventListener('click',()=>{const a=$('#advancedFilters'),open=a.hidden;a.hidden=!open;$('#moreFiltersButton').setAttribute('aria-expanded',String(open));$('#moreFiltersButton').querySelector('[data-i18n]').textContent=t('filters')});
  $$('[data-library-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.libraryMode)));
  $('#clearFiltersButton').addEventListener('click',()=>{Object.assign(state,{mode:'all',browse:'all',performer:'',limit:24,q:'',variety:'all',subject:'all',script:'all',format:'all',availability:'all',sort:'catalogue'});$('#searchInput').value='';applyLocale();updateUrl()});
  $('#languageButton').addEventListener('click',()=>openDialog('languageDialog')); $('#suggestButton').addEventListener('click',()=>openDialog('suggestDialog')); $$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.dataset.closeDialog))); $$('.dialog-backdrop').forEach(d=>d.addEventListener('mousedown',e=>{if(e.target===d)closeDialog(d.id)}));
  $('#detailsBack').addEventListener('click',closeDetails); $('#readerClose').addEventListener('click',closeReader); $('#fontDown').addEventListener('click',()=>{readerFont=Math.max(14,readerFont-2);safeStorage.setItem('kdl_reader_font',readerFont);applyReaderPrefs()}); $('#fontUp').addEventListener('click',()=>{readerFont=Math.min(28,readerFont+2);safeStorage.setItem('kdl_reader_font',readerFont);applyReaderPrefs()}); $('#readerWidth').addEventListener('click',()=>{wideReader=!wideReader;safeStorage.setItem('kdl_reader_wide',wideReader?'1':'0');applyReaderPrefs()}); $('#prevSection').addEventListener('click',()=>goSection(-1));$('#nextSection').addEventListener('click',()=>goSection(1));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#reader').hidden&&!$$('.dialog-backdrop').some(dialog=>!dialog.hidden))closeReader()});
  window.addEventListener('popstate',()=>{const p=new URL(location.href).searchParams;closeReader(false);readUrlState();applyLocale();if(!p.get('book')){$('#detailsPage').hidden=true;$('#cataloguePage').hidden=false}if(p.get('read'))openReader(bookBySlug(p.get('read')),false);else if(p.get('recording'))openRecording(p.get('recording'),false)});
  $('#reader').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=$$('a[href],button,input,select,iframe',$('#reader')).filter(x=>!x.hidden&&!x.disabled&&x.getClientRects().length);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
}

function setMode(mode){
 if(!$('#detailsPage').hidden)closeDetails();
 state.limit=24;state.browse='all';state.performer='';state.q='';$('#searchInput').value='';state.mode=mode;state.subject=mode==='stories'?'folklore':mode==='poetry'?'poetry':'all';state.format=mode==='pdf'?'pdf':'all';
 $('#subjectFilter').value=state.subject;$('#formatFilter').value=state.format;renderCatalogue();updateUrl();
}
/* DISCOVERY_FUNCTIONS */
readUrlState();initEvents();applyLocale();
const entryParams=new URL(location.href).searchParams;
const initialRead=entryParams.get('read');
const savedLocale=safeStorage.getItem('kdl_locale');
if(!LOCALES[savedLocale]&&!LOCALES[entryParams.get('lang')]){pendingInitialRead=initialRead;openDialog('languageDialog');}
else if(initialRead)openReader(bookBySlug(initialRead),false);
if(location.hash==='#kurmanjiStoryShelf'||location.hash==='#storyCorner'){state.variety=location.hash==='#storyCorner'?'ckb':'kmr';$('#varietyFilter').value=state.variety;setMode('stories')}
if(location.hash==='#voicesBrowsePanel')setMode('voices');
if(!initialRead&&entryParams.get('recording'))openRecording(entryParams.get('recording'),false);
if(!initialRead&&state.performer&&entryParams.get('mode')==='voices')showPerformer(state.performer,false);
