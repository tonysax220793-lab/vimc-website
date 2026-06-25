/* =========================================================
   VIMC Dev Tools — trình chỉnh sửa trực tiếp trên trang (v2)
   - Sửa chữ, màu chữ/nền, cỡ chữ, căn lề, padding, chiều rộng, vị trí
   - Nền & hiệu ứng nền (mờ video, lớp phủ, trống đồng) khi chọn Hero
   - Kéo-thả di chuyển có ĐƯỜNG CĂN SNAP (giữa / trái / phải) + nút căn nhanh
   - Lưu khi bấm "Lưu" (localStorage theo từng trang)
   - Hoàn tác / Làm lại (Ctrl+Z / Ctrl+Y), Xuất JSON, Đặt lại
   ========================================================= */
(function () {
  var PAGE = (location.pathname.split('/').pop() || 'index.html');
  var LS_KEY = 'vimc_edits::' + PAGE;

  var overrides = {};         // path -> { html, style:{}, hidden }
  var origStyle = {};         // path -> chuỗi style gốc
  var origHTML  = {};         // path -> innerHTML gốc
  var undoStack = [], redoStack = [];
  var selected = null, selectedPath = null;
  var editMode = false, dirty = false;

  try { overrides = JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { overrides = {}; }

  /* ---------- tiện ích ---------- */
  function snap() { return JSON.stringify(overrides); }
  function begin() { return snap(); }
  function commit(before) {
    undoStack.push(before); if (undoStack.length > 120) undoStack.shift();
    redoStack = []; dirty = true; refreshBar();
  }
  function ovFor(p) { overrides[p] = overrides[p] || {}; overrides[p].style = overrides[p].style || {}; return overrides[p]; }

  // gán style thường HOẶC biến CSS (--...) đúng cách
  function applyProp(el, k, v) { if (k.indexOf('--') === 0) el.style.setProperty(k, v); else el.style[k] = v; }

  function pathOf(el) {
    if (!el || el.nodeType !== 1 || el === document.body) return 'body';
    var parts = [];
    while (el && el.nodeType === 1 && el !== document.body) {
      var tag = el.tagName.toLowerCase();
      var i = 1, sib = el;
      while ((sib = sib.previousElementSibling)) { if (sib.tagName.toLowerCase() === tag) i++; }
      parts.unshift(tag + ':nth-of-type(' + i + ')');
      el = el.parentElement;
    }
    return 'body > ' + parts.join(' > ');
  }
  function elByPath(p) { try { return document.querySelector(p); } catch (e) { return null; } }
  function ensureOrig(p, el) { if (!(p in origStyle)) { origStyle[p] = el.getAttribute('style') || ''; origHTML[p] = el.innerHTML; } }

  /* ---------- áp dụng ---------- */
  function applyOverride(el, o) {
    if (o.html != null) el.innerHTML = o.html;
    if (o.style) for (var k in o.style) applyProp(el, k, o.style[k]);
    if (o.hidden) el.style.display = 'none';
  }
  function applyAll() {
    Object.keys(origStyle).forEach(function (p) {
      var el = elByPath(p); if (!el) return;
      el.setAttribute('style', origStyle[p] || '');
      var o = overrides[p];
      if (o) { if (o.html != null) el.innerHTML = o.html; else el.innerHTML = origHTML[p]; applyOverride(el, { style: o.style, hidden: o.hidden }); }
      else el.innerHTML = origHTML[p];
    });
  }
  function applyInitial() {
    Object.keys(overrides).forEach(function (p) {
      var el = elByPath(p); if (!el) return;
      ensureOrig(p, el); applyOverride(el, overrides[p]);
    });
  }

  /* ---------- lưu / undo ---------- */
  function doSave() { localStorage.setItem(LS_KEY, JSON.stringify(overrides)); dirty = false; refreshBar(); toast('✓ Đã lưu thay đổi'); }
  function doUndo() {
    if (!undoStack.length) { toast('Không còn bước để hoàn tác'); return; }
    redoStack.push(snap()); overrides = JSON.parse(undoStack.pop());
    applyAll(); reselect(); dirty = true; refreshBar(); toast('↩︎ Đã hoàn tác');
  }
  function doRedo() {
    if (!redoStack.length) { toast('Không còn bước để làm lại'); return; }
    undoStack.push(snap()); overrides = JSON.parse(redoStack.pop());
    applyAll(); reselect(); dirty = true; refreshBar(); toast('↪︎ Đã làm lại');
  }
  function doReset() {
    if (!confirm('Xóa toàn bộ chỉnh sửa của trang này và quay về bản gốc?')) return;
    var b = begin(); overrides = {}; commit(b);
    localStorage.removeItem(LS_KEY); applyAll(); deselect(); toast('♻︎ Đã đặt lại bản gốc');
  }
  function doExport() {
    var data = JSON.stringify({ page: PAGE, overrides: overrides }, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vimc-edits-' + PAGE.replace('.html', '') + '.json';
    a.click(); toast('⬇︎ Đã xuất file JSON');
  }

  /* ---------- chọn thành phần ---------- */
  function deselect() {
    if (selected) { selected.classList.remove('ved-selected'); selected.removeAttribute('contenteditable'); }
    selected = null; selectedPath = null; panel.classList.remove('open');
  }
  function reselect() { if (selectedPath) { var el = elByPath(selectedPath); if (el) selectEl(el); } }
  function selectEl(el) {
    if (selected) { selected.classList.remove('ved-selected'); selected.removeAttribute('contenteditable'); }
    selected = el; selectedPath = pathOf(el); ensureOrig(selectedPath, el);
    el.classList.add('ved-selected'); buildPanel(el); panel.classList.add('open');
  }

  /* ---------- thao tác style ---------- */
  function setStyle(prop, val, before) {
    var p = selectedPath; if (!p) return;
    var o = ovFor(p); o.style[prop] = val; if (selected) applyProp(selected, prop, val);
    if (before != null) commit(before); dirty = true;
  }

  /* ---------- transform / căn / snap ---------- */
  function curTranslate(el) {
    var t = (el.style.transform || (overrides[pathOf(el)] && overrides[pathOf(el)].style && overrides[pathOf(el)].style.transform) || '');
    var m = t.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
    return { x: m ? +m[1] : 0, y: m ? +m[2] : 0 };
  }
  function parentEdges(el) {
    var par = el.parentElement, pr = par.getBoundingClientRect(), cs = getComputedStyle(par);
    var l = pr.left + parseFloat(cs.paddingLeft || 0), r = pr.right - parseFloat(cs.paddingRight || 0);
    var t = pr.top + parseFloat(cs.paddingTop || 0), b = pr.bottom - parseFloat(cs.paddingBottom || 0);
    return { left: l, right: r, cx: (l + r) / 2, top: t, bottom: b, cy: (t + b) / 2 };
  }
  function setTransform(tx, ty, before) {
    var v = 'translate(' + Math.round(tx) + 'px,' + Math.round(ty) + 'px)';
    ovFor(selectedPath).style.transform = v; if (selected) selected.style.transform = v;
    updatePanelXY(Math.round(tx), Math.round(ty)); dirty = true; refreshBar();
    if (before != null) commit(before);
  }
  function quickAlign(mode) {
    if (!selected) return; var before = begin();
    var t = curTranslate(selected), e = parentEdges(selected), r = selected.getBoundingClientRect();
    var baseLeft = r.left - t.x, w = r.width, tx = t.x;
    if (mode === 'center') tx += e.cx - (baseLeft + w / 2);
    else if (mode === 'left') tx += e.left - baseLeft;
    else if (mode === 'right') tx += e.right - (baseLeft + w);
    setTransform(tx, t.y, before); toast('Đã căn ' + (mode === 'center' ? 'giữa' : mode === 'left' ? 'trái' : 'phải'));
  }

  /* ---------- kéo thả + đường căn snap ---------- */
  var gX, gY, justDragged = false;
  function showGuide(g, type, pos) {
    if (!g) { g = document.createElement('div'); g.className = 'ved-guide ' + type; document.body.appendChild(g); }
    if (pos == null) { g.style.display = 'none'; }
    else { g.style.display = 'block'; if (type === 'gx') g.style.left = pos + 'px'; else g.style.top = pos + 'px'; }
    return g;
  }
  function startDrag(e) {
    if (!editMode) return;
    if (inDevtools(e.target)) return;
    var el = e.target;
    if (!el || el === document.body || el === document.documentElement || el.tagName === 'HTML') return;
    if (selected && selected.getAttribute('contenteditable') === 'true') return;
    // bấm vào thành phần nào là chọn & kéo được ngay (di chuyển tự do)
    if (el !== selected) selectEl(el);
    var node = selected;
    var start = { x: e.clientX, y: e.clientY }, t = curTranslate(node);
    var r = node.getBoundingClientRect(), baseLeft = r.left - t.x, baseTop = r.top - t.y, w = r.width, h = r.height;
    var e2 = parentEdges(node), before = begin(), moved = false;
    e.preventDefault();
    function move(ev) {
      var dx = ev.clientX - start.x, dy = ev.clientY - start.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      var tx = t.x + dx, ty = t.y + dy, TH = 7, gx = null, gy = null;
      if (!ev.shiftKey) { // giữ Shift = di chuyển hoàn toàn tự do (tắt hít căn)
        var left = baseLeft + tx, center = left + w / 2, right = left + w;
        if (Math.abs(center - e2.cx) < TH) { tx += e2.cx - center; gx = e2.cx; }
        else if (Math.abs(left - e2.left) < TH) { tx += e2.left - left; gx = e2.left; }
        else if (Math.abs(right - e2.right) < TH) { tx += e2.right - right; gx = e2.right; }
        var top = baseTop + ty, vcen = top + h / 2;
        if (Math.abs(vcen - e2.cy) < TH) { ty += e2.cy - vcen; gy = e2.cy; }
      }
      var v = 'translate(' + Math.round(tx) + 'px,' + Math.round(ty) + 'px)';
      node.style.transform = v; ovFor(selectedPath).style.transform = v;
      gX = showGuide(gX, 'gx', gx); gY = showGuide(gY, 'gy', gy);
      updatePanelXY(Math.round(tx), Math.round(ty)); dirty = true;
    }
    function up() {
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      showGuide(gX, 'gx', null); showGuide(gY, 'gy', null);
      if (moved) { justDragged = true; commit(before); refreshBar(); }
    }
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
  }

  /* =========================================================
     GIAO DIỆN
     ========================================================= */
  var bar, panel;
  function injectCSS() {
    var css = ''
      + '#vimc-devtools, .ved-bar *, .ved-panel *{box-sizing:border-box;font-family:Inter,system-ui,sans-serif;}'
      + '.ved-bar{position:fixed;left:16px;bottom:16px;z-index:99999;display:flex;gap:6px;align-items:center;'
      + 'background:#10241b;color:#fff;padding:8px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.35);}'
      + '.ved-bar button{border:none;background:#1d3a2b;color:#fff;border-radius:9px;padding:9px 12px;cursor:pointer;'
      + 'font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;transition:.15s;white-space:nowrap;}'
      + '.ved-bar button:hover{background:#27523c;} .ved-bar button:disabled{opacity:.4;cursor:default;}'
      + '.ved-bar .ved-main{background:#1B9E4B;} .ved-bar .ved-main.on{background:#D62027;}'
      + '.ved-bar .ved-save{background:#E8602C;} .ved-dot{width:8px;height:8px;border-radius:50%;background:#ffd23f;display:none;}'
      + '.ved-bar.dirty .ved-dot{display:inline-block;}'
      + '.ved-sep{width:1px;height:24px;background:rgba(255,255,255,.15);margin:0 2px;}'
      + 'body.ved-on [data-vedhover]{outline:2px dashed rgba(27,158,75,.55);outline-offset:2px;cursor:pointer;}'
      + 'body.ved-on .ved-selected{outline:2px solid #D62027 !important;outline-offset:2px;cursor:move;}'
      + '.ved-guide{position:fixed;z-index:99998;pointer-events:none;display:none;}'
      + '.ved-guide.gx{top:0;height:100vh;width:0;border-left:1.5px dashed #E8602C;}'
      + '.ved-guide.gy{left:0;width:100vw;height:0;border-top:1.5px dashed #E8602C;}'
      + '.ved-panel{position:fixed;right:0;top:0;height:100vh;width:300px;background:#fff;z-index:99999;'
      + 'box-shadow:-8px 0 30px rgba(0,0,0,.18);transform:translateX(105%);transition:.25s;overflow-y:auto;padding:18px;}'
      + '.ved-panel.open{transform:translateX(0);}'
      + '.ved-panel h4{font-family:"Be Vietnam Pro",sans-serif;font-size:15px;margin:0 0 4px;color:#10241b;}'
      + '.ved-panel .tag{font-size:11px;color:#888;margin-bottom:14px;word-break:break-all;}'
      + '.ved-grp{border-top:1px solid #eee;padding-top:12px;margin-top:4px;} .ved-grp .gh{font-size:12px;font-weight:700;color:#1B9E4B;text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px;}'
      + '.ved-row{margin-bottom:14px;} .ved-row label{display:block;font-size:12px;font-weight:600;color:#444;margin-bottom:5px;}'
      + '.ved-row input[type=range]{width:100%;} .ved-row input[type=color]{width:46px;height:30px;border:1px solid #ddd;border-radius:6px;padding:0;cursor:pointer;}'
      + '.ved-inline{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}'
      + '.ved-chip{border:1px solid #ddd;background:#fff;border-radius:7px;padding:6px 10px;cursor:pointer;font-size:12px;font-weight:600;color:#333;}'
      + '.ved-chip:hover{border-color:#1B9E4B;} .ved-chip.active{background:#1B9E4B;color:#fff;border-color:#1B9E4B;}'
      + '.ved-val{font-size:11px;color:#888;float:right;}'
      + '.ved-close{position:absolute;right:12px;top:12px;border:none;background:#f1f1f1;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:16px;}'
      + '.ved-danger{color:#D62027;border-color:#f1c6c8;} .ved-danger:hover{background:#fdecec;}'
      + '.ved-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:#10241b;color:#fff;'
      + 'padding:11px 20px;border-radius:30px;z-index:99999;font-size:14px;font-weight:600;opacity:0;transition:.3s;pointer-events:none;}'
      + '.ved-toast.show{opacity:1;}'
      + '.ved-help{font-size:11px;color:#999;line-height:1.5;border-top:1px solid #eee;padding-top:12px;margin-top:6px;}'
      + '@media(max-width:560px){.ved-panel{width:90vw;} .ved-bar{left:8px;right:8px;bottom:8px;overflow-x:auto;}}';
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }

  function buildBar() {
    bar = document.createElement('div'); bar.className = 'ved-bar'; bar.id = 'vimc-devtools';
    bar.innerHTML =
      '<button class="ved-main" id="vedToggle">✏️ <span>Bật chỉnh sửa</span></button>'
      + '<div class="ved-sep"></div>'
      + '<button class="ved-save" id="vedSave"><span class="ved-dot"></span>💾 Lưu</button>'
      + '<button id="vedUndo" title="Ctrl+Z">↩︎</button>'
      + '<button id="vedRedo" title="Ctrl+Y">↪︎</button>'
      + '<div class="ved-sep"></div>'
      + '<button id="vedExport" title="Tải file JSON">⬇︎</button>'
      + '<button id="vedReset" class="ved-danger" title="Đặt lại bản gốc">♻︎</button>';
    document.body.appendChild(bar);
    document.getElementById('vedToggle').onclick = toggleEdit;
    document.getElementById('vedSave').onclick = doSave;
    document.getElementById('vedUndo').onclick = doUndo;
    document.getElementById('vedRedo').onclick = doRedo;
    document.getElementById('vedExport').onclick = doExport;
    document.getElementById('vedReset').onclick = doReset;
    refreshBar();
  }
  function refreshBar() {
    if (!bar) return;
    bar.classList.toggle('dirty', dirty);
    document.getElementById('vedUndo').disabled = !undoStack.length;
    document.getElementById('vedRedo').disabled = !redoStack.length;
  }

  function getVar(el, name, def) {
    var v = (el.style.getPropertyValue(name) || getComputedStyle(el).getPropertyValue(name) || '').trim();
    return v === '' ? def : v;
  }

  function buildPanel(el) {
    var cs = getComputedStyle(el);
    var o = overrides[selectedPath] || {}; var st = o.style || {};
    var fs = parseInt(st.fontSize || cs.fontSize) || 16;
    var pad = parseInt(st.paddingTop || cs.paddingTop) || 0;
    var tag = el.tagName.toLowerCase();
    var col = rgbToHex(st.color || cs.color);
    var bg = st.backgroundColor ? rgbToHex(st.backgroundColor) : '#ffffff';
    var t = curTranslate(el);
    var canText = isTextEditable(el);
    var isHero = el.classList.contains('hero');

    var html =
      '<button class="ved-close" id="vedClose">✕</button>'
      + '<h4>Chỉnh: &lt;' + tag + '&gt;' + (isHero ? ' (Hero)' : '') + '</h4>'
      + '<div class="tag">' + (el.textContent || '').trim().slice(0, 40) + '</div>'
      + (canText ? '<div class="ved-row"><button class="ved-chip" id="vedEditText">✍️ Sửa chữ trực tiếp</button></div>' : '');

    if (isHero) {
      var blur = parseFloat(getVar(el, '--hero-blur', '3px')) || 0;
      var dim = Math.round((parseFloat(getVar(el, '--hero-dim', '.62')) || 0) * 100);
      var dop = Math.round((parseFloat(getVar(el, '--drum-opacity', '.4')) || 0) * 100);
      var dsz = parseInt(getVar(el, '--drum-size', '760px')) || 760;
      var dsp = parseInt(getVar(el, '--drum-spin', '80s')) || 80;
      var dspo = parseInt(getVar(el, '--drum-spin-outer', '120s')) || 120;
      html += '<div class="ved-grp"><div class="gh">Nền &amp; Video</div>'
        + '<div class="ved-row"><label>Mờ video <span class="ved-val" id="vBlurV">' + blur + 'px</span></label><input type="range" id="vBlur" min="0" max="16" value="' + blur + '"></div>'
        + '<div class="ved-row"><label>Độ phủ tối (chữ rõ) <span class="ved-val" id="vDimV">' + dim + '%</span></label><input type="range" id="vDim" min="0" max="95" value="' + dim + '"></div>'
        + '</div>'
        + '<div class="ved-grp"><div class="gh">Trống đồng (3 lớp)</div>'
        + '<div class="ved-row"><label>Độ mờ <span class="ved-val" id="vDopV">' + dop + '%</span></label><input type="range" id="vDop" min="0" max="100" value="' + dop + '"></div>'
        + '<div class="ved-row"><label>Kích thước <span class="ved-val" id="vDszV">' + dsz + 'px</span></label><input type="range" id="vDsz" min="300" max="1200" value="' + dsz + '"></div>'
        + '<div class="ved-row"><label>Vòng giữa — tốc độ <span class="ved-val" id="vDspV">' + dsp + 's</span></label><input type="range" id="vDsp" min="10" max="200" value="' + dsp + '"></div>'
        + '<div class="ved-row"><label>Vòng giữa</label><div class="ved-inline"><button class="ved-chip" data-var="--drum-mid-play" data-val="running">▶ Xoay</button><button class="ved-chip" data-var="--drum-mid-play" data-val="paused">⏸ Dừng</button></div></div>'
        + '<div class="ved-row"><label>Vòng ngoài — tốc độ <span class="ved-val" id="vDspOV">' + dspo + 's</span></label><input type="range" id="vDspO" min="10" max="300" value="' + dspo + '"></div>'
        + '<div class="ved-row"><label>Vòng ngoài — chiều</label><div class="ved-inline"><button class="ved-chip" data-var="--drum-outer-dir" data-val="normal">↻ Thuận</button><button class="ved-chip" data-var="--drum-outer-dir" data-val="reverse">↺ Ngược</button></div></div>'
        + '<div class="ved-row"><label>Vòng ngoài</label><div class="ved-inline"><button class="ved-chip" data-var="--drum-outer-play" data-val="running">▶ Xoay</button><button class="ved-chip" data-var="--drum-outer-play" data-val="paused">⏸ Dừng</button></div></div>'
        + '<div class="ved-help" style="border:none;padding:4px 0 0;margin:0">Lõi (ngôi sao trung tâm) luôn đứng yên.</div>'
        + '</div>';
    }

    html +=
      '<div class="ved-grp"><div class="gh">Chữ &amp; màu</div>'
      + '<div class="ved-row"><label>Màu chữ</label><input type="color" id="vedColor" value="' + col + '"></div>'
      + '<div class="ved-row"><label>Màu nền</label><div class="ved-inline"><input type="color" id="vedBg" value="' + bg + '">'
      + '<button class="ved-chip" id="vedBgNone">Trong suốt</button></div></div>'
      + '<div class="ved-row"><label>Cỡ chữ <span class="ved-val" id="vedFsV">' + fs + 'px</span></label><input type="range" id="vedFs" min="10" max="80" value="' + fs + '"></div>'
      + '<div class="ved-row"><label>Độ đậm</label><div class="ved-inline">'
      + '<button class="ved-chip" data-w="400">Thường</button><button class="ved-chip" data-w="600">Đậm vừa</button><button class="ved-chip" data-w="800">Rất đậm</button></div></div>'
      + '<div class="ved-row"><label>Căn chữ trong khối</label><div class="ved-inline">'
      + '<button class="ved-chip" data-al="left">Trái</button><button class="ved-chip" data-al="center">Giữa</button><button class="ved-chip" data-al="right">Phải</button></div></div></div>';

    html +=
      '<div class="ved-grp"><div class="gh">Kích thước &amp; vị trí</div>'
      + '<div class="ved-row"><label>Giãn trong (padding) <span class="ved-val" id="vedPadV">' + pad + 'px</span></label><input type="range" id="vedPad" min="0" max="100" value="' + pad + '"></div>'
      + '<div class="ved-row"><label>Chiều rộng <span class="ved-val" id="vedWV">auto</span></label><input type="range" id="vedW" min="20" max="100" value="100"><button class="ved-chip" id="vedWauto" style="margin-top:6px">Tự động</button></div>'
      + '<div class="ved-row"><label>Căn nhanh (snap)</label><div class="ved-inline">'
      + '<button class="ved-chip" id="vedAlL">⇤ Trái</button><button class="ved-chip" id="vedAlC">⦿ Giữa</button><button class="ved-chip" id="vedAlR">Phải ⇥</button></div></div>'
      + '<div class="ved-row"><label>Vị trí ngang <span class="ved-val" id="vedTxV">' + t.x + 'px</span></label><input type="range" id="vedTx" min="-400" max="400" value="' + t.x + '"></div>'
      + '<div class="ved-row"><label>Vị trí dọc <span class="ved-val" id="vedTyV">' + t.y + 'px</span></label><input type="range" id="vedTy" min="-400" max="400" value="' + t.y + '"></div></div>';

    html +=
      '<div class="ved-grp"><div class="ved-inline"><button class="ved-chip" id="vedHide">🙈 Ẩn</button>'
      + '<button class="ved-chip ved-danger" id="vedResetEl">Khôi phục gốc</button></div>'
      + '<div class="ved-help">Mẹo: bấm chọn thành phần rồi <b>kéo để di chuyển</b> — sẽ hiện đường cam khi căn giữa/trái/phải. Ctrl+Z hoàn tác. Nhớ bấm <b>Lưu</b>.</div></div>';

    panel.innerHTML = html;

    document.getElementById('vedClose').onclick = deselect;
    bindColor('vedColor', 'color'); bindColor('vedBg', 'backgroundColor');
    document.getElementById('vedBgNone').onclick = function () { var b = begin(); setStyle('backgroundColor', 'transparent'); commit(b); };
    bindRange('vedFs', 'vedFsV', 'px', function (v) { return { fontSize: v + 'px' }; });
    bindRange('vedPad', 'vedPadV', 'px', function (v) { return { padding: v + 'px' }; });
    bindRange('vedW', 'vedWV', '%', function (v) { return { width: v + '%', maxWidth: 'none' }; });
    document.getElementById('vedWauto').onclick = function () { var b = begin(); setStyle('width', 'auto'); commit(b); document.getElementById('vedWV').textContent = 'auto'; };
    bindXY();
    document.getElementById('vedAlL').onclick = function () { quickAlign('left'); };
    document.getElementById('vedAlC').onclick = function () { quickAlign('center'); };
    document.getElementById('vedAlR').onclick = function () { quickAlign('right'); };

    if (isHero) {
      bindRange('vBlur', 'vBlurV', 'px', function (v) { return { '--hero-blur': v + 'px' }; });
      bindRangeRaw('vDim', 'vDimV', '%', function (v) { return { '--hero-dim': (v / 100).toFixed(2) }; });
      bindRangeRaw('vDop', 'vDopV', '%', function (v) { return { '--drum-opacity': (v / 100).toFixed(2) }; });
      bindRange('vDsz', 'vDszV', 'px', function (v) { return { '--drum-size': v + 'px' }; });
      bindRange('vDsp', 'vDspV', 's', function (v) { return { '--drum-spin': v + 's' }; });
      bindRange('vDspO', 'vDspOV', 's', function (v) { return { '--drum-spin-outer': v + 's' }; });
    }
    // nút bật/tắt xoay & đổi chiều theo lớp (đặt biến CSS)
    each('.ved-chip[data-var]', function (c) {
      c.onclick = function () {
        var b = begin(); setStyle(c.getAttribute('data-var'), c.getAttribute('data-val')); commit(b);
        each('.ved-chip[data-var="' + c.getAttribute('data-var') + '"]', function (x) { x.classList.remove('active'); });
        c.classList.add('active');
      };
    });

    each('.ved-chip[data-w]', function (c) { c.onclick = function () { var b = begin(); setStyle('fontWeight', c.getAttribute('data-w')); commit(b); markActive('[data-w]', c); }; });
    each('.ved-chip[data-al]', function (c) { c.onclick = function () { var b = begin(); setStyle('textAlign', c.getAttribute('data-al')); commit(b); markActive('[data-al]', c); }; });

    document.getElementById('vedHide').onclick = function () {
      var b = begin(); var o2 = ovFor(selectedPath); o2.hidden = !o2.hidden;
      selected.style.display = o2.hidden ? 'none' : ''; commit(b);
      toast(o2.hidden ? 'Đã ẩn (bấm Khôi phục để hiện lại)' : 'Đã hiện lại');
    };
    document.getElementById('vedResetEl').onclick = function () {
      var b = begin(); delete overrides[selectedPath];
      selected.setAttribute('style', origStyle[selectedPath] || '');
      selected.innerHTML = origHTML[selectedPath]; commit(b);
      buildPanel(elByPath(selectedPath)); toast('Đã khôi phục thành phần này');
    };
    if (canText) document.getElementById('vedEditText').onclick = function () {
      selected.setAttribute('contenteditable', 'true'); selected.focus();
      var b = begin(); var o2 = ovFor(selectedPath); if (o2.html == null) o2.html = selected.innerHTML;
      selected.oninput = function () { o2.html = selected.innerHTML; dirty = true; refreshBar(); };
      selected.onblur = function () { commit(b); selected.removeAttribute('contenteditable'); };
    };
  }

  function bindColor(id, prop) {
    var inp = document.getElementById(id); if (!inp) return;
    inp.oninput = function () { setStyle(prop, inp.value); dirty = true; };
    inp.onfocus = function () { inp._b = begin(); };
    inp.onchange = function () { if (inp._b != null) { commit(inp._b); inp._b = null; } };
  }
  // slider áp lên thành phần đang chọn (style hoặc biến CSS)
  function bindRange(id, valId, unit, toStyle) { _bindRange(id, valId, unit, toStyle); }
  function bindRangeRaw(id, valId, unit, toStyle) { _bindRange(id, valId, unit, toStyle); }
  function _bindRange(id, valId, unit, toStyle) {
    var inp = document.getElementById(id); if (!inp) return;
    inp.addEventListener('pointerdown', function () { inp._b = begin(); });
    inp.addEventListener('focus', function () { if (inp._b == null) inp._b = begin(); });
    inp.addEventListener('input', function () {
      var styles = toStyle(inp.value), o = ovFor(selectedPath);
      for (var k in styles) { o.style[k] = styles[k]; if (selected) applyProp(selected, k, styles[k]); }
      var v = document.getElementById(valId); if (v) v.textContent = inp.value + unit; dirty = true; refreshBar();
    });
    inp.addEventListener('change', function () { if (inp._b != null) { commit(inp._b); inp._b = null; } });
  }
  function bindXY() {
    var tx = document.getElementById('vedTx'), ty = document.getElementById('vedTy');
    function apply(commitIt, before) {
      setTransform(+tx.value, +ty.value, commitIt ? before : null);
    }
    [tx, ty].forEach(function (inp) {
      inp.addEventListener('pointerdown', function () { inp._b = begin(); });
      inp.addEventListener('input', function () { apply(false); });
      inp.addEventListener('change', function () { apply(true, inp._b); inp._b = null; });
    });
  }
  function updatePanelXY(x, y) {
    var a = document.getElementById('vedTx'), b = document.getElementById('vedTy');
    var av = document.getElementById('vedTxV'), bv = document.getElementById('vedTyV');
    if (a) a.value = x; if (b) b.value = y; if (av) av.textContent = x + 'px'; if (bv) bv.textContent = y + 'px';
  }
  function markActive(sel, c) { each('.ved-chip' + sel, function (x) { x.classList.remove('active'); }); c.classList.add('active'); }
  function each(sel, fn) { Array.prototype.forEach.call(panel.querySelectorAll(sel), fn); }
  function buildPanelEl() { panel = document.createElement('div'); panel.className = 'ved-panel'; panel.id = 'ved-panel'; document.body.appendChild(panel); }

  /* ---------- bật/tắt edit ---------- */
  function isTextEditable(el) {
    if (!el.children.length) return true;
    return Array.prototype.every.call(el.children, function (c) {
      return ['BR', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'A', 'SMALL', 'U'].indexOf(c.tagName) >= 0;
    });
  }
  function inDevtools(el) { return el.closest && el.closest('#vimc-devtools, .ved-bar, .ved-panel, .ved-toast, .ved-guide'); }
  function toggleEdit() {
    editMode = !editMode;
    document.body.classList.toggle('ved-on', editMode);
    var b = document.getElementById('vedToggle');
    b.classList.toggle('on', editMode);
    b.querySelector('span').textContent = editMode ? 'Đang chỉnh sửa' : 'Bật chỉnh sửa';
    if (editMode) markHover(); else { clearHover(); deselect(); }
  }
  function markHover() { Array.prototype.forEach.call(document.body.querySelectorAll('h1,h2,h3,h4,h5,p,span,a,button,li,.card,.outcome,.step,.testi,section,.eyebrow,.btn,.media-ph,img'), function (el) { if (!inDevtools(el)) el.setAttribute('data-vedhover', '1'); }); }
  function clearHover() { Array.prototype.forEach.call(document.querySelectorAll('[data-vedhover]'), function (el) { el.removeAttribute('data-vedhover'); }); }

  document.addEventListener('pointerdown', startDrag, true);
  document.addEventListener('click', function (e) {
    if (!editMode) return;
    if (inDevtools(e.target)) return;
    if (justDragged) { justDragged = false; e.preventDefault(); e.stopPropagation(); return; }
    if (selected && selected.getAttribute('contenteditable') === 'true') return;
    e.preventDefault(); e.stopPropagation();
    var el = e.target; if (el === document.body) return;
    selectEl(el);
  }, true);

  /* ---------- bàn phím ---------- */
  document.addEventListener('keydown', function (e) {
    var ae = document.activeElement;
    var typing = ae && ((ae.getAttribute && ae.getAttribute('contenteditable') === 'true') || ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      if (typing) return; e.preventDefault(); doUndo();
    } else if ((e.ctrlKey || e.metaKey) && ((e.key === 'y' || e.key === 'Y') || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
      if (typing) return; e.preventDefault(); doRedo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault(); doSave();
    }
  });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ved-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  }
  function rgbToHex(c) {
    if (!c) return '#000000'; if (c[0] === '#') return c;
    var m = c.match(/\d+/g); if (!m) return '#000000';
    return '#' + m.slice(0, 3).map(function (x) { x = (+x).toString(16); return x.length < 2 ? '0' + x : x; }).join('');
  }

  /* ---------- khởi động (sau khi main.js dựng header/footer) ---------- */
  function init() { injectCSS(); buildPanelEl(); buildBar(); applyInitial(); }
  if (document.readyState === 'complete') setTimeout(init, 60);
  else window.addEventListener('load', function () { setTimeout(init, 60); });
})();
