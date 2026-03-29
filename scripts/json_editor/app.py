import os
import json
import datetime
from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
JSON_PATH = os.path.join(BASE_DIR, "public", "models.json")
BACKUP_DIR = os.path.join(BASE_DIR, "public")
PROVIDERS_DIR = os.path.join(BASE_DIR, "public", "providers")
DEFAULT_MODEL_ICON_MAPPINGS = {
    "deepseek.png": ["DEEPSEEK"],
}


def list_provider_files():
    if not os.path.isdir(PROVIDERS_DIR):
        return []
    return sorted(
        [
            name
            for name in os.listdir(PROVIDERS_DIR)
            if os.path.isfile(os.path.join(PROVIDERS_DIR, name))
        ],
        key=lambda name: name.lower(),
    )


def normalize_models_payload(data):
    providers_list = list_provider_files()

    def normalize_platforms(platforms):
        if not isinstance(platforms, list):
            return []
        normalized = []
        for platform in platforms:
            if isinstance(platform, dict):
                item = dict(platform)
                item.pop("providers_list", None)
                item.pop("model_icon_mappings", None)
                normalized.append(item)
            else:
                normalized.append(platform)
        return normalized

    def normalize_model_icon_mappings(mappings):
        source = mappings if isinstance(mappings, dict) else DEFAULT_MODEL_ICON_MAPPINGS
        normalized = {}
        for icon_name, keywords in source.items():
            if not isinstance(icon_name, str) or not icon_name.strip():
                continue
            if isinstance(keywords, str):
                keyword_list = [keywords]
            elif isinstance(keywords, list):
                keyword_list = keywords
            else:
                continue

            cleaned_keywords = [
                keyword.strip()
                for keyword in keyword_list
                if isinstance(keyword, str) and keyword.strip()
            ]
            if cleaned_keywords:
                normalized[icon_name] = cleaned_keywords
        return normalized

    if isinstance(data, list):
        return {
            "providers_list": providers_list,
            "model_icon_mappings": normalize_model_icon_mappings(None),
            "platforms": normalize_platforms(data),
        }

    if isinstance(data, dict):
        payload = dict(data)
        payload["providers_list"] = providers_list
        payload["model_icon_mappings"] = normalize_model_icon_mappings(payload.get("model_icon_mappings"))
        payload["platforms"] = normalize_platforms(payload.get("platforms", []))
        return payload

    return {
        "providers_list": providers_list,
        "model_icon_mappings": normalize_model_icon_mappings(None),
        "platforms": [],
    }


def load_models():
    if not os.path.exists(JSON_PATH):
        return normalize_models_payload([])
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return normalize_models_payload(json.load(f))


def save_models(data):
    payload = normalize_models_payload(data)

    # 先备份
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"models.backup.{ts}.json")
    try:
        with open(backup_path, "w", encoding="utf-8") as bf:
            json.dump(load_models(), bf, ensure_ascii=False, indent=2)
    except Exception:
        # 备份失败不阻塞保存
        pass

    # 保存新内容
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def validate_models(data):
    errors = []

    if isinstance(data, dict):
        providers_list = data.get("providers_list")
        if providers_list is not None and not isinstance(providers_list, list):
            errors.append("providers_list 必须是数组")

        model_icon_mappings = data.get("model_icon_mappings")
        if model_icon_mappings is not None:
            if not isinstance(model_icon_mappings, dict):
                errors.append("model_icon_mappings 必须是对象")
            else:
                for icon_name, keywords in model_icon_mappings.items():
                    if not isinstance(icon_name, str) or not icon_name.strip():
                        errors.append("model_icon_mappings 的键必须是非空字符串")
                        continue
                    if not isinstance(keywords, list):
                        errors.append(f"model_icon_mappings[{icon_name}] 必须是数组")
                        continue
                    for keyword in keywords:
                        if not isinstance(keyword, str) or not keyword.strip():
                            errors.append(f"model_icon_mappings[{icon_name}] 的关键字必须是非空字符串")

        platforms = data.get("platforms")
        if not isinstance(platforms, list):
            errors.append("platforms 必须是数组")
            return errors
    elif isinstance(data, list):
        platforms = data
    else:
        errors.append("根结构必须是对象或数组")
        return errors

    for idx, platform in enumerate(platforms):
        for key in ["id", "name", "displayName", "models"]:
            if key not in platform:
                errors.append(f"平台[{idx}]缺少字段: {key}")
        if "models" in platform and not isinstance(platform["models"], list):
            errors.append(f"平台[{idx}].models 必须是数组")
        if isinstance(platform.get("models", []), list):
            for midx, model in enumerate(platform["models"]):
                for mkey in ["id", "displayName", "platformId"]:
                    if mkey not in model:
                        errors.append(f"平台[{idx}].models[{midx}] 缺少字段: {mkey}")
    return errors


def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(os.path.dirname(__file__), "templates"),
        static_folder=os.path.join(os.path.dirname(__file__), "static"),
    )
    CORS(app)

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.route("/api/models", methods=["GET"])
    def get_models():
        try:
            return jsonify(load_models())
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/models", methods=["POST", "PUT"])
    def put_models():
        try:
            data = request.get_json(force=True)
            errors = validate_models(data)
            if errors:
                return jsonify({"ok": False, "errors": errors}), 400
            save_models(data)
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500

    @app.route("/api/platforms", methods=["GET"])
    def get_platforms():
        try:
            payload = load_models()
            items = [
                {
                    "id": p.get("id"),
                    "name": p.get("id"),
                    "displayName": p.get("displayName"),
                    "modelsCount": len(p.get("models", [])),
                }
                for p in payload.get("platforms", [])
            ]
            return jsonify(items)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # 静态资源（可选：如需单独提供）
    @app.route("/static/<path:filename>")
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)

    return app


if __name__ == "__main__":
    app = create_app()
    # 避免与 Vite 端口冲突，使用 5050
    app.run(host="127.0.0.1", port=5050, debug=True)