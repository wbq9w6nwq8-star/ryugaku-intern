import os
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

# Gemini API用（標準ライブラリのみでHTTPリクエストを送るためパッケージ追加不要）
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
NEWS_JSON_PATH = "news.json"
MAX_ARCHIVE_ITEMS = 120  # タイムラインに蓄積する最大件数

# 目先の「インターン募集・ワークショップ・説明会・本選考エントリー」に特化した検索クエリ（直近7〜14日限定）
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

def clean_category(cat_str):
    """既存の絵文字付きカテゴリ名を正規化（タブフィルターと一致させる）"""
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

            # 公開日時を検証し、古い記事（体験記の過去アーカイブなど）を確実に除外
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

def generate_ai_comments(new_items):
    """Gemini APIで各募集・イベント記事のアクションポイントを解説生成（失敗時はルールベースで補完）"""
    if not new_items:
        return new_items

    if GEMINI_API_KEY:
        try:
            titles_text = "\n".join([f"{i+1}. [{it['category']}] {it['title']}" for i, it in enumerate(new_items)])
            prompt = (
                "以下の最新ニュース（インターン募集・ワークショップ・採用イベント等）について、"
                "海外大生・留学生・就活生が『今すぐ取るべきアクションや注目ポイント』を各80文字以内で簡潔に解説してください。\n"
                "出力はJSON配列（文字列の配列）のみを返してください。例: [\"解説1\", \"解説2\"]\n\n"
                f"{titles_text}"
            )
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }).encode("utf-8")

            req = urllib.request.Request(api_url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=25) as res:
                result = json.loads(res.read().decode("utf-8"))
                text_out = result["candidates"][0]["content"]["parts"][0]["text"]
                comments = json.loads(text_out)
                if isinstance(comments, list):
                    for idx, item in enumerate(new_items):
                        if idx < len(comments) and isinstance(comments[idx], str):
                            item["ai_comment"] = comments[idx]
                    return new_items
        except Exception as e:
            print(f"Gemini API fallback: {e}")

    # フォールバック解説
    for item in new_items:
        t = item["title"]
        if "インターン" in t:
            item["ai_comment"] = "インターン募集・開催の最新情報です。本選考の優遇枠に直結するケースが多いため、応募締切と参加条件を早めに確認しましょう。"
        elif any(w in t for w in ["ワークショップ", "セミナー", "説明会", "フォーラム"]):
            item["ai_comment"] = "企業と直接接点を持てるイベント・ワークショップ情報です。オンライン参加枠の有無や予約締切を今すぐチェックしておきましょう。"
        else:
            item["ai_comment"] = "直近で動きのあった採用・キャリア関連ニュースです。エントリー時期を逃さないよう詳細を確認しておきましょう。"
    return new_items

def main():
    # 1. 既存の news.json を読み込む（過去の記事を消さずにタイムラインとして残す）
    existing_items = []
    if os.path.exists(NEWS_JSON_PATH):
        try:
            with open(NEWS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                existing_items = data.get("items", [])
        except Exception as e:
            print(f"Existing news.json load error: {e}")

    # 既存データのカテゴリ名を正規化（絵文字除去）＆古い2024年等の記事を整理
    normalized_existing = []
    for item in existing_items:
        item["category"] = clean_category(item.get("category", ""))
        if not item.get("timestamp"):
            try:
                dt = parsedate_to_datetime(item.get("date", ""))
                item["timestamp"] = int(dt.timestamp() * 1000)
                item["date"] = dt.strftime("%Y/%m/%d")
            except Exception:
                item["timestamp"] = 0
        normalized_existing.append(item)

    # 2. 直近の新着募集・イベント記事を取得
    raw_new = []
    for q in SEARCH_QUERIES:
        raw_new.extend(fetch_rss_items(q))

    # 既存記事と重複していない新着だけを抽出
    existing_titles = {it.get("title", "")[:40] for it in normalized_existing}
    unique_new = []
    for it in raw_new:
        key = it["title"][:40]
        if key not in existing_titles:
            existing_titles.add(key)
            unique_new.append(it)

    # 新着記事にAI解説を付与
    unique_new = generate_ai_comments(unique_new)

    # 3. 新着記事 ＋ 既存記事 を結合し、新しい順（タイムライン順）にソートして保存
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
