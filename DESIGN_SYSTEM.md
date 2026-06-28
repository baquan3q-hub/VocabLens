# VocabLens — Design System

> Tài liệu này là nguồn sự thật duy nhất (single source of truth) cho mọi quyết định thiết kế của VocabLens. Mọi component, màu sắc, typography, spacing đều tham chiếu từ đây.

---

## 1. Design Principles

| Nguyên tắc | Mô tả |
|------------|-------|
| **Clarity first** | Người học đang tập trung đọc — UI không được gây phân tâm. Thông tin từ vựng phải đọc được ngay, không cần suy nghĩ. |
| **Compact but breathable** | Dashboard chứa nhiều data nhưng không được cảm giác chật. Dùng whitespace để phân tách vùng, không dùng border thừa. |
| **Feedback at every step** | Mỗi hành động (lưu từ, lật card, trả lời quiz) phải có phản hồi tức thì — màu sắc, icon, micro-animation. |
| **Progress is motivating** | Hiển thị streak, retention rate, proficiency level để người dùng cảm thấy tiến bộ mỗi ngày. |

---

## 2. Color System

### Primary Palette

```
Brand Purple (Primary)
  --color-primary-50:   #F5F3FF
  --color-primary-100:  #EDE9FE
  --color-primary-200:  #DDD6FE
  --color-primary-300:  #C4B5FD
  --color-primary-400:  #A78BFA
  --color-primary-500:  #8B5CF6   ← Main brand color (sidebar active, CTAs)
  --color-primary-600:  #7C3AED
  --color-primary-700:  #6D28D9
  --color-primary-800:  #5B21B6
  --color-primary-900:  #4C1D95
```

### Semantic Colors

```
Success (Reviewed / Familiar / Correct)
  --color-success-light: #DCFCE7
  --color-success:       #22C55E
  --color-success-dark:  #16A34A

Warning (Learning / Partially known)
  --color-warning-light: #FEF3C7
  --color-warning:       #F59E0B
  --color-warning-dark:  #D97706

Error (Wrong answer / Needs review)
  --color-error-light:   #FEE2E2
  --color-error:         #EF4444
  --color-error-dark:    #DC2626

Info (New words / Neutral)
  --color-info-light:    #DBEAFE
  --color-info:          #3B82F6
  --color-info-dark:     #2563EB
```

### Proficiency Level Colors

Dùng cho biểu đồ donut "Words by Proficiency" và badge review score:

```
New     (score 0–1): --color-proficiency-new:      #818CF8  (Indigo)
Learning(score 2–3): --color-proficiency-learning:  #60A5FA  (Blue)
Familiar(score 4):   --color-proficiency-familiar:  #34D399  (Green)
Mastered(score 5):   --color-proficiency-mastered:  #FBBF24  (Amber)
```

### Neutral / Surface

```
--color-bg-app:        #F8F9FB   ← Nền chính của toàn app (xám rất nhạt)
--color-bg-sidebar:    #FFFFFF   ← Sidebar trắng tinh
--color-surface-1:     #FFFFFF   ← Card, panel
--color-surface-2:     #F3F4F6   ← Hover state trên row table
--color-border:        #E5E7EB   ← Border nhẹ giữa các section
--color-border-strong: #D1D5DB   ← Border rõ hơn (table header)

--color-text-primary:  #111827   ← Heading, số liệu lớn
--color-text-secondary:#6B7280   ← Label, sub-text, placeholder
--color-text-muted:    #9CA3AF   ← Timestamp, disabled text
--color-text-link:     #7C3AED   ← Link clickable (source URL)
```

### Icon Background Palette (Stat Cards)

Mỗi stat card dùng màu icon bg khác nhau để phân biệt nhanh:

```
Total Words  → bg: #EEF2FF  icon: #6366F1  (Indigo)
Reviewed     → bg: #DCFCE7  icon: #22C55E  (Green)
Retention    → bg: #FEF3C7  icon: #F59E0B  (Amber)
Streak       → bg: #F3E8FF  icon: #A855F7  (Purple)
```

---

## 3. Typography

### Font Stack

```css
/* Display: heading trang, số liệu lớn */
--font-display: 'Inter', system-ui, -apple-system, sans-serif;

/* Body: mọi text thường, label, definition */
--font-body: 'Inter', system-ui, -apple-system, sans-serif;

/* Mono: phiên âm IPA, code, badge */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

> **Lý do chọn Inter:** Được thiết kế cho màn hình độ phân giải cao, rất dễ đọc ở size nhỏ (12–14px) — quan trọng với bảng từ vựng dày thông tin. JetBrains Mono cho IPA vì các ký tự đặc biệt cần spacing đều.

### Type Scale

| Token | Size | Weight | Line Height | Dùng cho |
|-------|------|--------|-------------|----------|
| `--text-xs` | 11px | 400 | 1.5 | Timestamp, badge label |
| `--text-sm` | 13px | 400 | 1.5 | Table cell, sub-label |
| `--text-base` | 14px | 400 | 1.6 | Body, definition text |
| `--text-md` | 15px | 500 | 1.5 | Sidebar nav item |
| `--text-lg` | 16px | 600 | 1.4 | Card title, section label |
| `--text-xl` | 18px | 600 | 1.3 | "Recent Words", "Review Progress" |
| `--text-2xl` | 22px | 700 | 1.2 | Page title "Dashboard" |
| `--text-3xl` | 32px | 700 | 1.0 | Stat number (342, 128, 78%) |
| `--text-4xl` | 40px | 800 | 1.0 | Quiz score result |

### IPA / Phonetic

```css
.phonetic {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-secondary);
  letter-spacing: 0.01em;
}
/* Ví dụ: /ˌser.ənˈdɪp.ɪ.ti/ */
```

---

## 4. Spacing System

Scale theo bội số 4px:

```
--space-0:   0px
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
```

### Layout Spacing

```
Sidebar width:          240px (collapsed: 64px)
Content area padding:   32px top/bottom, 32px left/right
Card padding:           24px
Table cell padding:     12px 16px
Section gap:            24px
Card gap (grid):        16px
```

---

## 5. Border Radius

```
--radius-sm:   6px    ← Badge, tag, input
--radius-md:   10px   ← Card, button, popup
--radius-lg:   14px   ← Stat card, modal
--radius-xl:   20px   ← Extension popup container
--radius-full: 9999px ← Avatar, pill badge, toggle
```

---

## 6. Shadow System

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.04);           /* Divider subtle */
--shadow-md:  0 2px 8px rgba(0,0,0,0.06);           /* Card resting */
--shadow-lg:  0 4px 16px rgba(0,0,0,0.10);          /* Card hover, popup */
--shadow-xl:  0 8px 32px rgba(0,0,0,0.14);          /* Modal, extension popup */
--shadow-focus: 0 0 0 3px rgba(139,92,246,0.25);    /* Focus ring (primary) */
```

---

## 7. Components

### 7.1 Sidebar Navigation

```
Width: 240px
Background: #FFFFFF
Border-right: 1px solid var(--color-border)
Padding: 20px 12px

Logo area:
  - Icon 24px + text "VocabLens" font-size 18px font-weight 700
  - Margin-bottom: 32px

Nav item (default):
  - Height: 40px
  - Padding: 0 12px
  - Border-radius: var(--radius-md)
  - Color: var(--color-text-secondary)
  - Icon: 18px, margin-right: 10px
  - Font-size: var(--text-md)

Nav item (active):
  - Background: var(--color-primary-50) → #F5F3FF
  - Color: var(--color-primary-600) → #7C3AED
  - Font-weight: 600
  - Icon color: var(--color-primary-500)

Nav item (hover):
  - Background: var(--color-surface-2)
  - Color: var(--color-text-primary)

Sub-menu (Review):
  - Indent: 28px từ icon
  - Font-size: var(--text-sm)
  - Collapsed/expanded bằng chevron icon

Bottom card (Install Extension):
  - Background: var(--color-primary-50)
  - Border: 1px solid var(--color-primary-200)
  - Border-radius: var(--radius-lg)
  - Padding: 16px
  - Button "Add to Chrome": full width, bg white, border 1px solid border
  - Chrome icon 16px bên trái button
```

### 7.2 Stat Card

```
Layout: 4 card ngang, equal width, gap 16px
Height: 100px
Background: #FFFFFF
Border: 1px solid var(--color-border)
Border-radius: var(--radius-lg)
Padding: 20px 24px
Box-shadow: var(--shadow-md)

Structure:
  [Icon Box 44x44] [Right: Label + Number + Delta]

Icon Box:
  - Border-radius: var(--radius-md)
  - Màu bg xem Color System > Icon Background Palette

Number:
  - Font-size: var(--text-3xl) → 32px
  - Font-weight: 700
  - Color: var(--color-text-primary)

Label (trên number):
  - Font-size: var(--text-sm) → 13px
  - Color: var(--color-text-secondary)
  - Margin-bottom: 2px

Delta (dưới number):
  - Font-size: var(--text-xs) → 11px
  - Color success: #22C55E kèm ↑ icon
  - Color error: #EF4444 kèm ↓ icon
```

### 7.3 Chart Card

```
Background: #FFFFFF
Border: 1px solid var(--color-border)
Border-radius: var(--radius-lg)
Padding: 24px
Box-shadow: var(--shadow-md)

Header row:
  - Title: font-size var(--text-xl), font-weight 600
  - Right: Dropdown filter (7 days / 30 days / All time)
    → Border: 1px solid border, radius sm, padding 6px 10px

Line Chart (Review Progress):
  - New Words line: color #6366F1 (Indigo)
  - Reviewed line:  color #22C55E (Green)
  - Line width: 2px, dot radius: 4px
  - Grid: dashed #E5E7EB, opacity 0.6
  - Tooltip: bg white, shadow-lg, radius md

Donut Chart (Words by Proficiency):
  - Size: 160px diameter
  - Stroke width: 28px
  - Center label: số tổng (342) + "Total" bên dưới
  - Legend bên phải: dot 10px + label + count
```

### 7.4 Words Table

```
Background: #FFFFFF
Border: 1px solid var(--color-border)
Border-radius: var(--radius-lg)
Overflow: hidden (để radius áp dụng đúng cho row đầu/cuối)

Header row:
  - Background: transparent
  - Border-bottom: 1px solid var(--color-border-strong)
  - Font-size: var(--text-xs)
  - Font-weight: 600
  - Color: var(--color-text-secondary)
  - Text-transform: uppercase
  - Letter-spacing: 0.05em
  - Padding: 10px 16px

Data row:
  - Height: 72px
  - Border-bottom: 1px solid var(--color-border)
  - Padding: 0 16px
  - Transition: background 150ms ease

Data row (hover):
  - Background: var(--color-surface-2) → #F3F4F6

Columns:
  Word column (240px):
    - Word: font-weight 600, font-size var(--text-base), color text-primary
    - IPA: font-family mono, font-size 11px, color text-secondary
    - Speaker icon 🔊: 16px, color primary-400, margin-right 8px, clickable

  Definition column (280px):
    - Text: font-size var(--text-sm), color text-secondary
    - Max 2 lines, overflow ellipsis
    - Word type badge (n. / adj. / v.): inline, font-size 11px, 
      color primary-600, bg primary-50, border-radius sm, padding 1px 5px

  Context column (220px):
    - Italic, font-size var(--text-sm), color text-secondary
    - Max 2 lines ellipsis

  Source column (160px):
    - Source name: font-weight 500, font-size var(--text-sm)
    - URL: color primary-600, font-size 11px, truncated

  Saved At column (120px):
    - Date: font-size var(--text-sm), font-weight 500
    - Time: font-size 11px, color text-muted

  Review column (80px):
    - Circle badge: 28px diameter, border-radius full
    - Score 0–1: bg #EEF2FF color #6366F1
    - Score 2–3: bg #DBEAFE color #3B82F6
    - Score 4:   bg #DCFCE7 color #22C55E
    - Score 5:   bg #FEF3C7 color #D97706
    - Font-weight: 600, font-size 13px
    - Kebab menu (⋮): 16px, visible on row hover
```

### 7.5 Extension Popup

```
Dimensions: 360px × auto (max 520px)
Background: #FFFFFF
Border-radius: var(--radius-xl)
Box-shadow: var(--shadow-xl)
Padding: 20px

Header:
  - Word: font-size 24px, font-weight 700, color text-primary
  - IPA: font-family mono, font-size 13px, color text-secondary
  - 🔊 button: 28px, bg primary-50, border-radius full, hover bg primary-100
  - Word type badge: pill, font-size 11px

Definition section:
  - Label "Definition": font-size 10px, uppercase, letter-spacing 0.08em, color text-muted
  - Text: font-size var(--text-base), color text-primary, line-height 1.6

Translation section:
  - Label "Tiếng Việt" + 🇻🇳
  - Bg: primary-50, border-left: 3px solid primary-400
  - Border-radius: 0 radius-sm radius-sm 0
  - Padding: 10px 12px

Synonyms/Antonyms:
  - Chips/tags: bg surface-2, border-radius full, padding 3px 10px, font-size 12px
  - Synonyms: color success-dark
  - Antonyms: color error-dark

Example sentence:
  - Italic, font-size var(--text-sm), color text-secondary
  - Border-left: 2px solid color-border
  - Padding-left: 12px

Context snippet:
  - Label "Saved from": font-size 10px, color text-muted
  - Bg: #FFFBEB, border: 1px solid #FEF3C7
  - Font-size: 12px, italic

Save button:
  - Full width, height 40px
  - Background: var(--color-primary-600) → #7C3AED
  - Color: white
  - Font-weight: 600, font-size 14px
  - Border-radius: var(--radius-md)
  - Hover: bg primary-700
  - Saved state: bg success, text "✓ Saved!"
  - Transition: all 200ms ease
```

### 7.6 Flashcard

```
Card container: 480px × 300px (center screen)
Background: #FFFFFF
Border: 1px solid var(--color-border)
Border-radius: var(--radius-xl)
Box-shadow: var(--shadow-xl)

Front face:
  - Word: font-size 40px, font-weight 800, center
  - IPA: font-mono, 16px, color text-secondary
  - "Tap to reveal" hint: font-size 12px, color text-muted, bottom center

Back face (sau khi lật):
  - Word (nhỏ hơn): 20px, font-weight 600, top left
  - Definition: 16px, line-height 1.7, center
  - Vietnamese translation: 14px, color primary-600, italic
  - Example sentence: 13px, color text-secondary, border-left

Flip animation:
  - CSS 3D transform: rotateY(180deg)
  - Duration: 400ms, timing: ease-in-out
  - Perspective: 1000px

Action buttons (sau khi lật):
  - "Không nhớ": bg error-light, color error-dark, border error-light
  - "Nhớ rồi":   bg success-light, color success-dark, border success-light
  - Width: 140px, height: 44px, border-radius: radius-md
  - Gap giữa 2 button: 16px
```

### 7.7 Quiz Option Button

```
Default:
  - Border: 1.5px solid var(--color-border)
  - Background: #FFFFFF
  - Border-radius: var(--radius-md)
  - Padding: 14px 16px
  - Font-size: var(--text-base)
  - Transition: all 150ms ease

Hover (chưa chọn):
  - Border-color: var(--color-primary-400)
  - Background: var(--color-primary-50)

Selected correct:
  - Border-color: var(--color-success)
  - Background: var(--color-success-light)
  - Color: var(--color-success-dark)
  - ✓ icon bên phải

Selected wrong:
  - Border-color: var(--color-error)
  - Background: var(--color-error-light)
  - Color: var(--color-error-dark)
  - ✕ icon bên phải
```

### 7.8 Buttons

```
Primary:
  - Background: var(--color-primary-600)
  - Color: white
  - Padding: 10px 20px
  - Height: 40px
  - Border-radius: var(--radius-md)
  - Font-weight: 600, font-size 14px
  - Hover: bg primary-700
  - Focus: box-shadow var(--shadow-focus)
  - Active: scale(0.98)

Secondary:
  - Background: white
  - Border: 1.5px solid var(--color-border)
  - Color: var(--color-text-primary)
  - Hover: bg surface-2

Ghost:
  - Background: transparent
  - Color: var(--color-primary-600)
  - Hover: bg primary-50

Danger:
  - Background: var(--color-error)
  - Color: white
  - Hover: bg error-dark

Size variants:
  - sm: height 32px, padding 6px 12px, font-size 13px
  - md: height 40px, padding 10px 20px, font-size 14px (default)
  - lg: height 48px, padding 12px 24px, font-size 15px
```

### 7.9 Badge / Tag

```
Word type (n. adj. v.):
  - Inline, font-size 11px, font-weight 500
  - Padding: 1px 6px
  - Border-radius: var(--radius-sm)
  - noun:      bg #EDE9FE  color #6D28D9
  - adjective: bg #DBEAFE  color #1D4ED8
  - verb:      bg #DCFCE7  color #15803D
  - adverb:    bg #FEF3C7  color #92400E

Streak badge:
  - "🔥 7 days": bg #FEF3C7, color #D97706
  - Border-radius: full
  - Font-weight: 600

Status pill:
  - New / Learning / Familiar / Mastered
  - Dùng màu Proficiency Level Colors
```

### 7.10 Date Range Picker (Header)

```
Container:
  - Border: 1px solid var(--color-border)
  - Border-radius: var(--radius-md)
  - Padding: 7px 12px
  - Background: white
  - Font-size: 13px, font-weight 500

Icon: Calendar 16px, color text-secondary, margin-right 6px
Chevron: 14px, color text-muted, margin-left 8px
Hover: bg surface-2
```

---

## 8. Icons

Dùng **Lucide Icons** (consistent với shadcn/ui):

```
Sidebar:
  Home          → dashboard
  BookMarked    → my words
  Shield        → review
  RefreshCw     → flashcard
  HelpCircle    → quiz
  BarChart2     → statistics
  FolderOpen    → collections
  Settings      → settings

Actions:
  Volume2       → phát âm
  Bookmark      → save word
  ExternalLink  → mở URL nguồn
  MoreVertical  → kebab menu
  ChevronDown   → dropdown
  ChevronRight  → sub-menu

Status:
  CheckCircle2  → correct / reviewed
  XCircle       → wrong
  Star          → retention / favorite
  Flame         → streak
  TrendingUp    → delta tăng
  TrendingDown  → delta giảm

Size: 16px (table, label), 18px (sidebar), 20px (button icon), 24px (stat card)
Stroke-width: 1.75 (default Lucide)
```

---

## 9. Motion & Animation

```
Timing functions:
  --ease-default:  cubic-bezier(0.4, 0, 0.2, 1)   /* Material ease */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1) /* Slight overshoot */
  --ease-out:      cubic-bezier(0, 0, 0.2, 1)

Durations:
  --duration-fast:   100ms   /* Hover state, bg color change */
  --duration-base:   200ms   /* Button, badge, icon transition */
  --duration-medium: 300ms   /* Sidebar collapse, dropdown open */
  --duration-slow:   400ms   /* Card flip, modal enter */
  --duration-page:   500ms   /* Page transition */

Specific animations:
  Extension popup appear:
    - translateY(8px) → translateY(0) + opacity 0→1
    - Duration: 200ms, ease-out

  Stat card count-up:
    - Number animates từ 0 → value khi page load
    - Duration: 800ms, ease-out

  Flashcard flip:
    - CSS perspective + rotateY
    - Duration: 400ms, ease-in-out

  Save word success:
    - Button text đổi "Save" → "✓ Saved!"
    - Scale pulse: 1 → 1.05 → 1
    - Duration: 300ms

  Row highlight (sau khi save từ):
    - Flash bg primary-50 → transparent
    - Duration: 1500ms, ease-out

@media (prefers-reduced-motion: reduce):
  - Tắt tất cả animation, chỉ giữ instant state change
```

---

## 10. Responsive Breakpoints

```
--bp-sm:  640px    /* Mobile landscape */
--bp-md:  768px    /* Tablet */
--bp-lg:  1024px   /* Laptop */
--bp-xl:  1280px   /* Desktop (design target) */
--bp-2xl: 1536px   /* Wide screen */
```

### Behavior theo breakpoint

| Component | Desktop (≥1280px) | Tablet (768–1279px) | Mobile (<768px) |
|-----------|-------------------|---------------------|-----------------|
| Sidebar | 240px expanded | 64px icon-only | Bottom nav bar |
| Stat cards | 4 columns | 2×2 grid | 1 column scroll |
| Charts | Side by side | Stacked | Stacked |
| Words table | Full columns | Hide Context col | Card-style rows |
| Extension popup | 360px fixed | — | — |

---

## 11. CSS Variables — Full Token Sheet

Copy đoạn này vào `globals.css`:

```css
:root {
  /* === COLORS === */
  /* Primary */
  --color-primary-50:  #F5F3FF;
  --color-primary-100: #EDE9FE;
  --color-primary-200: #DDD6FE;
  --color-primary-300: #C4B5FD;
  --color-primary-400: #A78BFA;
  --color-primary-500: #8B5CF6;
  --color-primary-600: #7C3AED;
  --color-primary-700: #6D28D9;
  --color-primary-800: #5B21B6;
  --color-primary-900: #4C1D95;

  /* Semantic */
  --color-success-light: #DCFCE7;
  --color-success:       #22C55E;
  --color-success-dark:  #16A34A;
  --color-warning-light: #FEF3C7;
  --color-warning:       #F59E0B;
  --color-warning-dark:  #D97706;
  --color-error-light:   #FEE2E2;
  --color-error:         #EF4444;
  --color-error-dark:    #DC2626;
  --color-info-light:    #DBEAFE;
  --color-info:          #3B82F6;
  --color-info-dark:     #2563EB;

  /* Proficiency */
  --color-prof-new:      #818CF8;
  --color-prof-learning: #60A5FA;
  --color-prof-familiar: #34D399;
  --color-prof-mastered: #FBBF24;

  /* Neutrals */
  --color-bg-app:        #F8F9FB;
  --color-bg-sidebar:    #FFFFFF;
  --color-surface-1:     #FFFFFF;
  --color-surface-2:     #F3F4F6;
  --color-border:        #E5E7EB;
  --color-border-strong: #D1D5DB;
  --color-text-primary:  #111827;
  --color-text-secondary:#6B7280;
  --color-text-muted:    #9CA3AF;
  --color-text-link:     #7C3AED;

  /* === TYPOGRAPHY === */
  --font-display: 'Inter', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;

  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 14px;
  --text-md:   15px;
  --text-lg:   16px;
  --text-xl:   18px;
  --text-2xl:  22px;
  --text-3xl:  32px;
  --text-4xl:  40px;

  /* === SPACING === */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* === BORDER RADIUS === */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-full: 9999px;

  /* === SHADOWS === */
  --shadow-sm:    0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:    0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg:    0 4px 16px rgba(0,0,0,0.10);
  --shadow-xl:    0 8px 32px rgba(0,0,0,0.14);
  --shadow-focus: 0 0 0 3px rgba(139,92,246,0.25);

  /* === MOTION === */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --duration-fast:   100ms;
  --duration-base:   200ms;
  --duration-medium: 300ms;
  --duration-slow:   400ms;

  /* === LAYOUT === */
  --sidebar-width:        240px;
  --sidebar-width-mini:   64px;
  --content-padding:      32px;
  --card-padding:         24px;
  --card-gap:             16px;
}
```

---

## 12. Tailwind Config Mapping

Nếu dùng Tailwind CSS, extend trong `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        surface: {
          1: '#FFFFFF',
          2: '#F3F4F6',
        },
        app: '#F8F9FB',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
      },
      boxShadow: {
        card:   '0 2px 8px rgba(0,0,0,0.06)',
        popup:  '0 8px 32px rgba(0,0,0,0.14)',
        focus:  '0 0 0 3px rgba(139,92,246,0.25)',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 13. Accessibility

```
Contrast ratios (WCAG AA minimum 4.5:1 cho normal text):
  Text primary (#111827) trên white:   ✓ 16.1:1
  Text secondary (#6B7280) trên white: ✓ 4.6:1
  Primary-600 (#7C3AED) trên white:    ✓ 5.2:1
  White trên primary-600:              ✓ 5.2:1

Focus:
  - Mọi interactive element đều có :focus-visible ring
  - Ring: var(--shadow-focus) = 3px primary với 25% opacity
  - Không dùng outline: none mà không thay thế

Keyboard navigation:
  - Sidebar: Tab qua các nav items
  - Table: Arrow keys trong rows
  - Flashcard: Space = lật, ← = "Không nhớ", → = "Nhớ"
  - Quiz: 1/2/3/4 = chọn đáp án

Screen reader:
  - Stat cards: aria-label="Total words: 342, increased by 12 this week"
  - Chart: aria-label mô tả trend
  - IPA: <span aria-label="pronunciation">phonetic text</span>
  - Speaker button: aria-label="Play pronunciation for serendipity"
```

---

*Version 1.0 — VocabLens Design System*
*Maintained by Bùi Anh Quân*
