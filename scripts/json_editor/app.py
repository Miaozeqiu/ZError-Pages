import os
import json
import datetime
from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
JSON_PATH = os.path.join(BASE_DIR, "public", "models.json")
BACKUP_DIR = os.path.join(BASE_DIR, "public")


def load_models():
    if not os.path.exists(JSON_PATH):
        return []
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_models(data):
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
        json.dump(data, f, ensure_ascii=False, indent=2)


def validate_models(data):
    errors = []
    if not isinstance(data, list):
        errors.append("根结构必须是数组")
        return errors

    for idx, platform in enumerate(data):
        for key in ["id", "name", "displayName", "models"]:
            if key not in platform:
                errors.append(f"平台[{idx}]缺少字段: {key}")
        if "models" in platform and not isinstance(platform["models"], list):
            errors.append(f"平台[{idx}].models 必须是数组")
        # 简单模型校验
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
            models = load_models()
            items = [
                {
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "displayName": p.get("displayName"),
                    "modelsCount": len(p.get("models", [])),
                }
                for p in models
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