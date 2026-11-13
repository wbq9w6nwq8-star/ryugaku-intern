const SUPABASE_URL = 'https://mhsnyngfyqqsfexutskj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DZK0J_qUnYzK-0p6P6xezg_jEe8Ypzd';

let supabaseClient = null;

// 簡易的に自分の投稿をブラウザごとに識別するためのID（ローカルストレージに保存）
let myUserId = localStorage.getItem('atrium_my_uid');
if (!myUserId) {
  myUserId = 'user_' + Math.random().toString(36.subString(2, 9));
  localStorage.setItem('atrium_my_uid', myUserId);
}

const emojiMap = {
  'thumbs': '👍',
  'coffee': '☕',
  'fire': '🔥',
  'heart': '❤️',
  'smile': '😊'
};

function loadSupabaseScript() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve(window.supabase);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => resolve(window.supabase);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('pulse-form');
  const feedContainer = document.getElementById('pulse-feed');
  const textInput = document.getElementById('pulse-text');

  if (textInput) {
    textInput.setAttribute('maxlength', '20');
    textInput.setAttribute('placeholder', '今何してる？（20字以内でチャット送信）');
  }

  if (feedContainer) {
    // ブラウザの横幅にゆとりを持たせ、LINE風のトークルーム背景と高さを設定
    feedContainer.className = "space-y-4 max-h-[520px] overflow-y-auto p-4 sm:p-6 bg-slate-100/70 rounded-2xl border border-slate-200/80 shadow-inner";
    feedContainer.innerHTML = '<div class="text-xs text-slate-400 text-center py-6">チャットルームを読み込んでいます...</div>';
  }

  try {
    const supabaseLib = await loadSupabaseScript();
    supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    await fetchPulses();
    setupRealtimeSubscription();
  } catch (e) {
    console.error('Supabase初期化エラー:', e);
    if (feedContainer) {
      feedContainer.innerHTML = '<div class="text-xs text-rose-500 text-center py-4 bg-rose-50 rounded-xl">データベース接続エラー：設定を確認してください</div>';
    }
  }

  async function fetchPulses() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from('atrium_pulses')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('データ取得エラー:', error);
      return;
    }

    renderPulses(data || []);
  }

  function setupRealtimeSubscription() {
    if (!supabaseClient) return;
    supabaseClient
      .channel('public:atrium_pulses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atrium_pulses' }, payload => {
        fetchPulses();
      })
      .subscribe();
  }

  function renderPulses(pulses) {
    if (!feedContainer) return;

    if (pulses.length === 0) {
      feedContainer.innerHTML = `
        <div class="text-center py-12">
          <p class="text-xs font-bold text-slate-600 mb-1">まだメッセージはありません</p>
          <p class="text-[11px] text-slate-400">上のフォームから最初のメッセージを送ってみよう！</p>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = pulses.map(p => {
      const timeDiffSec = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 1000);
      let timeStr = 'たった今';
      if (timeDiffSec >= 60 && timeDiffSec < 3600) {
        timeStr = `${Math.floor(timeDiffSec / 60)}分前`;
      } else if (timeDiffSec >= 3600 && timeDiffSec < 86400) {
        timeStr = `${Math.floor(timeDiffSec / 3600)}時間前`;
      } else if (timeDiffSec >= 86400) {
        timeStr = `${Math.floor(timeDiffSec / 86400)}日前`;
      }

      const displayName = p.name && p.name.trim() !== '' ? escapeHTML(p.name) : '名無しの海外大生';
      const displayCity = p.city && p.city.trim() !== '' ? escapeHTML(p.city) : '世界どこか';

      // 自分が投稿したメッセージかどうかの判定（user_idカラムがある場合の想定。なければデフォルト左側）
      const isMyMessage = p.user_id && p.user_id === myUserId;

      const reactions = p.reactions || {};
      const reactionHtml = Object.entries(reactions).map(([key, count]) => {
        const displayEmoji = emojiMap[key] || key;
        return `
          <button onclick="window.addReaction('${p.id}', '${key}')" class="inline-flex items-center space-x-1 text-[10px] bg-white border border-slate-200 hover:bg-indigo-50 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer shadow-2xs">
            <span>${displayEmoji}</span>
            <span class="font-mono font-bold">${count}</span>
          </button>
        `;
      }).join('');

      // 自分の投稿は右側＆薄い青背景（インディゴ系）、他人の投稿は左側＆白背景＋吹き出しの「くちばし」をCSSで表現
      if (isMyMessage) {
        // 自分のメッセージ（右寄せ・薄い青背景）
        return `
          <div class="flex flex-col items-end space-y-1 mb-3">
            <div class="flex items-center space-x-2 text-[11px] text-slate-500 mr-1">
              <span class="font-mono">${timeStr}</span>
              <span class="font-bold text-indigo-700">${displayName} (${displayCity})</span>
            </div>
            <div class="relative max-w-[80%] sm:max-w-[70%] bg-indigo-50 border border-indigo-100 text-slate-800 rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-2xs">
              <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">${escapeHTML(p.text)}</p>
              
              <!-- リアクション表示 ＆ ＋ボタン -->
              <div class="flex flex-wrap items-center gap-1.5 pt-1.5 mt-1.5 border-t border-indigo-200/50 justify-end">
                ${reactionHtml}
                <div class="relative inline-block">
                  <button onclick="window.toggleEmojiPicker('${p.id}')" class="inline-flex items-center justify-center text-[10px] bg-white border border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-600 px-2 py-0.5 rounded-md transition cursor-pointer">
                    + リアクション
                  </button>
                  <div id="picker-${p.id}" class="hidden absolute bottom-full right-0 mb-2 bg-white border border-slate-200 shadow-xl rounded-xl p-2 flex space-x-2 z-50 whitespace-nowrap">
                    <button onclick="window.addReaction('${p.id}', '👍')" class="hover:scale-125 transition text-base p-1 cursor-pointer">👍</button>
                    <button onclick="window.addReaction('${p.id}', '🔥')" class="hover:scale-125 transition text-base p-1 cursor-pointer">🔥</button>
                    <button onclick="window.addReaction('${p.id}', '☕')" class="hover:scale-125 transition text-base p-1 cursor-pointer">☕</button>
                    <button onclick="window.addReaction('${p.id}', '🎉')" class="hover:scale-125 transition text-base p-1 cursor-pointer">🎉</button>
                    <button onclick="window.addReaction('${p.id}', '👀')" class="hover:scale-125 transition text-base p-1 cursor-pointer">👀</button>
                    <button onclick="window.addReaction('${p.id}', '😭')" class="hover:scale-125 transition text-base p-1 cursor-pointer">😭</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // 他人のメッセージ（左寄せ・白背景・吹き出しの左側にくちばし）
        return `
          <div class="flex flex-col items-start space-y-1 mb-3">
            <div class="flex items-center space-x-2 text-[11px] text-slate-500 ml-1">
              <span class="font-bold text-slate-900">${displayName}</span>
              <span class="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-indigo-100">${displayCity}</span>
              <span class="font-mono">${timeStr}</span>
            </div>
            <div class="relative max-w-[80%] sm:max-w-[70%] bg-white border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-2xs">
              <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">${escapeHTML(p.text)}</p>
              
              <!-- リアクション表示 ＆ ＋ボタン -->
              <div class="flex flex-wrap items-center gap-1.5 pt-1.5 mt-1.5 border-t border-slate-100">
                ${reactionHtml}
                <div class="relative inline-block">
                  <button onclick="window.toggleEmojiPicker('${p.id}')" class="inline-flex items-center justify-center text-[10px] bg-slate-50 border border-dashed border-slate-300 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 px-2 py-0.5 rounded-md transition cursor-pointer">
                    + リアクション
                  </button>
                  <div id="picker-${p.id}" class="hidden absolute bottom-full left-0 mb-2 bg-white border border-slate-200 shadow-xl rounded-xl p-2 flex space-x-2 z-50 whitespace-nowrap">
                    <button onclick="window.addReaction('${p.id}', '👍')" class="hover:scale-125 transition text-base p-1 cursor-pointer">👍</button>
                    <button onclick="window.addReaction('${p.id}', '🔥')" class="hover:scale-125 transition text-base p-1 cursor-pointer">🔥</button>
                    <button onclick="window.addReaction('${p.id}', '☕')" class="hover:scale-125 transition text-base p-1 cursor-pointer">☕</button>
                    <button onclick="window.addReaction('${p.id}', '🎉')" class="hover:scale-125 transition text-base p-1 cursor-pointer">🎉</button>
                    <button onclick="window.addReaction('${p.id}', '👀')" class="hover:scale-125 transition text-base p-1 cursor-pointer">👀</button>
                    <button onclick="window.addReaction(', '${p.id}', '😭')" class="hover:scale-125 transition text-base p-1 cursor-pointer">😭</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    feedContainer.scrollTop = feedContainer.scrollHeight;
  }

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

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!supabaseClient) return;

      const cityInput = document.getElementById('pulse-city');
      const nameInput = document.getElementById('pulse-name');
      const textInput = document.getElementById('pulse-text');

      const text = textInput.value.trim();
      if (!text) return;
      if (text.length > 20) {
        alert('20文字以内で入力してください！');
        return;
      }

      const { error } = await supabaseClient
        .from('atrium_pulses')
        .insert([
          {
            city: cityInput.value.trim() || '世界どこか',
            name: nameInput.value.trim() || '名無しの海外大生',
            text: text,
            reactions: {},
            user_id: myUserId // 自分の発言を判別するためのIDを一緒に保存
          }
        ]);

      if (error) {
        console.error('投稿エラー:', error);
        alert('投稿に失敗しました。');
        return;
      }

      textInput.value = '';
    });
  }
});

window.toggleEmojiPicker = function(id) {
  const picker = document.getElementById(`picker-${id}`);
  if (picker) {
    picker.classList.toggle('hidden');
  }
};

window.addReaction = async function(id, emoji) {
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient.from('atrium_pulses').select('reactions').eq('id', id).single();
    if (error) throw error;

    let reactions = data?.reactions || {};
    reactions[emoji] = (reactions[emoji] || 0) + 1;

    await supabaseClient
      .from('atrium_pulses')
      .update({ reactions: reactions })
      .eq('id', id);

    const picker = document.getElementById(`picker-${id}`);
    if (picker) picker.classList.add('hidden');
  } catch (err) {
    console.error('リアクション更新エラー:', err);
  }
};