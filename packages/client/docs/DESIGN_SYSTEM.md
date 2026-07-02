# Tiny-Link Design System

Hệ thiết kế cho **Tiny-Link** — sản phẩm rút gọn link kèm dashboard quản lý, analytics (biểu đồ click, QR code) và trang redirect công khai. Mục tiêu: **nhanh, đáng tin, dễ đọc dữ liệu**. Người dùng vào đây để tạo link trong 5 giây và đọc số liệu trong 5 phút — UI không được cản đường.

Stack hiện có mà hệ thống này bám vào: Tailwind v4 (`@theme inline` + CSS variables), shadcn/ui, Lucide icons, Framer Motion, Recharts, next-themes (dark mode).

---

## 1. Nguyên tắc thiết kế

1. **Functional-first, decorative-second.** Link, số click, trạng thái active/inactive phải là thứ nổi bật nhất trên màn hình — không để hiệu ứng lấn át dữ liệu.
2. **Một điểm nhấn màu duy nhất.** Toàn bộ UI trung tính (neutral/gray); màu accent chỉ xuất hiện ở CTA chính, link/trạng thái active, và data-viz. Nhiều màu = mất tín hiệu.
3. **Mật độ vừa phải, không rỗng, không chật.** Dashboard là nơi quét (scan) danh sách link — ưu tiên mật độ thông tin cao hơn một chút so với landing page, nhưng vẫn giữ khoảng thở theo grid 4px.
4. **Motion có mục đích.** Animation dùng để xác nhận hành động (tạo link, xoá, copy) hoặc dẫn hướng chú ý — không dùng để "làm cho đẹp". Mọi hiệu ứng ≤ 250ms trừ khi là ambient background.
5. **Trạng thái rỗng/lỗi được thiết kế kỹ như trạng thái có dữ liệu.** Đây là app quản trị — user sẽ gặp empty state, loading, lỗi mạng thường xuyên hơn app tiêu dùng thông thường.

---

## 2. Màu sắc

Giữ nguyên format biến hiện có trong `globals.css` (`@theme inline` map sang `hsl(var(--token))`), nhưng token dưới đây là bộ giá trị mới, độc lập với theme cũ.

### Bảng màu

| Token                  | Light                  | Dark              | Dùng cho                      |
| ---------------------- | ---------------------- | ----------------- | ----------------------------- |
| `--background`         | `0 0% 100%`            | `222 47% 6%`      | nền trang                     |
| `--foreground`         | `222 47% 11%`          | `210 40% 96%`     | text chính                    |
| `--card`               | `0 0% 100%`            | `222 40% 9%`      | thẻ, panel                    |
| `--card-foreground`    | `222 47% 11%`          | `210 40% 96%`     | text trong card               |
| `--muted`              | `220 20% 96%`          | `222 30% 14%`     | nền phụ, skeleton             |
| `--muted-foreground`   | `220 10% 45%`          | `220 15% 65%`     | text phụ, caption             |
| `--border`             | `220 15% 90%`          | `222 25% 18%`     | viền                          |
| `--primary`            | `243 75% 59%` (indigo) | `243 85% 67%`     | CTA chính, link active, focus |
| `--primary-foreground` | `0 0% 100%`            | `222 47% 8%`      | text trên primary             |
| `--success`            | `152 60% 40%`          | `152 55% 50%`     | link active, uptime           |
| `--warning`            | `38 92% 50%`           | `38 92% 55%`      | sắp hết hạn, gần giới hạn     |
| `--destructive`        | `0 72% 51%`            | `0 70% 60%`       | xoá, link disabled/lỗi        |
| `--ring`               | trùng `--primary`      | trùng `--primary` | focus ring                    |

**Vì sao Indigo làm primary:** đủ tương phản trên nền trắng lẫn nền tối, không trùng với `success` (xanh lá) hay `destructive` (đỏ) nên không gây nhầm trạng thái link trong danh sách — điều quan trọng vì mỗi link có badge active/inactive riêng.

### Quy tắc dùng màu trạng thái

- Link **active** → chấm tròn `success`, không tô nền cả hàng.
- Link **inactive/disabled** → `muted-foreground`, không dùng `destructive` (destructive chỉ dành cho hành động xoá và lỗi thật sự).
- Link **sắp hết hạn / gần chạm rate limit** → `warning`, kèm icon, không chỉ dựa vào màu (đảm bảo colorblind-safe).

### Data-viz (Recharts)

Dùng dải màu categorical tách biệt, không dùng gradient của `primary` cho nhiều series (dễ nhoè khi > 2 giá trị):

```
--chart-1: 243 75% 59%   /* primary indigo — series chính, VD tổng clicks */
--chart-2: 199 89% 48%   /* cyan — referrer/nguồn */
--chart-3: 152 60% 40%   /* green — success/unique visitors */
--chart-4: 38 92% 50%    /* amber — cảnh báo/so sánh */
--chart-5: 280 65% 60%   /* violet — thiết bị/OS breakdown */
```

Biểu đồ line/area cho time-series số click; biểu đồ bar/donut cho breakdown (device, country, referrer). Luôn có tooltip khi hover; không dùng legend màu làm cách duy nhất phân biệt nếu > 4 series — thêm label trực tiếp trên chart khi có thể.

---

## 3. Typography

Giữ cặp font hiện có (`Inter` cho body, `Outfit` cho heading) — đây là lựa chọn tốt cho sản phẩm dữ liệu: Inter có tabular figures rõ cho số liệu, Outfit tạo điểm nhấn geometric cho heading mà không lố.

| Cấp     | Font                 | Size / Line-height | Weight  | Dùng cho                                 |
| ------- | -------------------- | ------------------ | ------- | ---------------------------------------- |
| Display | Outfit               | 36px / 1.15        | 800     | Hero landing                             |
| H1      | Outfit               | 28px / 1.2         | 800     | Tiêu đề trang (Dashboard, Stats)         |
| H2      | Outfit               | 20px / 1.3         | 700     | Section header, card title               |
| H3      | Outfit               | 16px / 1.4         | 600     | Sub-section                              |
| Body    | Inter                | 14px / 1.5         | 400–500 | Nội dung chính                           |
| Small   | Inter                | 13px / 1.4         | 400     | Caption, timestamp, helper text          |
| Metric  | Inter (tabular-nums) | 24–32px / 1.1      | 700     | Số click, số liệu lớn trong stat card    |
| Mono    | ui-monospace         | 13px / 1.4         | 500     | short code (`tiny.link/abc123`), API key |

**Quy tắc riêng cho số liệu:** mọi con số hiển thị (click count, %, thời gian) dùng `font-variant-numeric: tabular-nums` để bảng/list không bị nhảy layout khi số thay đổi (real-time click count).

---

## 4. Spacing, Grid & Radius

- Base unit: **4px**. Component padding dùng bội số 4 (8/12/16/24/32).
- Container: `max-w-4xl` cho dashboard/list (đọc dọc), `max-w-6xl` cho stats (biểu đồ cần ngang), `max-w-lg` cho form auth.
- Radius theo scale rõ ràng, phân biệt theo "trọng lượng thị giác" của element:

| Token         | Giá trị | Dùng cho               |
| ------------- | ------- | ---------------------- |
| `--radius-sm` | 6px     | badge, input nhỏ, chip |
| `--radius-md` | 10px    | button, input          |
| `--radius-lg` | 14px    | card, dropdown         |
| `--radius-xl` | 20px    | modal, panel lớn       |

Radius nhỏ hơn đáng kể so với theme hiện tại (1rem base) — vì đây là **tool dữ liệu**, radius quá lớn (pill-heavy) làm bảng/list trông "trẻ con" và giảm mật độ thông tin nhận được trên một màn hình.

---

## 5. Elevation & bề mặt

Bỏ glassmorphism (blur nặng) làm nền tảng mặc định — đẹp cho landing page nhưng gây mỏi mắt và giảm độ tương phản khi đọc bảng số liệu lâu trong dashboard. Thay bằng hệ elevation dựa trên **shadow + border mỏng**, đơn giản hơn và hiệu năng tốt hơn (không backdrop-filter tràn lan):

| Level        | Shadow             | Dùng cho               |
| ------------ | ------------------ | ---------------------- |
| 0 — Flat     | none, chỉ `border` | hàng trong list, input |
| 1 — Raised   | `shadow-sm`        | card, dropdown item    |
| 2 — Floating | `shadow-md`        | dropdown menu, popover |
| 3 — Overlay  | `shadow-xl`        | modal, dialog          |

Glass effect (`backdrop-blur`) **chỉ giữ lại** cho: nav bar sticky khi scroll, và trang landing/marketing (`/`) — nơi không cần đọc số liệu dày đặc.

---

## 6. Component patterns

### Buttons

- `primary` — nền `--primary`, dùng cho đúng 1 hành động chính mỗi màn hình (Tạo link, Lưu, Đăng nhập).
- `outline` — hành động phụ (Huỷ, Xem thêm).
- `ghost` — hành động trong hàng list (copy, edit icon-button).
- `destructive` — luôn kèm confirm (dialog, không dùng `window.confirm` mặc định của trình duyệt).
- Icon-only button ≥ 36×36px (đủ target size chạm), luôn có `aria-label`.

### Link row (dashboard list item)

Layout chuẩn 1 hàng: `[favicon/icon] short-code (mono) → original url (truncate) | badge trạng thái | clicks (tabular) | actions`. Trên mobile, actions thu vào menu overflow (⋯), không xếp chồng nút.

### Stat card

`label (small, muted) / metric (lớn, tabular, bold) / delta so với kỳ trước (small, màu success/destructive theo dấu +/-)`. Không dùng icon trang trí lớn choán chỗ — icon nếu có ở góc, 16–20px, `muted-foreground`.

### Empty / loading / error state

- Loading: skeleton đúng hình dạng content thật (đã có `.skeleton` shimmer — giữ lại), không dùng spinner cho danh sách.
- Empty: icon đơn sắc + 1 câu mô tả + đúng 1 CTA.
- Error: thông điệp cụ thể + nút Retry, không chỉ "Something went wrong".

### Toast (sonner)

Dùng cho phản hồi hành động tức thời (copy, xoá, lưu) — không dùng cho lỗi cần user đọc kỹ (dùng inline error hoặc dialog).

### Redirect page (`[code]`)

Trang public, tải cực nhanh, không cần theme đầy đủ — chỉ background + spinner/countdown nhẹ, tối ưu cho tốc độ hơn thẩm mỹ vì đây không phải nơi user "ở lại".

---

## 7. Iconography

Lucide, đồng nhất `strokeWidth={1.75}`, kích thước theo ngữ cảnh:

| Context                         | Size                     |
| ------------------------------- | ------------------------ |
| Inline với text (button, label) | 16px                     |
| Standalone action icon          | 18–20px                  |
| Empty state / feature icon      | 32px trong khung 56–64px |

Không mix icon set khác. Không dùng icon màu (multi-color) — icon luôn 1 màu kế thừa từ text color xung quanh.

---

## 8. Motion (Framer Motion)

| Loại                       | Duration  | Easing                            | Dùng cho                  |
| -------------------------- | --------- | --------------------------------- | ------------------------- |
| Micro (hover, press)       | 120–150ms | `ease-out`                        | button, card hover        |
| Entrance (list item, card) | 200–250ms | `ease-out`, `y: 8→0, opacity 0→1` | mount item, page section  |
| Page transition            | 250ms     | `ease-in-out`                     | chuyển route (nếu dùng)   |
| Số liệu đổi (count-up)     | 400–600ms | `ease-out`                        | metric card khi load xong |

Stagger cho danh sách: delay 30–40ms/item, tối đa 8 item đầu — sau đó không stagger nữa (tránh cảm giác chậm khi list dài).

`prefers-reduced-motion: reduce` → tắt toàn bộ transform/scale animation, giữ lại fade đơn giản (opacity only).

---

## 9. Dark mode

Không phải bản "đảo màu" của light — làm riêng để tránh chói khi xem chart/số liệu lâu:

- Nền tối dùng navy đậm (`222 47% 6%`), không dùng đen thuần (`#000`) — giảm halation quanh text sáng.
- `primary` sáng hơn ~8% so với light để giữ độ tương phản trên nền tối.
- Border/divider dùng độ mờ thấp hơn light mode để không tạo viền gắt trên nền tối.
- Chart colors giữ nguyên hue, tăng nhẹ lightness để không bị "chìm" trên nền navy.

---

## 10. Accessibility

- Contrast tối thiểu WCAG AA: text thường ≥ 4.5:1, text lớn (≥18px bold) ≥ 3:1 — áp dụng cả 2 theme.
- Mọi thông tin trạng thái (active/inactive, cảnh báo) phải có **icon hoặc text**, không chỉ dựa vào màu.
- Focus ring luôn hiện rõ (`ring-2 ring-primary/50`), không tắt outline khi focus bằng bàn phím.
- Target size tối thiểu 36×36px cho mọi phần tử bấm được (đặc biệt action icon trong list row).
- Form (auth, tạo link) dùng label thật (không chỉ placeholder), lỗi validate hiển thị cạnh field tương ứng.

---

## 11. Áp dụng vào code

Token ở mục 2 map trực tiếp vào `src/app/globals.css` theo đúng pattern đang có (`@theme inline` → `--color-x: hsl(var(--x))`). Khi triển khai:

1. Thay giá trị HSL trong `:root` / `.dark` theo bảng mục 2.
2. Thêm `--success`, `--warning` vào theme (hiện chưa có, chỉ có `--destructive`).
3. Giảm `--radius` base xuống tương ứng mục 4 (~10px thay vì 16px hiện tại).
4. Giữ `.skeleton` và class `glass` nhưng thu phạm vi dùng `glass`/`glass-card`/`glass-modal` lại theo mục 5 (chỉ landing + nav sticky), đổi các nơi khác (card dashboard, list item, modal) sang `bg-card border border-border shadow-*` thường.
5. Component shadcn (`button`, `card`, `input`...) đã có sẵn trong `src/components/ui` — chỉnh biến CSS là đủ, không cần viết lại component.
