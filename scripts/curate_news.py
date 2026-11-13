import os
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# 検索クエリ（日本語を自動URLエンコードして確実に取得する）
QUERIES = [
    "海外大生 就活 OR ボスキャリ OR サマーインターン",
    "外資系 就活 インターン 選考",
    "総合商社 サマーインターン 選考",
    "留学 就活 ボストンキャリアフォーラム"
]

NG_WORDS = ["PR TIMES", "人事異動", "訃報", "株式分割", "決算短信", "パチンコ", "競馬"]

def fetch_raw_articles():
    articles = []
    seen_titles = set()

    for q in QUERIES:
        encoded_q = urllib.parse.quote(q)
        url = f"https://news.google.com/rss/search?q={encoded_q}&hl=ja&gl=JP&ceid=JP:ja"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as res:
                xml_data = res.read()
            root = ET.fromstring(xml_data)

            for item in root.findall(".//item"):
                title = (item.findtext("title") or "").strip()
                link = (item.findtext("link") or "").strip()
                pub_date = (item.findtext("pubDate") or "").strip()

                if not title or not link or title in seen_titles:
                    continue
                if any(ng in title for ng in NG_WORDS):
                    continue

                seen_titles.add(title)
                articles.append({
                    "title": title,
                    "link": link,
                    "pubDate": pub_date[:16]
                })
        except Exception as e:
            print(f"RSS fetch error ({q}): {e}")

    return articles[:35]

def curate_with_gemini(raw_articles):
    if not raw_articles:
        print("No raw articles fetched.")
        return []

    prompt = f"""
あなたは英国・北米・豪州などの海外正規大学に通う日本人学生向けのキャリアアドバイザーです。
以下のニュース候補リストの中から、海外大生（特に1〜3年生やボスキャリ・夏休み帰国インターン志望者）にとって「本当に読む価値がある有益な記事」だけを厳しく評価し、トップ12件を厳選してください。

【除外基準】
- 単なる企業の宣伝プレスリリース、海外大生に無関係な国内ローカルニュース、釣り記事は必ず除外すること。

【出力ルール】
以下のJSON配列形式のみを出力してください（Markdownの ```json などは不要）。
[
  {{
    "title": "元の記事タイトル（そのまま）",
    "link": "元の記事URL（そのまま）",
    "category": "「💼 外資・商社」「☀️ インターン」「🌍 ボスキャリ」「💡 就活戦略」のいずれか1つ",
    "ai_comment": "この記事がなぜ海外大生に重要なのか、どう活かすべきかの独自解説コメント（100〜130文字程度・敬語）",
    "date": "公開日"
  }}
]

【候補リスト】
{json.dumps(raw_articles, ensure_ascii=False)}
"""

    api_url = f"[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=){GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }

    req = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with urllib.request.urlopen(req, timeout=45) as res:
        result = json.loads(res.read().decode("utf-8"))
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)

if __name__ == "__main__":
    raw = fetch_raw_articles()
    print(f"Fetched {len(raw)} raw articles.")
    curated = curate_with_gemini(raw)
    print(f"Curated {len(curated)} high-value articles.")

    jst = timezone(timedelta(hours=9))
    output = {
        "updated_at": datetime.now(jst).strftime("%Y-%m-%d %H:%M JST"),
        "items": curated
    }

    with open("news.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
