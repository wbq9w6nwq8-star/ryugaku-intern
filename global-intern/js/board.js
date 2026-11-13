<!DOCTYPE html>
<html lang="ja" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RyugakuIntern | 海外大生のための帰国期間・リモート特化型インターン</title>
  <meta name="description" content="6〜9月のサマー休暇、12月の冬休み、現地からのフルリモート案件に特化。海外正規大生のためのインターン・プロジェクト求人プラットフォーム。">
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
      background: radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.12) 0%, rgba(248, 250, 252, 0) 70%);
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

      <div class="flex items-center space-x-3 sm:space-x-6">
        <a href="#about" class="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition">特徴</a>
        <a href="#faq" class="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition">よくある質問</a>
        <a href="https://tally.so/r/gbeey4" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1.5 text-xs sm:text-sm bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-600 shadow-sm transition duration-200">
          <span>企業向け：求人を無料掲載</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- ヒーローセクション -->
  <section class="hero-gradient pt-14 pb-12 sm:pt-20 sm:pb-16 px-4 border-b border-slate-200/60">
    <div class="max-w-4xl mx-auto text-center">
      <div class="inline-flex items-center space-x-2 bg-white border border-slate-200 shadow-2xs rounded-full px-3.5 py-1.5 mb-6">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-semibold text-slate-700">2026-2027 サマー・冬休み・リモート求人 順次審査中</span>
      </div>

      <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
        海外大生のための、<br>
        <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">「帰国期間だけ」</span>のインターン
      </h1>

      <p class="mt-5 text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
        6〜9月のサマー休暇、12月の冬休み、現地からのフルリモート案件に特化。<br class="hidden sm:inline">
        日本の就活スケジュールに縛られず、実務経験と報酬を両立できる厳選ジョブボード。
      </p>

      <!-- 特徴ピル -->
      <div class="mt-8 flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 font-medium">
        <div class="flex items-center space-x-1.5">
          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span>帰国前オンライン選考完結</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span>英語・海外経験が評価される有給案件</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span>1〜2年生の応募歓迎</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 検索＆フィルターバー -->
  <section id="jobs" class="max-w-5xl w-full mx-auto px-4 -mt-7 relative z-10">
    <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="relative flex-1">
          <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            id="search-input" 
            oninput="applyFilters()" 
            placeholder="キーワード検索（例：リサーチ、VC、SaaS、翻訳、リモート...）" 
            class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
        </div>
        <div class="flex flex-wrap gap-1.5" id="filter-buttons">
          <button onclick="setCategory('all', this)" class="filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white shadow-xs transition">すべて</button>
          <button onclick="setCategory('summer', this)" class="filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">☀️ 6〜9月サマー</button>
          <button onclick="setCategory('winter', this)" class="filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">❄️ 12月冬休み</button>
          <button onclick="setCategory('remote', this)" class="filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">🌍 完全リモート</button>
        </div>
      </div>
    </div>
  </section>

  <!-- 求人エリア（学生ウェイトリスト統合） -->
  <main class="max-w-5xl w-full mx-auto px-4 py-12 flex-1">
    <div id="job-list" class="grid gap-5">
      <!-- 求人が追加されたらここにレンダリングされます -->
    </div>

    <!-- プレローンチ＆学生向け通知登録ボックス -->
    <div id="empty-state" class="text-center py-16 px-6 sm:px-12 bg-white rounded-3xl border border-slate-200/90 shadow-xs max-w-3xl mx-auto">
      <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-5 text-3xl">
        📮
      </div>
      <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">現在、初期掲載企業の求人を審査・準備中です</h3>
      <p class="text-sm text-slate-600 mt-3 max-w-lg mx-auto leading-relaxed">
        6〜9月のサマーインターンや12月の冬期スプリント案件が公開された際、優先的にメールで求人情報を受け取りたい学生の方はご登録ください（完全無料・スパムなし）。
      </p>

     <!-- 簡易メアド登録フォーム（ボタン直リンク版） -->
      <div class="mt-8">
        <a href="https://tally.so/r/DqKkvE" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-sm transition">
          <span>新着通知を受け取る（無料・30秒）</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
      <p class="text-[11px] text-slate-400 mt-3">※.ac.uk / .edu などの大学アドレスでも登録可能です</p>
    </div>
  </main>

  <!-- なぜRyugakuInternなのか（比較セクション） -->
  <section id="about" class="bg-slate-100/70 border-y border-slate-200 py-16 px-4">
    <div class="max-w-5xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Why RyugakuIntern</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">従来の就活媒体では解決できなかったこと</h2>
        <p class="text-sm text-slate-600 mt-2">海外大学特有の学事スケジュールと、国内企業の採用フローのズレを解消します。</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div class="text-indigo-600 font-extrabold text-lg mb-2">01. 期間のミスマッチ</div>
          <h3 class="font-bold text-slate-900 mb-2">国内ナビサイトの壁</h3>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            日本の大学生向けサマーは8月中心。「6月〜7月に日本にいるのに参加できる枠がない」「長期インターンは半年以上必須で断られる」問題を排除。
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div class="text-indigo-600 font-extrabold text-lg mb-2">02. 学年別の機会不足</div>
          <h3 class="font-bold text-slate-900 mb-2">ボスキャリ前の経験作り</h3>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            ボストンキャリアフォーラム等の本選考は3〜4年向けが中心。1〜2年生が夏休みに日本で積める「確固たる実務経験」の場を提供します。
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div class="text-indigo-600 font-extrabold text-lg mb-2">03. 選考の地理的ハードル</div>
          <h3 class="font-bold text-slate-900 mb-2">完全オンライン選考前提</h3>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            掲載求人はすべて「帰国前のオンライン面接で内定まで完結」を原則としています。帰国した初日からスムーズに業務を開始できます。
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- よくある質問（FAQ） -->
  <section id="faq" class="max-w-4xl mx-auto px-4 py-16">
    <div class="text-center mb-10">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">よくあるご質問（FAQ）</h2>
      <p class="text-sm text-slate-500 mt-2">学生・企業様双方からいただく質問をまとめました</p>
    </div>

    <div class="space-y-4">
      <details class="group bg-white p-5 rounded-2xl border border-slate-200 cursor-pointer">
        <summary class="flex justify-between items-center font-bold text-slate-900 text-sm sm:text-base list-none">
          <span>学部1年生や2年生でも応募できますか？</span>
          <span class="text-slate-400 group-open:rotate-180 transition transform">▼</span>
        </summary>
        <p class="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
          はい、大半の案件で学年不問（1〜2年生歓迎）となっています。海外リサーチや語学力を活かした実務など、学年に関わらず自走力や英語運用能力を重視するスタートアップ・VCを中心にご紹介しています。
        </p>
      </details>

      <details class="group bg-white p-5 rounded-2xl border border-slate-200 cursor-pointer">
        <summary class="flex justify-between items-center font-bold text-slate-900 text-sm sm:text-base list-none">
          <span>給与や報酬は発生しますか？無給インターンですか？</span>
          <span class="text-slate-400 group-open:rotate-180 transition transform">▼</span>
        </summary>
        <p class="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
          掲載されている求人はすべて有給（時給制・月給制・または成果報酬型スプリント）です。円安や留学生活費の補助として、短期間で効率的に稼ぐことが可能です。
        </p>
      </details>

      <details class="group bg-white p-5 rounded-2xl border border-slate-200 cursor-pointer">
        <summary class="flex justify-between items-center font-bold text-slate-900 text-sm sm:text-base list-none">
          <span>学生側の利用料はかかりますか？</span>
          <span class="text-slate-400 group-open:rotate-180 transition transform">▼</span>
        </summary>
        <p class="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
          学生側は登録から応募、マッチングまですべて完全無料です。費用は一切発生しません。
        </p>
      </details>
    </div>
  </section>

  <!-- 企業向けCTAバナー -->
  <section id="for-companies" class="max-w-5xl w-full mx-auto px-4 pb-20">
    <div class="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
      <div class="relative z-10 max-w-2xl">
        <span class="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full">For Employers</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold mt-4 leading-snug">
          6〜9月のサマー期間やリモートで、<br>即戦力の海外大生を採用しませんか？
        </h2>
        <p class="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
          RyugakuInternは、北米・英国・欧州・アジア等の海外正規大学で学ぶ日本人学生・バイリンガル学生に特化したジョブボードです。初期費用・掲載料すべて<strong>完全無料</strong>で求人を掲載いただけます。
        </p>
        <div class="mt-7 flex flex-wrap items-center gap-4">
          <a href="https://tally.so/r/gbeey4" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition">
            <span>無料で求人を掲載する（所要時間3分）</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
          <span class="text-xs text-slate-400">※内容確認の上、2営業日以内にサイトへ反映されます</span>
        </div>
      </div>
    </div>
  </section>

  <!-- フッター -->
  <footer class="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-500">
    <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex items-center space-x-2">
        <span class="font-bold text-slate-800">RyugakuIntern</span>
        <span>— 海外大生特化のサマー・冬期・リモート求人プラットフォーム</span>
      </div>
      <div class="flex space-x-6">
        <a href="#about" class="hover:text-slate-800">特徴</a>
        <a href="#faq" class="hover:text-slate-800">FAQ</a>
        <a href="https://tally.so/r/gbeey4" target="_blank" rel="noopener noreferrer" class="hover:text-slate-800">企業掲載受付</a>
      </div>
    </div>
  </footer>

  <!-- スクリプト -->
  <script>
    let currentCategory = 'all';

    function setCategory(category, btnElement) {
      currentCategory = category;
      const buttons = document.querySelectorAll('.filter-btn');
      buttons.forEach(btn => {
        btn.className = 'filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition';
      });
      btnElement.className = 'filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white shadow-xs transition';
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
  </script>
</body>
</html>