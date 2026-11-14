// 主要都市リスト（現地語名 localName と国コード countryCode を保持）
const PRESET_CITIES = [
  { name: 'London', localName: 'London', ja: 'ロンドン', country: 'UK', countryCode: 'GB', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'Paris', localName: 'Paris', ja: 'パリ', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
  { name: 'New York', localName: 'New York', ja: 'ニューヨーク', country: 'USA', countryCode: 'US', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'Vancouver', localName: 'Vancouver', ja: 'バンクーバー', country: 'Canada', countryCode: 'CA', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },
  { name: 'Sydney', localName: 'Sydney', ja: 'シドニー', country: 'Australia', countryCode: 'AU', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Singapore', localName: 'Singapore', ja: 'シンガポール', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Tokyo', localName: '東京', ja: '東京', country: 'Japan', countryCode: 'JP', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' }
];

// 国コードに応じたGoogle Newsの現地言語・地域パラメータ辞書
const COUNTRY_LOCALE_MAP = {
  JP: { lang: 'ja', hl: 'ja', gl: 'JP', ceid: 'JP:ja', label: '日本語' },
  FR: { lang: 'fr', hl: 'fr', gl: 'FR', ceid: 'FR:fr', label: 'フランス語' },
  DE: { lang: 'de', hl: 'de', gl: 'DE', ceid: 'DE:de', label: 'ドイツ語' },
  AT: { lang: 'de', hl: 'de', gl: 'AT', ceid: 'AT:de', label: 'ドイツ語' },
  CH: { lang: 'de', hl: 'de', gl: 'CH', ceid: 'CH:de', label: 'ドイツ語' },
  ES: { lang: 'es', hl: 'es', gl: 'ES', ceid: 'ES:es', label: 'スペイン語' },
  MX: { lang: 'es', hl: 'es-419', gl: 'MX', ceid: 'MX:es-419', label: 'スペイン語' },
  AR: { lang: 'es', hl: 'es-419', gl: 'AR', ceid: 'AR:es-419', label: 'スペイン語' },
  IT: { lang: 'it', hl: 'it', gl: 'IT', ceid: 'IT:it', label: 'イタリア語' },
  PT: { lang: 'pt', hl: 'pt-PT', gl: 'PT', ceid: 'PT:pt-150', label: 'ポルトガル語' },
  BR: { lang: 'pt', hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419', label: 'ポルトガル語' },
  NL: { lang: 'nl', hl: 'nl', gl: 'NL', ceid: 'NL:nl', label: 'オランダ語' },
  BE: { lang: 'fr', hl: 'fr', gl: 'BE', ceid: 'BE:fr', label: 'フランス語' },
  KR: { lang: 'ko', hl: 'ko', gl: 'KR', ceid: 'KR:ko', label: '韓国語' },
  TW: { lang: 'zh', hl: 'zh-TW', gl: 'TW', ceid: 'TW:zh-Hant', label: '中国語(繁体)' },
  HK: { lang: 'zh', hl: 'zh-HK', gl: 'HK', ceid: 'HK:zh-Hant', label: '中国語(繁体)' },
  CN: { lang: 'zh', hl: 'zh-CN', gl: 'CN', ceid: 'CN:zh-Hans', label: '中国語(簡体)' },
  TH: { lang: 'th', hl: 'th', gl: 'TH', ceid: 'TH:th', label: 'タイ語' },
  VN: { lang: 'vi', hl: 'vi', gl: 'VN', ceid: 'VN:vi', label: 'ベトナム語' },
  ID: { lang: 'id', hl: 'id', gl: 'ID', ceid: 'ID:id', label: 'インドネシア語' },
  MY: { lang: 'en', hl: 'en-MY', gl: 'MY', ceid: 'MY:en', label: '英語' },
  PH: { lang: 'en', hl: 'en-PH', gl: 'PH', ceid: 'PH:en', label: '英語' },
  SG: { lang: 'en', hl: 'en-SG', gl: 'SG', ceid: 'SG:en', label: '英語' },
  IN: { lang: 'en', hl: 'en-IN', gl: 'IN', ceid: 'IN:en', label: '英語' },
  GB: { lang: 'en', hl: 'en-GB', gl: 'GB', ceid: 'GB:en', label: '英語' },
  IE: { lang: 'en', hl: 'en-IE', gl: 'IE', ceid: 'IE:en', label: '英語' },
  AU: { lang: 'en', hl: 'en-AU', gl: 'AU', ceid: 'AU:en', label: '英語' },
  NZ: { lang: 'en', hl: 'en-NZ', gl: 'NZ', ceid: 'NZ:en', label: '英語' },
  CA: { lang: 'en', hl: 'en-CA', gl: 'CA', ceid: 'CA:en', label: '英語' },
  US: { lang: 'en', hl: 'en-US', gl: 'US', ceid: 'US:en', label: '英語' },
  SE: { lang: 'sv', hl: 'sv', gl: 'SE', ceid: 'SE:sv', label: 'スウェーデン語' },
  NO: { lang: 'no', hl: 'no', gl: 'NO', ceid: 'NO:no', label: 'ノルウェー語' },
  PL: { lang: 'pl', hl: 'pl', gl: 'PL', ceid: 'PL:pl', label: 'ポーランド語' },
  TR: { lang: 'tr', hl: 'tr', gl: 'TR', ceid: 'TR:tr', label: 'トルコ語' }
};

// 国名や国コードから最適な現地語設定を返す関数
function getLocaleConfig(cityObj) {
  const code = (cityObj.countryCode || '').toUpperCase();
  if (COUNTRY_LOCALE_MAP[code]) return COUNTRY_LOCALE_MAP[code];

  const cName = (cityObj.country || '').toLowerCase();
  if (cName.includes('japan') || cityObj.ja === '東京') return COUNTRY_LOCALE_MAP.JP;
  if (cName.includes('france') || cName.includes('フランス')) return COUNTRY_LOCALE_MAP.FR;
  if (cName.includes('germany') || cName.includes('ドイツ')) return COUNTRY_LOCALE_MAP.DE;
  if (cName.includes('spain') || cName.includes('スペイン')) return COUNTRY_LOCALE_MAP.ES;
  if (cName.includes('italy') || cName.includes('イタリア')) return COUNTRY_LOCALE_MAP.IT;
  if (cName.includes('korea') || cName.includes('韓国')) return COUNTRY_LOCALE_MAP.KR;
  if (cName.includes('taiwan') || cName.includes('台湾')) return COUNTRY_LOCALE_MAP.TW;
  if (cName.includes('thailand') || cName.includes('タイ')) return COUNTRY_LOCALE_MAP.TH;
  if (cName.includes('uk') || cName.includes('united kingdom') || cName.includes('イギリス')) return COUNTRY_LOCALE_MAP.GB;
  if (cName.includes('australia') || cName.includes('オーストラリア')) return COUNTRY_LOCALE_MAP.AU;
  if (cName.includes('canada') || cName.includes('カナダ')) return COUNTRY_LOCALE_MAP.CA;

  return COUNTRY_LOCALE_MAP.US;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 天気アイコンのみ絵文字を使用
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
      const matchedPreset = PRESET_CITIES.find(
        c => c.name.toLowerCase() === (data.city || '').toLowerCase()
      );
      if (matchedPreset) {
        localStorage.setItem('atrium_user_city', JSON.stringify(matchedPreset));
        return matchedPreset;
      }
      const detected = {
        name: data.city || 'London',
        localName: data.city || 'London',
        ja: data.city || '現在地周辺',
        country: data.country_name || '',
        countryCode: data.country_code || 'GB',
        lat: data.latitude,
        lon: data.longitude,
        tz: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      localStorage.setItem('atrium_user_city', JSON.stringify(detected));
      return detected;
    }
  } catch (e) {}

  return PRESET_CITIES[0];
}

// 自由記入した都市名から座標・国コード・現地語表記を取得
async function searchCityByName(query) {
  const preset = PRESET_CITIES.find(
    c => c.ja === query || c.name.toLowerCase() === query.toLowerCase()
  );
  if (preset) return preset;

  const [resEn, resJa] = await Promise.all([
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`).then(r => r.json()).catch(() => ({})),
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=ja&format=json`).then(r => r.json()).catch(() => ({}))
  ]);

  const rEn = resEn.results?.[0];
  const rJa = resJa.results?.[0];
  const base = rEn || rJa;

  if (!base) return null;

  const countryCode = (base.country_code || '').toUpperCase();
  const localeCfg = COUNTRY_LOCALE_MAP[countryCode];
  let localName = rEn ? rEn.name : base.name;

  // 英語・日本語以外の国（フランス、ドイツ、韓国など）なら、その国の現地語での都市名も取得する
  if (localeCfg && localeCfg.lang !== 'en' && localeCfg.lang !== 'ja') {
    try {
      const resLocal = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(localName)}&count=1&language=${localeCfg.lang}&format=json`).then(r => r.json());
      if (resLocal.results?.[0]?.name) {
        localName = resLocal.results[0].name;
      }
    } catch (e) {}
  }

  return {
    name: rEn ? rEn.name : base.name,
    localName: localName,
    ja: rJa ? rJa.name : query,
    country: base.country || '',
    countryCode: countryCode,
    lat: base.latitude,
    lon: base.longitude,
    tz: base.timezone || 'UTC'
  };
}

function decodeEntities(str) {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

function extractRssItems(rawText) {
  if (!rawText) throw new Error('Empty response');

  const items = [];
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(rawText, 'text/xml');
    const nodes = xml.querySelectorAll('item, entry');
    nodes.forEach(node => {
      if (items.length >= 10) return;
      const rawTitle = node.querySelector('title')?.textContent || '';
      const rawLink = node.querySelector('link')?.textContent || node.querySelector('link')?.getAttribute('href') || '';
      const rawDate = node.querySelector('pubDate, published, updated')?.textContent || '';
      if (rawTitle && rawLink) {
        items.push({
          title: decodeEntities(rawTitle.trim()).replace(/\s*-\s*[^-]+$/, ''),
          link: rawLink.trim(),
          pubDate: rawDate.trim()
        });
      }
    });
    if (items.length > 0) return items;
  } catch (e) {}

  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = itemRegex.exec(rawText)) !== null && items.length < 10) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) || block.match(/<link[^>]+href=["']([^"']+)["']/i);
    const dateMatch = block.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i);

    if (titleMatch && linkMatch) {
      const cleanTitle = decodeEntities(titleMatch[1].trim()).replace(/\s*-\s*[^-]+$/, '');
      items.push({
        title: cleanTitle,
        link: linkMatch[1].trim(),
        pubDate: dateMatch ? dateMatch[1].trim() : ''
      });
    }
  }

  if (items.length === 0) throw new Error('No valid RSS items');
  return items;
}

async function fetchWithTimeout(url, ms = 7500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function fetchRssViaMultipleProxies(rssUrl) {
  const routeRss2Json = async () => {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetchWithTimeout(apiUrl, 6500);
    const data = await res.json();
    if (!data.items || data.items.length === 0) throw new Error('rss2json empty');
    return data.items.slice(0, 10).map(i => ({
      title: decodeEntities((i.title || '').replace(/\s*-\s*[^-]+$/, '')),
      link: i.link,
      pubDate: i.pubDate
    }));
  };

  const routeAllOriginsRaw = async () => {
    const res = await fetchWithTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`, 7500);
    return extractRssItems(await res.text());
  };

  const routeAllOriginsGet = async () => {
    const res = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`, 7500);
    const json = await res.json();
    return extractRssItems(json.contents || '');
  };

  const routeCodeTabs = async () => {
    const res = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`, 7500);
    return extractRssItems(await res.text());
  };

  const routeCorsProxy = async () => {
    const res = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(rssUrl)}`, 7500);
    return extractRssItems(await res.text());
  };

  return await Promise.any([
    routeRss2Json(),
    routeAllOriginsRaw(),
    routeAllOriginsGet(),
    routeCodeTabs(),
    routeCorsProxy()
  ]);
}

// 都市の国の言語（現地語）で検索し、データを返す関数
async function fetchLocalNewsReliable(cityObj) {
  const locale = getLocaleConfig(cityObj);
  const isJapan = locale.lang === 'ja';

  // 1. その都市の国の現地語・現地エディションで検索（例: リヨンならフランス語版Google Newsで「Lyon」を検索）
  const localKeyword = isJapan ? cityObj.ja : (cityObj.localName || cityObj.name || cityObj.ja);
  const localRssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(localKeyword)}&hl=${locale.hl}&gl=${locale.gl}&ceid=${encodeURIComponent(locale.ceid)}`;

  try {
    const items = await fetchRssViaMultipleProxies(localRssUrl);
    if (items && items.length > 0) {
      return { items, isJaSource: isJapan, langLabel: locale.label, sourceLang: locale.lang };
    }
  } catch (e) {
    console.warn('Local language RSS attempt failed, trying fallback:', e);
  }

  // 2. フォールバック：英語エディションまたは日本語エディションで検索
  const fallbackKeyword = cityObj.name || cityObj.ja;
  const fallbackRssUrl = isJapan
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(fallbackKeyword)}&hl=en-US&gl=US&ceid=US:en`
    : `https://news.google.com/rss/search?q=${encodeURIComponent(cityObj.ja)}&hl=ja&gl=JP&ceid=JP:ja`;

  try {
    const items = await fetchRssViaMultipleProxies(fallbackRssUrl);
    if (items && items.length > 0) {
      return { items, isJaSource: !isJapan, langLabel: isJapan ? '英語' : '日本語', sourceLang: isJapan ? 'en' : 'ja' };
    }
  } catch (e) {}

  // 3. 最終バックアップ：GDELT Project API（CORSフリー直接取得）
  for (const kw of [cityObj.localName, cityObj.name, cityObj.country].filter(Boolean)) {
    try {
      const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(kw)}&mode=artlist&maxrecords=10&format=json&sort=datedesc`;
      const res = await fetchWithTimeout(gdeltUrl, 7000);
      const data = await res.json();
      if (data && data.articles && data.articles.length > 0) {
        const items = data.articles.map(a => ({
          title: a.title,
          link: a.url,
          pubDate: a.seendate
            ? `${a.seendate.slice(0, 4)}/${a.seendate.slice(4, 6)}/${a.seendate.slice(6, 8)}`
            : ''
        }));
        return { items, isJaSource: false, langLabel: locale.label, sourceLang: 'auto' };
      }
    } catch (e) {}
  }

  throw new Error('All news sources exhausted');
}

// 現地語のニュース見出しを一括で日本語に自動翻訳
async function translateTitlesBatch(items, sourceLang = 'auto') {
  if (!items || items.length === 0) return items;

  try {
    const delimiter = ' ||| ';
    const combinedText = items.map(i => i.title.replace(/\n/g, ' ')).join(delimiter);
    const sl = sourceLang || 'auto';
    const trUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=ja&dt=t&q=${encodeURIComponent(combinedText)}`;

    const res = await fetchWithTimeout(trUrl, 5000);
    const data = await res.json();

    if (data && data[0]) {
      const fullTranslated = data[0].map(part => part[0]).join('');
      const translatedParts = fullTranslated.split(/\s*\|\|\|\s*/);

      return items.map((item, idx) => ({
        ...item,
        originalTitle: item.title,
        title: (translatedParts[idx] || item.title).trim()
      }));
    }
  } catch (e) {
    console.warn('翻訳スキップ（原文表示）:', e);
  }
  return items;
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
    const isPresetSelected = sortedCities.some(c => Math.abs(c.lat - currentCity.lat) < 0.2);

    const optionsHtml = sortedCities.map(c => {
      const isSelected = (Math.abs(c.lat - currentCity.lat) < 0.2) ? 'selected' : '';
      return `<option value="${c.name}" ${isSelected}>${c.ja} (${c.country})</option>`;
    }).join('');

    const customOptionHtml = !isPresetSelected
      ? `<option value="__current_custom__" selected>${currentCity.ja} (${currentCity.country || 'カスタム'})</option>`
      : '';

    const isLocalPage = window.location.pathname.includes('local.html');
    const linkButtonHtml = isLocalPage
      ? `<a href="index.html" class="inline-flex items-center text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3.5 py-2 rounded-xl transition">
           チャット＆時計へ戻る
         </a>`
      : `<a href="local.html" class="inline-flex items-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-xl transition shadow-2xs">
           この街のニュースを見る →
         </a>`;

    widgetContainer.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xs max-w-5xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4" id="weather-display">
            <div class="text-xs text-slate-400">現地情報を取得中...</div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <select id="city-select" class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer">
              ${customOptionHtml}
              ${optionsHtml}
              <option value="__other__">その他（都市名を自由記入）</option>
            </select>

            <form id="custom-city-form" class="hidden flex items-center space-x-1.5">
              <input type="text" id="custom-city-input" placeholder="都市名を入力" class="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 w-40 focus:outline-none focus:border-indigo-500">
              <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer">設定</button>
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
          renderWeatherWidget();
          if (newsContainer) renderLocalNews();
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
          alert('都市が見つかりませんでした。別の表記でお試しください。');
          return;
        }
        currentCity = result;
        localStorage.setItem('atrium_user_city', JSON.stringify(currentCity));
        renderWeatherWidget();
        if (newsContainer) renderLocalNews();
      });
    }
  }

  async function renderLocalNews(forceRefresh = false) {
    if (!newsContainer) return;

    const locale = getLocaleConfig(currentCity);
    const titleEl = document.getElementById('news-city-title');
    if (titleEl) {
      titleEl.textContent = `${currentCity.ja} (${currentCity.country || currentCity.name}) の現地ニュース`;
    }

    const cacheKey = `atrium_news_v4_${currentCity.name}_${locale.lang}`;
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.time < 10 * 60 * 1000 && parsed.items?.length > 0) {
            drawNewsCards(parsed.items, parsed.langLabel);
            return;
          }
        } catch (e) {}
      }
    }

    newsContainer.innerHTML = `<div class="col-span-full text-xs text-slate-400 text-center py-10 animate-pulse">「${currentCity.ja}」の現地メディア（${locale.label}）から最新ニュースを取得しています...</div>`;

    try {
      const { items: rawItems, isJaSource, langLabel, sourceLang } = await fetchLocalNewsReliable(currentCity);

      // まず取得できた時点で即座に描画
      drawNewsCards(rawItems, langLabel);

      // 日本語以外の現地語記事なら、裏で即座に日本語へ一括翻訳して差し替え
      if (!isJaSource) {
        const translatedItems = await translateTitlesBatch(rawItems, sourceLang);
        sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), items: translatedItems, langLabel }));
        drawNewsCards(translatedItems, langLabel);
      } else {
        sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), items: rawItems, langLabel }));
      }
    } catch (err) {
      console.error('ニュース取得エラー:', err);
      newsContainer.innerHTML = `
        <div class="col-span-full text-center py-8 space-y-3">
          <p class="text-xs text-slate-500">一時的にニュースサーバーが混雑しています。</p>
          <button id="retry-news-btn" class="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition cursor-pointer">
            再読み込みする
          </button>
        </div>
      `;
      const retryBtn = document.getElementById('retry-news-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => renderLocalNews(true));
      }
    }
  }

  function drawNewsCards(items, langLabel = '') {
    newsContainer.innerHTML = items.map(item => {
      let pubDate = '';
      if (item.pubDate) {
        const d = new Date(item.pubDate);
        pubDate = !isNaN(d) ? d.toLocaleDateString('ja-JP') : item.pubDate;
      }
      const hasOriginal = item.originalTitle && item.originalTitle !== item.title;
      const footerLabel = hasOriginal
        ? `${langLabel ? langLabel + 'から' : ''}自動日本語翻訳`
        : '現地最新トピック';

      return `
        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="flex flex-col justify-between bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:bg-white rounded-2xl p-4 transition shadow-2xs hover:shadow-md">
          <div>
            <div class="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span class="font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">${currentCity.ja} ローカル</span>
              <span class="font-mono">${pubDate}</span>
            </div>
            <h3 class="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed mb-1">${item.title}</h3>
            ${hasOriginal ? `<p class="text-[10px] text-slate-400 line-clamp-1">${item.originalTitle}</p>` : ''}
          </div>
          <div class="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-semibold">${footerLabel}</span>
            <span class="text-[11px] font-bold text-indigo-600">記事を読む →</span>
          </div>
        </a>
      `;
    }).join('');
  }

  renderWeatherWidget();
  renderLocalNews();
});