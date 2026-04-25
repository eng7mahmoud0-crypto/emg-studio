import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify, send_from_directory, abort

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
DATA_FILE = os.path.join(BASE_DIR, "works.json")

ADMIN_PASSWORD = os.environ.get("EMG_ADMIN_PASSWORD", "EMG2026")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif", "mp4", "mov", "webm"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def read_works():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_works(works):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(works, file, ensure_ascii=False, indent=2)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/works", methods=["GET"])
def get_works():
    return jsonify(read_works())


@app.route("/api/upload", methods=["POST"])
def upload_work():
    password = request.form.get("password", "")
    if password != ADMIN_PASSWORD:
        return jsonify({"ok": False, "message": "كلمة السر غير صحيحة"}), 401

    file = request.files.get("file")
    title = request.form.get("title", "EMG Work").strip()
    category = request.form.get("category", "graphic").strip()
    description = request.form.get("description", "").strip()

    if category not in ["graphic", "video", "photo"]:
        category = "graphic"

    if not file or file.filename == "":
        return jsonify({"ok": False, "message": "لم يتم اختيار ملف"}), 400

    if not allowed_file(file.filename):
        return jsonify({"ok": False, "message": "نوع الملف غير مدعوم"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    safe_name = secure_filename(file.filename)
    final_name = f"{int(datetime.now().timestamp())}_{safe_name}"
    save_path = os.path.join(UPLOAD_FOLDER, final_name)
    file.save(save_path)

    work = {
        "id": int(datetime.now().timestamp() * 1000),
        "title": title,
        "category": category,
        "description": description,
        "type": "video" if ext in ["mp4", "mov", "webm"] else "image",
        "src": f"/static/uploads/{final_name}",
        "created_at": datetime.now().isoformat()
    }

    works = read_works()
    works.insert(0, work)
    save_works(works)

    return jsonify({"ok": True, "work": work})


@app.route("/api/works/<int:work_id>", methods=["DELETE"])
def delete_work(work_id):
    password = request.headers.get("X-Admin-Password", "")
    if password != ADMIN_PASSWORD:
        return jsonify({"ok": False, "message": "غير مسموح"}), 401

    works = read_works()
    target = next((work for work in works if work["id"] == work_id), None)

    if not target:
        return jsonify({"ok": False, "message": "العمل غير موجود"}), 404

    file_path = os.path.join(BASE_DIR, target["src"].lstrip("/"))
    if os.path.exists(file_path):
        os.remove(file_path)

    works = [work for work in works if work["id"] != work_id]
    save_works(works)

    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True)
