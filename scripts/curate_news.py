import os
import json
import hashlib
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
NEWS_JSON_PATH = "news.json"
MAX_ARCHIVE_ITEMS = 120

SEARCH_QUERIES = [
    {
        "category": "インターン",
        "query": '("インターン" OR "サマーインターン" OR "ウィンターインターン") AND ("募集" OR "エントリー" OR "開始" OR "開催" OR "締切") when:7d'
    },
    {
        "category": "外資・商社",
        "query": '("外資" OR "総合商社" OR "コンサル" OR "投資銀行" OR "グローバル採用") AND ("インターン" OR "新卒" OR "募集" OR "説明会" OR "選考") when:14d'
    },
    {
        "category": "ボスキャリ",
        "query": '("ボストンキャリアフォーラム" OR "ボスキャリ" OR "海外大" OR "留学生") AND ("採用" OR "インターン" OR "選考" OR "セミナー" OR "募集") when:14d'
    },
    {
        "category": "就活戦略",
        "query": '("就活" OR "新卒" OR "キャリア") AND ("ワークショップ" OR "オンライン説明会" OR "セミナー開催" OR "エントリー開始") when:7d'
    }
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

def fetch_rss_items(query_info, max_age_days=14):
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
            if len(items) >= 5:
                break
    except Exception as e:
        print(f"RSS fetch error ({query_info['category']}): {e}")

    return items

def build_fallback_summary(title, category):
    return (
        f"【ニュースの概要と背景】\n"
        f"「{title}」に関する最新動向です。{category}分野では近年、選考スケジュールの早期化やオンラインでのワークショップ・説明会の開催が加速しており、海外滞在中の方や留学生にとっても現地からアプローチしやすい環境が整いつつあります。\n\n"
        f"【注目すべきポイント】\n"
        f"単なる情報収集にとどめず、募集対象（卒業年度や専攻・語学条件など）とエントリー締切日時（日本時間か現地時間か）を正確に把握することが重要です。特にインターンや初期セミナーへの参加は、その後の特別選考ルートや早期内定に直結するケースが多く見られます。\n\n"
        f"【今すぐ取るべきネクストアクション】\n"
        f"1. 元記事および公式採用ページから募集要項・開催日程を確認する\n"
        f"2. マイページ登録やプレエントリーを済ませ、締切をカレンダーに登録する\n"
        f"3. 必要に応じて英文・和文レジュメやガクチカ（留学・海外生活での経験）をアップデートしておく"
    )

def generate_ai_contents(new_items):
    if not new_items:
        return new_items

    if GEMINI_API_KEY:
        try:
            titles_text = "\n".join([f"{i+1}. [{it['category']}] {it['title']}" for i, it in enumerate(new_items)])
            prompt = (
                "以下の最新ニュースについて、海外大生・留学生・グローバル就活生向けに2種類の解説を作成してください。\n"
                "1. comment: 一覧カード用の短い注目ポイント（70〜90文字）\n"
                "2. summary: 記事をタップした際に表示する、サイト独自の詳しいAI要約・解説記事（300〜450文字程度。改行を入れて『【概要と背景】』『【なぜ今注目すべきか】』『【具体的なネクストアクション】』の3構成で分かりやすく記述）\n\n"
                "出力は必ず以下のJSON配列形式のみとしてください：\n"
                "[{\"comment\": \"...\", \"summary\": \"...\"}, ...]\n\n"
                f"{titles_text}"
            )
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }).encode("utf-8")

            req = urllib.request.Request(api_url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as res:
                result = json.loads(res.read().decode("utf-8"))
                text_out = result["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_out)
                if isinstance(parsed, list):
                    for idx, item in enumerate(new_items):
                        if idx < len(parsed) and isinstance(parsed[idx], dict):
                            item["ai_comment"] = parsed[idx].get("comment") or "最新の募集・イベント動向です。詳細を確認して早めにエントリー準備を進めましょう。"
                            item["ai_summary"] = parsed[idx].get("summary") or build_fallback_summary(item["title"], item["category"])
                    return new_items
        except Exception as e:
            print(f"Gemini API fallback: {e}")

    for item in new_items:
        t = item["title"]
        if "インターン" in t:
            item["ai_comment"] = "インターン募集・開催の最新情報です。本選考の優遇枠に直結するケースが多いため、応募締切と参加条件を早めに確認しましょう。"
        elif any(w in t for w in ["ワークショップ", "セミナー", "説明会", "フォーラム"]):
            item["ai_comment"] = "企業と直接接点を持てるイベント・ワークショップ情報です。オンライン参加枠の有無や予約締切を今すぐチェックしておきましょう。"
        else:
            item["ai_comment"] = "直近で動きのあった採用・キャリア関連ニュースです。エントリー時期を逃さないよう詳細を確認しておきましょう。"
        item["ai_summary"] = build_fallback_summary(t, item["category"])

    return new_items

def main():
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
        item["category"] = clean_category(item.get("category", ""))
        if not item.get("id"):
            item["id"] = make_article_id(item.get("title", ""))
        if not item.get("ai_summary"):
            item["ai_summary"] = build_fallback_summary(item.get("title", ""), item["category"])
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

    existing_titles = {it.get("title", "")[:40] for it in normalized_existing}
    unique_new = []
    for it in raw_new:
        key = it["title"][:40]
        if key not in existing_titles:
            existing_titles.add(key)
            unique_new.append(it)

    unique_new = generate_ai_contents(unique_new)

    combined = unique_new + normalized_existing
    combined.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    combined = combined[:MAX_ARCHIVE_ITEMS]

    jst_now = datetime.now(timezone(timedelta(hours=9))).strftime("%Y-%m-%d %H:%M JST")
    output_data = {
        "updated_at": jst_now,
        "items": combined
    }

    with open(NEWS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"Updated news.json: +{len(unique_new)} new items (Total timeline: {len(combined)} items)")

if __name__ == "__main__":
    main()
