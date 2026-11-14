let aiNewsCache = [];
let currentNewsCat = 'all';
let newsLimitCount = null;
let displayCount = 12; // タイムラインで最初に表示する件数（「もっと見る」で増える）

const ARCHIVE_STORAGE_KEY = 'atrium_career_news_timeline_v1';

// 目先の「インターン募集開始・ワークショップ・選考イベント」を狙い撃ちする検索クエリ
const LIVE_CAREER_QUERIES = [
  {
    category: 'インターン',
    query: '("インターン" OR "サマーインターン" OR "ウィンターインターン") AND ("募集" OR "エントリー" OR "開始" OR "締切") when:14d'
  },
  {
    category: '外資・商社',
    query: '("外資" OR "総合商社" OR "コンサル" OR "投資銀行" OR "マッキンゼー" OR "ゴールドマン" OR "三菱商事" OR "三井物産") AND ("新卒" OR "インターン" OR "採用" OR "選考" OR "説明会") when:14d'
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

// 記事タイトルとカテゴリから、目先のアクションにつながる解説コメントを自動生成
function generateActionComment(title, category) {
  if (/締切|締め切り|まもなく|最終/.test(title)) {
    return 'エントリー締切が迫っている可能性があります。募集要項と提出期限（日本時間/現地時間）を早めに確認しておきましょう。';
  }
  if (/ワークショップ|セミナー|説明会|イベント|フォーラム/.test(title)) {
    return '企業や選考のリアルな情報が得られるイベント・ワークショップ情報です。オンライン参加の可否や予約枠を早めにチェックするのがおすすめです。';
  }
  if (category === 'インターン' || /インターン/.test(title)) {
    return 'インターンシップの募集・開催に関する最新動向です。早期選考ルートや優遇枠に直結するケースが多いため、対象条件を確認してみてください。';
  }
  if (category === '外資・商社') {
    return '外資系企業・総合商社・難関業界に関する採用・選考トピックです。グローバル経験や語学力を活かせるポジションがないか要チェックです。';
  }
  if (category === 'ボスキャリ') {
    return '海外大生・留学生向けの採用イベントやグローバル選考に関する動きです。事前応募やレジュメ準備のスケジュールに役立てましょう。';
  }
  return '直近の採用イベント・募集・キャリア形成に関わる最新ニュースです。早めの情報収集とエントリー準備に活用してください。';
}

// 記事の日付をパースしてミリ秒タイムスタンプを取得（ソート用）
function parseTimestamp(dateStr) {
  if (!dateStr) return 0;
  const normalized = String(dateStr).replace(/\./g, '/').replace(/年|月/g, '/').replace(/日/g, '');
  const t = new Date(normalized).getTime();
  return isNaN(t) ? 0 : t;
}

// タイムライン用の相対時間＆日付フォーマット
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

// 既存のタイムライン履歴と新しい記事リストを重複なくマージし、新しい順に並べる関数
function mergeAndSaveTimeline(newItems) {
  let savedItems = [];
  try {
    savedItems = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || '[]');
  } catch (e) {}

  const map = new Map();

  // 既存アーカイブと新着データを統合（同じタイトルやURLは上書き・重複排除）
  [...savedItems, ...newItems].forEach(item => {
    if (!item || !item.title || !item.link) return;
    const cleanTitle = item.title.trim();
    const key = cleanTitle.slice(0, 45); // タイトル先頭で重複判定
    const ts = item.timestamp || parseTimestamp(item.date) || Date.now();

    const existing = map.get(key);
    if (!existing || (item.ai_comment && !existing.isStaticJson)) {
      map.set(key, {
        ...item,
        title: cleanTitle,
        timestamp: ts,
        date: item.date || new Date(ts).toLocaleDateString('ja-JP')
      });
    }
  });

  // 新しい順（タイムライン順）にソートして最大200件まで蓄積保存
  const merged = Array.from(map.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 200);

  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {}

  return merged;
}

// XMLテキストからRSSアイテムを抽出
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
      items.push({
        category,
        title: cleanTitle,
        link: linkMatch[1].trim(),
        date: new Date(ts).toLocaleDateString('ja-JP'),
        timestamp: ts,
        ai_comment: generateActionComment(cleanTitle, category)
      });
    }
  }
  return items;
}

// 複数プロキシで単一カテゴリの最新募集・イベントニュースを取得
async function fetchCategoryLiveNews(catConfig) {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(catConfig.query)}&hl=ja&gl=JP&ceid=JP:ja`;

  const p1 = fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
    .then(r => r.json())
    .then(d => {
      if (!d.items || d.items.length === 0) throw new Error();
      return d.items.slice(0, 8).map(i => {
        const cleanTitle = decodeEntities((i.title || '').replace(/\s*-\s*[^-]+$/, ''));
        const ts = parseTimestamp(i.pubDate) || Date.now();
        return {
          category: catConfig.category,
          title: cleanTitle,
          link: i.link,
          date: new Date(ts).toLocaleDateString('ja-JP'),
          timestamp: ts,
          ai_comment: generateActionComment(cleanTitle, catConfig.category)
        };
      });
    });

  const p2 = fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`)
    .then(r => { if (!r.ok) throw new Error(); return r.text(); })
    .then(text => {
      const parsed = parseRssItemsFromXml(text, catConfig.category);
      if (parsed.length === 0) throw new Error();
      return parsed;
    });

  const p3 = fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`)
    .then(r => { if (!r.ok) throw new Error(); return r.text(); })
    .then(text => {
      const parsed = parseRssItemsFromXml(text, catConfig.category);
      if (parsed.length === 0) throw new Error();
      return parsed;
    });

  try {
    return await Promise.any([p1, p2, p3]);
  } catch (e) {
    return [];
  }
}

async function loadAiNews(limit = null) {
  newsLimitCount = limit;

  // 1. まずローカルに蓄積されているタイムライン履歴があれば即座に表示（待ち時間ゼロ）
  try {
    const cachedTimeline = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || '[]');
    if (cachedTimeline.length > 0) {
      aiNewsCache = cachedTimeline;
      renderAiNews();
    }
  } catch (e) {}

  // 2. news.json（既存・過去ログデータ）を取得してタイムラインに統合
  try {
    const res = await fetch('news.json?v=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      const staticItems = (data.items || []).map(item => ({
        ...item,
        isStaticJson: true,
        timestamp: parseTimestamp(item.date) || (Date.now() - 86400000 * 3)
      }));
      aiNewsCache = mergeAndSaveTimeline(staticItems);
      renderAiNews();
    }
  } catch (e) {
    console.log('news.json standby');
  }

  // 3. 最新のインターン募集・説明会・ワークショップ情報をライブ取得してタイムライン先頭に追加！
  try {
    const results = await Promise.all(LIVE_CAREER_QUERIES.map(q => fetchCategoryLiveNews(q)));
    const liveItems = results.flat();
    if (liveItems.length > 0) {
      aiNewsCache = mergeAndSaveTimeline(liveItems);
      const updatedEl = document.getElementById('ai-news-updated');
      if (updatedEl) {
        const nowStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        updatedEl.innerText = `タイムライン自動更新: 本日 ${nowStr} （過去ログ蓄積数: ${aiNewsCache.length}件）`;
      }
      renderAiNews();
    }
  } catch (e) {
    console.warn('Live career news update skipped:', e);
  }
}

function filterAiNews(cat, btn) {
  currentNewsCat = cat;
  displayCount = 12; // タブ切り替え時は表示件数をリセット
  document.querySelectorAll('.news-tab').forEach(b => {
    b.className = 'news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer';
  });
  if (btn) {
    btn.className = 'news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer';
  }
  renderAiNews();
}

// 「もっと見る」ボタンで過去のタイムラインを展開する関数
window.loadMoreTimelineNews = function() {
  displayCount += 12;
  renderAiNews();
};

function renderAiNews() {
  const grid = document.getElementById('ai-news-grid');
  if (!grid) return;

  let list = aiNewsCache;
  if (currentNewsCat !== 'all') {
    list = list.filter(item => item.category === currentNewsCat);
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
      <a href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer" class="bg-slate-50/80 hover:bg-indigo-50/40 p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition flex flex-col justify-between group">
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
            <span class="font-bold text-indigo-600">ポイント：</span>${escapeHTML(item.ai_comment || '')}
          </div>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
          <span class="text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition">募集・記事の詳細を見る →</span>
        </div>
      </a>
    `;
  }).join('');

  // トップページ等の件数制限（newsLimitCount）がない場合は、下部に「過去のタイムラインをもっと見る」ボタンを表示
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