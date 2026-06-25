# Hướng dẫn đưa website VIMC lên GitHub + Vercel (go-live)

> Thư mục cần đẩy là **`vimc-website`** (chính thư mục này). Mọi lệnh chạy **bên trong** thư mục này.
> Đã chuẩn bị sẵn: `vercel.json`, `.gitignore`, và Dev Tools đã được ẩn với khách (chỉ hiện khi thêm `?edit=1`).

---

## Chuẩn bị 1 lần

1. Cài **Git**: https://git-scm.com/download/win — kiểm tra: `git --version`
2. Có tài khoản **GitHub**: https://github.com
3. Có tài khoản **Vercel** (đăng nhập bằng chính GitHub cho tiện): https://vercel.com

---

## CÁCH A — Dễ nhất, dùng giao diện web (khuyên dùng nếu không quen lệnh)

### Bước 1: Đưa code lên GitHub bằng GitHub Desktop
1. Tải **GitHub Desktop**: https://desktop.github.com → đăng nhập GitHub.
2. Menu **File → Add local repository** → chọn thư mục `…\Website TTYHBĐVN\vimc-website`.
3. Nó báo chưa phải repo → bấm **"create a repository"** → Create.
4. Bấm **Commit to main** (gõ mô tả: "VIMC website") → bấm **Publish repository**.
   - Bỏ tick "Keep this code private" nếu muốn repo công khai (tùy bạn).
   → Code đã lên GitHub.

### Bước 2: Đưa lên Vercel
1. Vào https://vercel.com → **Add New… → Project**.
2. Chọn **Import** repo `vimc-website` vừa tạo.
3. Mục **Framework Preset**: chọn **Other**.
4. **Root Directory**: để mặc định (`.`) — vì repo chính là thư mục web.
5. Bấm **Deploy** → đợi ~1 phút.
6. Xong! Vercel cho bạn link dạng `https://vimc-website-xxx.vercel.app` → đó là website đã go-live.

---

## CÁCH B — Dùng dòng lệnh (nhanh nếu đã quen)

Mở **CMD/PowerShell** trong thư mục `vimc-website`:

```bash
cd "E:\Thiet ke\Claude Cowork\Website HND\Website TTYHBĐVN\vimc-website"

git init
git add .
git commit -m "VIMC website - bản đầu"
git branch -M main
```

Tạo repo rỗng trên GitHub (nút **New repository**, KHÔNG tick thêm README), rồi:

```bash
git remote add origin https://github.com/<TEN_GITHUB>/<TEN_REPO>.git
git push -u origin main
```

Đưa lên Vercel bằng CLI:

```bash
npm i -g vercel       # cài 1 lần
vercel login          # đăng nhập
vercel --prod         # deploy bản chính thức
```
Chọn scope, đặt tên project, **Framework: Other**, Root: `.` → xong, có link live.

---

## Sau khi go-live

- **Cập nhật nội dung**: sửa file trong `vimc-website` → commit & push lại (hoặc bấm Commit/Push trên GitHub Desktop). Vercel **tự động deploy lại** sau mỗi lần push.
- **Tên miền riêng** (vd. vimc.org.vn): trong Vercel → Project → **Settings → Domains → Add**, rồi trỏ DNS theo hướng dẫn của Vercel.
- **Dùng Dev Tools trên bản live**: thêm `?edit=1` vào URL, ví dụ `https://...vercel.app/?edit=1`. Khách thường KHÔNG thấy thanh chỉnh sửa.

---

## Lưu ý kỹ thuật

- Vercel phục vụ **tĩnh** toàn bộ file — KHÔNG chạy `server.js` (file đó chỉ để chạy local). Không sao cả.
- File video nền `assets/video/hero-bg.mp4` ~30MB nên lần deploy đầu hơi lâu; vẫn trong giới hạn GitHub/Vercel.
- Các chỉnh sửa bằng Dev Tools chỉ lưu trong **trình duyệt của bạn** (localStorage), không tự lưu vào bản live. Muốn đổi nội dung cho mọi người thấy: sửa thẳng file rồi push lại. (Có thể dùng nút **Xuất JSON** trong Dev Tools để gửi tôi, tôi áp vĩnh viễn vào code giúp.)
- Nếu Vercel báo lỗi vì phát hiện `package.json`: vào **Settings → Build & Development Settings** → đặt **Framework Preset = Other**, **Build Command = (để trống)**, **Output Directory = (để trống)**.
