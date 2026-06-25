# Website VIMC — Prototype

Prototype tĩnh (HTML/CSS/JS) của Website **Trung tâm Y học Bản địa Việt Nam (VIMC)**, dựng theo **PRD v3.0** và **Hướng dẫn UX/UI v1.0** (bố cục & nguyên lý phễu của taoistwellness, Việt hóa + compliance y tế).

## Cách chạy (local server)

Yêu cầu: đã cài **Node.js** (kiểm tra: `node -v`).

```bash
cd vimc-website
node server.js
```

Mở trình duyệt: **http://localhost:3001**

> Cổng mặc định là **3001** (vì 3000 đã dùng). Muốn đổi cổng:
> ```bash
> PORT=8080 node server.js        # macOS/Linux
> set PORT=8080 && node server.js  # Windows CMD
> $env:PORT=8080; node server.js   # Windows PowerShell
> ```

Không cần `npm install` — server dùng module `http` có sẵn của Node.

### Cách khác (nếu có Python)
```bash
cd vimc-website
python -m http.server 3001
```

## Cấu trúc thư mục

```
vimc-website/
├── index.html                 # Trang chủ (18 khối phễu)
├── gioi-thieu.html            # Giới thiệu pháp nhân
├── phuong-phap-tdcs.html      # Trang trụ cột Phương pháp TĐCS (SEO)
├── dao-tao.html               # Đào tạo
├── landing-khoa-hoc.html      # Landing chuyển đổi 10 khối (R13)
├── san-pham.html              # Sản phẩm (dược liệu/thiết bị/sách)
├── hoan-nguyen-duong.html     # Hệ thống cơ sở
├── kien-thuc.html             # Kiến thức / Blog
├── lien-he.html               # Liên hệ + Newsletter
├── 404.html
├── server.js                  # Local server (Node, cổng 3001)
├── package.json
└── assets/
    ├── css/style.css          # Design System (token D13)
    └── js/main.js             # Header/Footer dùng chung + tương tác
```

## Lưu ý
- Đây là **prototype giao diện** để duyệt UX/UI, chưa kết nối backend/WooCommerce. Khi triển khai thật: chuyển sang WordPress + Elementor + WooCommerce theo PRD (D1, D14).
- Ảnh đang dùng **placeholder** (gradient/SVG). Thay bằng ảnh thật của VIMC.
- Mọi nội dung sức khỏe đều kèm **disclaimer**; số liệu để trống tới khi VIMC cấp số thật (D12).
