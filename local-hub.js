const PRESET_CITIES = [
  { name: 'London', ja: 'ロンドン', country: 'UK', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'Paris', ja: 'パリ', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
  { name: 'New York', ja: 'ニューヨーク', country: 'USA', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'Boston', ja: 'ボストン', country: 'USA', lat: 42.3601, lon: -71.0589, tz: 'America/New_York' },
  { name: 'Los Angeles', ja: 'ロサンゼルス', country: 'USA', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'Vancouver', ja: 'バンクーバー', country: 'Canada', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },
  { name: 'Toronto', ja: 'トロント', country: 'Canada', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' },
  { name: 'Sydney', ja: 'シドニー', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Melbourne', ja: 'メルボルン', country: 'Australia', lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne' },
  { name: 'Berlin', ja: 'ベルリン', country: 'Germany', lat: 52.5200, lon: 13.4050, tz: 'Europe/Berlin' },
  { name: 'Singapore', ja: 'シンガポール', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Bangkok', ja: 'バンコク', country: 'Thailand', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok' },
  { name: 'Tokyo', ja: '東京', country: 'Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' }
];

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getWeatherInfo(code) {
  if (code === 0) return { icon: '☀️', label: '快晴' };
  if (code <= 3) return { icon: '⛅', label: '晴れ時々曇り' };
  if (code <= 48) return { icon: '🌫️', label: '霧・曇り' };
  if (code <= 67) return { icon: '🌧️', label: '雨' };
  if (code <= 77) return { icon: '❄️', label: '雪' };
  if (code <= 82) return { icon: '🌦️', label: 'にわか雨' };
  return { icon: '⛈️', label: '雷雨・荒天' };
}

async function initUserLocation() {
  const saved = localStorage.getItem('atrium_user_city');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }

  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data && data.latitude && data.longitude) {
      const detected = {
        name: data.city || 'London',
        ja: data.city || '現在地周辺',
        country: data.country_name || '',
        lat: data.latitude,
        lon: data.longitude,
        tz: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      localStorage.setItem('atrium_user_city', JSON.stringify(detected));
      return detected;
    }
  } catch (e) {
    console.warn('IP位置情報の取得をスキップしました');
  }

  return PRESET_CITIES[0];
}

async function searchCityByName(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=ja&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const r = data.results[0];
    return {
      name: r.name,
      ja: r.name,
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude,
      tz: r.timezone || 'UTC'
    };
  }
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {
  const widgetContainer = document.getElementById('local-life-widget');
  const newsContainer = document.getElementById('local-news-feed');
  if (!widgetContainer && !newsContainer) return;

  let currentCity = await initUserLocation();

  function getSortedPresets() {
    return [...PRESET_CITIES].sort((a, b) => {
      const distA = getDistanceKm(currentCity.lat, currentCity.lon, a.lat, a.lon);
      const distB = getDistanceKm(currentCity.lat, currentCity.lon, b.lat, b.lon);
      return distA - distB;
    });
  }

  async function renderWeatherWidget() {
    if (!widgetContainer) return;

    const sortedCities = getSortedPresets();
    const optionsHtml = sortedCities.map(c => {
      const isSelected = (Math.abs(c.lat - currentCity.lat) < 0.2) ? 'selected' : '';
      return `<option value="${c.name}" ${isSelected}>📍 ${c.ja} (${c.country})</option>`;
    }).join('');

    // 現在のページが local.html かどうかでボタン表示を出し分け
    const isLocalPage = window.location.pathname.includes('local.html');
    const linkButtonHtml = isLocalPage
      ? ''
      : `<a href="local.html" class="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition">
           📰 この街のニュースを見る →
         </a>`;

    widgetContainer.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xs max-w-5xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4" id="weather-display">
            <div class="text-xs text-slate-400">現地情報を取得中...</div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <select id="city-select" class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer">
              <option value="__custom__">-- 近い都市から選択 --</option>
              ${optionsHtml}
              <option value="__other__">✏️ その他（都市名を記入）</option>
            </select>

            <form id="custom-city-form" class="hidden flex items-center space-x-1.5">
              <input type="text" id="custom-city-input" placeholder="例: リヨン, セブ, オークランド" class="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 w-44 focus:outline-none focus:border-indigo-500">
              <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer">変更</button>
            </form>

            ${linkButtonHtml}
          </div>
        </div>
      </div>
    `;

    try {
      const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${currentCity.lat}&longitude=${currentCity.lon}&current=temperature_2m,weather_code&timezone=auto`;
      const wRes = await fetch(wUrl);
      const wData = await wRes.json();
      const temp = Math.round(wData.current.temperature_2m);
      const wInfo = getWeatherInfo(wData.current.weather_code);

      let localTimeStr = '';
      try {
        localTimeStr = new Intl.DateTimeFormat('ja-JP', {
          timeZone: currentCity.tz || 'UTC',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date());
      } catch (e) {}

      const displayEl = document.getElementById('weather-display');
      if (displayEl) {
        displayEl.innerHTML = `
          <div class="text-3xl sm:text-4xl bg-slate-50 p-2.5 rounded-2xl border border-slate-100">${wInfo.icon}</div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-extrabold text-base sm:text-lg text-slate-900">${currentCity.ja}</span>
              <span class="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">現地時刻 ${localTimeStr}</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">${wInfo.label} ・ 現在の気温 <strong class="text-slate-800">${temp}°C</strong></p>
          </div>
        `;
      }
    } catch (err) {
      console.error('天気取得エラー:', err);
    }

    const selectEl = document.getElementById('city-select');
    const customForm = document.getElementById('custom-city-form');

    if (selectEl) {
      selectEl.addEventListener('change', async (e) => {
        const val = e.target.value;
        if (val === '__other__') {
          customForm.classList.remove('hidden');
          document.getElementById('custom-city-input').focus();
          return;
        }
        customForm.classList.add('hidden');
        const found = PRESET_CITIES.find(c => c.name === val);
        if (found) {
          currentCity = found;
          localStorage.setItem('atrium_user_city', JSON.stringify(currentCity));
          await renderWeatherWidget();
          if (newsContainer) await renderLocalNews();
        }
      });
    }

    if (customForm) {
      customForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputVal = document.getElementById('custom-city-input').value.trim();
        if (!inputVal) return;
        const result = await searchCityByName(inputVal);
        if (!result) {
          alert('都市が見つかりませんでした。別の都市名や英語表記でお試しください。');
          return;
        }
        currentCity = result;
        localStorage.setItem('atrium_user_city', JSON.stringify(currentCity));
        await renderWeatherWidget();
        if (newsContainer) await renderLocalNews();
      });
    }
  }

  async function renderLocalNews() {
    if (!newsContainer) return;

    const titleEl = document.getElementById('news-city-title');
    if (titleEl) {
      titleEl.textContent = `📍 ${currentCity.ja} 周辺の最新ニュース＆生活情報`;
    }

    newsContainer.innerHTML = `<div class="col-span-full text-xs text-slate-400 text-center py-10">「${currentCity.ja}」の現地ニュースを取得しています...</div>`;

    try {
      const query = encodeURIComponent(`${currentCity.ja} OR ${currentCity.name}`);
      const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=ja&gl=JP&ceid=JP:ja`;
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        newsContainer.innerHTML = `<div class="col-span-full text-xs text-slate-500 text-center py-8">現在この都市に関するニュースが見つかりませんでした。</div>`;
        return;
      }

      newsContainer.innerHTML = data.items.slice(0, 10).map(item => {
        const pubDate = item.pubDate ? new Date(item.pubDate.replace(' ', 'T')).toLocaleDateString('ja-JP') : '';
        return `
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="flex flex-col justify-between bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:bg-white rounded-2xl p-4 transition shadow-2xs hover:shadow-md">
            <div>
              <div class="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span class="font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">${currentCity.ja}</span>
                <span class="font-mono">${pubDate}</span>
              </div>
              <h3 class="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">${item.title}</h3>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-200/50 text-right">
              <span class="text-[11px] font-bold text-indigo-600">記事を読む →</span>
            </div>
          </a>
        `;
      }).join('');
    } catch (err) {
      console.error('ニュース取得エラー:', err);
      newsContainer.innerHTML = `<div class="col-span-full text-xs text-rose-500 text-center py-8">ニュースの読み込みに失敗しました。</div>`;
    }
  }

  await renderWeatherWidget();
  await renderLocalNews();
});