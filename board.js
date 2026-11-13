const SUPABASE_REST_URL = 'https://nccmmvoeuhwlgwfxdhsq.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY21tdm9ldWh3bGd3ZnhkaHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1MTk0NTIsImV4cCI6MjExMDA5NTQ1Mn0.jnXopufuqaCLTirq6Od1-EMagcv1TwNNZvx1L6fh8Ps';

const supabaseHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

let allThreads = [];
let activeThreadId = null;
let currentBoardCat = 'all';
let lastPostTime = 0;
let showOnlyBookmarks = false; // ブックマークフィルター用

function getDailyUserId() {
  let seed = localStorage.getItem('ri_user_seed');
  if (!seed) {
    seed = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('ri_user_seed', seed);
  }
  const today = new Date().toISOString().slice(0, 10);
  const raw = seed + today;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';
  let id = '';
  let num = Math.abs(hash) + 12345678;
  for (let i = 0; i < 8; i++) {
    id += chars[num % chars.length];
    num = Math.floor(num / 3) + i * 17;
  }
  return id;
}

function formatThreadBody(text, threadId) {
  const escaped = escapeHTML(text);
  return escaped.replace(/&gt;&gt;(\d+)/g, (match, num) => {
    return `<span class="anchor-link" onclick="previewAnchor('${threadId}', ${num})" title=">>${num} のレスを見る">&gt;&gt;${num}</span>`;
  });
}

function previewAnchor(threadId, resNum) {
  const thread = allThreads.find(t => String(t.id) === String(threadId));
  if (!thread) return;
  let targetText = '';
  if (resNum === 1) {
    targetText = `1: ${thread.author} [${formatThreadDate(thread.created_at)}]\n${thread.body}`;
  } else {
    const reply = (thread.replies || [])[resNum - 2];
    if (!reply) {
      alert(`>>${resNum} はまだ存在しません。`);
      return;
    }
    targetText = `${resNum}: ${reply.author} [${formatThreadDate(reply.created_at)}]\n${reply.body}`;
  }
  alert(targetText);
}

function insertAnchor(resNum) {
  const textarea = document.getElementById('thread-reply-body');
  if (!textarea) return;
  textarea.value += (textarea.value && !textarea.value.endsWith('\n') ? '\n' : '') + `>>${resNum}\n`;
  textarea.focus();
}

async function fetchThreads() {
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/community_posts?select=*,community_replies(*)&order=created_at.desc`, {
      headers: supabaseHeaders
    });
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    allThreads = (data || []).map(post => {
      const replies = (post.community_replies || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const nonSageReplies = replies.filter(r => !String(r.author || '').includes('[sage]'));
      const lastBump = nonSageReplies.length > 0
        ? nonSageReplies[nonSageReplies.length - 1].created_at
        : post.created_at;
      return { ...post, replies, lastBump };
    });

    const params = new URLSearchParams(window.location.search);
    const paramThread = params.get('thread') || params.get('post');
    if (paramThread && allThreads.some(t => String(t.id) === String(paramThread))) {
      activeThreadId = paramThread;
    }

    renderBoard();
  } catch (e) {
    console.error(e);
    const root = document.getElementById('board-root');
    if (root) {
      root.innerHTML = `<div class="p-6 text-center text-xs text-rose-600">掲示板データの読み込みに失敗しました。再読み込みしてください。</div>`;
    }
  }
}

function setBoardCat(cat, btn) {
  currentBoardCat = cat;
  activeThreadId = null;
  document.querySelectorAll('.board-cat-btn').forEach(b => {
    b.className = 'board-cat-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer';
  });
  btn.className = 'board-cat-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer';
  renderBoard();
}

function openThread(id) {
  activeThreadId = id;
  const url = new URL(window.location);
  url.searchParams.set('thread', id);
  window.history.pushState({}, '', url);
  renderBoard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToThreadList() {
  activeThreadId = null;
  const url = new URL(window.location);
  url.searchParams.delete('thread');
  url.searchParams.delete('post');
  window.history.pushState({}, '', url);
  renderBoard();
}

// --- ブックマーク機能のロジック ---
function getBookmarks() {
  const saved = localStorage.getItem('ryugaku_bookmarks');
  return saved ? JSON.parse(saved) : [];
}

function checkIsBookmarked(id) {
  return getBookmarks().includes(id);
}

function toggleBookmark(id, event) {
  event.stopPropagation();
  let bookmarks = getBookmarks();
  if (bookmarks.includes(id)) {
    bookmarks = bookmarks.filter(bId => bId !== id);
  } else {
    bookmarks.push(id);
  }
  localStorage.setItem('ryugaku_bookmarks', JSON.stringify(bookmarks));
  renderBoard();
}

function toggleBookmarkFilter(btn) {
  showOnlyBookmarks = !showOnlyBookmarks;
  renderBoard();
}

function filterBoardThreads() {
  renderBoard();
}

function renderBoard() {
  const root = document.getElementById('board-root');
  if (!root) return;

  // 1. スレッド詳細画面を開いている場合
  if (activeThreadId) {
    const t = allThreads.find(item => String(item.id) === String(activeThreadId));
    if (!t) {
      activeThreadId = null;
      renderBoard();
      return;
    }

    const totalRes = 1 + (t.replies || []).length;
    const shareUrl = `${SITE_BASE_URL}board.html?thread=${encodeURIComponent(t.id)}`;
    const isBookmarked = checkIsBookmarked(t.id);

    const repliesHtml = (t.replies || []).map((r, idx) => {
      const resNum = idx + 2;
      const rawAuthor = r.author || '名無しの海外大生';
      const displayAuthor = rawAuthor.replace('[sage]', '').trim() || '名無しの海外大生';
      return `
        <div class="py-3.5 border-b border-slate-200/80">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-1.5">
            <button onclick="insertAnchor(${resNum})" class="font-extrabold text-indigo-700 hover:underline cursor-pointer">${resNum}</button>
            <span class="font-bold text-emerald-800">${escapeHTML(displayAuthor)}</span>
            <span class="text-[11px] text-slate-500">${formatThreadDate(r.created_at)}</span>
            <button onclick="insertAnchor(${resNum})" class="text-[10px] bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 px-1.5 py-0.5 rounded cursor-pointer">返信(&gt;&gt;${resNum})</button>
          </div>
          <div class="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line pl-2">${formatThreadBody(r.body, t.id)}</div>
        </div>
      `;
    }).join('');

    root.innerHTML = `
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <button onclick="backToThreadList()" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3.5 py-2 rounded-xl cursor-pointer">
          ← スレッド一覧に戻る
        </button>
        <div class="flex items-center gap-2">
          <button onclick="toggleBookmark('${t.id}', event)" class="text-xs font-bold px-3.5 py-2 rounded-xl border transition cursor-pointer ${isBookmarked ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}">
            ${isBookmarked ? '★ 保存済み' : '☆ スレッドを保存'}
          </button>
          <button onclick="fetchThreads()" class="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl cursor-pointer">🔄 更新</button>
          <button onclick="shareSite('${shareUrl}', '${escapeHTML(t.title)}｜RyugakuIntern')" class="text-xs font-bold bg-slate-900 text-white px-3.5 py-2 rounded-xl cursor-pointer">🔗 共有</button>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div class="pb-4 border-b border-slate-200">
          <span class="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">${escapeHTML(t.tag)}</span>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">${escapeHTML(t.title)} <span class="text-slate-400 font-normal text-sm">(${totalRes})</span></h2>
        </div>

        <div class="py-4 border-b border-slate-200">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-1.5">
            <button onclick="insertAnchor(1)" class="font-extrabold text-indigo-700 hover:underline cursor-pointer">1</button>
            <span class="font-bold text-emerald-800">${escapeHTML(t.author)}</span>
            ${t.uni ? `<span class="text-[11px] text-slate-500">(${escapeHTML(t.uni)})</span>` : ''}
            <span class="text-[11px] text-slate-500">${formatThreadDate(t.created_at)}</span>
            <button onclick="insertAnchor(1)" class="text-[10px] bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 px-1.5 py-0.5 rounded cursor-pointer">返信(&gt;&gt;1)</button>
          </div>
          <div class="text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-line pl-2">${formatThreadBody(t.body, t.id)}</div>
        </div>

        <div>${repliesHtml || '<p class="py-6 text-center text-xs text-slate-400">まだレスがありません。最初の書き込みをどうぞ。</p>'}</div>

        <form onsubmit="submitThreadReply(event, '${t.id}')" class="mt-6 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-extrabold text-slate-800">書き込む</span>
            <span class="text-[11px] text-slate-500 font-mono">ID: ${getDailyUserId()}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input type="text" id="thread-reply-author" placeholder="名前（省略可：名無しの海外大生）" class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <label class="flex items-center space-x-2 text-xs text-slate-600 px-2">
              <input type="checkbox" id="thread-reply-sage" class="rounded text-indigo-600">
              <span><strong>sage</strong>（スレッドを上げずに書き込む）</span>
            </label>
          </div>
          <textarea id="thread-reply-body" rows="4" placeholder="コメント内容（>>1 のように番号を書くとアンカーになります）" required class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          <div class="flex justify-end">
            <button type="submit" id="reply-submit-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer">書き込む</button>
          </div>
        </form>
      </div>
    `;
    return;
  }

  // 2. スレッド一覧画面の場合（検索窓やブックマーク一覧を綺麗に1つに統合）
  // 既存の入力値やフォーカスが外れないよう、現在の入力欄からキーワードを安全に取得
  const existingInput = document.getElementById('board-search');
  const keyword = existingInput ? existingInput.value.toLowerCase() : '';
  const bookmarks = getBookmarks();

  let list = [...allThreads];

  // A. ブックマークフィルター
  if (showOnlyBookmarks) {
    list = list.filter(t => bookmarks.includes(t.id));
  }

  // B. カテゴリフィルター
  if (currentBoardCat !== 'all') {
    list = list.filter(t => t.tag === currentBoardCat);
  }

  // C. キーワード検索
  if (keyword) {
    list = list.filter(t => {
      const matchTitle = t.title.toLowerCase().includes(keyword);
      const matchBody = t.body.toLowerCase().includes(keyword);
      const matchTag = t.tag.toLowerCase().includes(keyword);
      const matchUni = (t.uni || '').toLowerCase().includes(keyword);
      return matchTitle || matchBody || matchTag || matchUni;
    });
  }

  list.sort((a, b) => new Date(b.lastBump) - new Date(a.lastBump));

  const listRows = list.map((t, idx) => {
    const resCount = 1 + (t.replies || []).length;
    const isBookmarked = bookmarks.includes(t.id);
    return `
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 hover:bg-slate-50 transition">
        <div onclick="openThread('${t.id}')" class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer pr-3">
          <span class="text-xs font-mono font-bold text-slate-400 shrink-0">${idx + 1}</span>
          <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded shrink-0">${escapeHTML(t.tag)}</span>
          <span class="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-indigo-600">${escapeHTML(t.title)} <span class="text-slate-400 font-semibold">(${resCount})</span></span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <button onclick="toggleBookmark('${t.id}', event)" class="text-xs p-1 rounded transition cursor-pointer ${isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}" title="${isBookmarked ? '保存済み' : '保存する'}">
            ${isBookmarked ? '★' : '☆'}
          </button>
          <span class="text-[11px] text-slate-400 hidden sm:inline">${formatRelativeTime(t.lastBump)}</span>
        </div>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="flex flex-col sm:flex-row gap-3 mb-4 items-stretch sm:items-center justify-between">
      <div class="relative flex-1">
        <input type="text" id="board-search" value="${escapeHTML(keyword)}" placeholder="キーワードでスレッドを検索（例：ボスキャリ、ビザ、寮）" oninput="filterBoardThreads()" class="w-full px-3.5 py-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs">
        <span class="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
      </div>
      <button onclick="toggleBookmarkFilter(this)" id="bookmark-filter-btn" class="px-4 py-2.5 ${showOnlyBookmarks ? 'bg-amber-50 border border-amber-300 text-amber-800' : 'bg-white border border-slate-200 hover:border-indigo-300 text-slate-700'} text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
        ${showOnlyBookmarks ? '★ 保存済みを表示中（解除）' : '☆ 保存済みスレッドを見る'}
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center text-xs font-bold">
        <span>スレッド一覧（最新レス順）</span>
        <span>全 ${list.length} スレ</span>
      </div>
      <div>
        ${listRows || '<div class="p-8 text-center text-xs text-slate-400">該当するスレッドが見つかりませんでした。</div>'}
      </div>
    </div>
  `;

  // 入力中にフォーカスが外れないよう、再描画後にカーソル位置を末尾に戻す
  const newInput = document.getElementById('board-search');
  if (newInput && keyword) {
    newInput.focus();
    newInput.setSelectionRange(newInput.value.length, newInput.value.length);
  }
}

async function submitNewThread(event) {
  event.preventDefault();
  const now = Date.now();
  if (now - lastPostTime < 10000) {
    alert('連投防止のため10秒ほど空けてください。');
    return;
  }
  const btn = document.getElementById('new-thread-btn');
  btn.disabled = true;
  btn.innerText = '作成中...';

  const rawName = document.getElementById('new-author').value.trim() || '名無しの海外大生';
  const authorWithId = `${rawName} ID:${getDailyUserId()}`;

  const payload = {
    author: authorWithId,
    uni: document.getElementById('new-uni').value.trim(),
    tag: document.getElementById('new-tag').value,
    title: document.getElementById('new-title').value.trim(),
    body: document.getElementById('new-body').value.trim(),
    likes: 1
  };

  try {
    const res = await fetch(`${SUPABASE_REST_URL}/community_posts`, {
      method: 'POST',
      headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Create failed');
    const created = await res.json();
    lastPostTime = now;
    event.target.reset();
    document.getElementById('new-thread-box').classList.add('hidden');
    await fetchThreads();
    if (created && created[0]) openThread(created[0].id);
  } catch (e) {
    alert('スレッド作成に失敗しました。');
  } finally {
    btn.disabled = false;
    btn.innerText = '新規スレッドを作成する';
  }
}

async function submitThreadReply(event, threadId) {
  event.preventDefault();
  const btn = document.getElementById('reply-submit-btn');
  btn.disabled = true;
  btn.innerText = '送信中...';

  const rawName = document.getElementById('thread-reply-author').value.trim() || '名無しの海外大生';
  const isSage = document.getElementById('thread-reply-sage').checked;
  const author = `${rawName} ID:${getDailyUserId()}${isSage ? ' [sage]' : ''}`;
  const body = document.getElementById('thread-reply-body').value.trim();

  try {
    const res = await fetch(`${SUPABASE_REST_URL}/community_replies`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify({ post_id: threadId, author, body })
    });
    if (!res.ok) throw new Error('Reply failed');
    await fetchThreads();
  } catch (e) {
    alert('書き込みに失敗しました。');
  } finally {
    btn.disabled = false;
    btn.innerText = '書き込む';
  }
}