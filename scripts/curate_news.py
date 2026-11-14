import os
import re
import json
import hashlib
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

GEMINI_API_KEY = (os.environ.get("GEMINI_API_KEY") or "").strip()
NEWS_JSON_PATH = "news.json"
MAX_ARCHIVE_ITEMS = 200  # タイムラインで過去記事をたっぷり遡れるよう200件保持

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

# 1段階目チェック：無条件で弾くNGワード（歯学部・医療・特定大学広報・受験ノイズ）
NG_KEYWORDS = [
    "歯学部", "歯科", "歯科医", "歯科衛生", "医学部", "薬学部", "薬剤師", "看護", "獣医",
    "介護", "福祉", "保育", "幼稚園", "栄養士", "理学療法", "作業療法", "柔道整復",
    "体験記", "交換留学", "派遣留学", "帰国報告", "オープンキャンパス", "入試", "偏差値",
    "共通テスト", "学園祭", "大学プレスセンター", "教授が", "准教授", "高校生向け", "中学生",
    "小学生", "パチンコ", "競馬", "人事異動", "訃報", "決算短信", "株式分割"
]

# 特定の国内大学による学内イベントや宣伝を弾く正規表現
SPECIFIC_UNI_PATTERN = re.compile(r'(?:[^\s「『（(]{2,10})(?:大学|短期大学|専門学校|高校|高等学校)(?:が|で|の|にて|主催|開催|、|・|\s*[-｜|])')

ACTION_KEYWORDS = [
    "募集", "エントリー", "開催", "締切", "インターン", "選考", "説明会",
    "ワークショップ", "セミナー", "フォーラム", "採用", "受付", "解禁", "奨学金", "公募", "支援"
]

def make_article_id(title):
    clean = re.sub(r'\s*-\s*[^-]+$', '', title.strip())
    h = 0
    for ch in clean:
        h = ((h << 5) - h) + ord(ch)
        h &= 0xFFFFFFFF
    if h >= 0x80000000:
        h -= 0x100000000
    return "art_" + base36_encode(abs(h))

def base36_encode(number):
    alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    if number == 0:
        return '0'
    base36 = ''
    while number != 0:
        number, i = divmod(number, 36)
        base36 = alphabet[i] + base36
    return base36

def clean_category(cat_str):
    if not cat_str:
        return "就活戦略"
    for valid in ["外資・商社", "インターン", "ボスキャリ", "奨学金", "就活戦略"]:
        if valid in cat_str:
            return valid
    return "就活戦略"

def is_valid_article(title):
    """ルールベースの厳格フィルター（歯学部や特定大学の学内ニュースを排除）"""
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

def extract_keywords(title, category):
    tags = [clean_category(category)]
    rules = [
        ("サマーインターン", r"サマーインターン|夏インターン|夏季インターン"),
        ("ウィンターインターン", r"ウィンターインターン|冬インターン|冬季インターン"),
        ("長期インターン", r"長期インターン|有給インターン"),
        ("27卒", r"27卒|2027年卒"),
        ("28卒", r"28卒|2028年卒"),
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
    return tags[:5]

def build_specific_fallback(title, category):
    clean_t = re.sub(r'\s*-\s*[^-]+$', '', title.strip())
    cat = clean_category(category)

    grad_match = re.search(r'(2[6-9]卒|202[6-9]年卒|海外大生|留学生)', clean_t)
    target_str = f"{grad_match.group(1)}を対象に含む" if grad_match else "グローバル志向の学生が注目すべき"

    if cat == "奨学金" or "奨学金" in clean_t or "財団" in clean_t:
        comment = f"「{clean_t[:28]}...」に関する奨学金・支援情報です。正規留学・交換留学の対象区分や併給条件、申請期限を確認しましょう。"
    elif "インターン" in clean_t:
        comment = f"{target_str}インターン募集動向（{clean_t[:24]}...）です。一時帰国期間やオンラインでの参加可否、早期選考ルートへの直結度を確認しましょう。"
    else:
        comment = f"{target_str}採用・キャリアイベント情報（{clean_t[:24]}...）です。応募資格と日本時間でのエントリー締切を早めにチェックしましょう。"

    summary = (
        f"【ニュースの核心とAI分析】\n"
        f"「{clean_t}」\n"
        f"{comment}\n\n"
        f"【海外大生・グローバル就活生へのインプリケーション】\n"
        f"{cat}領域では、国内の一般的な就活解禁よりも早い段階でインターンや選考案内、公募が動くケースが主流です。"
        f"特に海外滞在中の学生にとっては、オンラインで選考やセミナー参加が完結するか、また一時帰国のスケジュールと合致するかが重要な判断基準となります。\n\n"
        f"【推奨ネクストアクション】\n"
        f"1. 元記事および公式募集ページを開き、対象条件（卒業年度・専攻・留学区分）を確認する\n"
        f"2. 締切日時（日本時間JSTか現地時間か）をカレンダーへ登録し、事前エントリーを済ませる\n"
        f"3. 必要に応じて英文・和文レジュメや成績証明書などの提出書類を準備しておく"
    )
    return comment, summary

def fetch_rss_items(query_info, max_age_days=30):
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

            if not title or not link:
                continue
            if not is_valid_article(title):
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
                "keywords": extract_keywords(title, query_info["category"])
            })
            if len(items) >= 10:
                break
    except Exception as e:
        print(f"RSS fetch error ({query_info['category']}): {e}")

    return items

def get_available_flash_models(api_key):
    fallback_candidates = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
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
                return models[:3]
    except Exception as e:
        print(f"Model list fetch warning: {e}")
    return fallback_candidates

def screen_and_generate_ai_contents(new_items):
    """2段階目チェック：Gemini APIで記事の有効性をダブルチェックし、記事固有のコメント・長文要約・キーワードを生成"""
    if not new_items:
        return []

    if GEMINI_API_KEY:
        titles_text = "\n".join([f"{i}: [{it['category']}] {it['title']}" for i, it in enumerate(new_items)])
        prompt = (
            "あなたは海外正規大学生・グローバル就活生向けメディア『Atrium』の編集長です。\n"
            "以下のニュース候補をダブルチェックし、サイト読者（海外大生・グローバル就活生・留学志望者）にとって本当に有益な記事のみ `is_relevant: true` としてください。\n\n"
            "【厳格な除外ルール（必ず is_relevant: false にすること）】\n"
            "・歯学部、医学部、薬学部、看護、介護、保育などの専門職・医療系ローカル就活記事\n"
            "・特定の日本の大学1校のみを対象とした学内イベント、交換留学報告、大学入試・オープンキャンパス記事\n"
            "・就活や奨学金と無関係な一般ニュース\n\n"
            "【執筆ルール（絵文字は一切使用禁止）】\n"
            "・comment: その記事固有の企業名・対象卒年・イベント内容に踏み込んだ鋭いAI視点コメント（90〜120文字、どの記事も同じようなテンプレ文になるのを避けること）\n"
            "・summary: 記事タップ時に表示する400〜500文字の独自解説記事（『【ニュースの核心とAI分析】』『【海外大生・グローバル就活生へのインプリケーション】』『【推奨ネクストアクション】』の3部構成で改行を入れる）\n"
            "・keywords: 記事検索用の具体的なキーワード配列（3〜5個。例: [\"三菱商事\", \"サマーインターン\", \"28卒\", \"海外大生向け\"]）\n\n"
            "以下のJSON配列形式のみを返してください：\n"
            "[{\"index\": 0, \"is_relevant\": true, \"comment\": \"...\", \"summary\": \"...\", \"keywords\": [\"...\"]}, ...]\n\n"
            f"{titles_text}"
        )
        payload = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }).encode("utf-8")

        for model_name in get_available_flash_models(GEMINI_API_KEY):
            try:
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
                req = urllib.request.Request(api_url, data=payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=45) as res:
                    result = json.loads(res.read().decode("utf-8"))
                    text_out = result["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text_out)
                    if isinstance(parsed, list):
                        approved = []
                        for entry in parsed:
                            idx = entry.get("index")
                            if entry.get("is_relevant") is True and isinstance(idx, int) and 0 <= idx < len(new_items):
                                item = new_items[idx]
                                fb_comment, fb_summary = build_specific_fallback(item["title"], item["category"])
                                item["ai_comment"] = entry.get("comment") or fb_comment
                                item["ai_summary"] = entry.get("summary") or fb_summary
                                ai_kws = entry.get("keywords")
                                if isinstance(ai_kws, list) and len(ai_kws) > 0:
                                    item["keywords"] = [str(k).lstrip("#") for k in ai_kws[:5]]
                                approved.append(item)
                        print(f"Gemini double-check succeeded using {model_name}: {len(approved)}/{len(new_items)} approved.")
                        return approved
            except Exception as e:
                print(f"Model {model_name} failed: {e}")

    # フォールバック時にも個別タイトルを反映したコメント・要約を付与
    for item in new_items:
        fb_comment, fb_summary = build_specific_fallback(item["title"], item["category"])
        item["ai_comment"] = fb_comment
        item["ai_summary"] = fb_summary
    return new_items

def main():
    print("Starting Atrium AI News Curator...")
    existing_items = []
    if os.path.exists(NEWS_JSON_PATH):
        try:
            with open(NEWS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                existing_items = data.get("items", [])
        except Exception as e:
            print(f"Existing news.json load error: {e}")

    # 既存の過去記事もダブルチェック関数に通し、歯学部や特定大学イベント等のノイズを一掃しつつ有効な過去記事をすべて保持
    normalized_existing = []
    for item in existing_items:
        raw_title = item.get("title", "")
        title = re.sub(r'\s*-\s*[^-]+$', '', raw_title.strip())
        if not is_valid_article(title):
            continue

        cat = clean_category(item.get("category", ""))
        item["title"] = title
        item["category"] = cat
        item["id"] = make_article_id(title)

        fb_comment, fb_summary = build_specific_fallback(title, cat)
        if not item.get("ai_comment") or "直近の採用イベント・募集・キャリア形成に関わる最新ニュースです" in item.get("ai_comment", ""):
            item["ai_comment"] = fb_comment
        if not item.get("ai_summary") or len(item.get("ai_summary", "")) < 150:
            item["ai_summary"] = fb_summary
        if not item.get("keywords"):
            item["keywords"] = extract_keywords(title, cat)

        if not item.get("timestamp"):
            try:
                dt = parsedate_to_datetime(item.get("date", ""))
                item["timestamp"] = int(dt.timestamp() * 1000)
                item["date"] = dt.strftime("%Y/%m/%d")
            except Exception:
                item["timestamp"] = int(datetime.now(timezone.utc).timestamp() * 1000) - 86400000
        normalized_existing.append(item)

    raw_new = []
    for q in SEARCH_QUERIES:
        raw_new.extend(fetch_rss_items(q))

    existing_titles = {it.get("title", "")[:45] for it in normalized_existing}
    unique_new = []
    for it in raw_new:
        key = it["title"][:45]
        if key not in existing_titles:
            existing_titles.add(key)
            unique_new.append(it)

    approved_new = screen_and_generate_ai_contents(unique_new)

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

    print(f"Updated news.json: +{len(approved_new)} new items (Total archive: {len(combined)} items)")

if __name__ == "__main__":
    main()
