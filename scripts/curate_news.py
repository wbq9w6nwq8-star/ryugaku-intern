let aiNewsCache = [];
let currentNewsCat = 'all';
let newsLimitCount = null;
let displayCount = 12;

const ARCHIVE_STORAGE_KEY = 'atrium_career_news_timeline_v2';

const LIVE_CAREER_QUERIES = [
  {
    category: 'インターン',
    query: '("インターン" OR "サマーインターン" OR "ウィンターインターン") AND ("募集" OR "エントリー" OR "開始" OR "締切") when:14d'
  },
  {
    category: '外資・商社',
    query: '("外資" OR "総合商社" OR "コンサル" OR "投資銀行" OR "三菱商事" OR "三井物産") AND ("新卒" OR "インターン" OR "採用" OR "選考" OR "説明会") when:14d'
  },
  {
    category: 'ボスキャリ',
    query: '("ボストンキャリアフォーラム" OR "ボスキャリ" OR "海外大生" OR "留学" OR "グローバル採用") AND ("就活" OR "選考" OR "募集" OR "企業" OR "イベント") when:30d'
  },
  {
    category: '就活戦略',
    query: '("就活" OR "新卒採用" OR "キャリア") AND ("ワークショップ" OR "セミナー" OR "オンライン説明会" OR "選考対策" OR "イベント開催") when:14d'
  }
];

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

// タイトルから一意のIDを生成（URLシェア用）
function generateArticleId(title) {
  let hash = 0;
  const s = String(title || '');
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return 'art_' + Math.abs(hash).toString(36);
}

function cleanCategoryName(cat) {
  if (!cat) return '就活戦略';
  for (const valid of ['外資・商社', 'インターン', 'ボスキャリ', '就活戦略']) {
    if (cat.includes(valid)) return valid;
  }
  return cat;
}

// 一覧用の短いコメント生成
function generateShortComment(title, category) {
  if (/締切|締め切り|まもなく|最終/.test(title)) {
    return 'エントリー締切が迫っている可能性があります。募集要項と提出期限を早めに確認しておきましょう。';
  }
  if (/ワークショップ|セミナー|説明会|イベント|フォーラム/.test(title)) {
    return '企業や選考のリアルな情報が得られるイベント・ワークショップ情報です。参加枠を早めにチェックしましょう。';
  }
  if (category.includes('インターン') || /インターン/.test(title)) {
    return 'インターンシップの募集・開催に関する最新動向です。早期選考ルートや優遇枠に直結するケースが多いため要チェックです。';
  }
  if (category.includes('外資・商社')) {
    return '外資系・総合商社・難関業界に関する採用トピックです。語学力や海外経験を活かせる枠がないか確認してみましょう。';
  }
  return '直近の採用イベント・募集・キャリア形成に関わる最新ニュースです。早めの情報収集に活用してください。';
}

// タップ時に表示する「少し長めのAI独自要約記事」を生成
function generateLongSummary(item) {
  if (item.ai_summary && item.ai_summary.length > 120) {
    return item.ai_summary;
  }
  const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '');
  const cat = cleanCategoryName(item.category);
  const baseComment = item.ai_comment || generateShortComment(cleanTitle, cat);

  let actionDetail = '';
  if (cat === 'インターン' || /インターン/.test(cleanTitle)) {
    actionDetail = '近年のサマー・ウィンターインターンは、単なる就業体験ではなく「早期本選考の1次ステップ」として位置づけられています。特に海外滞在中の場合、時差を考慮したオンライン面接枠やWebテストの受験期限管理が合否を分けます。';
  } else if (cat === '外資・商社') {
    actionDetail = '外資系企業や総合商社では、通年採用枠や海外経験者向けの特別セミナーが通常のナビサイト解禁よりも早く動く傾向があります。ケース面接やガクチカの深掘りに備え、早めのプレエントリーが不可欠です。';
  } else if (cat === 'ボスキャリ') {
    actionDetail = '海外大生・交換留学生向けの採用枠は、事前応募（オンライン選考）の段階で面接枠の大半が埋まるケースが増えています。レジュメ（日本語・英語）の準備を前倒しで進めましょう。';
  } else {
    actionDetail = 'ワークショップやオンライン説明会は、現場社員の生の声を聞けるだけでなく、参加履歴が志望度の高さとして評価されることも少なくありません。';
  }

  return `【AIニュース要約・背景】\n「${cleanTitle}」に関する注目トピックです。${baseComment}\n\n【なぜこの情報が重要か】\n${actionDetail}\n\n【推奨ネクストアクション】\n・元記事および該当企業の採用マイページから、対象条件（卒業年度・応募資格）と締切日時を確認する\n・興味がある場合はブックマークやカレンダーへの日程登録を済ませ、エントリー漏れを防ぐ`;
}

function parseTimestamp(dateStr) {
  if (!dateStr) return 0;
  const normalized = String(dateStr).replace(/\./g, '/').replace(/年|月/g, '/').replace(/日/g, '');
  const t = new Date(normalized).getTime();
  return isNaN(t) ? 0 : t;
}

function formatTimelineDate(item) {
  const ts = item.timestamp || parseTimestamp(item.date);
  if (!ts) return { label: item.date || '最新', isNew: false };

  const diffHours = Math.floor((Date.now() - ts) / (1000 * 60 * 60));
  const d = new Date(ts);
  const dateFormatted = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

  if (diffHours >= 0 && diffHours < 24) {
    return { label: `${Math.max(1, diffHours)}時間前 (${dateFormatted})`, isNew: true };
  }
  if (diffHours >= 24 && diffHours < 72) {
    return { label: `${Math.floor(diffHours / 24)}日前 (${dateFormatted})`, isNew: true };
  }
  return { label: dateFormatted, isNew: false };
}

function mergeAndSaveTimeline(newItems) {
  let savedItems = [];
  try {
    savedItems = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || '[]');
  } catch (e) {}

  const map = new Map();

  [...savedItems, ...newItems].forEach(item => {
    if (!item || !item.title || !item.link) return;
    const cleanTitle = item.title.trim();
    const key = cleanTitle.slice(0, 45);
    const ts = item.timestamp || parseTimestamp(item.date) || Date.now();
    const id = item.id || generateArticleId(cleanTitle);
    const cat = cleanCategoryName(item.category);

    const existing = map.get(key);
    if (!existing || (item.ai_summary && !existing.ai_summary)) {
      const normalizedItem = {
        ...item,
        id,
        category: cat,
        title: cleanTitle,
        timestamp: ts,
        date: item.date || new Date(ts).toLocaleDateString('ja-JP'),
        ai_comment: item.ai_comment || generateShortComment(cleanTitle, cat)
      };
      normalizedItem.ai_summary = generateLongSummary(normalizedItem);
      map.set(key, normalizedItem);
    }
  });

  const merged = Array.from(map.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 200);

  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {}

  return merged;
}

function parseRssItemsFromXml(rawText, category) {
  const items = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(rawText)) !== null && items.length < 8) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

    if (titleMatch && linkMatch) {
      const cleanTitle = decodeEntities(titleMatch[1].trim()).replace(/\s*-\s*[^-]+$/, '');
      const pubDateStr = dateMatch ? dateMatch[1].trim() : '';
      const ts = parseTimestamp(pubDateStr) || Date.now();
      const baseItem = {
        id: generateArticleId(cleanTitle),
        category,
        title: cleanTitle,
        link: linkMatch[1].trim(),
        date: new Date(ts).toLocaleDateString('ja-JP'),
        timestamp: ts,
        ai_comment: generateShortComment(cleanTitle, category)
      };
      baseItem.ai_summary = generateLongSummary(baseItem);
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
      return d.items.slice(0, 8).map(i => {
        const cleanTitle = decodeEntities((i.title || '').replace(/\s*-\s*[^-]+$/, ''));
        const ts = parseTimestamp(i.pubDate) || Date.now();
        const baseItem = {
          id: generateArticleId(cleanTitle),
          category: catConfig.category,
          title: cleanTitle,
          link: i.link,
          date: new Date(ts).toLocaleDateString('ja-JP'),
          timestamp: ts,
          ai_comment: generateShortComment(cleanTitle, catConfig.category)
        };
        baseItem.ai_summary = generateLongSummary(baseItem);
        return baseItem;
      });
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

// シェア用の記事固有URLを作成（どこからシェアしてもその記事モーダルが直接開く）
function getShareableArticleUrl(articleId) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?article=${encodeURIComponent(articleId)}`;
}

// 詳細モーダル（AI長文要約＋X発信＋URLコピー）をDOMに用意
function ensureArticleModal() {
  if (document.getElementById('ai-article-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'ai-article-modal';
  modal.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 relative animate-fadeIn" onclick="event.stopPropagation()">
      <!-- 閉じるボタン -->
      <button onclick="window.closeArticleModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition cursor-pointer">
        ✕
      </button>

      <!-- カテゴリ＆日付 -->
      <div class="flex items-center space-x-2 mb-3">
        <span id="modal-article-cat" class="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100"></span>
        <span id="modal-article-date" class="text-xs font-mono text-slate-400"></span>
      </div>

      <!-- タイトル -->
      <h2 id="modal-article-title" class="text-base sm:text-xl font-extrabold text-slate-900 leading-snug mb-5"></h2>

      <!-- AI長文要約セクション -->
      <div class="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/80 mb-6">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/70">
          <span class="text-xs font-extrabold text-indigo-600 tracking-wide">AI独自解説・アクションプラン</span>
          <span class="text-[11px] text-slate-400">Atrium Deep Summary</span>
        </div>
        <div id="modal-article-summary" class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"></div>
      </div>

      <!-- シェア＆アクションボタン群 -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div class="flex items-center gap-2">
          <a id="modal-x-share" href="#" target="_blank" rel="noopener noreferrer" class="flex-1 sm:flex-initial inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">
            Xでこの記事を発信
          </a>
          <button id="modal-copy-url" type="button" class="flex-1 sm:flex-initial inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer">
            URLをコピー
          </button>
        </div>

        <a id="modal-original-link" href="#" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-2xs">
          元記事・募集ページへ進む →
        </a>
      </div>
    </div>
  `;

  modal.addEventListener('click', () => window.closeArticleModal());
  document.body.appendChild(modal);
}

// 記事をタップしたときにAI要約モーダルを開く関数
window.openArticleModal = function(articleId) {
  ensureArticleModal();
  const item = aiNewsCache.find(i => i.id === articleId);
  if (!item) return;

  const modal = document.getElementById('ai-article-modal');
  const timeInfo = formatTimelineDate(item);
  const shareUrl = getShareableArticleUrl(item.id);
  const longSummary = generateLongSummary(item);

  document.getElementById('modal-article-cat').textContent = item.category;
  document.getElementById('modal-article-date').textContent = timeInfo.label;
  document.getElementById('modal-article-title').textContent = item.title;
  document.getElementById('modal-article-summary').textContent = longSummary;
  document.getElementById('modal-original-link').href = item.link;

  // 公式Xでもそのまま発信しやすいポスト文面を自動生成
  const xText = `【${item.category}｜最新ニュース】\n${item.title}\n\n💡 AI要約：${(item.ai_comment || '').slice(0, 75)}...\n\n▼AI詳細解説・記事はこちら\n`;
  const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(shareUrl)}`;
  document.getElementById('modal-x-share').href = xIntentUrl;

  // URLコピーボタンの動作
  const copyBtn = document.getElementById('modal-copy-url');
  copyBtn.textContent = 'URLをコピー';
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copyBtn.textContent = 'コピーしました！';
      setTimeout(() => { copyBtn.textContent = 'URLをコピー'; }, 2000);
    } catch (e) {
      prompt('以下のURLをコピーしてください:', shareUrl);
    }
  };

  // アドレスバーのURLも記事固有URLに更新（そのままブラウザのURLをコピーしてもシェア可能に）
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

// URLに ?article=xxx がついている場合（Xのリンクから踏まれた時）、自動でその記事のAI要約モーダルを開く
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

  try {
    const cachedTimeline = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || '[]');
    if (cachedTimeline.length > 0) {
      aiNewsCache = cachedTimeline;
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
        timestamp: item.timestamp || parseTimestamp(item.date) || (Date.now() - 86400000 * 2)
      }));
      aiNewsCache = mergeAndSaveTimeline(staticItems);
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
        updatedEl.innerText = `タイムライン自動更新: 本日 ${nowStr} （蓄積記事: ${aiNewsCache.length}件）`;
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
  displayCount = 12;
  document.querySelectorAll('.news-tab').forEach(b => {
    b.className = 'news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer';
  });
  if (btn) {
    btn.className = 'news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer';
  }
  renderAiNews();
}

window.loadMoreTimelineNews = function() {
  displayCount += 12;
  renderAiNews();
};

function renderAiNews() {
  const grid = document.getElementById('ai-news-grid');
  if (!grid) return;

  let list = aiNewsCache;
  if (currentNewsCat !== 'all') {
    list = list.filter(item => (item.category || '').includes(currentNewsCat));
  }

  const totalMatching = list.length;
  const maxToShow = newsLimitCount ? newsLimitCount : displayCount;
  const visibleList = list.slice(0, maxToShow);

  if (visibleList.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-8 text-xs text-slate-400">最新の募集・イベント情報を取得しています...</div>`;
    return;
  }

  const cardsHtml = visibleList.map(item => {
    const timeInfo = formatTimelineDate(item);
    const newBadge = timeInfo.isNew
      ? `<span class="text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">NEW</span>`
      : '';

    return `
      <div onclick="window.openArticleModal('${escapeHTML(item.id)}')" class="bg-slate-50/80 hover:bg-indigo-50/40 p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition flex flex-col justify-between group cursor-pointer">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center space-x-1.5">
              <span class="text-[11px] font-bold bg-white text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">${escapeHTML(item.category)}</span>
              ${newBadge}
            </div>
            <span class="text-[10px] font-mono text-slate-400">${escapeHTML(timeInfo.label)}</span>
          </div>
          <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition leading-snug mb-2.5">
            ${escapeHTML(item.title)}
          </h3>
          <div class="bg-white p-3 rounded-xl border border-slate-200/70 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            <span class="font-bold text-indigo-600">AI要点：</span>${escapeHTML(item.ai_comment || '')}
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
          <span class="text-[10px] font-bold text-slate-400">タップしてAI詳細要約＆シェア</span>
          <span class="text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition">AI解説を読む →</span>
        </div>
      </div>
    `;
  }).join('');

  const hasMore = !newsLimitCount && totalMatching > maxToShow;
  const loadMoreHtml = hasMore
    ? `<div class="col-span-full text-center pt-4">
         <button onclick="window.loadMoreTimelineNews()" class="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-6 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer shadow-2xs">
           過去のタイムラインをもっと見る（残り ${totalMatching - maxToShow} 件）
         </button>
       </div>`
    : '';

  grid.innerHTML = cardsHtml + loadMoreHtml;
}
