/* VIMC — main.js: header/footer dùng chung + tương tác */
(function () {
  // ---- Logo SVG (sen + chuỗi đốt sống cách điệu) ----
  var LOGO = '<svg class="logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<circle cx="24" cy="24" r="23" fill="#1B9E4B"/>' +
    '<path d="M24 9c3 4 3 8 0 12-3-4-3-8 0-12z" fill="#fff"/>' +
    '<path d="M24 13c5 1 8 4 9 9-5-1-8-4-9-9z" fill="#FBF7EF"/>' +
    '<path d="M24 13c-5 1-8 4-9 9 5-1 8-4 9-9z" fill="#FBF7EF"/>' +
    '<circle cx="24" cy="30" r="2.4" fill="#E8602C"/>' +
    '<circle cx="24" cy="36" r="1.9" fill="#fff"/>' +
    '<circle cx="24" cy="41" r="1.4" fill="#fff"/>' +
    '</svg>';

  // ---- HEADER (mega-menu 5 nhóm) ----
  var MENU = [
    { label: 'Giới thiệu', href: 'gioi-thieu.html', items: [
      { t: 'Tổng quan VIMC', d: 'Pháp nhân trực thuộc VUSTA', h: 'gioi-thieu.html', i: '🏛️' },
      { t: 'Tầm nhìn – Sứ mệnh – Giá trị', d: 'Định hướng cốt lõi', h: 'gioi-thieu.html#gia-tri', i: '🎯' },
      { t: 'Câu chuyện phương pháp & Người kế thừa', d: 'Di sản được tiếp nối', h: 'gioi-thieu.html#cau-chuyen', i: '📜' },
      { t: 'Đội ngũ chuyên gia', d: 'Đội ngũ Diệu Thủ Y Sư', h: 'gioi-thieu.html#doi-ngu', i: '👐' },
      { t: 'Tuyển dụng', d: 'Cơ hội nghề nghiệp tại VIMC', h: 'tuyen-dung.html', i: '💼' }
    ]},
    { label: 'Chăm sóc', href: 'phuong-phap-tdcs.html', items: [
      { t: 'Phương pháp TĐCS', d: 'Chăm sóc không dùng thuốc', h: 'phuong-phap-tdcs.html', i: '🩺' },
      { t: 'Hệ thống Hoàn Nguyên Đường', d: 'Tìm cơ sở gần bạn', h: 'hoan-nguyen-duong.html', i: '📍' },
      { t: 'Quy trình 3 bước', d: 'Hành trình chăm sóc', h: 'phuong-phap-tdcs.html#quy-trinh', i: '🔄' },
      { t: 'Đặt lịch tư vấn', d: 'Tư vấn miễn phí, không ràng buộc', h: 'lien-he.html#dat-lich', i: '🗓️' }
    ]},
    { label: 'Đào tạo', href: 'dao-tao.html', items: [
      { t: 'Chương trình đào tạo', d: 'TĐCS & Xoa bóp Bấm huyệt', h: 'dao-tao.html', i: '🎓' },
      { t: 'Khóa TĐCS', d: 'Khóa học bài bản, có chứng chỉ', h: 'landing-khoa-hoc.html', i: '📘' },
      { t: 'Tuyển sinh', d: 'Thông tin & đăng ký', h: 'tuyen-sinh.html', i: '📝' }
    ]},
    { label: 'Sản phẩm', href: 'san-pham.html', items: [
      { t: 'Dược liệu', d: 'Thành phần, nguồn gốc rõ ràng', h: 'san-pham.html#duoc-lieu', i: '🌿' },
      { t: 'Thiết bị hỗ trợ cột sống', d: 'Đạt chuẩn thiết bị y tế', h: 'san-pham.html#thiet-bi', i: '🩼' },
      { t: 'Sách y học', d: 'Tủ sách y học bản địa', h: 'san-pham.html#sach', i: '📚' }
    ]},
    { label: 'Kiến thức', href: 'kien-thuc.html', items: [
      { t: 'Bài viết / Blog', d: 'Sống khỏe cùng y học bản địa', h: 'kien-thuc.html', i: '✍️' },
      { t: 'Sự kiện', d: 'Hội thảo, workshop, sinh hoạt', h: 'su-kien.html', i: '📅' },
      { t: 'Hỏi đáp', d: 'Giải đáp thắc mắc thường gặp', h: 'hoi-dap.html', i: '💬' },
      { t: 'Cẩm nang miễn phí', d: 'Tải PDF chăm sóc cột sống', h: 'index.html#cam-nang', i: '📥' }
    ]}
  ];
  function isActive(g, active) {
    if (g.href.split('#')[0] === active) return true;
    return g.items.some(function (it) { return it.h.split('#')[0] === active; });
  }
  function header(active) {
    var menuHTML = MENU.map(function (g) {
      var act = isActive(g, active) ? ' nav-active' : '';
      var sub = g.items.map(function (it) {
        return '<a class="mega-item" href="' + it.h + '"><b>' + it.t + '</b><small>' + it.d + '</small></a>';
      }).join('');
      return '<li class="has-mega"><a class="mega-top' + act + '" href="' + g.href + '">' + g.label + '</a>' +
        '<div class="mega"><div class="mega-grid">' + sub + '</div></div></li>';
    }).join('');
    return '' +
    '<div class="container nav">' +
      '<a class="brand" href="index.html">' + LOGO +
        '<span>VIMC<small>Y học Bản địa Việt Nam</small></span>' +
      '</a>' +
      '<ul class="nav-menu">' + menuHTML + '</ul>' +
      '<div class="nav-right">' +
        '<span class="lang" id="langToggle"><b>VI</b> | EN</span>' +
        '<button class="a11y-btn" id="a11yToggle" title="Phóng to chữ (người cao tuổi)">A+</button>' +
        '<a class="btn btn-cta" href="lien-he.html#dat-lich">Đặt lịch tư vấn</a>' +
        '<button class="nav-toggle" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</div>';
  }

  // ---- FOOTER (pháp nhân đầy đủ) ----
  function footer() {
    return '' +
    '<div class="footer-disclaimer"><div class="container">⚠ <strong style="color:#fff">Lưu ý y tế:</strong> ' +
      'Thông tin trên website mang tính tham khảo, không thay thế cho việc chẩn đoán hoặc điều trị y khoa. ' +
      'Vui lòng tham vấn chuyên gia trước khi áp dụng.</div></div>' +
    '<div class="container">' +
      '<div class="footer-grid">' +
        '<div class="footer-brand">' +
          '<a class="brand" href="index.html">' + LOGO + '<span>VIMC<small>Y học Bản địa Việt Nam</small></span></a>' +
          '<p>Trung tâm Y học Bản địa Việt Nam (VIMC) — tổ chức Khoa học &amp; Công nghệ trực thuộc ' +
          'Liên hiệp các Hội Khoa học và Kỹ thuật Việt Nam (VUSTA).</p>' +
          '<p class="legal-line">Giấy phép số: <em>(đang cập nhật)</em><br>Mã số thuế: <em>(đang cập nhật)</em></p>' +
        '</div>' +
        '<div><h4>Khám phá</h4><ul>' +
          '<li><a href="gioi-thieu.html">Giới thiệu</a></li>' +
          '<li><a href="phuong-phap-tdcs.html">Phương pháp TĐCS</a></li>' +
          '<li><a href="dao-tao.html">Đào tạo</a></li>' +
          '<li><a href="hoan-nguyen-duong.html">Hoàn Nguyên Đường</a></li>' +
          '<li><a href="kien-thuc.html">Kiến thức</a></li>' +
        '</ul></div>' +
        '<div><h4>Chính sách</h4><ul>' +
          '<li><a href="#">Chính sách bảo mật (NĐ 13/2023)</a></li>' +
          '<li><a href="#">Chính sách đổi trả</a></li>' +
          '<li><a href="#">Chính sách vận chuyển</a></li>' +
          '<li><a href="#">Điều khoản sử dụng</a></li>' +
        '</ul></div>' +
        '<div><h4>Liên hệ</h4><ul>' +
          '<li>Hotline: <em>(đang cập nhật)</em></li>' +
          '<li>Email: lienhe@vimc.org.vn</li>' +
          '<li>Địa chỉ: <em>(đang cập nhật)</em></li>' +
        '</ul>' +
        '<div class="socials" style="margin-top:14px">' +
          '<a href="#" title="Facebook">f</a><a href="#" title="YouTube">▶</a><a href="#" title="Zalo">Z</a>' +
        '</div></div>' +
      '</div>' +
      '<div class="footer-bottom"><span>© 2026 VIMC — Trung tâm Y học Bản địa Việt Nam. Bảo lưu mọi quyền.</span>' +
        '<span>Tinh hoa Bản địa – Chữa lành từ Tâm</span></div>' +
    '</div>';
  }

  // ---- Mount ----
  document.addEventListener('DOMContentLoaded', function () {
    var active = (location.pathname.split('/').pop() || 'index.html');
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) { h.className = 'site-header'; h.innerHTML = header(active); }
    if (f) { f.className = 'site-footer'; f.innerHTML = footer(); }

    // Mobile sticky CTA + float widget (chèn 1 lần)
    if (!document.querySelector('.mobile-cta')) {
      var m = document.createElement('div'); m.className = 'mobile-cta';
      m.innerHTML = '<a class="btn btn-cta" href="lien-he.html#dat-lich">Đặt lịch tư vấn miễn phí</a>' +
        '<a class="call" href="tel:+84" title="Gọi">☎</a>';
      document.body.appendChild(m);
      var fw = document.createElement('div'); fw.className = 'float-widget';
      fw.innerHTML = '<a class="fw-zalo" href="#" title="Chat Zalo">Zalo</a><a class="fw-phone" href="tel:+84" title="Hotline">Gọi</a>';
      document.body.appendChild(fw);
    }

    // Hamburger
    var toggle = document.getElementById('navToggle');
    if (toggle) toggle.addEventListener('click', function () { h.classList.toggle('open'); });

    // Chế độ chữ to (người cao tuổi)
    var a11y = document.getElementById('a11yToggle');
    if (a11y) a11y.addEventListener('click', function () {
      document.body.classList.toggle('font-large');
      a11y.textContent = document.body.classList.contains('font-large') ? 'A' : 'A+';
    });

    // Chuyển ngôn ngữ (stub demo)
    var lang = document.getElementById('langToggle');
    if (lang) lang.addEventListener('click', function () {
      alert('Bản tiếng Anh sẽ có khi ra mắt (D3: VI + EN). Đây là bản demo tiếng Việt.');
    });

    // FAQ accordion
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () { q.parentElement.classList.toggle('open'); });
    });

    // Chặn submit form demo
    document.querySelectorAll('form[data-demo]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        form.innerHTML = '<p style="font-family:var(--font-head);color:var(--c-primary-dark);font-weight:600">' +
          '✓ Cảm ơn bạn! Đây là bản demo — khi triển khai thật, dữ liệu sẽ được lưu kèm consent NĐ 13/2023 và VIMC sẽ liên hệ lại.</p>';
      });
    });

    // Nạp bộ Dev Tools — CHỈ khi chạy local hoặc URL có ?edit=1 (ẩn với khách trên bản live)
    var host = location.hostname;
    var allowEdit = /[?&]edit=1/.test(location.search) || host === 'localhost' || host === '127.0.0.1' || host === '';
    if (allowEdit && !document.getElementById('vimc-editor-js')) {
      var ed = document.createElement('script');
      ed.id = 'vimc-editor-js'; ed.src = 'assets/js/editor.js';
      document.body.appendChild(ed);
    }
  });
})();
