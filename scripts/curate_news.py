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
            # 新しいバージョン（数字が大きい順）にソートして候補にする
            models.sort(reverse=True)
            if models:
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
