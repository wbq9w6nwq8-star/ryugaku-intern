import os
import re
import time
import json
import urllib.request
import urllib.parse
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

GEMINI_API_KEY = (os.environ.get("GEMINI_API_KEY") or "").strip()
CUSTOM_MODEL = (os.environ.get("CUSTOM_GEMINI_MODEL") or "").strip()

NEWS_JSON_PATH = "news.json"
MAX_ARCHIVE_ITEMS = 200          # 過去記事をたっぷり遡れるよう最大200件保持
MAX_NEW_ARTICLES_PER_RUN = 5     # 1回の実行（1日3回）で最大5件を1記事ずつ丁寧に深掘り執筆

# 優先順にモデルを試行（Proモデルで深い解説を生成し、混雑・制限時はFlashへ自動フォールバック）
MODEL_CANDIDATES = [
    m for m in [
        CUSTOM_MODEL,
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite"
    ] if m
]

EXCLUSIONS = '-"大学" -"学部" -"歯学部" -"歯科" -"看護" -"薬学" -"介護" -"交換留学" -"体験記" -"オープンキャンパス" -"入試"'

SEARCH_QUERIES = [
    {
        "category": "インターン",
        "query": f'site:prtimes.jp ("サマーインターン" OR "ウィンターインターン" OR "長期インターン" OR "インターンシップ") ("募集" OR "エントリー" OR "開催") {EXCLUSIONS} when:14d'
    },
    {
        "category": "外資・商社",
        "query": f'("外資" OR "総合商社" OR "戦略コンサル" OR "投資銀行" OR "グローバル採用") ("新卒" OR "インターン" OR "募集" OR "本選考" OR "説明会") {EXCLUSIONS} when:14d'
    },
    {
        "category": "ボスキャリ",
        "query": f'("ボストンキャリアフォーラム" OR "ボスキャリ" OR "キャリアフォーラム" OR "海外大生") ("採用" OR "選考" OR "募集" OR "セミナー" OR "企業") {EXCLUSIONS} when:30d'
    },
    {
        "category": "奨学金",
        "query": f'("海外留学" OR "海外大学" OR "正規留学" OR "海外大学院") ("奨学金" OR "給付型奨学金" OR "財団") ("募集" OR "公募" OR "応募" OR "支援") -"歯科" -"看護" -"介護" when:60d'
    },
    {
        "category": "就活戦略",
        "query": f'site:prtimes.jp ("新卒採用" OR "就活" OR "グローバルキャリア") ("ワークショップ" OR "オンライン説明会" OR "選考対策" OR "セミナー") {EXCLUSIONS} when:14d'
    }
]

# 1段階目チェック：無条件で除外するNGワード（歯学部・医療福祉・特定大学広報・受験・一般ノイズ）
NG_KEYWORDS = [
    "歯学部", "歯科", "歯科医", "歯科衛生", "医学部", "薬学部", "薬剤師", "看護", "獣医",
    "介護", "福祉", "保育", "幼稚園", "栄養士", "理学療法", "作業療法", "柔道整復",
    "体験記", "交換留学", "派遣留学", "帰国報告", "オープンキャンパス", "入試", "偏差値",
    "共通テスト", "学園祭", "大学プレスセンター", "教授が", "准教授", "高校生向け", "中学生",
    "小学生", "パチンコ", "競馬", "競輪", "人事異動", "訃報", "決算短信", "株式分割"
]

# 特定の国内大学による学内イベントや個別大学ニュースを弾く正規表現
SPECIFIC_UNI_PATTERN = re.compile(
    r'(?:[^\s「『（(]{2,10})(?:大学|短期大学|専門学校|高校|高等学校)(?:が|で|の|にて|主催|開催|、|・|\s*[-｜|])'
)

ACTION_KEYWORDS = [
    "募集", "エントリー", "開催", "締切", "インターン", "選考", "説明会",
    "ワークショップ", "セミナー", "フォーラム", "採用", "受付", "解禁", "奨学金", "公募", "支援"
]


def base36_encode(number):
    alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    if number == 0:
        return '0'
    base36 = ''
    while number != 0:
        number, i = divmod(number, 36)
        base36 = alphabet[i] + base36
    return base36


def make_article_id(title):
    clean = re.sub(r'\s*-\s*[^-]+$', '', (title or "").strip())
    h = 0
    for ch in clean:
        h = ((h << 5) - h) + ord(ch)
        h &= 0xFFFFFFFF
    if h >= 0x80000000:
        h -= 0x100000000
    return "art_" + base36_encode(abs(h))


def clean_category(cat_str):
    if not cat_str:
        return "就活戦略"
    for valid in ["外資・商社", "インターン", "ボスキャリ", "奨学金", "就活戦略"]:
        if valid in cat_str:
            return valid
    return "就活戦略"


def is_valid_article(title):
    """第1段階チェック：ルールベースの厳格フィルター"""
    if not title or len(title) < 10:
        return False
    if any(ng in title for ng in NG_KEYWORDS):
        return False
    if "海外大学" not in title and "海外大生" not in title:
        if SPECIFIC_UNI_PATTERN.search(title):
            return False
    if not any(act in title for act in ACTION_KEYWORDS):
        return False
    return True


def extract_keywords_fallback(title, category):
    tags = [clean_category(category)]
    rules = [
        ("サマーインターン", r"サマーインターン|夏インターン|夏季インターン"),
        ("ウィンターインターン", r"ウィンターインターン|冬インターン|冬季インターン"),
        ("長期インターン", r"長期インターン|有給インターン"),
        ("27卒", r"27卒|2027年卒"),
        ("28卒", r"28卒|2028年卒"),
        ("29卒", r"29卒|2029年卒"),
        ("海外大生向け", r"海外大|正規留学|ボストン|ボスキャリ|グローバル採用"),
        ("外資・コンサル", r"外資|コンサル|投資銀行"),
        ("総合商社", r"商社|三菱商事|三井物産|伊藤忠|住友商事|丸紅"),
        ("オンライン開催", r"オンライン|Web|ウェビナー|リモート"),
        ("給付型・支援", r"給付|奨学金|財団|支援"),
        ("エントリー募集", r"募集|エントリー|受付開始|締切")
    ]
    for label, pattern in rules:
        if re.search(pattern, title) and label not in tags:
            tags.append(label)

    corp_match = re.search(r'(?:株式会社|一般財団法人|公益財団法人)?([A-Za-z0-9ァ-ヶー一-龠]{2,12})(?:株式会社|グループ|財団)', title)
    if corp_match and corp_match.group(1) not in ["日本", "海外", "国際", "学生", "新卒", "採用"]:
        if corp_match.group(1) not in tags:
            tags.append(corp_match.group(1))

    return tags[:5]


def build_specific_fallback(title, category):
    """万が一APIが全滅した際にも、タイトルから固有情報を抜き出して解説を組み立てる安全策"""
    clean_t = re.sub(r'\s*-\s*[^-]+$', '', (title or "").strip())
    cat = clean_category(category)

    grad_match = re.search(r'(2[6-9]卒|202[6-9]年卒|海外大生|留学生)', clean_t)
    target_str = f"{grad_match.group(1)}を対象に含む" if grad_match else "グローバル志向の学生が注目すべき"

    if cat == "奨学金" or "奨学金" in clean_t or "財団" in clean_t:
        comment = f"「{clean_t[:32]}」に関する奨学金・支援プログラムの発表です。正規留学・交換留学の対象区分や併給条件、申請期限を確認しましょう。"
    elif "インターン" in clean_t:
        comment = f"{target_str}インターン募集情報（{clean_t[:28]}）です。一時帰国期間やオンラインでの参加可否、早期選考優遇の有無を確認しましょう。"
    else:
        comment = f"{target_str}採用・キャリアイベント情報（{clean_t[:28]}）です。応募要件と日本時間でのエントリー締切を早めにチェックしましょう。"

    summary = (
        f"【ニュースの核心とファクト整理】\n"
        f"「{clean_t}」に関する最新発表です。{comment}\n\n"
        f"【構造的背景・なぜ今この動きが重要なのか】\n"
        f"{cat}領域では、国内の一般的な就活スケジュールよりも早い段階で募集や選考案内が動くケースが主流となっています。早期に一次情報を掴み、プレエントリーや書類準備に着手することが選考突破の鍵を握ります。\n\n"
        f"【海外大生・グローバル就活生への影響と注意点】\n"
        f"海外滞在中の学生にとっては、説明会やWebテスト・面接がすべてオンラインで完結するか、または6〜9月等の一時帰国スケジュールと合致するかが最重要のチェックポイントです。奨学金の場合は「海外正規進学」が対象に含まれるかを募集要項で必ず確認してください。\n\n"
        f"【具体的なネクストアクション】\n"
        f"1. 元記事および公式募集ページを開き、対象条件（卒業年度・専攻・留学区分）を確認する\n"
        f"2. 締切日時（日本標準時JST）をカレンダーへ登録し、マイページ登録やエントリーを済ませる\n"
        f"3. 英文・和文レジュメや成績証明書など、提出が求められる書類を前倒しで準備する"
    )
    return comment, summary


def extract_article_body_text(url):
    """元記事URLへアクセスし、HTMLから本文テキスト（最大3000文字）を抽出する"""
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept-Language": "ja,en-US;q=0.9,en;q=0.8"
            }
        )
        with urllib.request.urlopen(req, timeout=12) as res:
            raw_bytes = res.read()
            html = raw_bytes.decode("utf-8", errors="ignore")

        # メタディスクリプションやOGP説明文があれば抽出（要約精度を底上げ）
        meta_desc = ""
        m_og = re.search(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        if m_og:
            meta_desc = m_og.group(1).strip()

        # 不要なタグブロックを除去
        html = re.sub(r'<(script|style|nav|header|footer|aside|noscript)[^>]*>[\s\S]*?</\1>', ' ', html, flags=re.IGNORECASE)
        text = re.sub(r'<[^>]+>', ' ', html)
        text = re.sub(r'&nbsp;|&amp;|&quot;|&lt;|&gt;|&#\d+;', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()

        combined = f"{meta_desc}\n{text}".strip()
        if len(combined) < 200 or "Google ニュース" in combined[:80]:
            return meta_desc
        return combined[:3000]
    except Exception as e:
        print(f"Body fetch skipped ({url[:40]}...): {e}")
        return ""


def fetch_rss_items(query_info, max_age_days=35):
    url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query_info['query'])}&hl=ja&gl=JP&ceid=JP:ja"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    items = []
    now = datetime.now(timezone.utc)

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            xml_data = res.read()
        root = ET.fromstring(xml_data)
        for item in root.findall("./channel/item"):
            raw_title = (item.findtext("title") or "").strip()
            title = re.sub(r'\s*-\s*[^-]+$', '', raw_title)
            link = (item.findtext("link") or "").strip()
            pub_date_raw = (item.findtext("pubDate") or "").strip()
            desc_raw = (item.findtext("description") or "").strip()
            desc_clean = re.sub(r'<[^>]+>', ' ', desc_raw).strip()

            if not title or not link or not is_valid_article(title):
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
                "timestamp": ts,
                "rss_snippet": desc_clean[:400]
            })
            if len(items) >= 5:
                break
    except Exception as e:
        print(f"RSS fetch error ({query_info['category']}): {e}")

    return items


def analyze_single_article_with_gemini(item, body_text):
    """第2段階チェック＆深掘り執筆：上位モデルを使って1記事ずつ審査し、本質的な要約記事を生成"""
    if not GEMINI_API_KEY:
        return None

    snippet = item.get("rss_snippet") or ""
    full_source = "\n".join(filter(None, [body_text, snippet])).strip()
    source_section = (
        f"【元記事から抽出した本文・抜粋テキスト】\n{full_source}"
        if full_source
        else "（※本文テキストは未取得のため、記事タイトルに含まれる企業名・プログラム名・卒年・業界背景から具体的かつ論理的に解説を構築してください）"
    )

    prompt = f"""
あなたは英国・北米・豪州などの海外正規大学に通う日本人学生およびグローバル就活生向けメディア『Atrium』の編集長兼キャリアアナリストです。
以下の記事を厳格にダブルチェックし、サイト読者（海外大生・グローバル就活生・留学志望者）にとって本当に有益な記事である場合のみ、本質的で密度の高い解説記事を作成してください。

【記事タイトル】
{item['title']}

【カテゴリ】
{item['category']}

{source_section}

【厳格な除外基準（1つでも該当する場合は必ず is_relevant: false にすること）】
- 歯学部・歯科・医学部・薬学部・看護・獣医・介護・保育などの医療福祉系・特定専門職ローカル就活記事
- 特定の日本の大学1校のみを対象とした学内イベント、交換留学報告会、オープンキャンパス、大学入試記事
- キャリア形成・インターン・就活・奨学金と無関係な一般ニュースや単なる企業宣伝

【執筆ルール（絵文字は一切使用禁止）】
1. comment（100〜140文字）:
   タイムラインの一覧カードに表示する「AI視点の要点」。「〜の最新情報です。詳細を確認しましょう」のような薄い定型文は絶対に書かないこと。この記事固有の企業名・主催団体・対象卒年・プログラム内容・海外大生にとっての具体的な価値に踏み込んで書くこと。
2. summary（600〜800文字）:
   記事をタップした際にモーダルで読む「独自深掘り解説記事」。元記事の具体的内容を踏まえ、以下の4つの見出し（改行あり）で本質的な分析を行うこと：
   【ニュースの核心とファクト整理】
   （どの企業・団体が、誰を対象に、どのようなインターン・選考・奨学金・イベントを発表したのか具体的に整理）

   【構造的背景・なぜ今この動きが重要なのか】
   （早期選考化やグローバル人材獲得競争、留学資金調達の観点から見たこの記事の本質的な意味）

   【海外大生・グローバル就活生への影響と注意点】
   （オンライン参加の可否、6〜9月の一時帰国との兼ね合い、ボスキャリや本選考への直結度、正規留学/交換留学の対象区分など特有の論点）

   【具体的なネクストアクション】
   （読者が今日すぐ取るべき具体的な行動を箇条書きで2〜3点提示）
3. keywords（3〜5個）:
   記事検索・タグ絞り込み用の具体的なキーワード配列（例: ["三菱商事", "サマーインターン", "28卒", "海外大生向け"]）。

必ず以下のJSONオブジェクト形式のみを出力してください：
{{"is_relevant": true, "comment": "...", "summary": "...", "keywords": ["..."]}}
"""

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }).encode("utf-8")

    api_host = "generativelanguage" + ".googleapis.com"

    for model_name in MODEL_CANDIDATES:
        api_url = f"https://{api_host}/v1beta/models/{model_name}:generateContent"
        req = urllib.request.Request(
            api_url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=90) as res:
                result = json.loads(res.read().decode("utf-8"))
                text_out = result["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_out)
                if isinstance(parsed, dict) and "is_relevant" in parsed:
                    print(f"Success with [{model_name}]: {item['title'][:32]}...")
                    return parsed
        except urllib.error.HTTPError as e:
            print(f"Model [{model_name}] HTTP {e.code} -> switching to next fallback model...")
            time.sleep(4)
        except Exception as e:
            print(f"Model [{model_name}] error ({e}) -> switching to next fallback model...")
            time.sleep(4)

    return None


def main():
    print(f"Starting Atrium Deep AI News Curator... Models: {MODEL_CANDIDATES}")
    existing_items = []
    if os.path.exists(NEWS_JSON_PATH):
        try:
            with open(NEWS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                existing_items = data.get("items", [])
        except Exception as e:
            print(f"Existing news.json load error: {e}")

    # 既存の過去記事もダブルチェックに通し、歯学部や特定大学イベント等のノイズを排除しつつ有効な過去記事を保持
    normalized_existing = []
    for item in existing_items:
        title = re.sub(r'\s*-\s*[^-]+$', '', (item.get("title") or "").strip())
        if not is_valid_article(title):
            continue

        cat = clean_category(item.get("category", ""))
        item["title"] = title
        item["category"] = cat
        item["id"] = make_article_id(title)
        item.pop("rss_snippet", None)

        fb_comment, fb_summary = build_specific_fallback(title, cat)
        if not item.get("ai_comment") or "直近の採用イベント・募集・キャリア形成に関わる最新ニュースです" in item.get("ai_comment", ""):
            item["ai_comment"] = fb_comment
        if not item.get("ai_summary") or len(item.get("ai_summary", "")) < 200:
            item["ai_summary"] = fb_summary
        if not item.get("keywords"):
            item["keywords"] = extract_keywords_fallback(title, cat)

        normalized_existing.append(item)

    raw_new = []
    for q in SEARCH_QUERIES:
        raw_new.extend(fetch_rss_items(q))

    existing_keys = {it.get("title", "")[:45] for it in normalized_existing}
    candidates = []
    for it in raw_new:
        key = it["title"][:45]
        if key not in existing_keys:
            existing_keys.add(key)
            candidates.append(it)

    targets = candidates[:MAX_NEW_ARTICLES_PER_RUN]
    approved_new = []

    for idx, item in enumerate(targets):
        print(f"[{idx + 1}/{len(targets)}] Scraping & Deep Analyzing: {item['title'][:40]}...")
        body_text = extract_article_body_text(item["link"])
        ai_res = analyze_single_article_with_gemini(item, body_text)

        item.pop("rss_snippet", None)

        if ai_res is not None:
            if ai_res.get("is_relevant") is False:
                print(f"Rejected by AI double-check: {item['title'][:40]}")
                continue
            fb_comment, fb_summary = build_specific_fallback(item["title"], item["category"])
            item["ai_comment"] = (ai_res.get("comment") or fb_comment).strip()
            item["ai_summary"] = (ai_res.get("summary") or fb_summary).strip()
            kws = ai_res.get("keywords")
            item["keywords"] = (
                [str(k).lstrip("#").strip() for k in kws[:5] if str(k).strip()]
                if isinstance(kws, list) and len(kws) > 0
                else extract_keywords_fallback(item["title"], item["category"])
            )
            approved_new.append(item)
        else:
            # すべてのモデルがレート制限等で応答しなかった場合のみフォールバック解説で保存
            fb_comment, fb_summary = build_specific_fallback(item["title"], item["category"])
            item["ai_comment"] = fb_comment
            item["ai_summary"] = fb_summary
            item["keywords"] = extract_keywords_fallback(item["title"], item["category"])
            approved_new.append(item)

        if idx < len(targets) - 1:
            time.sleep(5)

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

    print(f"Done! +{len(approved_new)} deep articles added. Total archive: {len(combined)} items.")


if __name__ == "__main__":
    main()
