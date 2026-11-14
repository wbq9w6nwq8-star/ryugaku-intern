// 主要都市リスト（代表的な7都市に厳選）
const PRESET_CITIES = [
  { name: 'London', ja: 'ロンドン', country: 'UK', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'Paris', ja: 'パリ', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
  { name: 'New York', ja: 'ニューヨーク', country: 'USA', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'Vancouver', ja: 'バンクーバー', country: 'Canada', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },
  { name: 'Sydney', ja: 'シドニー', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Singapore', ja: 'シンガポール', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
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

// 最上部ナビゲーションバーに「現地ライフ・天気」タブを先頭追加（絵文字なし）
function injectTopNavTab() {
  setTimeout(() => {
    const header = document.getElementById('common-header') || document.querySelector('header');
    if (!header || header.querySelector('a[href="local.html"]')) return;

    const navContainer = header.querySelector('nav') || header.querySelector('.flex.items-center.space-x-6, .flex.space-x-4, ul');
    const isLocalPage = window.location.pathname.includes('local.html');

    const tabLink = document.createElement('a');
    tabLink.href = 'local.html';
    tabLink.textContent = '現地ライフ・天気';
    tabLink.className = isLocalPage
      ? 'text-xs sm:text-sm font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition shrink-0'
      : 'text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition shrink-0';

    if (navContainer) {
      navContainer.insertBefore(tabLink, navContainer.firstChild);
    }
  }, 150);
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
      const detected = {
        name: data.city || 'London',
        ja: matchedPreset ? matchedPreset.ja : (data.city || '現在地周辺'),
        country: data.country_name || '',
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

// 自由記入した都市名から座標を取得
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
  const r = rEn || rJa;

  if (r) {
    return {
      name: rEn ? rEn.name : r.name,
      ja: query,
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude,
      tz: r.timezone || 'UTC'
    };
  }
  return null;
}

function decodeEntities(str) {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

// どんなXML/RSS形式でも確実に取り出す強化版パーサー
function extractRssItems(rawText) {
  if (!rawText) throw new Error('Empty response');

  const items = [];
  // DOMParser と 正規表現のハイブリッドで抽出
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

  // DOMParserで取れなかった場合の正規表現フォールバック
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

// 単一のRSS URLに対して複数プロキシを競争させる関数
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

// 多段階フォールバックで確実に都市のニュースを取得する関数
async function fetchLocalNewsReliable(cityObj) {
  const isJapan = cityObj.country === 'Japan' || cityObj.name === 'Tokyo' || cityObj.ja === '東京';

  // 1. まずメインの言語（日本なら日本語、海外なら英語）でGoogle News RSSを取得
  const primaryKeyword = isJapan ? cityObj.ja : (cityObj.name || cityObj.ja);
  const primaryRssUrl = isJapan
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(primaryKeyword)}&hl=ja&gl=JP&ceid=JP:ja`
    : `https://news.google.com/rss/search?q=${encodeURIComponent(primaryKeyword)}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const items = await fetchRssViaMultipleProxies(primaryRssUrl);
    if (items && items.length > 0) return { items, isJaSource: isJapan };
  } catch (e) {
    console.warn('Primary RSS attempt failed, trying fallback query:', e);
  }

  // 2. 海外都市でも日本語のGoogle News RSSなら取れるケース（またはその逆）をフォールバック試行
  const secondaryKeyword = isJapan ? (cityObj.name || 'Tokyo') : cityObj.ja;
  const secondaryRssUrl = isJapan
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(secondaryKeyword)}&hl=en-US&gl=US&ceid=US:en`
    : `https://news.google.com/rss/search?q=${encodeURIComponent(secondaryKeyword)}&hl=ja&gl=JP&ceid=JP:ja`;

  try {
    const items = await fetchRssViaMultipleProxies(secondaryRssUrl);
    if (items && items.length > 0) return { items, isJaSource: !isJapan };
  } catch (e) {
    console.warn('Secondary RSS attempt failed, trying GDELT direct API:', e);
  }

  // 3. プロキシ不要・CORSフリーのGDELT APIから直接取得（フレーズ一致ではなく広めのキーワードでヒット率向上）
  for (const kw of [cityObj.name, cityObj.ja, cityObj.country].filter(Boolean)) {
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
        return { items, isJaSource: false };
      }
    } catch (e) {}
  }

  throw new Error('All news sources exhausted');
}

// 英語のニュース見出しを一括で日本語に自動翻訳
async function translateTitlesBatch(items) {
  if (!items || items.length === 0) return items;

  try {
    const delimiter = ' ||| ';
    const combinedText = items.map(i => i.title.replace(/\n/g, ' ')).join(delimiter);
    const trUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(combinedText)}`;

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
  injectTopNavTab();

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
          alert('都市が見つかりませんでした。別の表記や英語名でお試しください。');
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

    const titleEl = document.getElementById('news-city-title');
    if (titleEl) {
      titleEl.textContent = `${currentCity.ja} (${currentCity.country || currentCity.name}) の現地ニュース`;
    }

    const cacheKey = `atrium_news_v3_${currentCity.name}`;
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.time < 10 * 60 * 1000 && parsed.items?.length > 0) {
            drawNewsCards(parsed.items);
            return;
          }
        } catch (e) {}
      }
    }

    newsContainer.innerHTML = `<div class="col-span-full text-xs text-slate-400 text-center py-10 animate-pulse">「${currentCity.ja}」の現地ニュースを取得しています...</div>`;

    try {
      const { items: rawItems, isJaSource } = await fetchLocalNewsReliable(currentCity);

      // まず取得できた時点で即座に画面へ描画
      drawNewsCards(rawItems);

      // 英語ソースの場合は裏で日本語翻訳して差し替え
      if (!isJaSource) {
        const translatedItems = await translateTitlesBatch(rawItems);
        sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), items: translatedItems }));
        drawNewsCards(translatedItems);
      } else {
        sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), items: rawItems }));
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

  function drawNewsCards(items) {
    newsContainer.innerHTML = items.map(item => {
      let pubDate = '';
      if (item.pubDate) {
        const d = new Date(item.pubDate);
        pubDate = !isNaN(d) ? d.toLocaleDateString('ja-JP') : item.pubDate;
      }
      const hasOriginal = item.originalTitle && item.originalTitle !== item.title;

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
            <span class="text-[10px] text-slate-400 font-semibold">${hasOriginal ? '自動日本語翻訳' : '最新トピック'}</span>
            <span class="text-[11px] font-bold text-indigo-600">記事を読む →</span>
          </div>
        </a>
      `;
    }).join('');
  }

  renderWeatherWidget();
  renderLocalNews();
});