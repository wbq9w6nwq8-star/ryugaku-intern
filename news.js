let aiNewsCache = [];
let currentNewsCat = 'all';
let newsLimitCount = null;

async function loadAiNews(limit = null) {
  newsLimitCount = limit;
  try {
    const res = await fetch('news.json?v=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    aiNewsCache = data.items || [];
    const updatedEl = document.getElementById('ai-news-updated');
    if (updatedEl && data.updated_at) {
      updatedEl.innerText = `最終AI更新: ${data.updated_at}`;
    }
    renderAiNews();
  } catch (e) {
    console.log('news.json standby');
  }
}

function filterAiNews(cat, btn) {
  currentNewsCat = cat;
  document.querySelectorAll('.news-tab').forEach(b => {
    b.className = 'news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer';
  });
  btn.className = 'news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer';
  renderAiNews();
}

function renderAiNews() {
  const grid = document.getElementById('ai-news-grid');
  if (!grid) return;

  let list = aiNewsCache;
  if (currentNewsCat !== 'all') {
    list = list.filter(item => item.category === currentNewsCat);
  }
  if (newsLimitCount) {
    list = list.slice(0, newsLimitCount);
  }

  if (list.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-8 text-xs text-slate-400">AI厳選ニュースを読み込み中、または該当記事がありません。</div>`;
    return;
  }

  grid.innerHTML = list.map(item => `
    <a href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer" class="bg-slate-50/80 hover:bg-indigo-50/40 p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition flex flex-col justify-between group">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[11px] font-bold bg-white text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">${escapeHTML(item.category)}</span>
          <span class="text-[10px] text-slate-400">${escapeHTML(item.date || '')}</span>
        </div>
        <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition leading-snug mb-2.5">
          ${escapeHTML(item.title)}
        </h3>
        <div class="bg-white p-3 rounded-xl border border-slate-200/70 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
          <span class="font-bold text-indigo-600">🤖 AI視点：</span>${escapeHTML(item.ai_comment)}
        </div>
      </div>
      <div class="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
        <span class="text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition">元記事を読む ↗</span>
      </div>
    </a>
  `).join('');
}