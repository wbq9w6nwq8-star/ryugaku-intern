const SUPABASE_URL = 'https://mhsnyngfyqqsfexutskj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DZK0J_qUnYzK-0p6P6xezg_jEe8Ypzd';

let supabaseClient = null;

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
    // LINEのトークルーム風の背景とスクロールエリアを設定
    feedContainer.className = "space-y-2.5 max-h-[460px] overflow-y-auto p-3 bg-slate-100/60 rounded-xl border border-slate-200";
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
      .order('created_at', { ascending: true }) // チャット風なので古いものが上で新しいものが下に流れる（または逆も可）
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
        <div class="text-center py-10">
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

      // LINE風のチャットバブルデザイン
      return `
        <div class="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs transition hover:border-indigo-200">
          <div class="flex items-center justify-between text-xs mb-1">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-slate-900">${displayName}</span>
              <span class="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-indigo-100">${displayCity}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono">${timeStr}</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pl-1 my-1.5">${escapeHTML(p.text)}</p>
          
          <!-- リアクション＆＋ボタン -->
          <div class="flex flex-wrap items-center gap-1.5 pt-1.5 mt-1 border-t border-slate-100">
            ${reactionHtml}
            
            <div class="relative inline-block">
              <button onclick="window.toggleEmojiPicker('${p.id}')" class="inline-flex items-center justify-center text-[10px] bg-slate-50 border border-dashed border-slate-300 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 px-2 py-0.5 rounded-md transition cursor-pointer" title="リアクション">
                + リアクション
              </button>
              
              <div id="picker-${p.id}" class="hidden absolute bottom-full left-0 mb-2 bg-white border border-slate-200 shadow-xl rounded-xl p-2 flex space-x-2 z-50 whitespace-nowrap">
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
      `;
    }).join('');

    // チャット風に自動で一番下までスクロールさせる
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
            reactions: {}
          }
        ]);

      if (error) {
        console.error('投稿エラー:', error);
        alert('投稿に失敗しました。');
        return;
      }

      textInput.value = '';
      // 都市名と名前は一度入力したら残しておくとチャットで連続投稿しやすいのであえてクリアしない仕様もアリですが、お好みで！
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