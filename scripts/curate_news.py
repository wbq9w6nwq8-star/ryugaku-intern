import os
import json
import hashlib
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
import tweepy

# ▼ サイトの news.html の公開URL（必要に応じて書き換えてください）
SITE_NEWS_URL = "https://wbq9w6nwq8-star.github.io/ryugaku-intern/news.html"

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
NEWS_JSON_PATH = "news.json"
MAX_ARCHIVE_ITEMS = 120

EXCLUSIONS = '-"大学" -"学部" -"交換留学" -"体験記" -"ランキング" -"入試"'

SEARCH_QUERIES = [
    {
        "category": "インターン",
        "query": f'site:prtimes.jp ("インターン" OR "サマーインターン" OR "ウィンターインターン") ("募集" OR "エントリー" OR "開催") when:14d'
    },
    {
        "category": "外資・商社",
        "query": f'("外資" OR "総合商社" OR "コンサル" OR "投資銀行" OR "グローバル採用") ("新卒" OR "インターン" OR "募集" OR "説明会") {EXCLUSIONS} when:14d'
    },
    {
        "category": "ボスキャリ",
        "query": f'("ボストンキャリアフォーラム" OR "ボスキャリ" OR "キャリアフォーラム" OR "海外大生") ("採用" OR "選考" OR "募集" OR "セミナー" OR "企業") {EXCLUSIONS} when:30d'
    },
    {
        "category": "就活戦略",
        "query": f'site:prtimes.jp ("新卒採用" OR "就活") ("ワークショップ" OR "説明会" OR "選考" OR "イベント") when:14d'
    }
]

NG_KEYWORDS = [
    "体験記", "交換留学", "派遣留学", "オープンキャンパス", "入試", "偏差値",
    "学園祭", "大学プレスセンター", "教授が", "准教授", "高校生向け", "中学生"
]

ACTION_KEYWORDS = [
    "募集", "エントリー", "開催", "締切", "インターン", "選考", "説明会",
    "ワークショップ", "セミナー", "フォーラム", "採用", "受付開始", "解禁"
]

def make_article_id(title):
    return "news_" + hashlib.md5(title.encode("utf-8")).hexdigest()[:10]

def clean_category(cat_str):
    if not cat_str:
        return "就活戦略"
    for valid in ["外資・商社", "インターン", "ボスキャリ", "就活戦略"]:
        if valid in cat_str:
            return valid
    return "就活戦略"

def is_high_quality_title(title):
    if any(ng in title for ng in NG_KEYWORDS):
        return False
    if "大学 -" in title or "大学｜" in title:
        return False
    if not any(act in title for act in ACTION_KEYWORDS):
        return False
    return True

def fetch_rss_items(query_info, max_age_days=21):
    url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query_info['query'])}&hl=ja&gl=JP&ceid=JP:ja"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    items = []
    now = datetime.now(timezone.utc)

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            xml_data = res.read()
        root = ET.fromstring(xml_data)
        for item in root.findall("./channel/item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub_date_raw = (item.findtext("pubDate") or "").strip()

            if not title or not link:
                continue
            if not is_high_quality_title(title):
                continue

            try:
                dt = parsedate_to_datetime(pub_date_raw)
                if (now - dt).days > max_age_days:
                    continue
                date_str = dt.astimezone(timezone(timedelta(hours=9))).strftime("%Y/%m/%d")
                ts = int(dt.timestamp() * 1000)
            except Exception:
                date_str = now.astimezone(timezone(timedelta(hours=9))).strftime("%Y/%m/%d")
                ts = int(now.timestamp() * 1000)

            items.append({
                "id": make_article_id(title),
                "title": title,
                "link": link,
                "category": query_info["category"],
                "date": date_str,
                "timestamp": ts
            })
            if len(items) >= 8:
                break
    except Exception as e:
        print(f"RSS fetch error ({query_info['category']}): {e}")

    return items

def build_fallback_summary(title, category):
    return (
        f"【募集・イベントの概要】\n"
        f"「{title}」に関する公式発表・最新情報です。{category}領域における具体的なインターン募集や採用イベントの動きとして注目されます。\n\n"
        f"【注目すべきポイント】\n"
        f"早期のインターンや企業主催ワークショップへの参加は、その後の特別選考ルートや本選考の優遇に直結するケースが多くあります。募集対象や参加形式（オンライン／対面）を確認しておきましょう。\n\n"
        f"【今すぐ取るべきアクション】\n"
        f"1. 元のプレスリリース・採用ページで応募資格とエントリー締切を確認する\n"
        f"2. 定員制のイベントや説明会は枠が埋まる前に予約を完了させる"
    )

def get_available_flash_models(api_key):
    """現在のAPIキーで利用可能な最新のFlashモデル名をAPIから直接自動取得する"""
    fallback_candidates = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash-lite"]
    try:
        list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        req = urllib.request.Request(list_url)
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode("utf-8"))
            models = []
            for m in data.get("models", []):
                name = m.get("name", "").replace("models/", "")
                methods = m.get("supportedGenerationMethods", [])
                if "generateContent" in methods and "flash" in name.lower():
                    models.append(name)
            models.sort(reverse=True)
            if models:
                print(f"Detected available Gemini models: {models[:3]}")
                return models[:3]
    except Exception as e:
        print(f"Model list fetch warning: {e}")
    return fallback_candidates

def screen_and_generate_ai_contents(new_items):
    if not new_items:
        return []

    api_key = (GEMINI_API_KEY or "").strip()
    if api_key:
        titles_text = "\n".join([f"{i}: [{it['category']}] {it['title']}" for i, it in enumerate(new_items)])
        prompt = (
            "あなたは優秀なキャリアメディアの編集長です。以下のニュース候補から、"
            "『企業が学生向けに開催するインターン募集・採用説明会・ワークショップ・キャリアフォーラム等の実務的な募集/イベント情報』だけを厳選してください。\n"
            "※大学の交換留学報告、学内イベント、個人の就活体験記、一般論コラムはすべて is_relevant: false にして厳しく除外してください。\n\n"
            "各記事（index番号対応）について以下のJSON配列を返してください：\n"
            "[{\"index\": 0, \"is_relevant\": true, \"comment\": \"一覧用80字以内の要点\", \"summary\": \"詳細モーダル用350字程度のAI解説（【概要】【注目ポイント】【ネクストアクション】の3構成）\"}, ...]\n\n"
            f"{titles_text}"
        )
        payload = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }).encode("utf-8")

        candidate_models = get_available_flash_models(api_key)
        for model_name in candidate_models:
            try:
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                req = urllib.request.Request(api_url, data=payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=30) as res:
                    result = json.loads(res.read().decode("utf-8"))
                    text_out = result["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text_out)
                    if isinstance(parsed, list):
                        approved = []
                        for entry in parsed:
                            idx = entry.get("index")
                            if entry.get("is_relevant") is True and isinstance(idx, int) and 0 <= idx < len(new_items):
                                item = new_items[idx]
                                item["ai_comment"] = entry.get("comment") or "最新の募集・イベント動向です。詳細を確認して早めにエントリー準備を進めましょう。"
                                item["ai_summary"] = entry.get("summary") or build_fallback_summary(item["title"], item["category"])
                                approved.append(item)
                        print(f"Gemini screening succeeded using {model_name}!")
                        return approved
            except Exception as e:
                print(f"Model {model_name} failed: {e}")

    for item in new_items:
        item["ai_comment"] = "最新のインターン募集・採用イベント情報です。応募条件と締切を早めに確認しましょう。"
        item["ai_summary"] = build_fallback_summary(item["title"], item["category"])
    return new_items

def post_top_news_to_x(items_to_post):
    """新着記事があれば、一番上の1件を公式Xに自動投稿する"""
    if not items_to_post:
        print("No items available to post to X.")
        return

    api_key = (os.environ.get("X_API_KEY") or "").strip()
    api_secret = (os.environ.get("X_API_SECRET") or "").strip()
    access_token = (os.environ.get("X_ACCESS_TOKEN") or "").strip()
    access_secret = (os.environ.get("X_ACCESS_TOKEN_SECRET") or "").strip()

    if not all([api_key, api_secret, access_token, access_secret]):
        print("X API keys not set, skipping auto-post.")
        return

    top_item = items_to_post[0]
    article_url = f"{SITE_NEWS_URL}?article={top_item['id']}"
    clean_title = top_item["title"].rsplit(" - ", 1)[0][:55]
    comment_short = (top_item.get("ai_comment") or "")[:60]

    tweet_text = (
        f"【{top_item['category']}｜最新募集・イベント】\n"
        f"{clean_title}\n\n"
        f"AI要点：{comment_short}...\n\n"
        f"▼AI詳細解説・応募リンクはこちら\n"
        f"{article_url}\n"
        f"#海外大生 #就活 #インターン"
    )

    try:
        client = tweepy.Client(
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_secret
        )
        res = client.create_tweet(text=tweet_text)
        print(f"Successfully posted to X! Tweet ID: {res.data['id']}")
    except tweepy.TweepyException as e:
        print(f"X auto-post failed: {e}")
        if hasattr(e, "response") and e.response is not None:
            print(f"X API Response detail: {e.response.text}")

def main():
    print("Starting AI Job News Curator...")
    existing_items = []
    if os.path.exists(NEWS_JSON_PATH):
        try:
            with open(NEWS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                existing_items = data.get("items", [])
        except Exception as e:
            print(f"Existing news.json load error: {e}")

    normalized_existing = []
    for item in existing_items:
        title = item.get("title", "")
        if any(ng in title for ng in NG_KEYWORDS) or "大学 -" in title:
            continue
        item["category"] = clean_category(item.get("category", ""))
        if not item.get("id"):
            item["id"] = make_article_id(title)
        if not item.get("ai_summary"):
            item["ai_summary"] = build_fallback_summary(title, item["category"])
        if not item.get("timestamp"):
            try:
                dt = parsedate_to_datetime(item.get("date", ""))
                item["timestamp"] = int(dt.timestamp() * 1000)
                item["date"] = dt.strftime("%Y/%m/%d")
            except Exception:
                item["timestamp"] = 0
        normalized_existing.append(item)

    raw_new = []
    for q in SEARCH_QUERIES:
        raw_new.extend(fetch_rss_items(q))

    print(f"Fetched {len(raw_new)} raw items from RSS.")

    existing_titles = {it.get("title", "")[:40] for it in normalized_existing}
    unique_new = []
    for it in raw_new:
        key = it["title"][:40]
        if key not in existing_titles:
            existing_titles.add(key)
            unique_new.append(it)

    print(f"Found {len(unique_new)} unique new items.")
    approved_new = screen_and_generate_ai_contents(unique_new)

    # 新着があればそれを、なければ既存の最新1件をXに投稿
    items_to_post = approved_new if approved_new else normalized_existing[:1]
    post_top_news_to_x(items_to_post)

    combined = approved_new + normalized_existing
    combined.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    combined = combined[:MAX_ARCHIVE_ITEMS]

    jst_now = datetime.now(timezone(timedelta(hours=9))).strftime("%Y-%m-%d %H:%M JST")
    output_data = {
        "updated_at": jst_now,
        "items": combined
    }

    with open(NEWS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"Updated news.json: +{len(approved_new)} approved items (Total timeline: {len(combined)} items)")

if __name__ == "__main__":
    main()
