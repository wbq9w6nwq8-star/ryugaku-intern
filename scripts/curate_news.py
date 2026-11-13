import os
import sys
import time
import json
import urllib.request
import urllib.parse
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

GEMINI_API_KEY = (os.environ.get("GEMINI_API_KEY") or "").strip()

QUERIES = [
    "海外大生 就活",
    "ボスキャリ 就活",
    "サマーインターン 外資",
    "総合商社 インターン 選考"
]

NG_WORDS = ["PR TIMES", "人事異動", "訃報", "株式分割", "決算短信", "パチンコ", "競馬"]

# API公式メッセージ指定の最新モデル順（メイン → 軽量予備）
MODELS = [
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite"
]

def fetch_raw_articles():
    articles = []
    seen_titles = set()

    for q in QUERIES:
        encoded_q = urllib.parse.quote(q)
        host = "news" + ".google.com"
        url = f"https://{host}/rss/search?q={encoded_q}&hl=ja&gl=JP&ceid=JP:ja"
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
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
            print(f"RSS fetch warning ({q}): {e}")

    return articles[:12]

def curate_with_gemini(raw_articles):
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY is empty!")
        sys.exit(1)

    if not raw_articles:
        print("WARNING: Fetched 0 articles from RSS. Keeping existing news.json.")
        sys.exit(0)

    prompt = f"""
あなたは英国・北米・豪州などの海外正規大学に通う日本人学生向けのキャリアアドバイザーです。
以下のニュース候補リストの中から、海外大生（特に1〜3年生やボスキャリ・夏休み帰国インターン志望者）にとって「本当に読む価値がある有益な記事」を厳選し、トップ8件を出力してください。

【出力ルール】
以下のJSON配列形式のみを出力してください（Markdownの ```json などは不要）。
[
  {{
    "title": "元の記事タイトル（そのまま）",
    "link": "元の記事URL（そのまま）",
    "category": "「💼 外資・商社」「☀️ インターン」「🌍 ボスキャリ」「💡 就活戦略」のいずれか1つ",
    "ai_comment": "この記事がなぜ海外大生に重要なのか、どう活かすべきかの独自解説コメント（80〜110文字程度・敬語）",
    "date": "公開日"
  }}
]

【候補リスト】
{json.dumps(raw_articles, ensure_ascii=False)}
"""

    api_host = "generativelanguage" + ".googleapis.com"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    encoded_payload = json.dumps(payload).encode("utf-8")

    for model in MODELS:
        api_url = f"https://{api_host}/v1beta/models/{model}:generateContent"
        for attempt in range(1, 3):
            print(f"Trying {model} (attempt {attempt})...")
            req = urllib.request.Request(
                api_url,
                data=encoded_payload,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY
                }
            )
            try:
                with urllib.request.urlopen(req, timeout=60) as res:
                    result = json.loads(res.read().decode("utf-8"))
                    text = result["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text)
                    if parsed:
                        print(f"Success with {model}!")
                        return parsed
            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8", errors="ignore")
                print(f"HTTP ERROR {e.code} on {model}: {error_body[:200]}")
                if e.code in (429, 500, 502, 503, 504):
                    time.sleep(10)
                else:
                    break
            except Exception as e:
                print(f"ERROR on {model}: {e}")
                time.sleep(10)

    print("WARNING: All retries failed. Keeping previous news.json.")
    sys.exit(0)

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
