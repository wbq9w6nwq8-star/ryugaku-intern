const globalCities = [
  { name: 'ロサンゼルス', zone: 'America/Los_Angeles', country: 'US' },
  { name: 'ニューヨーク', zone: 'America/New_York', country: 'US' },
  { name: 'トロント', zone: 'America/Toronto', country: 'Canada' },
  { name: 'ロンドン', zone: 'Europe/London', country: 'UK' },
  { name: 'パリ', zone: 'Europe/Paris', country: 'France' },
  { name: '東京', zone: 'Asia/Tokyo', country: 'Japan' },
  { name: 'シドニー', zone: 'Australia/Sydney', country: 'Australia' }
];

function getTimezoneOffsetMinutes(date, timeZone) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
  return (tzDate.getTime() - utcDate.getTime()) / (60 * 1000);
}

function updateGlobalClocks() {
  const grid = document.getElementById('global-clock-grid');
  if (!grid) return;

  const now = new Date();

  const sortedCities = [...globalCities].map(city => {
    const offset = getTimezoneOffsetMinutes(now, city.zone);
    
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

    const isDay = hour >= 6 && hour < 18;

    return { ...city, offset, hour, minute, second, dateStr, isDay };
  }).sort((a, b) => a.offset - b.offset);

  grid.innerHTML = sortedCities.map(city => {
    const secondAngle = city.second * 6;
    const minuteAngle = city.minute * 6 + city.second * 0.1;
    const hourAngle = (city.hour % 12) * 30 + city.minute * 0.5;

    // 昼と夜でカードのデザイン・配色を完全に切り替え
    const cardBg = city.isDay 
      ? 'bg-white border-slate-200 text-slate-800 shadow-xs' 
      : 'bg-slate-900 border-slate-800 text-slate-100 shadow-xs';
    
    const clockFaceBg = city.isDay ? 'fill-slate-50' : 'fill-slate-950';
    const clockRim = city.isDay ? 'stroke-slate-300' : 'stroke-slate-700';
    const hourHandColor = city.isDay ? 'stroke-slate-900' : 'stroke-white';
    const minuteHandColor = city.isDay ? 'stroke-slate-600' : 'stroke-slate-300';
    const tickColor = city.isDay ? '#cbd5e1' : '#475569';
    const dotColor = city.isDay ? 'fill-indigo-600' : 'fill-indigo-400';
    const icon = city.isDay ? '☀️' : '🌙';
    const nameColor = city.isDay ? 'text-slate-900' : 'text-white';
    const subTextColor = city.isDay ? 'text-slate-500' : 'text-slate-400';

    return `
      <div class="${cardBg} border rounded-2xl p-3 flex flex-col items-center justify-between transition hover:shadow-md">
        <div class="w-full flex items-center justify-between text-[11px] mb-1.5">
          <span class="font-extrabold ${nameColor}">${city.name}</span>
          <span class="text-xs">${icon}</span>
        </div>

        <!-- SVGアナログ時計 -->
        <div class="relative w-20 h-20 my-1">
          <svg class="w-full h-full drop-shadow-xs" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" class="${clockFaceBg} ${clockRim}" stroke-width="3" />
            
            <line x1="50" y1="8" x2="50" y2="14" stroke="${tickColor}" stroke-width="2.5" stroke-linecap="round" />
            <line x1="50" y1="86" x2="50" y2="92" stroke="${tickColor}" stroke-width="2.5" stroke-linecap="round" />
            <line x1="8" y1="50" x2="14" y2="50" stroke="${tickColor}" stroke-width="2.5" stroke-linecap="round" />
            <line x1="86" y1="50" x2="92" y2="50" stroke="${tickColor}" stroke-width="2.5" stroke-linecap="round" />

            <line x1="50" y1="50" x2="50" y2="28" class="${hourHandColor}" stroke-width="4" stroke-linecap="round" transform="rotate(${hourAngle} 50 50)" />
            <line x1="50" y1="50" x2="50" y2="18" class="${minuteHandColor}" stroke-width="3" stroke-linecap="round" transform="rotate(${minuteAngle} 50 50)" />
            <line x1="50" y1="55" x2="50" y2="15" stroke="#f43f5e" stroke-width="1.5" stroke-linecap="round" transform="rotate(${secondAngle} 50 50)" />
            
            <circle cx="50" cy="50" r="3.5" class="${dotColor}" />
          </svg>
        </div>

        <div class="text-center mt-1">
          <div class="text-xs font-extrabold font-mono ${nameColor}">
            ${String(city.hour).padStart(2, '0')}:${String(city.minute).padStart(2, '0')}
          </div>
          <div class="text-[9px] ${subTextColor}">
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