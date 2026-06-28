# VocabLens 🔍

> Highlight any English word while browsing → get Oxford definition, Vietnamese translation, synonyms, example sentences, and saved context — instantly. Then review with Flashcard + Quiz mode.

---

## 🧩 Problem Statement

Khi đọc tài liệu tiếng Anh trên máy tính, người học phải:

1. Gặp từ mới → mở tab mới → tra Oxford/Google Translate
2. Copy nghĩa → paste vào Notion/Google Sheets để lưu
3. Nhớ context đang đọc đã bị mất khi chuyển tab

**VocabLens** giải quyết cả 3 bước này trong một thao tác: **bôi đen → popup → lưu**.

---

## ✨ Core Features

### 1. Chrome Extension — Popup Tra Từ
- Bôi đen bất kỳ từ nào trên trang web → popup hiện ngay tại chỗ
- Hiển thị:
  - **Định nghĩa Oxford** (qua Dictionary API / Oxford API)
  - **Phiên âm IPA** + nút nghe phát âm
  - **Bản dịch tiếng Việt** (AI — Gemini API)
  - **Từ đồng nghĩa / trái nghĩa**
  - **Ví dụ câu** (example sentences)
- **Nút "Save Word"** → lưu từ + ngữ cảnh (câu đang đọc) vào Supabase
- Không cần rời trang, không mất mạch đọc

### 2. Web App — Vocab Dashboard
- Xem toàn bộ danh sách từ đã lưu
- Lọc theo: ngày lưu / từ loại / mức độ thuộc
- Xem lại **ngữ cảnh gốc** (câu/đoạn đang đọc khi gặp từ đó)
- Xem URL nguồn để quay lại tài liệu gốc

### 3. Review Mode — Flashcard
- Lật card: mặt trước (từ tiếng Anh) → mặt sau (nghĩa + ví dụ)
- Tự đánh giá: **Nhớ / Không nhớ** → hệ thống tự điều chỉnh thứ tự ôn (Spaced Repetition đơn giản)
- Ưu tiên những từ lâu không ôn hoặc đánh giá "Không nhớ"

### 4. Review Mode — Quiz Trắc Nghiệm
- Hiện từ tiếng Anh → chọn 1 trong 4 nghĩa tiếng Việt
- Hoặc ngược lại: hiện nghĩa → chọn từ đúng
- Kết quả phiên: điểm số, từ sai nhiều nhất, streak

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  CHROME EXTENSION                   │
│  content_script.js  ←→  popup UI (React/Vanilla)   │
│         ↓ fetch                                     │
│   background.js (service worker)                   │
│         ↓ API calls                                 │
└──────────────┬──────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────┐
│              NEXT.JS API ROUTES (Vercel)            │
│  /api/lookup   → Dictionary API + Gemini AI         │
│  /api/words    → CRUD từ vựng (auth required)       │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│                   SUPABASE                          │
│  Auth (Google OAuth)   │   PostgreSQL DB            │
│  Row Level Security    │   Realtime (optional)      │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Supabase)

### Table: `words`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → auth.users |
| `word` | text | Từ tiếng Anh (lowercase) |
| `phonetic` | text | IPA phiên âm |
| `definition` | jsonb | Oxford definition (array of meanings) |
| `translation_vi` | text | Bản dịch tiếng Việt (AI) |
| `synonyms` | text[] | Từ đồng nghĩa |
| `antonyms` | text[] | Từ trái nghĩa |
| `examples` | text[] | Ví dụ câu |
| `context_sentence` | text | Câu đang đọc khi gặp từ |
| `source_url` | text | URL trang web nguồn |
| `source_title` | text | Tiêu đề trang web nguồn |
| `review_score` | int | 0–5: mức độ thuộc (spaced repetition) |
| `last_reviewed_at` | timestamptz | Lần ôn cuối |
| `next_review_at` | timestamptz | Lịch ôn tiếp theo |
| `created_at` | timestamptz | Ngày lưu từ |

### Table: `quiz_sessions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → auth.users |
| `mode` | text | `flashcard` hoặc `quiz` |
| `score` | int | Số câu đúng |
| `total` | int | Tổng số câu |
| `words_tested` | uuid[] | Danh sách từ được quiz |
| `created_at` | timestamptz | Thời gian làm quiz |

---

## 🛠️ Tech Stack

| Layer | Technology | Lý do chọn |
|-------|-----------|------------|
| **Frontend Web** | Next.js 14 (App Router) | SSR/SSG tốt, tích hợp API routes, Vercel native |
| **Styling** | Tailwind CSS + shadcn/ui | Nhanh, consistent, không cần design system riêng |
| **Chrome Extension** | Vanilla JS + Manifest V3 | Lightweight, không cần build phức tạp |
| **Backend API** | Next.js API Routes | Serverless, deploy cùng Vercel, không cần server riêng |
| **Database** | Supabase (PostgreSQL) | Auth sẵn, RLS, realtime, free tier |
| **Auth** | Supabase Auth (Google OAuth) | Dùng chung email Google, không cần đăng ký thêm |
| **Dictionary API** | Free Dictionary API | Free, không cần key, có IPA + examples |
| **AI Translation** | Gemini API (gemini-1.5-flash) | Free tier generous, dịch tiếng Việt tốt |
| **Deploy** | Vercel | Git push = auto deploy, free tier đủ dùng |
| **AI Coding** | Claude / Cursor / Windsurf | Accelerate development |

---

## 📁 Project Structure

```
vocablens/
├── apps/
│   ├── web/                      # Next.js web app
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── callback/
│   │   │   ├── dashboard/        # Vocab list
│   │   │   ├── review/
│   │   │   │   ├── flashcard/
│   │   │   │   └── quiz/
│   │   │   └── api/
│   │   │       ├── lookup/       # Dictionary + AI translate
│   │   │       └── words/        # CRUD endpoints
│   │   ├── components/
│   │   └── lib/
│   │       ├── supabase.ts
│   │       └── gemini.ts
│   │
│   └── extension/                # Chrome Extension
│       ├── manifest.json
│       ├── content_script.js     # Inject vào mọi trang web
│       ├── background.js         # Service worker
│       ├── popup/
│       │   ├── popup.html
│       │   └── popup.js
│       └── styles/
│           └── popup.css
│
├── .env.local.example
├── README.md
└── package.json
```

---

## 🔑 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini AI
GEMINI_API_KEY=

# Optional: Oxford API (nếu dùng API có key)
OXFORD_APP_ID=
OXFORD_APP_KEY=
```

---

## 🗺️ User Flow

### Flow 1: Tra từ & Lưu (Extension)
```
User đọc tài liệu
    → Bôi đen từ "paradigm"
    → content_script.js detect selection
    → Gọi background.js → /api/lookup
    → Popup hiện: definition + IPA + dịch VI + synonyms + examples
    → User click "Save"
    → POST /api/words → Supabase lưu từ + context sentence + URL
    → Popup hiện "✓ Saved!" → tắt popup
    → User tiếp tục đọc
```

### Flow 2: Ôn tập Flashcard (Web)
```
User vào /review/flashcard
    → Fetch danh sách từ chưa thuộc (next_review_at <= now)
    → Hiện card: "paradigm" (mặt trước)
    → User click "Lật"
    → Mặt sau: nghĩa + ví dụ + context ban đầu
    → User đánh giá: "Nhớ" hoặc "Không nhớ"
    → Cập nhật review_score + next_review_at
    → Hiện card tiếp theo
```

### Flow 3: Quiz (Web)
```
User vào /review/quiz
    → Chọn số câu (10/20/50)
    → Mỗi câu: hiện từ + 4 lựa chọn nghĩa
    → Chọn đúng → xanh lá, sai → đỏ + hiện đáp án đúng
    → Kết thúc: hiện điểm, lưu vào quiz_sessions
```

---

## 🚀 Development Roadmap

### Phase 1 — MVP (2–3 tuần)
- [ ] Setup Next.js + Supabase + Auth
- [ ] API route `/api/lookup` (Dictionary API + Gemini translate)
- [ ] API route `/api/words` (CRUD)
- [ ] Chrome Extension: content_script bắt selection + hiện popup
- [ ] Popup UI: hiện definition, IPA, dịch, nút Save
- [ ] Dashboard: danh sách từ đã lưu

### Phase 2 — Review (1–2 tuần)
- [ ] Flashcard mode với Spaced Repetition đơn giản
- [ ] Quiz mode (4 lựa chọn)
- [ ] Lưu quiz session + hiện lịch sử

### Phase 3 — Polish (1 tuần)
- [ ] Dark mode
- [ ] Export từ vựng (CSV / Anki deck)
- [ ] Filter & search trong dashboard
- [ ] Extension icon badge: số từ đã lưu hôm nay
- [ ] Mobile responsive web app

---

## 🔒 Security Notes

- Mọi request đến `/api/words` đều verify Supabase JWT
- Row Level Security (RLS) bật trên tất cả bảng: user chỉ đọc/ghi data của chính mình
- Gemini API key chỉ để server-side, không expose ra client
- Extension chỉ inject script trên `http://` và `https://` (không inject trên chrome:// pages)

---

## 📦 Getting Started

```bash
# 1. Clone repo
git clone https://github.com/yourusername/vocablens.git
cd vocablens

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.local.example .env.local
# Điền các key vào .env.local

# 4. Setup Supabase
# - Tạo project tại supabase.com
# - Chạy SQL schema trong /supabase/schema.sql
# - Bật Google OAuth trong Authentication > Providers

# 5. Run dev server
npm run dev

# 6. Load Chrome Extension
# - Mở chrome://extensions/
# - Bật "Developer mode"
# - Click "Load unpacked" → chọn thư mục apps/extension/
```

---

## 🤝 Contributing

Project cá nhân — nhưng nếu bạn có góp ý, mở issue hoặc PR đều welcome!

---

*Built by Bùi Anh Quân — EdTech Product Analyst in training 🇻🇳*
