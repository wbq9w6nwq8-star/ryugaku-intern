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
NEWS_JSON_PATH = "news.json"
MAX_ARCHIVE_ITEMS = 200
MAX_NEW_ARTICLES_PER_RUN = 4  # 1記事あたり1000文字以上の長文を生成するため1回4件に集中

EXCLUSIONS = '-"大学" -"学部" -"歯学部" -"歯科" -"看護" -"薬学" -"介護" -"交換留学" -"体験記" -"社員旅行" -"懇親会"'

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
        "query": f'site:prtimes.jp ("新卒採用" OR "就活" OR "就活生" OR "グローバルキャリア") ("ワークショップ" OR "オンライン説明会" OR "選考対策" OR "キャリアセミナー") {EXCLUSIONS} when:14d'
    }
]

# 1段階目チェック：医療福祉・特定大学広報・社内イベント（「社員旅行」「懇親会」等）を完全排除
NG_KEYWORDS = [
    "歯学部", "歯科", "歯科医", "歯科衛生", "医学部", "薬学部", "薬剤師", "看護", "獣医",
    "介護", "福祉", "保育", "幼稚園", "栄養士", "理学療法", "作業療法", "柔道整復",
    "体験記", "交換留学", "派遣留学", "帰国報告", "オープンキャンパス", "入試", "偏差値",
    "共通テスト", "学園祭", "大学プレスセンター", "教授が", "准教授", "高校生向け", "中学生",
    "小学生", "パチンコ", "競馬", "競輪", "人事異動", "訃報", "決算短信", "株式分割",
    "社員旅行", "懇親会", "周年", "社内イベント", "表彰式", "内定式", "入社式", "運動会", "忘年会"
]

SPECIFIC_UNI_PATTERN = re.compile(
    r'(?:[^\s「『（(]{2,10})(?:大学|短期大学|専門学校|高校|高等学校)(?:が|で|の|にて|主催|開催|、|・|\s*[-｜|])'
)

# 単なる「開催」だけでは通さず、学生のキャリア・就活・奨学金に直結する語を必須化
REQUIRED_CAREER_SIGNALS = [
    "インターン", "新卒", "就活", "採用", "選考", "エントリー", "ボスキャリ", "キャリアフォーラム",
    "説明会", "奨学金", "給付", "財団", "海外大生", "留学生", "卒向け", "年卒"
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
    if not title or len(title) < 12:
        return False
    if any(ng in title for ng in NG_KEYWORDS):
        return False
    if "海外大学" not in title and "海外大生" not in title:
        if SPECIFIC_UNI_PATTERN.search(title):
            return False
    if not any(sig in title for sig in REQUIRED_CAREER_SIGNALS):
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
    return tags[:5]


def discover_available_models(api_key):
    """APIから現在有効なモデル一覧を動的に取得し、404エラーを完全に防ぐ"""
    # 過去のログで動作確認済みのモデル＋最新候補をバックアップとして保持
    known_fallbacks = [
        "gemini-3.8-flash",
        "gemini-3.5-flash-lite",
        "gemini-3-pro",
        "gemini-3-flash"
    ]
    api_host = "generativelanguage" + ".googleapis.com"
    list_url = f"https://{api_host}/v1beta/models?key={api_key}"

    try:
        req = urllib.request.Request(list_url)
        with urllib.request.urlopen(req, timeout=12) as res:
            data = json.loads(res.read().decode("utf-8"))

        pro_models = []
        flash_models = []
        lite_models = []

        for m in data.get("models", []):
            name = m.get("name", "").replace("models/", "")
            methods = m.get("supportedGenerationMethods", [])
            lname = name.lower()

            if "generateContent" not in methods:
                continue
            # 特殊用途モデルや429が出やすい実験モデル（omni等）を除外
            if any(ex in lname for ex in ["omni", "audio", "tts", "image", "vision", "embedding", "aqa", "1.0", "1.5", "2.0", "2.5"]):
                continue

            if "pro" in lname:
                pro_models.append(name)
            elif "lite" in lname:
                lite_models.append(name)
            elif "flash" in lname:
                flash_models.append(name)

        pro_models.sort(reverse=True)
        flash_models.sort(reverse=True)
        lite_models.sort(reverse=True)

        # 標準Flash（安定＆高品質）→ Pro（最高品質）→ Lite（高速予備）の順で候補を構築
        discovered = flash_models[:2] + pro_models[:2] + lite_models[:2]
        for fb in known_fallbacks:
            if fb not in discovered:
                discovered.append(fb)

        print(f"Discovered active Gemini models: {discovered[:5]}")
        return discovered[:5]
    except Exception as e:
        print(f"Model discovery warning ({e}), using known fallbacks: {known_fallbacks}")
        return known_fallbacks


def extract_article_body_text(url):
    """元記事URLからOGP説明文と本文テキスト（最大4000文字）を抽出する"""
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

        meta_parts = []
        for prop in ["og:description", "description"]:
            m = re.search(rf'<meta[^>]+(?:property|name)=["\']{prop}["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if m:
                meta_parts.append(m.group(1).strip())

        html = re.sub(r'<(script|style|nav|header|footer|aside|noscript)[^>]*>[\s\S]*?</\1>', ' ', html, flags=re.IGNORECASE)
        text = re.sub(r'<[^>]+>', ' ', html)
        text = re.sub(r'&nbsp;|&amp;|&quot;|&lt;|&gt;|&#\d+;', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()

        combined = "\n".join(meta_parts + [text]).strip()
        if len(combined) < 200 or "Google ニュース" in combined[:80]:
            return "\n".join(meta_parts)
        return combined[:4000]
    except Exception as e:
        print(f"Body fetch skipped ({url[:40]}...): {e}")
        return ""


def fetch_rss_items(query_info, max_age_days=35):
    host = "news" + ".google.com"
    url = f"https://{host}/rss/search?q={urllib.parse.quote(query_info['query'])}&hl=ja&gl=JP&ceid=JP:ja"
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
                "rss_snippet": desc_clean[:500]
            })
            if len(items) >= 5:
                break
    except Exception as e:
        print(f"RSS fetch error ({query_info['category']}): {e}")

    return items


def build_rich_fallback(title, category, snippet=""):
    """万が一APIが全モデル429等の場合でも、1000文字近い 상세な解説を提供するフォールバック"""
    clean_t = re.sub(r'\s*-\s*[^-]+$', '', (title or "").strip())
    cat = clean_category(category)
    grad_match = re.search(r'(2[6-9]卒|202[6-9]年卒|海外大生|留学生)', clean_t)
    target_str = f"{grad_match.group(1)}を対象に含む" if grad_match else "グローバル志向の学生が押さえておくべき"

    comment = f"{target_str}注目トピック「{clean_t[:34]}」です。募集要件やオンライン参加の可否、早期選考・応募締切のスケジュールを早めに確認しましょう。"

    summary = (
        f"【1. ニュースの核心と募集・発表ファクトの整理】\n"
        f"本記事「{clean_t}」は、{cat}領域における最新のプログラム・採用・支援動向を伝える重要トピックです。"
        f"{('（抜粋情報：' + snippet[:160] + '）') if snippet else ''}"
        f"主催企業・団体が発信する一次情報には、対象となる卒業年度や応募資格、実施期間、開催形式（オンラインまたは対面）といった選考・応募の根幹となる条件が含まれています。表面的なニュースタイトルだけで判断せず、募集要項の細部まで目を通すことが他の候補者との差別化につながります。\n\n"
        f"【2. 業界・採用構造から見た本質的な背景】\n"
        f"近年の新卒採用市場およびグローバル人材獲得競争では、従来の就職ナビサイト解禁を待たずに、サマー・オータム・ウィンターインターンや早期セミナー、通年選考枠を通じて優秀層へ早期アプローチを行う動きが完全に定着しています。また奨学金や留学支援プログラムにおいても、円安や現地滞在費の高騰を背景に、給付型支援への応募倍率が高まる傾向にあります。したがって、こうした公募開始やイベント開催のニュースを初動でキャッチできるかどうかが、最終的な内定や採択率を大きく左右します。\n\n"
        f"【3. 海外大生・留学生にとっての戦略的メリットと注意点】\n"
        f"海外の正規大学や交換留学プログラムに在籍する学生にとって、国内学生と最も条件が異なるのは「物理的な移動の制約（一時帰国時期）」と「時差のある環境での選考スケジュール管理」です。\n"
        f"・説明会やワークショップ、面接がすべてオンライン（Zoom等）で完結するか、あるいは6〜9月・冬休み等の一時帰国期間と対面日程が合致するかを最初に確認してください。\n"
        f"・ボスキャリ（ボストンキャリアフォーラム）や海外大生特別選考ルートを持つ企業の場合、今回のイベント参加が早期選考パスや面接回数免除に直結するケースが多々あります。\n"
        f"・奨学金関連の場合は、「日本の大学に在籍する交換留学生のみ対象」か「海外大学へ直接進学する正規留学生・大学院生も対象か」、さらに他団体奨学金との併給が可能かを必ず募集要項で照合してください。\n\n"
        f"【4. 選考突破・応募に向けた具体的な準備ポイント】\n"
        f"エントリーにあたっては、単にマイページ登録を済ませるだけでなく、海外環境で培った「異文化適応力」「タフな交渉・協働経験」「専門領域の学業成果（GPAや研究テーマ）」を、志望企業や財団が求める人物像と結びつけて言語化しておく必要があります。Webテスト（玉手箱・TG-WEB・SPI等）やケース面接・グループディスカッションが課される場合は、エントリー締切から逆算して対策時間を確保しましょう。\n\n"
        f"【5. 今すぐ実行すべきネクストアクション】\n"
        f"1. 下部の「元記事・募集要項へ進む」から公式ページを開き、対象学年・応募条件・実施日程を確認する\n"
        f"2. エントリー締切日時（日本標準時JSTか現地時間かに注意）を手元のカレンダーへ即座に登録する\n"
        f"3. 必要な提出書類（和文・英文レジュメ、エントリーシート、成績証明書等）をリストアップし、今週中に下書きに着手する"
    )
    return comment, summary


def analyze_single_article_with_gemini(item, body_text, model_candidates):
    """第2段階チェック＆1,000〜1,500文字の徹底深掘り解説記事生成"""
    if not GEMINI_API_KEY:
        return None

    snippet = item.get("rss_snippet") or ""
    full_source = "\n".join(filter(None, [body_text, snippet])).strip()
    source_section = (
        f"【元記事から抽出した本文・抜粋テキスト】\n{full_source}"
        if full_source
        else "（※本文テキストが短いため、記事タイトルに含まれる企業名・団体名・プログラム名・卒年・業界構造の専門知識を総動員して具体的かつ詳細な解説を構築してください）"
    )

    prompt = f"""
あなたは英国・北米・豪州・アジア等の海外正規大学に通う日本人学生およびハイクラス就活生向けメディア『Atrium』の編集長兼チーフキャリアアナリストです。
以下の記事を厳格に審査し、読者にとって本当に有益な記事である場合のみ、タップして開いた読者が圧倒的に満足する「1,000〜1,400文字の徹底深掘り解説記事」を執筆してください。

【記事タイトル】
{item['title']}

【カテゴリ】
{item['category']}

{source_section}

【厳格な除外基準（1つでも該当する場合は必ず is_relevant: false にすること）】
- 企業の社員旅行、周年懇親会、社内運動会、表彰式、役員人事などの社内向けニュース（学生向け募集ではないもの）
- 歯学部・歯科・医学部・薬学部・看護・獣医・介護・保育などの医療福祉系ローカル記事
- 特定の日本の大学1校のみを対象とした学内イベント、交換留学報告会、大学入試記事
- 学生のキャリア形成・インターン・就活・奨学金と無関係な一般ニュース

【執筆ルール（絵文字は一切使用禁止）】
1. comment（110〜140文字）:
   タイムラインの一覧カードに表示する「AI視点の鋭い要点」。定型文は一切使わず、この記事固有の企業名・主催団体・対象卒年・プログラムの特徴と、なぜ今チェックすべきかを具体的に凝縮すること。
2. summary（必ず1,000〜1,400文字以上の長文で徹底解説すること）:
   記事をタップした読者は「この記事の詳しい中身と、自分がどう動くべきかの本質的な攻略法」を知りたくて開いています。薄っぺらい要約ではなく、以下の5部構成（各見出しの前に改行を入れる）で、具体例や背景知識を交えて1,000文字以上で濃密に執筆してください：

   【1. ニュースの核心と募集・発表ファクトの徹底整理】
   （どの企業・団体が、どの層を対象に、どのようなプログラム・選考・インターン・奨学金を発表したのか。本文やタイトルから読み取れる日時・形式・定員・特徴などのファクトを漏れなく具体的に整理する）

   【2. 業界動向・採用構造から見た本質的な意味】
   （なぜこの企業・団体がいまこの施策を打っているのか。早期選考化、ジョブ型採用、グローバル人材獲得競争、あるいは留学支援のトレンドなど、マクロな構造から見たこの記事の重要性を深く解説する）

   【3. 海外大生・グローバル就活生への影響と特有の注意点】
   （海外滞在中・留学中の学生がこの情報をどう活用すべきか。オンライン参加の可否、時差への対応、6〜9月の一時帰国スケジュールとの兼ね合い、ボスキャリや本選考優遇ルートへの直結度、奨学金なら正規留学/交換留学の対象区分や併給条件など、海外大生ならではの視点を掘り下げる）

   【4. 選考突破・採択に向けた実践的アプローチ】
   （このインターンや選考、イベント、奨学金に応募する際、ES・レジュメ・面接・Webテスト等でどのような点が見られるか、海外大生はどう強みをアピールすべきかの具体的な対策論）

   【5. 今すぐ実行すべきネクストアクション】
   （読者が今日この画面を閉じた直後に取るべき具体的な行動ステップを3点、箇条書きで明確に提示する）

3. keywords（3〜5個）:
   記事検索・タグ絞り込み用の具体的なキーワード配列（例: ["三井物産", "サマーインターン", "28卒", "海外大生向け"]）。

必ず以下のJSONオブジェクト形式のみを出力してください：
{{"is_relevant": true, "comment": "...", "summary": "...", "keywords": ["..."]}}
"""

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "maxOutputTokens": 8192,
            "temperature": 0.4
        }
    }).encode("utf-8")

    api_host = "generativelanguage" + ".googleapis.com"

    for model_name in model_candidates:
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
            with urllib.request.urlopen(req, timeout=120) as res:
                result = json.loads(res.read().decode("utf-8"))
                text_out = result["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_out)
                if isinstance(parsed, dict) and "is_relevant" in parsed:
                    summary_len = len(parsed.get("summary") or "")
                    print(f"Success with [{model_name}] ({summary_len} chars): {item['title'][:30]}...")
                    return parsed
        except urllib.error.HTTPError as e:
            err_detail = e.read().decode("utf-8", errors="ignore")[:160]
            print(f"Model [{model_name}] HTTP {e.code}: {err_detail}")
            time.sleep(5)
        except Exception as e:
            print(f"Model [{model_name}] error ({e}) -> trying next...")
            time.sleep(5)

    return None


def main():
    print("Starting Atrium Deep AI News Curator (1000+ chars Long-Form Edition)...")
    model_candidates = discover_available_models(GEMINI_API_KEY) if GEMINI_API_KEY else []

    existing_items = []
    if os.path.exists(NEWS_JSON_PATH):
        try:
            with open(NEWS_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                existing_items = data.get("items", [])
        except Exception as e:
            print(f"Existing news.json load error: {e}")

    # 既存アーカイブから「社員旅行・懇親会・歯学部」などのノイズ記事を掃除し、短い要約も1000字クラスへ底上げ
    normalized_existing = []
    upgraded_count = 0

    for item in existing_items:
        title = re.sub(r'\s*-\s*[^-]+$', '', (item.get("title") or "").strip())
        if not is_valid_article(title):
            print(f"Removed noise article from existing archive: {title[:40]}")
            continue

        cat = clean_category(item.get("category", ""))
        item["title"] = title
        item["category"] = cat
        item["id"] = make_article_id(title)
        item.pop("rss_snippet", None)

        # 既存記事の要約が600文字未満で薄い場合、1回の実行につき最大2件までAIで1000文字超に書き直す
        current_summary = item.get("ai_summary") or ""
        if len(current_summary) < 650 and GEMINI_API_KEY and upgraded_count < 2:
            print(f"Upgrading short existing article with AI: {title[:38]}...")
            body_text = extract_article_body_text(item.get("link", ""))
            ai_res = analyze_single_article_with_gemini(item, body_text, model_candidates)
            if ai_res and ai_res.get("is_relevant") is False:
                print(f"Removed irrelevant existing article by AI check: {title[:40]}")
                continue
            if ai_res and ai_res.get("summary"):
                item["ai_comment"] = (ai_res.get("comment") or item.get("ai_comment") or "").strip()
                item["ai_summary"] = ai_res.get("summary").strip()
                if isinstance(ai_res.get("keywords"), list) and ai_res["keywords"]:
                    item["keywords"] = [str(k).lstrip("#").strip() for k in ai_res["keywords"][:5]]
                upgraded_count += 1
                time.sleep(4)

        if len(item.get("ai_summary") or "") < 650:
            fb_comment, fb_summary = build_rich_fallback(title, cat)
            if not item.get("ai_comment"):
                item["ai_comment"] = fb_comment
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
        print(f"[{idx + 1}/{len(targets)}] Scraping & Writing 1000+ chars Deep Analysis: {item['title'][:40]}...")
        body_text = extract_article_body_text(item["link"])
        ai_res = analyze_single_article_with_gemini(item, body_text, model_candidates)
        snippet = item.pop("rss_snippet", "")

        if ai_res is not None:
            if ai_res.get("is_relevant") is False:
                print(f"Rejected by AI double-check: {item['title'][:40]}")
                continue
            fb_comment, fb_summary = build_rich_fallback(item["title"], item["category"], snippet)
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
            fb_comment, fb_summary = build_rich_fallback(item["title"], item["category"], snippet)
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

    print(f"Done! +{len(approved_new)} new deep articles, {upgraded_count} upgraded. Total archive: {len(combined)} items.")


if __name__ == "__main__":
    main()
