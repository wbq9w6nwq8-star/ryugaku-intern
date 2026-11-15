let aiNewsCache = [];
let currentNewsCat = 'all';
let currentSearchQuery = '';
let newsLimitCount = null;
let displayCount = 20; // 初期表示20件

const ARCHIVE_STORAGE_KEY = 'atrium_career_news_timeline_v5';
const LEGACY_KEYS = [
  'atrium_career_news_timeline_v4',
  'atrium_career_news_timeline_v3',
  'atrium_career_news_timeline_v2',
  'atrium_career_news_timeline_v1'
];

// 奨学金タブ選択時に上部へ常設表示する主要給付型奨学金データベース
const FEATURED_SCHOLARSHIPS = [
  {
    name: 'トビタテ！留学JAPAN（新・日本代表プログラム）',
    badge: '返済不要・給付型',
    amount: '月額12万〜16万円＋渡航費・授業料',
    timing: '例年12月〜2月頃募集（次年度派遣分）',
    target: '日本の大学在籍の交換・派遣・休学留学向け（実践活動計画が重視）',
    url: 'https://tobitate-mext.jasso.go.jp/'
  },
  {
    name: 'JASSO 海外留学支援制度（学部学位取得型・大学院学位取得型）',
    badge: '返済不要・給付型',
    amount: '月額6万〜11.8万円＋授業料支援（上限あり）',
    timing: '例年9月〜10月頃募集',
    target: '海外の正規大学・大学院で学位（学士・修士・博士）取得を目指す学生向け',
    url: 'https://ryugaku.jasso.go.jp/scholarship/scholarship_degree/'
  },
  {
    name: '柳井正財団 海外奨学金プログラム',
    badge: '大型給付型',
    amount: '年間最大9.5万ドル相当（授業料・寮費・生活費・保険）',
    timing: '公募制（夏〜秋）／予約型',
    target: '米国・英国のトップランク正規大学へ進学する日本人学生向け',
    url: 'https://www.yanaitadashi-foundation.or.jp/'
  },
  {
    name: '平和中島財団 日本人留学生奨学金',
    badge: '返済不要・給付型',
    amount: '月額15万円〜20万円＋往復渡航費',
    timing: '例年9月〜10月頃募集',
    target: '海外の大学・大学院へ正規留学する日本人学生対象',
    url: 'http://www.hnf.jp/shogaku/'
  }
];

// ノイズを除外したライブ検索クエリ
const LIVE_CAREER_QUERIES = [
  {
    category: 'インターン',
    query: 'site:prtimes.jp ("サマーインターン" OR "ウィンターインターン" OR "長期インターン" OR "インターンシップ") ("募集" OR "エントリー" OR "開催") -"歯科" -"歯学部" -"看護" -"薬学" -"介護" -"社員旅行" -"懇親会" when:14d'
  },
  {
    category: '外資・商社',
    query: '("外資" OR "総合商社" OR "戦略コンサル" OR "投資銀行" OR "グローバル採用") ("新卒" OR "インターン" OR "本選考" OR "説明会") -"大学" -"学部" -"歯科" -"看護" -"体験記" -"社員旅行" -"懇親会" when:14d'
  },
  {
    category: 'ボスキャリ',
    query: '("ボストンキャリアフォーラム" OR "ボスキャリ" OR "キャリアフォーラム" OR "海外大生") ("採用" OR "選考" OR "募集" OR "セミナー") -"交換留学" -"歯科" -"学内" when:30d'
  },
  {
    category: '奨学金',
    query: '("海外留学" OR "海外大学" OR "正規留学" OR "海外大学院") ("奨学金" OR "給付型奨学金" OR "財団") ("募集" OR "公募" OR "応募" OR "支援") -"歯科" -"看護" -"介護" when:45d'
  },
  {
    category: '就活戦略',
    query: 'site:prtimes.jp ("新卒採用" OR "就活" OR "グローバルキャリア") ("ワークショップ" OR "オンライン説明会" OR "選考対策" OR "キャリアセミナー") -"歯科" -"看護" -"薬学" -"介護" -"社員旅行" -"懇親会" when:14d'
  }
];

// 厳格ダブルチェック用：除外するノイズワード（歯学部・医療福祉職・特定大学の学内イベント・社内行事等）
const STRICT_NG_WORDS = [
  '歯学部', '歯科', '歯科医', '歯科衛生', '医学部', '薬学部', '薬剤師', '看護', '獣医',
  '介護', '福祉', '保育', '幼稚園', '栄養士', '理学療法', '作業療法', '柔道整復',
  '高校生向け', '中学生', '小学生', 'オープンキャンパス', '大学入試', '偏差値', '共通テスト',
  '学園祭', '文化祭', '大学プレスセンター', '交換留学報告', '派遣報告', '帰国報告会',
  'パチンコ', '競馬', '競輪', 'ボートレース', '訃報', '人事異動', '決算短信', '株式分割',
  '社員旅行', '懇親会', '周年', '社内イベント', '表彰式', '内定式', '入社式', '運動会', '忘年会'
];

const SPECIFIC_UNI_REGEX = /(?:[^\s「『（(]{2,10})(?:大学|短期大学|専門学校|高校|高等学校)(?:が|で|の|にて|主催|開催|、|・|\s*[-｜|])/;

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}

function decodeEntities(str) {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

function generateArticleId(title) {
  let hash = 0;
  const s = String(title || '').trim();
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return 'art_' + Math.abs(hash).toString(36);
}

function cleanCategoryName(cat) {
  if (!cat) return '就活戦略';
  for (const valid of ['外資・商社', 'インターン', 'ボスキャリ', '奨学金', '就活戦略']) {
    if (cat.includes(valid)) return valid;
  }
  return '就活戦略';
}

// ダブルチェック関数：記事が海外大生・就活サイトに本当に適しているかを厳格判定
function isValidArticleForSite(title, category = '') {
  if (!title || title.length < 12) return false;
  const t = String(title);

  if (STRICT_NG_WORDS.some(ng => t.includes(ng))) {
    return false;
  }

  if (!t.includes('海外大学') && !t.includes('海外大生')) {
    if (SPECIFIC_UNI_REGEX.test(t)) {
      return false;
    }
  }

  const validSignals = [
    'インターン', '新卒', '就活', '採用', '選考', 'エントリー', '説明会',
    'ボスキャリ', 'キャリアフォーラム', '海外大', '留学',
    '外資', '商社', 'コンサル', '奨学金', '財団', '給付', '卒向け', '年卒'
  ];
  if (!validSignals.some(sig => t.includes(sig))) {
    return false;
  }

  return true;
}

function extractArticleKeywords(title, category) {
  const tags = new Set();
  const cat = cleanCategoryName(category);
  tags.add(cat);

  const rules = [
    { kw: 'サマーインターン', reg: /サマーインターン|夏インターン|夏季インターン/ },
    { kw: 'ウィンターインターン', reg: /ウィンターインターン|冬インターン|冬季インターン/ },
    { kw: '長期インターン', reg: /長期インターン|有給インターン/ },
    { kw: '27卒', reg: /27卒|2027年卒/ },
    { kw: '28卒', reg: /28卒|2028年卒/ },
    { kw: '29卒', reg: /29卒|2029年卒/ },
    { kw: '海外大生向け', reg: /海外大|正規留学|ボストン|ボスキャリ|グローバル採用/ },
    { kw: '外資・コンサル', reg: /外資|コンサル|投資銀行|IBD|戦略/ },
    { kw: '総合商社', reg: /商社|三菱商事|三井物産|伊藤忠|住友商事|丸紅/ },
    { kw: 'IT・メガベンチャー', reg: /エンジニア|AI|DX|IT|デジタル|サイバー|楽天|メルカリ|DeNA/ },
    { kw: 'オンライン開催', reg: /オンライン|Web|ウェビナー|リモート/ },
    { kw: '早期選考・直結', reg: /早期|直結|優遇|特別選考|パス/ },
    { kw: '給付型・支援', reg: /給付|奨学金|財団|支援/ },
    { kw: 'エントリー募集', reg: /募集|エントリー|受付開始|締切/ }
  ];

  rules.forEach(r => {
    if (r.reg.test(title)) tags.add(r.kw);
  });

  const corpMatch = title.match(/(?:株式会社|合同会社|一般財団法人|公益財団法人)?([A-Za-z0-9ァ-ヶー一-龠]{2,12})(?:株式会社|グループ|財団)/);
  if (corpMatch && corpMatch[1] && !['日本', '海外', '国際', '学生', '新卒', '採用'].includes(corpMatch[1])) {
    tags.add(corpMatch[1]);
  }

  return Array.from(tags).slice(0, 5);
}

function generateSpecificComment(title, category) {
  const cleanTitle = (title || '').replace(/\s*[-｜|]\s*[^-｜|]+$/, '');
  const cat = cleanCategoryName(category);

  const gradMatch = cleanTitle.match(/(2[6-9]卒|202[6-9]年卒|海外大生|留学生|学部生|大学院生)/);
  const targetStr = gradMatch ? `${gradMatch[1]}を対象に含む` : 'グローバル志向の学生が注目すべき';

  const entityMatch = cleanTitle.match(/^【([^】]+)】|([A-Za-z0-9ァ-ヶー一-龠・]{2,15}(?:株式会社|グループ|財団|銀行|証券|コンサルティング|商事|物産))/);
  const entityName = entityMatch ? (entityMatch[1] || entityMatch[2]) : '';
  const subjectPrefix = entityName ? `${entityName}による` : '';

  if (cat === '奨学金' || /奨学金|財団|給付/.test(cleanTitle)) {
    return `${subjectPrefix}奨学金・経済支援プログラムの最新発表です。正規留学・交換留学の対象区分や併給条件、申請書類の提出期限を必ず確認しましょう。`;
  }
  if (/サマーインターン|夏季インターン|夏インターン/.test(cleanTitle)) {
    return `${subjectPrefix}${targetStr}サマーインターン募集動向です。夏の一時帰国期間やオンラインで参加可能か、本選考優遇の有無を早めにチェックしましょう。`;
  }
  if (/ウィンターインターン|冬インターン|オータム/.test(cleanTitle)) {
    return `${subjectPrefix}${targetStr}秋冬インターン選考情報です。海外滞在中でもオンラインでWebテスト・面接が完結するか募集要項の確認を推奨します。`;
  }
  if (/ボスキャリ|ボストンキャリアフォーラム|キャリアフォーラム/.test(cleanTitle)) {
    return `${subjectPrefix}海外大生・留学生向け採用フォーラム関連の重要トピックです。事前エントリー枠やオンライン面接のスケジュール管理に直結します。`;
  }
  if (/ワークショップ|セミナー|説明会|ウェビナー|イベント/.test(cleanTitle)) {
    return `${subjectPrefix}${targetStr}キャリアセミナー・説明会の開催情報です。現場社員との接点や選考対策の一次情報を得る好機のため、定員前の予約が有効です。`;
  }
  if (/外資|コンサル|投資銀行|商社|グローバル/.test(cleanTitle)) {
    return `${subjectPrefix}難関・グローバル採用枠に関する最新ニュースです。英語力や海外での専攻・経験を高く評価するポジションが含まれるか確認しておきましょう。`;
  }
  return `${subjectPrefix}${targetStr}最新の採用・エントリー関連トピックです。応募資格（卒年・専攻）と日本時間での締切日時を早めに把握しておきましょう。`;
}

// ★ここが質問いただいた関数です（サーバー側の1,000文字超AI解説を優先表示し、未生成時のみ長文フォールバックを作成）
function generateDeepSummary(item) {
  if (item.ai_summary && item.ai_summary.length > 400) {
    return item.ai_summary;
  }

  const cleanTitle = (item.title || '').replace(/\s*[-｜|]\s*[^-｜|]+$/, '');
  const cat = cleanCategoryName(item.category);
  const shortPoint = item.ai_comment || generateSpecificComment(cleanTitle, cat);

  return (
    `【1. ニュースの核心と募集・発表ファクトの整理】\n` +
    `本記事「${cleanTitle}」は、${cat}領域における最新のプログラム・採用・支援動向を伝える重要トピックです。${shortPoint}\n` +
    `主催企業・団体が発信する一次情報には、対象となる卒業年度や応募資格、実施期間、開催形式（オンラインまたは対面）といった選考・応募の根幹となる条件が含まれています。表面的なニュースタイトルだけで判断せず、募集要項の細部まで目を通すことが他の候補者との差別化につながります。\n\n` +
    `【2. 業界・採用構造から見た本質的な背景】\n` +
    `近年の新卒採用市場およびグローバル人材獲得競争では、従来の就職ナビサイト解禁を待たずに、サマー・オータム・ウィンターインターンや早期セミナー、通年選考枠を通じて優秀層へ早期アプローチを行う動きが完全に定着しています。また奨学金や留学支援プログラムにおいても、円安や現地滞在費の高騰を背景に、給付型支援への応募倍率が高まる傾向にあります。したがって、こうした公募開始やイベント開催のニュースを初動でキャッチできるかどうかが、最終的な内定や採択率を大きく左右します。\n\n` +
    `【3. 海外大生・留学生にとっての戦略的メリットと注意点】\n` +
    `海外の正規大学や交換留学プログラムに在籍する学生にとって、国内学生と最も条件が異なるのは「物理的な移動の制約（一時帰国時期）」と「時差のある環境での選考スケジュール管理」です。\n` +
    `・説明会やワークショップ、面接がすべてオンライン（Zoom等）で完結するか、あるいは6〜9月・冬休み等の一時帰国期間と対面日程が合致するかを最初に確認してください。\n` +
    `・ボスキャリ（ボストンキャリアフォーラム）や海外大生特別選考ルートを持つ企業の場合、今回のイベント参加が早期選考パスや面接回数免除に直結するケースが多々あります。\n` +
    `・奨学金関連の場合は、「日本の大学に在籍する交換留学生のみ対象」か「海外大学へ直接進学する正規留学生・大学院生も対象か」、さらに他団体奨学金との併給が可能かを必ず募集要項で照合してください。\n\n` +
    `【4. 選考突破・応募に向けた具体的な準備ポイント】\n` +
    `エントリーにあたっては、単にマイページ登録を済ませるだけでなく、海外環境で培った「異文化適応力」「タフな交渉・協働経験」「専門領域の学業成果（GPAや研究テーマ）」を、志望企業や財団が求める人物像と結びつけて言語化しておく必要があります。Webテスト（玉手箱・TG-WEB・SPI等）やケース面接・グループディスカッションが課される場合は、エントリー締切から逆算して対策時間を確保しましょう。\n\n` +
    `【5. 今すぐ実行すべきネクストアクション】\n` +
    `1. 下部の「元記事・募集要項へ進む」から公式ページを開き、対象学年・応募条件・実施日程を確認する\n` +
    `2. エントリー締切日時（日本標準時JSTか現地時間かに注意）を手元のカレンダーへ即座に登録する\n` +
    `3. 必要な提出書類（和文・英文レジュメ、エントリーシート、成績証明書等）をリストアップし、今週中に下書きに着手する`
  );
}

function parseTimestamp(dateStr) {
  if (!dateStr) return 0;
  const normalized = String(dateStr).replace(/\./g, '/').replace(/年|月/g, '/').replace(/日/g, '');
  const t = new Date(normalized).getTime();
  return isNaN(t) ? 0 : t;
}

function formatTimelineDate(item) {
  const ts = item.timestamp || parseTimestamp(item.date);
  if (!ts) return { label: item.date || '最新', badgeText: 'NEW', badgeClass: 'bg-rose-600 text-white' };

  const diffHours = Math.floor((Date.now() - ts) / (1000 * 60 * 60));
  const d = new Date(ts);
  const dateFormatted = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

  if (diffHours >= 0 && diffHours < 24) {
    const hrs = Math.max(1, diffHours);
    return {
      label: dateFormatted,
      badgeText: `NEW・${hrs}時間前`,
      badgeClass: 'bg-rose-600 text-white border border-rose-600 shadow-2xs'
    };
  }
  if (diffHours >= 24 && diffHours < 72) {
    const days = Math.floor(diffHours / 24);
    return {
      label: dateFormatted,
      badgeText: `新着・${days}日前`,
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-300'
    };
  }
  return { label: dateFormatted, badgeText: '', badgeClass: '' };
}

function mergeAndSaveTimeline(newItems) {
  let savedItems = [];
  try {
    savedItems = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || '[]');
    LEGACY_KEYS.forEach(k => {
      const oldRaw = localStorage.getItem(k);
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        if (Array.isArray(oldParsed)) savedItems = [...savedItems, ...oldParsed];
      }
    });
  } catch (e) {}

  const map = new Map();

  [...savedItems, ...newItems].forEach(item => {
    if (!item || !item.title || !item.link) return;
    const cleanTitle = decodeEntities(item.title.trim()).replace(/\s*-\s*PR TIMES$/i, '');

    if (!isValidArticleForSite(cleanTitle, item.category)) return;

    const key = cleanTitle.slice(0, 48);
    const ts = item.timestamp || parseTimestamp(item.date) || Date.now();
    const id = item.id || generateArticleId(cleanTitle);
    const cat = cleanCategoryName(item.category);
    const keywords = (Array.isArray(item.keywords) && item.keywords.length > 0)
      ? item.keywords
      : extractArticleKeywords(cleanTitle, cat);

    const isGenericComment = !item.ai_comment || item.ai_comment.includes('直近の採用イベント・募集・キャリア形成に関わる最新ニュースです');
    const specificComment = isGenericComment
      ? generateSpecificComment(cleanTitle, cat)
      : item.ai_comment;

    const normalizedItem = {
      ...item,
      id,
      category: cat,
      title: cleanTitle,
      timestamp: ts,
      date: item.date || new Date(ts).toLocaleDateString('ja-JP'),
      keywords,
      ai_comment: specificComment
    };
    normalizedItem.ai_summary = generateDeepSummary(normalizedItem);

    const existing = map.get(key);
    if (!existing || normalizedItem.timestamp > existing.timestamp || item.isStaticJson) {
      map.set(key, normalizedItem);
    }
  });

  const merged = Array.from(map.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 300);

  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {}

  return merged;
}

function parseRssItemsFromXml(rawText, category) {
  const items = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(rawText)) !== null && items.length < 12) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

    if (titleMatch && linkMatch) {
      const cleanTitle = decodeEntities(titleMatch[1].trim()).replace(/\s*-\s*[^-]+$/, '');
      if (!isValidArticleForSite(cleanTitle, category)) continue;

      const pubDateStr = dateMatch ? dateMatch[1].trim() : '';
      const ts = parseTimestamp(pubDateStr) || Date.now();
      const keywords = extractArticleKeywords(cleanTitle, category);
      const baseItem = {
        id: generateArticleId(cleanTitle),
        category,
        title: cleanTitle,
        link: linkMatch[1].trim(),
        date: new Date(ts).toLocaleDateString('ja-JP'),
        timestamp: ts,
        keywords,
        ai_comment: generateSpecificComment(cleanTitle, category)
      };
      baseItem.ai_summary = generateDeepSummary(baseItem);
      items.push(baseItem);
    }
  }
  return items;
}

async function fetchCategoryLiveNews(catConfig) {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(catConfig.query)}&hl=ja&gl=JP&ceid=JP:ja`;

  const p1 = fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
    .then(r => r.json())
    .then(d => {
      if (!d.items || d.items.length === 0) throw new Error();
      const validItems = [];
      for (const i of d.items) {
        const cleanTitle = decodeEntities((i.title || '').replace(/\s*-\s*[^-]+$/, ''));
        if (!isValidArticleForSite(cleanTitle, catConfig.category)) continue;
        const ts = parseTimestamp(i.pubDate) || Date.now();
        const keywords = extractArticleKeywords(cleanTitle, catConfig.category);
        const baseItem = {
          id: generateArticleId(cleanTitle),
          category: catConfig.category,
          title: cleanTitle,
          link: i.link,
          date: new Date(ts).toLocaleDateString('ja-JP'),
          timestamp: ts,
          keywords,
          ai_comment: generateSpecificComment(cleanTitle, catConfig.category)
        };
        baseItem.ai_summary = generateDeepSummary(baseItem);
        validItems.push(baseItem);
        if (validItems.length >= 10) break;
      }
      if (validItems.length === 0) throw new Error();
      return validItems;
    });

  const p2 = fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`)
    .then(r => { if (!r.ok) throw new Error(); return r.text(); })
    .then(text => {
      const parsed = parseRssItemsFromXml(text, catConfig.category);
      if (parsed.length === 0) throw new Error();
      return parsed;
    });

  try {
    return await Promise.any([p1, p2]);
  } catch (e) {
    return [];
  }
}

function getShareableArticleUrl(articleId) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?article=${encodeURIComponent(articleId)}`;
}

function ensureSearchAndKeywordBar() {
  if (newsLimitCount) return;
  if (document.getElementById('atrium-news-search-bar')) return;

  const grid = document.getElementById('ai-news-grid');
  if (!grid || !grid.parentNode) return;

  const searchContainer = document.createElement('div');
  searchContainer.id = 'atrium-news-search-bar';
  searchContainer.className = 'mb-5 bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4';

  const quickKeywords = ['サマーインターン', '27卒', '28卒', '海外大生向け', '外資・コンサル', '総合商社', '給付型・支援', 'オンライン開催'];

  searchContainer.innerHTML = `
    <div class="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
      <div class="relative flex-1">
        <input
          id="news-keyword-input"
          type="text"
          placeholder="記事を検索（例：三菱商事、サマーインターン、ボスキャリ、28卒、奨学金...）"
          class="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400"
        />
        <button
          id="news-search-clear"
          type="button"
          class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 cursor-pointer"
        >
          クリア
        </button>
      </div>
      <div id="news-count-indicator" class="text-[11px] font-bold text-slate-500 shrink-0 px-1"></div>
    </div>
    <div class="flex items-center flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-slate-200/60">
      <span class="text-[10px] font-bold text-slate-400 mr-1">注目ワード:</span>
      ${quickKeywords.map(kw => `
        <button
          type="button"
          onclick="window.setNewsSearchKeyword('${escapeHTML(kw)}')"
          class="text-[11px] font-semibold bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 px-2.5 py-0.5 rounded-full transition cursor-pointer"
        >
          #${escapeHTML(kw)}
        </button>
      `).join('')}
    </div>
  `;

  grid.parentNode.insertBefore(searchContainer, grid);

  const inputEl = document.getElementById('news-keyword-input');
  const clearBtn = document.getElementById('news-search-clear');

  inputEl.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim();
    displayCount = 20;
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !currentSearchQuery);
    }
    renderAiNews();
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    currentSearchQuery = '';
    displayCount = 20;
    clearBtn.classList.add('hidden');
    renderAiNews();
  });
}

window.setNewsSearchKeyword = function(kw) {
  ensureSearchAndKeywordBar();
  const inputEl = document.getElementById('news-keyword-input');
  const clearBtn = document.getElementById('news-search-clear');
  if (currentSearchQuery === kw) {
    currentSearchQuery = '';
    if (inputEl) inputEl.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
  } else {
    currentSearchQuery = kw;
    if (inputEl) inputEl.value = kw;
    if (clearBtn) clearBtn.classList.remove('hidden');
  }
  displayCount = 20;
  renderAiNews();
};

function ensureArticleModal() {
  if (document.getElementById('ai-article-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'ai-article-modal';
  modal.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 relative max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
      <button onclick="window.closeArticleModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition cursor-pointer">
        ×
      </button>

      <div class="flex flex-wrap items-center gap-2 mb-3 pr-8 shrink-0">
        <span id="modal-article-cat" class="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100"></span>
        <span id="modal-article-freshness" class="hidden text-[11px] font-extrabold px-2.5 py-0.5 rounded-full"></span>
        <span id="modal-article-date" class="text-xs font-mono text-slate-400"></span>
      </div>

      <h2 id="modal-article-title" class="text-base sm:text-xl font-extrabold text-slate-900 leading-snug mb-3 shrink-0"></h2>

      <div id="modal-article-keywords" class="flex flex-wrap gap-1.5 mb-4 shrink-0"></div>

      <div class="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/80 mb-5 overflow-y-auto flex-1">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/70">
          <span class="text-xs font-extrabold text-indigo-600 tracking-wide">AI徹底解説・選考攻略レポート</span>
          <span id="modal-summary-length" class="text-[11px] font-semibold text-slate-400">Atrium Deep Intelligence</span>
        </div>
        <div id="modal-article-summary" class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"></div>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
        <div class="flex items-center gap-2">
          <a id="modal-x-share" href="#" target="_blank" rel="noopener noreferrer" class="flex-1 sm:flex-initial inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">
            Xでこの記事を共有
          </a>
          <button id="modal-copy-url" type="button" class="flex-1 sm:flex-initial inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer">
            記事リンクをコピー
          </button>
        </div>

        <a id="modal-original-link" href="#" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-2xs">
          元記事・募集要項へ進む →
        </a>
      </div>
    </div>
  `;

  modal.addEventListener('click', () => window.closeArticleModal());
  document.body.appendChild(modal);
}

window.openArticleModal = function(articleId) {
  ensureArticleModal();
  const item = aiNewsCache.find(i => i.id === articleId);
  if (!item) return;

  const modal = document.getElementById('ai-article-modal');
  const timeInfo = formatTimelineDate(item);
  const shareUrl = getShareableArticleUrl(item.id);
  const longSummary = generateDeepSummary(item);
  const keywords = item.keywords || extractArticleKeywords(item.title, item.category);

  document.getElementById('modal-article-cat').textContent = item.category;
  document.getElementById('modal-article-date').textContent = timeInfo.label;
  document.getElementById('modal-article-title').textContent = item.title;
  document.getElementById('modal-article-summary').textContent = longSummary;
  document.getElementById('modal-original-link').href = item.link;

  const lenEl = document.getElementById('modal-summary-length');
  if (lenEl) {
    lenEl.textContent = `解説文字数: 約${longSummary.length}字`;
  }

  const freshEl = document.getElementById('modal-article-freshness');
  if (timeInfo.badgeText) {
    freshEl.textContent = timeInfo.badgeText;
    freshEl.className = `text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${timeInfo.badgeClass}`;
  } else {
    freshEl.className = 'hidden';
  }

  const kwContainer = document.getElementById('modal-article-keywords');
  kwContainer.innerHTML = keywords.map(kw => `
    <span class="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">#${escapeHTML(kw)}</span>
  `).join('');

  const xText = `【${item.category}｜Atrium就活・留学ニュース】\n${item.title}\n\nAI視点：${(item.ai_comment || '').slice(0, 80)}...\n\nAI徹底解説レポート（約${longSummary.length}字）はこちら\n`;
  const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(shareUrl)}`;
  document.getElementById('modal-x-share').href = xIntentUrl;

  const copyBtn = document.getElementById('modal-copy-url');
  copyBtn.textContent = '記事リンクをコピー';
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copyBtn.textContent = 'コピー完了';
      setTimeout(() => { copyBtn.textContent = '記事リンクをコピー'; }, 2000);
    } catch (e) {
      prompt('以下のURLをコピーしてください:', shareUrl);
    }
  };

  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', `?article=${encodeURIComponent(item.id)}`);
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.closeArticleModal = function() {
  const modal = document.getElementById('ai-article-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');

  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }
};

function checkDeepLinkArticle() {
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('article');
  if (targetId && aiNewsCache.some(i => i.id === targetId)) {
    window.openArticleModal(targetId);
  }
}

async function loadAiNews(limit = null) {
  newsLimitCount = limit;
  ensureArticleModal();
  ensureSearchAndKeywordBar();

  try {
    aiNewsCache = mergeAndSaveTimeline([]);
    if (aiNewsCache.length > 0) {
      renderAiNews();
      checkDeepLinkArticle();
    }
  } catch (e) {}

  try {
    const res = await fetch('news.json?v=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      const staticItems = (data.items || []).map(item => ({
        ...item,
        id: item.id || generateArticleId(item.title),
        isStaticJson: true,
        timestamp: item.timestamp || parseTimestamp(item.date) || (Date.now() - 86400000)
      }));
      aiNewsCache = mergeAndSaveTimeline(staticItems);
      const updatedEl = document.getElementById('ai-news-updated');
      if (updatedEl && data.updated_at) {
        updatedEl.innerText = `最終更新: ${data.updated_at} （アーカイブ総数: ${aiNewsCache.length}件）`;
      }
      renderAiNews();
      checkDeepLinkArticle();
    }
  } catch (e) {
    console.log('news.json standby');
  }

  try {
    const results = await Promise.all(LIVE_CAREER_QUERIES.map(q => fetchCategoryLiveNews(q)));
    const liveItems = results.flat();
    if (liveItems.length > 0) {
      aiNewsCache = mergeAndSaveTimeline(liveItems);
      const updatedEl = document.getElementById('ai-news-updated');
      if (updatedEl) {
        const nowStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        updatedEl.innerText = `自動更新: 本日 ${nowStr} （アーカイブ総数: ${aiNewsCache.length}件）`;
      }
      renderAiNews();
      checkDeepLinkArticle();
    }
  } catch (e) {
    console.warn('Live career news update skipped:', e);
  }
}

function filterAiNews(cat, btn) {
  currentNewsCat = cat;
  displayCount = 20;
  document.querySelectorAll('.news-tab').forEach(b => {
    b.className = 'news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer';
  });
  if (btn) {
    btn.className = 'news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer';
  }
  renderAiNews();
}

window.loadMoreTimelineNews = function() {
  displayCount += 20;
  renderAiNews();
};

function renderScholarshipStockGuide() {
  const cards = FEATURED_SCHOLARSHIPS.map(s => `
    <a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer" class="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between group">
      <div>
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">${escapeHTML(s.badge)}</span>
          <span class="text-[10px] font-bold text-slate-500">${escapeHTML(s.timing)}</span>
        </div>
        <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition">${escapeHTML(s.name)}</h4>
        <p class="text-[11px] font-bold text-indigo-600 mt-1">支給額目安：${escapeHTML(s.amount)}</p>
        <p class="text-[11px] text-slate-600 mt-1">${escapeHTML(s.target)}</p>
      </div>
      <div class="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
        <span class="text-[11px] font-bold text-indigo-600">公式サイトで要項を見る →</span>
      </div>
    </a>
  `).join('');

  return `
    <div class="col-span-full bg-slate-100/70 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-2">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">Scholarship Database</span>
          <h3 class="text-sm sm:text-base font-extrabold text-slate-900 mt-1">海外大生・留学生が押さえておくべき主要給付型奨学金</h3>
        </div>
        <span class="text-[11px] text-slate-500">年次・公募制の代表プログラム</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${cards}
      </div>
    </div>
    <div class="col-span-full flex items-center justify-between pt-2 pb-1">
      <h3 class="text-xs sm:text-sm font-extrabold text-slate-800">最新の奨学金募集・公募ニュース（タイムライン）</h3>
    </div>
  `;
}

function renderAiNews() {
  const grid = document.getElementById('ai-news-grid');
  if (!grid) return;

  let list = aiNewsCache;

  if (currentNewsCat !== 'all') {
    const cleanCat = cleanCategoryName(currentNewsCat);
    list = list.filter(item => cleanCategoryName(item.category) === cleanCat);
  }

  if (currentSearchQuery) {
    const q = currentSearchQuery.toLowerCase().replace(/^#/, '');
    list = list.filter(item => {
      const hay = [
        item.title || '',
        item.ai_comment || '',
        item.ai_summary || '',
        ...(item.keywords || [])
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  const totalMatching = list.length;
  const maxToShow = newsLimitCount ? newsLimitCount : displayCount;
  const visibleList = list.slice(0, maxToShow);

  const countEl = document.getElementById('news-count-indicator');
  if (countEl) {
    countEl.textContent = currentSearchQuery
      ? `「${currentSearchQuery}」の検索結果: ${totalMatching}件`
      : `表示中: ${Math.min(totalMatching, maxToShow)} / 全${totalMatching}件`;
  }

  const scholarshipHeaderHtml = (!newsLimitCount && currentNewsCat.includes('奨学金'))
    ? renderScholarshipStockGuide()
    : '';

  if (visibleList.length === 0) {
    const emptyMsg = currentSearchQuery
      ? `「${escapeHTML(currentSearchQuery)}」に一致する記事が見つかりませんでした。別のキーワードをお試しください。`
      : `該当カテゴリの最新ニュースを取得しています...`;
    grid.innerHTML = scholarshipHeaderHtml + `<div class="col-span-full text-center py-10 text-xs text-slate-400">${emptyMsg}</div>`;
    return;
  }

  const cardsHtml = visibleList.map(item => {
    const timeInfo = formatTimelineDate(item);
    const freshBadgeHtml = timeInfo.badgeText
      ? `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${timeInfo.badgeClass}">${escapeHTML(timeInfo.badgeText)}</span>`
      : '';
    const keywords = item.keywords || extractArticleKeywords(item.title, item.category);
    const summaryLen = (item.ai_summary || '').length;

    return `
      <article onclick="window.openArticleModal('${escapeHTML(item.id)}')" class="bg-slate-50/80 hover:bg-indigo-50/40 p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition flex flex-col justify-between group cursor-pointer">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <div class="flex items-center flex-wrap gap-1.5">
              <span class="text-[11px] font-bold bg-white text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">${escapeHTML(item.category)}</span>
              ${freshBadgeHtml}
            </div>
            <span class="text-[11px] font-mono text-slate-400 shrink-0">${escapeHTML(timeInfo.label)}</span>
          </div>

          <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition leading-snug mb-2.5">
            ${escapeHTML(item.title)}
          </h3>

          <div class="flex flex-wrap gap-1 mb-3" onclick="event.stopPropagation()">
            ${keywords.slice(0, 4).map(kw => `
              <button type="button" onclick="window.setNewsSearchKeyword('${escapeHTML(kw)}')" class="text-[10px] font-semibold bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200/80 px-2 py-0.5 rounded-md transition cursor-pointer">
                #${escapeHTML(kw)}
              </button>
            `).join('')}
          </div>

          <div class="bg-white p-3 rounded-xl border border-slate-200/70 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            <span class="font-bold text-indigo-600">AI視点：</span>${escapeHTML(item.ai_comment || '')}
          </div>
        </div>

        <div class="mt-3.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
          <span class="text-[10px] font-bold text-slate-400">タップして長文解説レポート（約${summaryLen}字）を開く</span>
          <span class="text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition">詳細解説を読む →</span>
        </div>
      </article>
    `;
  }).join('');

  const hasMore = !newsLimitCount && totalMatching > maxToShow;
  const remaining = totalMatching - maxToShow;
  const nextBatch = Math.min(20, remaining);
  const loadMoreHtml = hasMore
    ? `<div class="col-span-full text-center pt-5">
         <button onclick="window.loadMoreTimelineNews()" class="bg-white hover:bg-slate-900 text-slate-800 hover:text-white font-bold text-xs px-7 py-3 rounded-xl border border-slate-300 hover:border-slate-900 transition cursor-pointer shadow-2xs">
           過去のタイムラインをさらに${nextBatch}件読み込む（残り ${remaining} 件）
         </button>
       </div>`
    : '';

  grid.innerHTML = scholarshipHeaderHtml + cardsHtml + loadMoreHtml;
}