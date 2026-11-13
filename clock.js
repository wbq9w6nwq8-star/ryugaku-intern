const globalCities = [
  { name: 'ロンドン', zone: 'Europe/London', country: 'UK' },
  { name: 'パリ', zone: 'Europe/Paris', country: 'France' },
  { name: 'ニューヨーク', zone: 'America/New_York', country: 'US' },
  { name: 'ロサンゼルス', zone: 'America/Los_Angeles', country: 'US' },
  { name: 'トロント', zone: 'America/Toronto', country: 'Canada' },
  { name: 'バンクーバー', zone: 'America/Vancouver', country: 'Canada' },
  { name: 'シドニー', zone: 'Australia/Sydney', country: 'Australia' },
  { name: 'ワルシャワ', zone: 'Europe/Warsaw', country: 'Poland' },
  { name: 'ドバイ', zone: 'Asia/Dubai', country: 'UAE' },
  { name: 'イスタンブール', zone: 'Europe/Istanbul', country: 'Turkey' },
  { name: '台湾', zone: 'Asia/Taipei', country: 'Taiwan' },
  { name: 'タイ', zone: 'Asia/Bangkok', country: 'Thailand' },
  { name: 'マレーシア', zone: 'Asia/Kuala_Lumpur', country: 'Malaysia' },
  { name: '東京', zone: 'Asia/Tokyo', country: 'Japan' }
];

function updateGlobalClocks() {
  const grid = document.getElementById('global-clock-grid');
  if (!grid) return;

  const now = new Date();
  
  grid.innerHTML = globalCities.map(city => {
    try {
      const timeString = new Intl.DateTimeFormat('ja-JP', {
        timeZone: city.zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);

      const dateString = new Intl.DateTimeFormat('ja-JP', {
        timeZone: city.zone,
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      }).format(now);

      const hourNum = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: city.zone, hour: 'numeric', hour12: false }).format(now), 10);
      const isDay = hourNum >= 6 && hourNum < 18;
      const icon = isDay ? '☀️' : '🌙';

      return `
        <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between hover:border-indigo-500/50 transition">
          <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span class="font-bold text-slate-200">${city.name}</span>
            <span>${icon}</span>
          </div>
          <div class="text-sm sm:text-base font-extrabold font-mono text-white tracking-tight my-0.5">
            ${timeString}
          </div>
          <div class="text-[10px] text-slate-400">
            ${dateString} (${city.country})
          </div>
        </div>
      `;
    } catch (e) {
      return '';
    }
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  updateGlobalClocks();
  setInterval(updateGlobalClocks, 1000);
});