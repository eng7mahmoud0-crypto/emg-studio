# EMG Studio Full Website

موقع Portfolio كامل لـ EMG Studio باسم Mahmoud Saad.

## التشغيل

1. افتح فولدر المشروع في VS Code.
2. ثبّت المتطلبات:

```bash
pip install -r requirements.txt
```

3. شغّل الموقع:

```bash
python app.py
```

4. افتح:

```text
http://127.0.0.1:5000
```

## لوحة الرفع الخاصة

اضغط Private Upload واستخدم كلمة السر:

```text
EMG2026
```

يمكنك تغيير كلمة السر من داخل `app.py` أو باستخدام Environment Variable باسم:

```text
EMG_ADMIN_PASSWORD
```

## الملفات

- `app.py` بايثون Flask Backend
- `templates/index.html` صفحة HTML
- `static/css/style.css` التصميم والأنيميشن
- `static/js/main.js` JavaScript للفلاتر والرفع
- `static/uploads` الأعمال التي ترفعها
- `works.json` يتم إنشاؤه تلقائياً لحفظ بيانات الأعمال
