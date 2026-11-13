<!DOCTYPE html>
<html lang="ja" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RyugakuIntern | 海外大生のための匿名情報交換ボード＆短期インターン</title>
  <meta name="description" content="6〜9月のサマー休暇、12月の冬休み、現地からのフルリモート案件に特化。海外大生同士がリアルな就活・帰国・インターン情報を匿名で交換できるコミュニティ＆ジョブボード。">
  
  <!-- タブの画像アイコン（favicon.png） -->
  <link rel="icon" type="image/png" href="favicon.png?v=99">
  <link rel="shortcut icon" href="favicon.png?v=99">

  <!-- SNSシェア用サムネイル（websamune.png 対応OGP・Xカード設定） -->
  <meta property="og:title" content="RyugakuIntern | 海外大生のための匿名情報交換ボード＆短期インターン">
  <meta property="og:description" content="海外大生同士がリアルな就活・帰国・インターン情報を匿名で交換できる掲示板＆帰国期間特化ジョブボード。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ryugaku-intern.com/">
  <meta property="og:image" content="https://ryugaku-intern.com/websamune.png?v=2">
  <meta property="og:site_name" content="RyugakuIntern">

  <!-- X (Twitter) 大きなカード表示用 -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@ryugakuintern">
  <meta name="twitter:title" content="RyugakuIntern | 海外大生のための匿名情報交換ボード＆短期インターン">
  <meta name="twitter:description" content="海外大生同士がリアルな就活・帰国・インターン情報を匿名で交換できる掲示板＆帰国期間特化ジョブボード。">
  <meta name="twitter:image" content="https://ryugaku-intern.com/websamune.png?v=2">

  <!-- Google AdSense 審査・配信用コード -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9644749026345882"
       crossorigin="anonymous"></script>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    .hero-gradient {
      background: radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.12) 0%, rgba(248, 250, 252, 0) 75%);
    }
    @keyframes highlightPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
      50% { box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.25); }
    }
    .thread-highlight {
      border-color: #4f46e5 !important;
      background-color: #eef2ff !important;
      animation: highlightPulse 1.5s ease-in-out 2;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen antialiased selection:bg-indigo-600 selection:text-white flex flex-col">

  <!-- ナビゲーションバー -->
  <header class="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
      <a href="#" class="flex items-center space-x-2.5 group">
        <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition">
          R
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-xl font-extrabold tracking-tight text-slate-900">RyugakuIntern</span>
          <span class="text-[10px] uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full font-bold">Beta</span>
        </div>
      </a>

      <div class="flex items-center space-x-3 sm:space-x-5">
        <a href="#community" class="inline-flex items-center space-x-1 text-xs lg:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">
          <span>💬 匿名掲示板</span>
        </a>
        <a href="#ai-news" class="hidden md:inline-block text-xs lg:text-sm font-medium text-slate-600 hover:text-slate-900 transition">🤖 AI就活ニュース</a>
        <a href="#planner" class="hidden md:inline-block text-xs lg:text-sm font-medium text-slate-600 hover:text-slate-900 transition">逆算カレンダー</a>
        <a href="#story" class="hidden lg:inline-block text-xs lg:text-sm font-medium text-slate-600 hover:text-slate-900 transition">設立の経緯</a>
        <button onclick="shareSite('https://ryugaku-intern.com/', 'RyugakuIntern | 海外大生のための匿名情報交換ボード＆短期インターン')" title="サイトURLをシェア" class="text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer">
          🔗 サイト共有
        </button>
        <a href="https://tally.so/r/gbeey4" target="_blank" rel="noopener noreferrer" class="hidden sm:inline-flex items-center space-x-1.5 text-xs sm:text-sm bg-slate-900 text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-600 shadow-sm transition duration-200">
          <span>企業向け：無料掲載</span>
        </a>
      </div>
    </div>
  </header>

  <!-- ヒーローセクション -->
  <section class="hero-gradient pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 border-b border-slate-200/60">
    <div class="max-w-4xl mx-auto text-center">
      <div class="inline-flex items-center space-x-2 bg-white border border-slate-200 shadow-2xs rounded-full px-3.5 py-1.5 mb-6">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-semibold text-slate-700">海外正規大生からの先行登録＆コミュニティ参加受付中！</span>
      </div>

      <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
        海外大生のための、<br>
        <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">「帰国期間だけ」</span>のインターン
      </h1>

      <p class="mt-5 text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
        6〜9月のサマー休暇、12月の冬休み、留学先からのフルリモート案件に特化。<br class="hidden sm:inline">
        さらに海外大生同士がリアルな就活・帰国事情を匿名で共有できる情報交換ボード＆AI就活ニュースも搭載。
      </p>

      <!-- アクションボタン2軸 -->
      <div class="mt-8 bg-white p-5 sm:p-6 rounded-2xl shadow-md border border-slate-200/90 max-w-xl mx-auto">
        <p class="text-xs sm:text-sm font-bold text-slate-800 mb-3">
          📮 新着求人が公開され次第、優先的にメールで通知を受け取る
        </p>
        <div class="flex flex-col sm:flex-row gap-2.5">
          <a href="https://tally.so/r/DqKkvE" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-sm transition">
            <span>新着求人の先行通知に登録（無料）</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
          <a href="#community" class="inline-flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition">
            <span>💬 匿名掲示板を見る</span>
          </a>
        </div>
        <p class="text-[11px] text-slate-500 mt-3 leading-normal">
          ※普段お使いのGmailや大学アドレス等、通知を受け取りやすいアドレスをご入力ください。
        </p>
      </div>
    </div>
  </section>

  <!-- ★主役セクション：海外大生専用・リアルタイム匿名情報交換コミュニティボード -->
  <section id="community" class="max-w-5xl w-full mx-auto px-4 py-14">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6 sm:p-8">
      
      <!-- ヘッダー＆新規投稿ボタン -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-extrabold uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-0.5 rounded-md">Live Community</span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">全員リアルタイム共有・匿名OK</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">💬 海外大生のリアル就活・帰国情報交換ボード</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            書き込んだスレッドや返信・いいねは全員の画面にリアルタイムで共有されます。各スレッドの専用URLをコピーしてLINEやDiscord、インスタDM、Xで仲間と共有できます！
          </p>
        </div>
        <div class="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button onclick="fetchCommunityPosts()" title="最新の投稿を読み込む" class="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-3 rounded-xl transition cursor-pointer">
            <span>🔄</span>
            <span class="hidden sm:inline">更新</span>
          </button>
          <button onclick="togglePostForm()" class="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer">
            <span>✏️ 新しくスレッドを立てる</span>
          </button>
        </div>
      </div>

      <!-- 新規スレッド作成フォーム（開閉式） -->
      <div id="post-form-container" class="hidden bg-slate-50 p-5 sm:p-6 rounded-2xl border border-indigo-200 my-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm sm:text-base font-extrabold text-slate-900">新しいトピック・質問を投稿する（全員に公開されます）</h3>
          <button onclick="togglePostForm()" class="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer">×</button>
        </div>
        <form onsubmit="submitCommunityPost(event)" class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ニックネーム（任意）</label>
              <input type="text" id="post-author" placeholder="名無しの海外大生" class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">留学先・学年（任意）</label>
              <input type="text" id="post-uni" placeholder="例：UK 1st Year / US Sophomore" class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">カテゴリ</label>
              <select id="post-tag" class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="☀️ 夏休み・帰国">☀️ 夏休み・帰国</option>
                <option value="💼 ボスキャリ・就活">💼 ボスキャリ・就活</option>
                <option value="💻 リモート・バイト">💻 リモート・バイト</option>
                <option value="🌍 留学生活・悩み">🌍 留学生活・悩み</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">トピックのタイトル <span class="text-rose-500">*</span></label>
            <input type="text" id="post-title" placeholder="例：1〜2年の夏休みに参加してよかった短期インターンやバイト教えてください！" required class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">本文 <span class="text-rose-500">*</span></label>
            <textarea id="post-body" rows="3" placeholder="体験談、聞きたいこと、おすすめの対策などを自由に書いてください！" required class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
          <div class="flex items-center justify-between pt-1">
            <span class="text-[11px] text-slate-500">※個人を特定できる本名や誹謗中傷の書き込みはお控えください。</span>
            <div class="flex space-x-2">
              <button type="button" onclick="togglePostForm()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer">閉じる</button>
              <button type="submit" id="submit-post-btn" class="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition cursor-pointer">スレッドを公開する</button>
            </div>
          </div>
        </form>
      </div>

      <!-- カテゴリフィルター＆ソートバー -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-5">
        <div class="flex flex-wrap gap-1.5" id="board-filter-buttons">
          <button onclick="setBoardCategory('all', this)" class="board-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white transition cursor-pointer">すべて</button>
          <button onclick="setBoardCategory('☀️ 夏休み・帰国', this)" class="board-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer">☀️ 夏休み・帰国</button>
          <button onclick="setBoardCategory('💼 ボスキャリ・就活', this)" class="board-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer">💼 ボスキャリ・就活</button>
          <button onclick="setBoardCategory('💻 リモート・バイト', this)" class="board-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer">💻 リモート・バイト</button>
          <button onclick="setBoardCategory('🌍 留学生活・悩み', this)" class="board-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer">🌍 留学生活・悩み</button>
        </div>

        <div class="flex items-center space-x-2 self-end sm:self-auto">
          <span class="text-[11px] font-bold text-slate-400">並び替え:</span>
          <select id="board-sort" onchange="renderCommunityPosts()" class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none">
            <option value="newest">🕒 新着順</option>
            <option value="popular">🔥 いいね順</option>
          </select>
        </div>
      </div>

      <!-- スレッド一覧コンテナ -->
      <div id="community-posts" class="space-y-4">
        <div class="text-center py-10 text-xs sm:text-sm text-slate-400">スレッドを読み込み中...</div>
      </div>

    </div>
  </section>

  <!-- 🤖 AI厳選・海外大生向け就活インテリジェンス（毎日自動更新） -->
  <section id="ai-news" class="max-w-5xl w-full mx-auto px-4 pb-12">
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-0.5 rounded-md">AI Curated</span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">毎日自動厳選・独自解説付き</span>
          </div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">🤖 AI厳選・海外大生のための最新就活インテリジェンス</h2>
          <p class="text-xs text-slate-500 mt-1">AIが毎日最新ニュースから海外大生に有益な記事だけを厳選し、活用ポイントを独自解説しています。</p>
        </div>
        <span id="ai-news-updated" class="text-[11px] font-bold text-slate-400 shrink-0"></span>
      </div>

      <!-- カテゴリ絞り込み -->
      <div class="flex flex-wrap gap-1.5 my-4" id="news-cat-tabs">
        <button onclick="filterAiNews('all', this)" class="news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer">すべて</button>
        <button onclick="filterAiNews('💼 外資・商社', this)" class="news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">💼 外資・商社</button>
        <button onclick="filterAiNews('☀️ インターン', this)" class="news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">☀️ インターン</button>
        <button onclick="filterAiNews('🌍 ボスキャリ', this)" class="news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">🌍 ボスキャリ</button>
        <button onclick="filterAiNews('💡 就活戦略', this)" class="news-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">💡 就活戦略</button>
      </div>

      <div id="ai-news-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="col-span-full text-center py-8 text-xs text-slate-400">AI厳選ニュースを読み込み中...</div>
      </div>
    </div>
  </section>

  <!-- 検索＆フィルターバー（求人サンプル側） -->
  <section id="jobs" class="max-w-5xl w-full mx-auto px-4 pt-4">
    <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="relative flex-1">
          <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            id="search-input" 
            oninput="applyFilters()" 
            placeholder="求人キーワード検索（例：AI、リサーチ、M&A、SaaS、リモート...）" 
            class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
        </div>
        <div class="flex flex-wrap gap-1.5" id="filter-buttons">
          <button onclick="setCategory('all', this)" class="filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white shadow-xs transition cursor-pointer">すべて</button>
          <button onclick="setCategory('summer', this)" class="filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer">☀️ 6〜9月サマー</button>
          <button onclick="setCategory('winter', this)" class="filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer">❄️ 12月冬休み</button>
          <button onclick="setCategory('remote', this)" class="filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer">🌍 完全リモート</button>
        </div>
      </div>
    </div>
  </section>

  <!-- 取り扱い求人イメージ（サンプル例） -->
  <main class="max-w-5xl w-full mx-auto px-4 py-8">
    <div class="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xs font-extrabold uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-0.5 rounded-md">Sample</span>
          <h2 class="text-base sm:text-lg font-extrabold text-slate-900">当サイトで取り扱う求人のイメージ（サンプル例）</h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          ※以下は当プラットフォームが対象とする職種・条件の<strong>サンプル（イメージ例）</strong>であり、現在募集中の実在求人ではありません。実際の求人が掲載され次第、通知登録いただいた方へ順次ご案内いたします。
        </p>
      </div>
    </div>

    <div id="job-list" class="grid gap-4">
      <!-- サンプル求人 1 -->
      <div class="job-card bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition" data-category="summer remote">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-2.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">掲載イメージ例</span>
              <span class="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">☀️ 6〜9月サマー</span>
              <span class="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">🌍 完全リモート</span>
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
              【案件例】AI・ITスタートアップ：海外市場・競合リサーチ＆英語圏トレンド調査
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              北米・欧州における最新の生成AIユースケース調査、英語論文・現地メディアのリサーチレポート作成など。留学先からのフルリモート稼働や帰国期間中の集中コミットを想定したポジション例。
            </p>
            <div class="flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-slate-500 pt-1">
              <span>💰 想定時給 1,500円 〜 2,500円</span>
              <span>⏰ 週15時間〜（テスト期間考慮）</span>
              <span>🎓 1〜4年生対象（英語リサーチ力重視）</span>
            </div>
          </div>
          <div class="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <a href="https://tally.so/r/DqKkvE" target="_blank" rel="noopener noreferrer" class="w-full md:w-auto text-center text-xs sm:text-sm bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold px-4 py-2.5 rounded-xl transition whitespace-nowrap">
              新着通知に登録する →
            </a>
          </div>
        </div>
      </div>

      <!-- サンプル求人 2 -->
      <div class="job-card bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition" data-category="summer">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-2.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">掲載イメージ例</span>
              <span class="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">☀️ 6〜9月サマー</span>
              <span class="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">🏢 東京（出社・ハイブリッド）</span>
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
              【案件例】クロスボーダーM&A・コンサルティング：海外企業リサーチ＆英文資料作成補助
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              東南アジア・欧米企業のリスト作成、英文資料の要約・翻訳、初期リサーチ補助など。外資系企業やコンサル、総合商社などを目指す学生が夏休みの帰国期間中に実務経験を積めるポジション例。
            </p>
            <div class="flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-slate-500 pt-1">
              <span>💰 想定時給 1,800円 〜 3,000円</span>
              <span>⏰ 6月〜9月のうち2ヶ月以上（週3日〜）</span>
              <span>🎓 1〜3年生歓迎</span>
            </div>
          </div>
          <div class="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <a href="https://tally.so/r/DqKkvE" target="_blank" rel="noopener noreferrer" class="w-full md:w-auto text-center text-xs sm:text-sm bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold px-4 py-2.5 rounded-xl transition whitespace-nowrap">
              新着通知に登録する →
            </a>
          </div>
        </div>
      </div>

      <!-- サンプル求人 3 -->
      <div class="job-card bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition" data-category="remote summer winter">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-2.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">掲載イメージ例</span>
              <span class="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">🌍 完全リモート</span>
              <span class="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">🕒 通年・時差ワークOK</span>
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
              【案件例】グローバル展開SaaS企業：英語圏マーケティング＆ローカライズ推進
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              海外ユーザー向けプロダクトの英語ローカライズ、海外SNS・コミュニティでのPR運用、海外ユーザーインタビューのサポートなど、留学先から時差を活かして稼働できるポジション例。
            </p>
            <div class="flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-slate-500 pt-1">
              <span>💰 想定時給 1,500円 〜 2,200円</span>
              <span>⏰ 週10時間〜（非同期・時差稼働OK）</span>
              <span>🎓 全学年対象（留学先からの応募可）</span>
            </div>
          </div>
          <div class="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <a href="https://tally.so/r/DqKkvE" target="_blank" rel="noopener noreferrer" class="w-full md:w-auto text-center text-xs sm:text-sm bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold px-4 py-2.5 rounded-xl transition whitespace-nowrap">
              新着通知に登録する →
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 検索結果0件時の表示 -->
    <div id="empty-state" class="hidden text-center py-12 px-6 bg-white rounded-2xl border border-slate-200 mt-4">
      <p class="text-sm font-bold text-slate-700">該当する条件のサンプル案件が見つかりませんでした。</p>
      <p class="text-xs text-slate-500 mt-1">別のキーワードやフィルターをお試しください。</p>
    </div>
  </main>

  <!-- 逆算カレンダー診断 ＆ 欲しい求人リクエスト投票 -->
  <section id="planner" class="bg-white border-t border-slate-200 py-16 px-4">
    <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- 一時帰国・インターン逆算カレンダー（7カラム） -->
      <div class="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/90 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Schedule Tool</span>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">🗓️ 一時帰国・インターン逆算カレンダー</h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-1.5">留学エリアと希望時期を選ぶと、動き出すべきベストタイミングが表示されます。</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">🌍 あなたの留学エリア</label>
              <select id="calc-region" onchange="updateSchedule()" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="uk">🇬🇧 英国・欧州（6月〜9月夏休み）</option>
                <option value="us">🇺🇸 北米・カナダ（5月〜8月夏休み）</option>
                <option value="au">🇦🇺 豪州・オセアニア（11月〜2月夏休み）</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">🎯 ターゲット時期</label>
              <select id="calc-season" onchange="updateSchedule()" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="summer">☀️ サマー帰国インターン（2〜3ヶ月）</option>
                <option value="winter">❄️ 12月冬休み短期プロジェクト</option>
                <option value="remote">💻 現地からの通年フルリモート</option>
              </select>
            </div>
          </div>

          <!-- 診断結果ボックス -->
          <div id="schedule-result" class="mt-6 bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5">
            <!-- JSで動的描画 -->
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>※期末試験（Exam）前にオンライン面接を終えるのが理想です</span>
          <a href="https://tally.so/r/DqKkvE" target="_blank" class="text-indigo-600 font-bold hover:underline shrink-0 ml-2">先行通知に登録 →</a>
        </div>
      </div>

      <!-- 欲しい求人リクエスト投票ボード（5カラム） -->
      <div class="lg:col-span-5 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/90 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Voice & Poll</span>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">📊 どんな求人が欲しい？</h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-1.5">ワンクリックで投票できます（複数可）。得票数が多い職種から優先的に企業開拓を行います！</p>

          <div id="poll-list" class="mt-5 space-y-2.5">
            <!-- JSで動的描画 -->
          </div>
        </div>

        <p class="text-[11px] text-slate-400 mt-4 text-right">※タップすると即座に票数が反映されます</p>
      </div>

    </div>
  </section>

  <!-- 設立の経緯（Founder's Story） -->
  <section id="story" class="bg-slate-100/70 border-t border-slate-200 py-16 px-4">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-2xs">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Founder's Story</span>
        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4 leading-snug">
          なぜ「RyugakuIntern」を作ったのか？<br>
          <span class="text-base sm:text-lg font-bold text-slate-600">— 現役の海外大生として直面した「帰国期間の壁」</span>
        </h2>

        <div class="mt-5 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            このプラットフォームは、海外の大学に通う私自身が<strong>「夏休みに日本へ一時帰国しても、条件の合うインターンや短期の仕事がなかなか見つからない」</strong>と痛感した実体験から生まれました。
          </p>
          <p>
            海外大のサマー休暇は6月〜9月と約3ヶ月以上あります。「この期間に日本で実務経験を積みたい」「円安や現地の物価高が続く中、帰国中にしっかり働きたい」と思って国内の求人サイトを探しても、日本の大学生向けサマーインターンは8月の数日開催ばかり。かといって長期インターンに応募すると、<strong>「最低半年以上・通年での勤務が必須」</strong>という条件で、期間が合わずに断られてしまうケースがほとんどでした。
          </p>
          <p>
            さらに、ボストンキャリアフォーラム（ボスキャリ）等の選考は3〜4年生が中心であり、1〜2年生のうちから英語力やリサーチ力を活かして実務経験を積める環境は驚くほど限られています。
          </p>
          <p class="font-semibold text-slate-800">
            「帰国中の2〜3ヶ月やリモートでも、海外大生の語学力と行動力を歓迎してくれる企業と学生を直接繋ぎたい。そして海外大生同士がリアルな情報を交換できる場所を作りたい」
          </p>
          <p>
            そんな思いから、『RyugakuIntern』を立ち上げました。同じ悩みを持つ海外大生の選択肢を一つでも増やせれば幸いです。
          </p>
        </div>

        <div class="mt-7 pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold text-slate-900">RyugakuIntern 運営代表（現役海外正規留学生）</p>
            <p class="text-[11px] text-slate-500">新着求人の速報や運営状況は公式Xにて発信しています。</p>
          </div>
          <a href="https://x.com/ryugakuintern" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 text-xs font-bold bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition self-start sm:self-auto">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span>@ryugakuintern をフォロー</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- 企業向けCTAバナー -->
  <section id="for-companies" class="max-w-5xl w-full mx-auto px-4 py-16">
    <div class="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
      <div class="relative z-10 max-w-2xl">
        <span class="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full">For Employers</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold mt-4 leading-snug">
          6〜9月のサマー期間やリモートで、<br>優秀な海外大生を採用しませんか？
        </h2>
        <p class="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
          RyugakuInternは、英国・北米・欧州・アジア等の海外大学で学ぶ日本人学生・バイリンガル学生に特化したコミュニティ＆ジョブボードです。現在β版につき、初期費用・掲載料すべて<strong>完全無料</strong>で求人を掲載いただけます。
        </p>
        <div class="mt-7 flex flex-wrap items-center gap-4">
          <a href="https://tally.so/r/gbeey4" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition">
            <span>無料で求人を掲載する（所要時間3分）</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
          <span class="text-xs text-slate-400">※内容確認の上、サイトへ反映いたします</span>
        </div>
      </div>
    </div>
  </section>

  <!-- フッター -->
  <footer class="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
    <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
      <div class="text-center sm:text-left space-y-1">
        <div class="flex items-center justify-center sm:justify-start space-x-2">
          <span class="font-extrabold text-slate-900 text-sm">RyugakuIntern</span>
          <span>— 海外大生特化の匿名掲示板＆短期・リモート求人</span>
        </div>
        <p class="text-[11px] text-slate-400">© 2026 RyugakuIntern Project. All rights reserved.</p>
      </div>

      <div class="flex flex-wrap gap-4 sm:gap-6 justify-center items-center">
        <button onclick="openModal('info-modal')" class="hover:text-slate-900 transition cursor-pointer">運営概要 (Project Info)</button>
        <button onclick="openModal('privacy-modal')" class="hover:text-slate-900 transition cursor-pointer">プライバシーポリシー</button>
        <a href="https://tally.so/r/gbeey4" target="_blank" rel="noopener noreferrer" class="hover:text-slate-900 transition">企業掲載フォーム</a>
        <a href="mailto:ryugakuintern.official@gmail.com" class="hover:text-slate-900 transition">お問い合わせ</a>
        <a href="https://x.com/ryugakuintern" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1 text-slate-700 font-semibold hover:text-indigo-600 transition">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span>公式X</span>
        </a>
      </div>
    </div>
  </footer>

  <!-- モーダル1：運営概要 (Project Info) -->
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

  <!-- モーダル2：プライバシーポリシー -->
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

  <!-- 全機能制御スクリプト -->
  <script>
    /* --- Supabase 接続設定 --- */
    const SUPABASE_REST_URL = 'https://nccmmvoeuhwlgwfxdhsq.supabase.co/rest/v1';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY21tdm9ldWh3bGd3ZnhkaHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1MTk0NTIsImV4cCI6MjExMDA5NTQ1Mn0.jnXopufuqaCLTirq6Od1-EMagcv1TwNNZvx1L6fh8Ps';
    const SITE_BASE_URL = 'https://ryugaku-intern.com/';

    const supabaseHeaders = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };

    /* --- 1. 求人フィルター制御 --- */
    let currentCategory = 'all';

    function setCategory(category, btnElement) {
      currentCategory = category;
      const buttons = document.querySelectorAll('.filter-btn');
      buttons.forEach(btn => {
        btn.className = 'filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer';
      });
      btnElement.className = 'filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white shadow-xs transition cursor-pointer';
      applyFilters();
    }

    function applyFilters() {
      const query = document.getElementById('search-input').value.toLowerCase();
      const cards = document.querySelectorAll('.job-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const categories = card.getAttribute('data-category');
        const text = card.innerText.toLowerCase();
        const matchCategory = currentCategory === 'all' || categories.includes(currentCategory);
        const matchQuery = !query || text.includes(query);

        if (matchCategory && matchQuery) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      document.getElementById('empty-state').style.display = visibleCount === 0 ? 'block' : 'none';
    }

    /* --- 2. 逆算カレンダー診断ロジック --- */
    const scheduleData = {
      uk_summer: [
        { step: '3月〜4月中旬', title: '情報収集＆CV（履歴書）準備', desc: 'イースター休暇前後に日本のサマー長期枠やリモート案件をチェック。5月のExam期間に入る前に応募書類を整えるのが鉄則。' },
        { step: '4月下旬〜5月', title: 'オンライン面談・内定獲得', desc: '現地滞在中にZoom等でカジュアル面談・選考を実施。帰国日と稼働可能期間（6月〜9月）を企業へ伝えて合意。' },
        { step: '6月中旬〜9月', title: '帰国＆サマーインターン稼働', desc: '帰国直後からスムーズに業務開始！3ヶ月間のまとまった期間を活かして実務実績と報酬を獲得。' }
      ],
      us_summer: [
        { step: '2月〜3月', title: '早期リサーチ＆レジュメ作成', desc: '北米は5月上旬〜中旬に夏休みが始まるため、春休み（Spring Break）前後に動き出すのがベスト。' },
        { step: '4月', title: 'オンライン選考＆条件すり合わせ', desc: 'Finals（期末試験）前にオンライン面接を完了させ、5月からの稼働スケジュールを確定。' },
        { step: '5月中旬〜8月', title: 'サマーインターン本番（約3ヶ月半）', desc: '国内大生がまだ授業中の5〜7月にフルコミットできるため、企業から最も重宝されるゴールデンタイム。' }
      ],
      au_summer: [
        { step: '9月〜10月', title: '長期休暇（11〜2月）に向けた案件探し', desc: '南半球特有の長い夏休みに合わせ、秋冬採用枠やリモート併用可能な長期インターンをピックアップ。' },
        { step: '10月下旬〜11月', title: 'オンライン選考完結', desc: '期末試験シーズン前後にオンライン面接を実施し、帰国後すぐ働ける環境を確保。' },
        { step: '11月下旬〜2月', title: '帰国＆集中インターン稼働', desc: '年末年始を挟みつつ約3ヶ月間の集中稼働。そのまま2月以降の現地リモート継続に繋がるケースも多数。' }
      ],
      winter: [
        { step: '10月〜11月中旬', title: '冬休み短期プロジェクト・リサーチ枠の確認', desc: '12月の冬休み（3〜4週間）は期間が短いため、「短期リサーチ案件」や「帰国中スタート→1月以降現地リモート継続」の枠を狙う。' },
        { step: '11月下旬', title: 'オンライン面談＆タスク決定', desc: '帰国前にオンラインで顔合わせを行い、12月中に達成するリサーチテーマや業務範囲を決定。' },
        { step: '12月（3〜4週間）', title: '短期集中スプリント稼働', desc: '一時帰国中またはオンラインで短期集中コミット。新学期が始まる1月からは週10h程度のリモートへ移行も可能。' }
      ],
      remote: [
        { step: '思い立った時（通年）', title: '週10〜15時間でできるリモート案件を探す', desc: '時差を活かせる「海外市場リサーチ」「英文翻訳・ローカライズ」「SNS・マーケ運用」など非同期ワーク向きの職種を選択。' },
        { step: '応募から1〜2週間', title: 'オンライン面接＆トライアル稼働', desc: '授業のコマ数やエッセイ提出時期を考慮してくれる企業とオンライン面談。まずは週10時間程度からスタート。' },
        { step: '学期中〜長期休暇', title: '現地からリモート稼働（帰国時は出社も可）', desc: '普段は寮や自宅からフルリモートで稼ぎ、夏休みや冬休みの帰国期間だけ東京のオフィスに顔を出すハイブリッド型も人気。' }
      ]
    };

    function updateSchedule() {
      const region = document.getElementById('calc-region').value;
      const season = document.getElementById('calc-season').value;
      let key = season === 'summer' ? `${region}_summer` : season;
      const steps = scheduleData[key];

      const container = document.getElementById('schedule-result');
      container.innerHTML = steps.map((s, idx) => `
        <div class="flex items-start space-x-3">
          <div class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">${s.step}</span>
              <h4 class="text-xs sm:text-sm font-bold text-slate-900">${s.title}</h4>
            </div>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">${s.desc}</p>
          </div>
        </div>
      `).join('');
    }

    /* --- 3. 欲しい求人リクエスト投票ボード --- */
    const defaultPolls = [
      { id: 'p1', label: '🌍 現地から週10h〜働ける完全リモート案件', count: 19 },
      { id: 'p2', label: '☀️ 6〜9月の帰国期間だけ働けるサマー長期枠', count: 16 },
      { id: 'p3', label: '💼 外資コンサル・M&A・金融系のリサーチ実務', count: 12 },
      { id: 'p4', label: '🤖 AI・急成長スタートアップでの海外調査・マーケ', count: 14 },
      { id: 'p5', label: '🎓 1〜2年生から応募できる有給インターン', count: 18 }
    ];

    function renderPolls() {
      const savedCounts = JSON.parse(localStorage.getItem('ri_poll_counts') || '{}');
      const votedIds = JSON.parse(localStorage.getItem('ri_poll_voted') || '[]');
      const container = document.getElementById('poll-list');
      const totalVotes = defaultPolls.reduce((sum, item) => sum + (savedCounts[item.id] || item.count), 0);

      container.innerHTML = defaultPolls.map(item => {
        const count = savedCounts[item.id] || item.count;
        const isVoted = votedIds.includes(item.id);
        const pct = Math.min(100, Math.round((count / (totalVotes || 1)) * 180));

        return `
          <button onclick="votePoll('${item.id}')" class="w-full text-left bg-white p-3.5 rounded-2xl border ${isVoted ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'} transition cursor-pointer relative overflow-hidden group">
            <div class="absolute left-0 top-0 bottom-0 bg-indigo-50/80 transition-all duration-300" style="width: ${pct}%"></div>
            <div class="relative z-10 flex items-center justify-between gap-2">
              <span class="text-xs font-bold ${isVoted ? 'text-indigo-900' : 'text-slate-800'}">${item.label}</span>
              <span class="shrink-0 inline-flex items-center space-x-1 text-xs font-extrabold ${isVoted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700'} px-2.5 py-1 rounded-full transition">
                <span>👍</span>
                <span>${count}</span>
              </span>
            </div>
          </button>
        `;
      }).join('');
    }

    function votePoll(id) {
      const savedCounts = JSON.parse(localStorage.getItem('ri_poll_counts') || '{}');
      let votedIds = JSON.parse(localStorage.getItem('ri_poll_voted') || '[]');
      const target = defaultPolls.find(p => p.id === id);
      let current = savedCounts[id] || target.count;

      if (votedIds.includes(id)) {
        savedCounts[id] = current - 1;
        votedIds = votedIds.filter(v => v !== id);
      } else {
        savedCounts[id] = current + 1;
        votedIds.push(id);
      }

      localStorage.setItem('ri_poll_counts', JSON.stringify(savedCounts));
      localStorage.setItem('ri_poll_voted', JSON.stringify(votedIds));
      renderPolls();
    }

    /* --- 4. 海外大生コミュニティ掲示板（Supabase クラウド共有 ＋ マルチシェア・個別URL） --- */
    let allPostsCache = [];
    let currentBoardCategory = 'all';
    let lastPostTime = 0;

    const fallbackSamplePosts = [
      {
        id: 'sample_1',
        isSample: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        author: 'UK大 1年生',
        uni: 'University in UK (Politics & IR)',
        tag: '☀️ 夏休み・帰国',
        title: '1年生の夏休み（6〜9月）、日本の長期インターンは半年縛りで断られがち…',
        body: 'イギリスの大学は6月中旬から9月まで丸々3ヶ月以上休みがあるのに、日本の求人サイトだと「最低6ヶ月〜」ばかりで書類で弾かれることが多くて困っていました。帰国期間だけでも英語リサーチ等で働ける企業が増えるのは本当にありがたいです！',
        likes: 14,
        replies: [
          { author: 'UK大 2年先輩', body: 'めちゃくちゃ分かります！自分は1年の夏はフルリモートのスタートアップにDM送って2ヶ月半だけ働かせてもらいました。最初から帰国期間を正直に伝えるのがおすすめです。', created_at: new Date(Date.now() - 43200000).toISOString() }
        ]
      },
      {
        id: 'sample_2',
        isSample: true,
        created_at: new Date(Date.now() - 36000000).toISOString(),
        author: '北米大 2年',
        uni: 'US Liberal Arts College',
        tag: '💻 リモート・バイト',
        title: '円安＆現地の物価高対策に、時差を活かしたリモート案件を探しています',
        body: '現地のカフェバイトがキャンパス内しかできず枠も少ないので、日本のスタートアップで海外トレンド調査や英文翻訳のリモートワークができると生活費の足しになって助かります。週10〜15時間くらいの案件に期待しています！',
        likes: 11,
        replies: []
      }
    ];

    function getThreadShareUrl(postId) {
      if (!postId || String(postId).startsWith('sample_')) {
        return `${SITE_BASE_URL}#community`;
      }
      return `${SITE_BASE_URL}?post=${encodeURIComponent(postId)}#community`;
    }

    function copyThreadLink(postId, btnEl) {
      const shareUrl = getThreadShareUrl(postId);
      navigator.clipboard.writeText(shareUrl).then(() => {
        const originalHTML = btnEl.innerHTML;
        btnEl.innerHTML = '<span>✅ URLコピー完了！</span>';
        btnEl.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
        setTimeout(() => {
          btnEl.innerHTML = originalHTML;
          btnEl.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
        }, 2000);
      }).catch(() => {
        prompt('以下のスレッド専用URLをコピーしてください：', shareUrl);
      });
    }

    function shareToLine(postId, title) {
      const shareUrl = getThreadShareUrl(postId);
      const text = encodeURIComponent(`「${title}」｜海外大生のリアル情報交換ボード\n${shareUrl}`);
      window.open(`https://line.me/R/msg/text/?${text}`, '_blank', 'noopener,noreferrer');
    }

    function shareToX(postId, title) {
      const shareUrl = getThreadShareUrl(postId);
      const text = encodeURIComponent(`「${title}」\n海外大生のリアル情報交換ボード｜RyugakuIntern`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
    }

    function nativeShareThread(postId, title) {
      const shareUrl = getThreadShareUrl(postId);
      shareSite(shareUrl, `「${title}」｜RyugakuIntern 匿名情報交換ボード`);
    }

    function shareSite(url, titleText) {
      if (navigator.share) {
        navigator.share({
          title: titleText,
          text: titleText,
          url: url
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url).then(() => {
          alert(`共有用URLをクリップボードにコピーしました！\nLINE・Discord・インスタDM等にそのまま貼り付けて送れます：\n\n${url}`);
        }).catch(() => {
          prompt('以下のURLをコピーして共有してください：', url);
        });
      }
    }

    function checkDeepLinkedThread() {
      const params = new URLSearchParams(window.location.search);
      const targetPostId = params.get('post');
      if (!targetPostId) return;

      const card = document.getElementById(`thread-card-${targetPostId}`);
      const repliesBox = document.getElementById(`replies-box-${targetPostId}`);
      if (card) {
        if (repliesBox) repliesBox.classList.remove('hidden');
        card.classList.add('thread-highlight');
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      }
    }

    function formatRelativeTime(isoString) {
      if (!isoString) return 'たった今';
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 60) return 'たった今';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}時間前`;
      return `${Math.floor(diffSec / 86400)}日前`;
    }

    async function fetchCommunityPosts() {
      try {
        const res = await fetch(`${SUPABASE_REST_URL}/community_posts?select=*,community_replies(*)&order=created_at.desc`, {
          headers: supabaseHeaders
        });
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();

        if (data && data.length > 0) {
          allPostsCache = data.map(post => ({
            ...post,
            replies: (post.community_replies || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          }));
        } else {
          allPostsCache = fallbackSamplePosts;
        }
        renderCommunityPosts();
        checkDeepLinkedThread();
      } catch (err) {
        console.error('Supabase fetch error:', err);
        allPostsCache = fallbackSamplePosts;
        renderCommunityPosts();
      }
    }

    function setBoardCategory(cat, btnElement) {
      currentBoardCategory = cat;
      document.querySelectorAll('.board-tab').forEach(btn => {
        btn.className = 'board-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer';
      });
      btnElement.className = 'board-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white transition cursor-pointer';
      renderCommunityPosts();
    }

    function escapeHTML(str) {
      if (!str) return '';
      return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[tag]));
    }

    function toggleReplies(postId) {
      const box = document.getElementById(`replies-box-${postId}`);
      if (box) box.classList.toggle('hidden');
    }

    function renderCommunityPosts() {
      let posts = [...allPostsCache];
      const likedIds = JSON.parse(localStorage.getItem('ri_liked_posts_cloud') || '[]');
      const sortMode = document.getElementById('board-sort').value;

      if (currentBoardCategory !== 'all') {
        posts = posts.filter(p => p.tag === currentBoardCategory);
      }

      if (sortMode === 'popular') {
        posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else {
        posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      const container = document.getElementById('community-posts');

      if (posts.length === 0) {
        container.innerHTML = `<div class="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-500">このカテゴリにはまだ投稿がありません。最初のスレッドを立ててみませんか？</div>`;
        return;
      }

      container.innerHTML = posts.map(post => {
        const isLiked = likedIds.includes(post.id);
        const replyCount = (post.replies || []).length;
        const timeText = formatRelativeTime(post.created_at);
        const safeTitleForJs = escapeHTML(post.title).replace(/'/g, "\\'");

        const repliesHTML = (post.replies || []).map(r => `
          <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div class="flex justify-between items-center mb-1">
              <span class="font-bold text-slate-800">${escapeHTML(r.author || '名無しの海外大生')}</span>
              <span class="text-[10px] text-slate-400">${formatRelativeTime(r.created_at)}</span>
            </div>
            <p class="text-slate-600 leading-relaxed whitespace-pre-line">${escapeHTML(r.body)}</p>
          </div>
        `).join('');

        return `
          <div id="thread-card-${post.id}" class="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/90 hover:border-indigo-200 transition">
            <!-- 上段メタ情報＆マルチシェアバー -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">${escapeHTML(post.tag)}</span>
                <span class="text-xs font-bold text-slate-800">${escapeHTML(post.author)}</span>
                ${post.uni ? `<span class="text-[11px] text-slate-400">(${escapeHTML(post.uni)})</span>` : ''}
                <span class="text-[11px] text-slate-400">・${timeText}</span>
              </div>

              <!-- 共有ボタン群（URLコピー / LINE / X / その他SNS） -->
              <div class="flex flex-wrap items-center gap-1.5">
                <button onclick="copyThreadLink('${post.id}', this)" title="スレッド専用URLをコピー" class="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-600 hover:text-indigo-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
                  <span>🔗 URLコピー</span>
                </button>
                <button onclick="shareToLine('${post.id}', '${safeTitleForJs}')" title="LINEで送る" class="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
                  <span>LINE</span>
                </button>
                <button onclick="shareToX('${post.id}', '${safeTitleForJs}')" title="Xでシェア" class="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button onclick="nativeShareThread('${post.id}', '${safeTitleForJs}')" title="Instagram DM・Discord等で共有" class="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer">
                  <span>📤</span>
                </button>
              </div>
            </div>

            <!-- タイトル＆本文 -->
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900 leading-snug mb-2">${escapeHTML(post.title)}</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-4">${escapeHTML(post.body)}</p>

            <!-- アクションバー（いいね＆スレッド開閉） -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-200/70">
              <button onclick="toggleReplies('${post.id}')" class="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer">
                <span>💬 返信・スレッドを見る</span>
                <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[11px]">${replyCount}件</span>
              </button>

              <button onclick="likePost('${post.id}', ${post.likes || 0}, ${post.isSample ? 'true' : 'false'})" class="inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border ${isLiked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600'} transition cursor-pointer">
                <span>${isLiked ? '❤️' : '🤍'}</span>
                <span>いいね ${post.likes || 0}</span>
              </button>
            </div>

            <!-- スレッド返信エリア（開閉式） -->
            <div id="replies-box-${post.id}" class="hidden mt-4 pt-4 border-t border-slate-200/80 space-y-3">
              ${replyCount > 0 ? `<div class="space-y-2.5 pl-3 border-l-2 border-indigo-200">${repliesHTML}</div>` : `<p class="text-xs text-slate-400 pl-1">まだ返信はありません。最初のアドバイスや感想を書いてみましょう！</p>`}
              
              <!-- 返信入力フォーム -->
              <form onsubmit="submitReply(event, '${post.id}', ${post.isSample ? 'true' : 'false'})" class="flex flex-col sm:flex-row gap-2 pt-2">
                <input type="text" id="reply-author-${post.id}" placeholder="名前（任意）" class="sm:w-36 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <input type="text" id="reply-body-${post.id}" placeholder="返信・アドバイスを書き込む..." required class="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <button type="submit" class="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0">返信する</button>
              </form>
            </div>
          </div>
        `;
      }).join('');
    }

    function togglePostForm() {
      const form = document.getElementById('post-form-container');
      form.classList.toggle('hidden');
    }

    async function submitCommunityPost(event) {
      event.preventDefault();
      const now = Date.now();
      if (now - lastPostTime < 10000) {
        alert('連投防止のため、10秒ほど空けてから投稿してください。');
        return;
      }

      const btn = document.getElementById('submit-post-btn');
      btn.disabled = true;
      btn.innerText = '送信中...';

      const payload = {
        author: document.getElementById('post-author').value.trim() || '名無しの海外大生',
        uni: document.getElementById('post-uni').value.trim(),
        tag: document.getElementById('post-tag').value,
        title: document.getElementById('post-title').value.trim(),
        body: document.getElementById('post-body').value.trim(),
        likes: 1
      };

      try {
        const res = await fetch(`${SUPABASE_REST_URL}/community_posts`, {
          method: 'POST',
          headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Insert failed');

        lastPostTime = now;
        event.target.reset();
        togglePostForm();
        await fetchCommunityPosts();
      } catch (err) {
        alert('投稿の送信に失敗しました。通信環境をご確認のうえ再度お試しください。');
        console.error(err);
      } finally {
        btn.disabled = false;
        btn.innerText = 'スレッドを公開する';
      }
    }

    async function submitReply(event, postId, isSample) {
      event.preventDefault();
      if (isSample) {
        alert('こちらは初期サンプル記事です。上の「新しくスレッドを立てる」から本物のスレッドを作成すると、全員と返信・共有ができます！');
        return;
      }

      const authorInput = document.getElementById(`reply-author-${postId}`);
      const bodyInput = document.getElementById(`reply-body-${postId}`);
      const author = authorInput.value.trim() || '名無しの海外大生';
      const body = bodyInput.value.trim();
      if (!body) return;

      try {
        const res = await fetch(`${SUPABASE_REST_URL}/community_replies`, {
          method: 'POST',
          headers: supabaseHeaders,
          body: JSON.stringify({ post_id: postId, author, body })
        });
        if (!res.ok) throw new Error('Reply failed');

        await fetchCommunityPosts();
        const box = document.getElementById(`replies-box-${postId}`);
        if (box) box.classList.remove('hidden');
      } catch (err) {
        alert('返信の送信に失敗しました。');
        console.error(err);
      }
    }

    async function likePost(postId, currentLikes, isSample) {
      if (isSample) {
        alert('こちらは初期サンプル記事です。新しく立てられたスレッドから全員共有のいいねが反映されます！');
        return;
      }

      let likedIds = JSON.parse(localStorage.getItem('ri_liked_posts_cloud') || '[]');
      const alreadyLiked = likedIds.includes(postId);
      const nextLikes = alreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

      if (alreadyLiked) {
        likedIds = likedIds.filter(id => id !== postId);
      } else {
        likedIds.push(postId);
      }
      localStorage.setItem('ri_liked_posts_cloud', JSON.stringify(likedIds));

      try {
        await fetch(`${SUPABASE_REST_URL}/community_posts?id=eq.${postId}`, {
          method: 'PATCH',
          headers: supabaseHeaders,
          body: JSON.stringify({ likes: nextLikes })
        });
        await fetchCommunityPosts();
      } catch (err) {
        console.error('Like update failed:', err);
      }
    }

    /* --- 5. AI厳選ニュース（news.json）の読み込み＆描画 --- */
    let aiNewsCache = [];
    let currentNewsCat = 'all';

    async function loadAiNews() {
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

      if (list.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-xs text-slate-400">AI厳選ニュースの初回自動生成を待機中です（GitHub Actionsを実行すると自動で並びます）。</div>`;
        return;
      }

      grid.innerHTML = list.map(item => `
        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="bg-slate-50/80 hover:bg-indigo-50/40 p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition flex flex-col justify-between group">
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

    /* --- 6. モーダル制御 --- */
    function openModal(id) {
      const modal = document.getElementById(id);
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeModal(id) {
      const modal = document.getElementById(id);
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    /* 初期描画実行 */
    window.addEventListener('DOMContentLoaded', () => {
      updateSchedule();
      renderPolls();
      fetchCommunityPosts();
      loadAiNews();
    });
  </script>
</body>
</html>