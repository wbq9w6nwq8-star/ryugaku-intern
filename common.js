const SITE_BASE_URL = 'https://ryugaku-intern.com/';

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

function formatRelativeTime(isoString) {
  if (!isoString) return 'たった今';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return 'たった今';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}時間前`;
  return `${Math.floor(diffSec / 86400)}日前`;
}

function formatThreadDate(isoString) {
  const d = isoString ? new Date(isoString) : new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const day = days[d.getDay()];
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}(${day}) ${hh}:${min}:${ss}`;
}

function shareSite(url, titleText) {
  if (navigator.share) {
    navigator.share({ title: titleText, text: titleText, url: url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      alert(`共有用URLをコピーしました！\nLINE・Discord・インスタDM等にそのまま貼れます：\n\n${url}`);
    }).catch(() => {
      prompt('以下のURLをコピーして共有してください：', url);
    });
  }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const current = path.includes('board') ? 'board' : path.includes('news') ? 'news' : 'home';

  const navClass = (name) =>
    current === name
      ? 'text-xs lg:text-sm font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg transition'
      : 'text-xs lg:text-sm font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg transition';

  const headerContainer = document.getElementById('common-header');
  if (headerContainer) {
    headerContainer.innerHTML = `
      <header class="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-2">
          <a href="index.html" class="flex items-center space-x-2.5 group">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition">R</div>
            <div class="flex items-center space-x-2">
              <span class="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">RyugakuIntern</span>
              <span class="text-[10px] uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full font-bold">Beta</span>
            </div>
          </a>

          <nav class="flex items-center space-x-1 sm:space-x-2 order-3 sm:order-2 w-full sm:w-auto justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <a href="index.html" class="${navClass('home')}">🏠 求人・トップ</a>
            <a href="board.html" class="${navClass('board')}">💬 匿名掲示板</a>
            <a href="news.html" class="${navClass('news')}">🤖 AI就活ニュース</a>
          </nav>

          <div class="flex items-center space-x-2 order-2 sm:order-3">
            <button onclick="shareSite('https://ryugaku-intern.com/', 'RyugakuIntern | 海外大生のための匿名情報交換ボード＆短期インターン')" title="サイトURLをシェア" class="text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer">
              🔗 共有
            </button>
            <a href="https://tally.so/r/gbeey4" target="_blank" rel="noopener noreferrer" class="hidden md:inline-flex items-center text-xs bg-slate-900 text-white px-3.5 py-2 rounded-xl font-semibold hover:bg-indigo-600 shadow-sm transition">
              企業向け：無料掲載
            </a>
          </div>
        </div>
      </header>
    `;
  }

  const footerContainer = document.getElementById('common-footer');
  if (footerContainer) {
    footerContainer.innerHTML = `
      <footer class="border-t border-slate-200 bg-white py-10 text-xs text-slate-500 mt-auto">
        <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div class="text-center sm:text-left space-y-1">
            <div class="flex items-center justify-center sm:justify-start space-x-2">
              <span class="font-extrabold text-slate-900 text-sm">RyugakuIntern</span>
              <span>— 海外大生特化の匿名掲示板＆短期・リモート求人</span>
            </div>
            <p class="text-[11px] text-slate-400">© 2026 RyugakuIntern Project. All rights reserved.</p>
          </div>
          <div class="flex flex-wrap gap-4 sm:gap-6 justify-center items-center">
            <a href="index.html" class="hover:text-slate-900 transition">トップ</a>
            <a href="board.html" class="hover:text-slate-900 transition">匿名掲示板</a>
            <a href="news.html" class="hover:text-slate-900 transition">AIニュース</a>
            <button onclick="openModal('info-modal')" class="hover:text-slate-900 transition cursor-pointer">運営概要</button>
            <button onclick="openModal('privacy-modal')" class="hover:text-slate-900 transition cursor-pointer">プライバシーポリシー</button>
            <a href="https://x.com/ryugakuintern" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1 text-slate-700 font-semibold hover:text-indigo-600 transition">
              <span>公式X</span>
            </a>
          </div>
        </div>
      </footer>

      <div id="info-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden items-center justify-center p-4" onclick="closeModal('info-modal')">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200" onclick="event.stopPropagation()">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900">運営概要 (Project Info)</h3>
            <button onclick="closeModal('info-modal')" class="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 cursor-pointer">×</button>
          </div>
          <div class="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p><strong>プロジェクト名：</strong>RyugakuIntern（留学インターン）</p>
            <p><strong>運営主体：</strong>RyugakuIntern 運営事務局（現役英国正規留学生によるプロジェクト）</p>
            <p><strong>事業内容：</strong>海外大生・バイリンガル学生向けの匿名情報交換コミュニティ運営および短期インターン・リモート求人情報の掲載</p>
            <p><strong>連絡先メールアドレス：</strong><a href="mailto:ryugakuintern.official@gmail.com" class="text-indigo-600 underline">ryugakuintern.official@gmail.com</a></p>
            <p><strong>公式SNS：</strong><a href="https://x.com/ryugakuintern" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline">https://x.com/ryugakuintern</a></p>
          </div>
        </div>
      </div>

      <div id="privacy-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden items-center justify-center p-4" onclick="closeModal('privacy-modal')">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200" onclick="event.stopPropagation()">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900">プライバシーポリシー（個人情報保護方針）</h3>
            <button onclick="closeModal('privacy-modal')" class="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 cursor-pointer">×</button>
          </div>
          <div class="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p><strong>1. 情報の取得と利用目的</strong><br>当サイト（RyugakuIntern）で収集したメールアドレスおよび回答情報は、新着インターン・求人情報の配信およびサービス改善の目的にのみ利用いたします。</p>
            <p><strong>2. 第三者への非提供</strong><br>ご登録いただいた個人情報を、本人の同意なく第三者や外部企業へ販売・提供・貸与することは一切ございません。</p>
            <p><strong>3. 配信停止・削除について</strong><br>通知の配信停止や登録情報の削除をご希望の場合は、配信メール内の解除リンクまたは運営連絡先（ryugakuintern.official@gmail.com）までご連絡いただくことで速やかに削除いたします。</p>
          </div>
        </div>
      </div>
    `;
  }
});