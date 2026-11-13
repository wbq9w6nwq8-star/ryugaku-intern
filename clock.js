const globalCities = [
  { name: 'ロサンゼルス', zone: 'America/Los_Angeles', country: 'US' },
  { name: 'ニューヨーク', zone: 'America/New_York', country: 'US' },
  { name: 'トロント', zone: 'America/Toronto', country: 'Canada' },
  { name: 'バンクーバー', zone: 'America/Vancouver', country: 'Canada' },
  { name: 'ロンドン', zone: 'Europe/London', country: 'UK' },
  { name: 'パリ', zone: 'Europe/Paris', country: 'France' },
  { name: 'ワルシャワ', zone: 'Europe/Warsaw', country: 'Poland' },
  { name: 'イスタンブール', zone: 'Europe/Istanbul', country: 'Turkey' },
  { name: 'ドバイ', zone: 'Asia/Dubai', country: 'UAE' },
  { name: 'タイ', zone: 'Asia/Bangkok', country: 'Thailand' },
  { name: 'マレーシア', zone: 'Asia/Kuala_Lumpur', country: 'Malaysia' },
  { name: '台湾', zone: 'Asia/Taipei', country: 'Taiwan' },
  { name: '東京', zone: 'Asia/Tokyo', country: 'Japan' },
  { name: 'シドニー', zone: 'Australia/Sydney', country: 'Australia' }
];

// 指定したタイムゾーンの「協定世界時からのオフセット（分）」を計算する関数
function getTimezoneOffsetMinutes(date, timeZone) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
  return (tzDate.getTime() - utcDate.getTime()) / (60 * 1000);
}

function updateGlobalClocks() {
  const grid = document.getElementById('global-clock-grid');
  if (!grid) return;

  const now = new Date();

  // 1. 各都市の現在のタイムゾーンオフセットを計算し、時差順（西から東へ）にソートする
  const sortedCities = [...globalCities].map(city => {
    const offset = getTimezoneOffsetMinutes(now, city.zone);
    
    // 現地の時間・日付・時・分・秒・曜日を取得
    const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: city.zone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = timeFormatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
    const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
    const second = parseInt(parts.find(p => p.type === 'second').value, 10);

    const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: city.zone,
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
    const dateStr = dateFormatter.format(now);

    // 昼夜判定（6時〜18時を昼とする）
    const isDay = hour >= 6 && hour < 18;

    return { ...city, offset, hour, minute, second, dateStr, isDay };
  }).sort((a, b) => a.offset - b.offset);

  // 2. アナログ時計のSVGとカードを描画
  grid.innerHTML = sortedCities.map(city => {
    // 針の角度計算
    // 秒針: 1秒で6度 (360 / 60)
    const secondAngle = city.second * 6;
    // 分針: 1分で6度 ＋ 秒の進み分 (0.1度)
    const minuteAngle = city.minute * 6 + city.second * 0.1;
    // 時針: 1時間で30度 (360 / 12) ＋ 分の進み分 (0.5度)
    const hourAngle = (city.hour % 12) * 30 + city.minute * 0.5;

    // 昼と夜でカードや文字盤の色を切り替え
    const cardBg = city.isDay 
      ? 'bg-slate-800/90 border-slate-700 text-slate-100' 
      : 'bg-slate-950/90 border-slate-800/80 text-slate-300';
    
    const clockFaceBg = city.isDay ? 'fill-slate-700' : 'fill-slate-900';
    const clockRim = city.isDay ? 'stroke-slate-500' : 'stroke-slate-700';
    const hourHandColor = city.isDay ? 'stroke-white' : 'stroke-slate-200';
    const minuteHandColor = city.isDay ? 'stroke-slate-200' : 'stroke-slate-400';
    const dotColor = city.isDay ? 'fill-indigo-400' : 'fill-indigo-500';
    const icon = city.isDay ? '☀️' : '🌙';

    return `
      <div class="${cardBg} border rounded-xl p-3 flex flex-col items-center justify-between transition shadow-sm hover:scale-[1.02]">
        <div class="w-full flex items-center justify-between text-[11px] mb-1.5">
          <span class="font-bold text-white">${city.name}</span>
          <span>${icon}</span>
        </div>

        <!-- SVGアナログ時計 -->
        <div class="relative w-20 h-20 my-1">
          <svg class="w-full h-full drop-shadow-sm" viewBox="0 0 100 100">
            <!-- 文字盤の背景 -->
            <circle cx="50" cy="50" r="46" class="${clockFaceBg} ${clockRim}" stroke-width="3" />
            
            <!-- 文字盤の目盛り（12時間分） -->
            <line x1="50" y1="8" x2="50" y2="14" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
            <line x1="50" y1="86" x2="50" y2="92" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
            <line x1="8" y1="50" x2="14" y2="50" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
            <line x1="86" y1="50" x2="92" y2="50" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />

            <!-- 時針 -->
            <line x1="50" y1="50" x2="50" y2="28" class="${hourHandColor}" stroke-width="4" stroke-linecap="round" transform="rotate(${hourAngle} 50 50)" />
            
            <!-- 分針 -->
            <line x1="50" y1="50" x2="50" y2="18" class="${minuteHandColor}" stroke-width="3" stroke-linecap="round" transform="rotate(${minuteAngle} 50 50)" />
            
            <!-- 秒針 -->
            <line x1="50" y1="55" x2="50" y2="15" stroke="#f43f5e" stroke-width="1.5" stroke-linecap="round" transform="rotate(${secondAngle} 50 50)" />
            
            <!-- 中心ピン -->
            <circle cx="50" cy="50" r="3.5" class="${dotColor}" />
          </svg>
        </div>

        <div class="text-center mt-1">
          <div class="text-[10px] text-slate-400 font-mono">
            ${String(city.hour).padStart(2, '0')}:${String(city.minute).padStart(2, '0')}
          </div>
          <div class="text-[9px] text-slate-500">
            ${city.dateStr} (${city.country})
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  updateGlobalClocks();
  setInterval(updateGlobalClocks, 1000);
});