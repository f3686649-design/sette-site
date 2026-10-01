/* ============================================================
   Эффекты «второго слоя». Не трогают данные и логику app.js.
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mqDesktop = matchMedia('(min-width: 901px)');
  const isDesktop = () => mqDesktop.matches;

  /* ---------- Фирменный паттерн: шевроны (гайдлайн, стр. 10) ---------- */
  const chevron = (fill) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='128' viewBox='0 0 96 128'><g fill='${fill}'>` +
      `<path d='M8 40 48 16v40L8 80z'/><path d='M48 16l40 24v40L48 56z'/>` +
      `<path d='M8 104 48 80v40L8 144z'/><path d='M48 80l40 24v40L48 120z'/>` +
      `<path d='M8 -24 48 -48v40L8 16z'/><path d='M48 -48l40 24v40L48 -8z'/></g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  };
  document.documentElement.style.setProperty('--pattern', chevron('rgba(27,54,255,0.09)'));
  document.documentElement.style.setProperty('--pattern-dark', chevron('rgba(255,255,255,0.05)'));
  const addPattern = (sel, dark) => {
    const s = $(sel); if (!s) return;
    const p = document.createElement('div'); p.className = 'pattern'; p.setAttribute('aria-hidden', 'true');
    if (dark) p.style.setProperty('--pat', 'var(--pattern-dark)');
    s.prepend(p);
  };
  addPattern('.directions'); addPattern('.footer', true);

  /* ---------- Полоса прогресса ---------- */
  const progress = document.createElement('div'); progress.className = 'progress'; progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  /* ---------- Занавес первого экрана ---------- */
  const hero = $('.hero'), heroCover = document.createElement('div');
  heroCover.className = 'hero__cover'; hero.append(heroCover);

  /* ---------- Северное сияние (WebGL, с CSS-запасным вариантом) ---------- */
  const FRAG = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform float k;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
vec3 mm=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);mm=mm*mm;mm=mm*mm;
vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
mm*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(mm,g);}
void main(){vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 p=vec2(uv.x*asp,uv.y);float tt=t*0.05;
vec3 c1=vec3(0.106,0.212,1.0);vec3 c2=vec3(0.42,0.486,1.0);vec3 c3=vec3(0.753,0.831,0.933);vec3 g=vec3(1.0,0.91,0.596);vec3 gr=vec3(0.33,0.93,0.68);
vec3 col=vec3(0.0);
for(int i=0;i<3;i++){float fi=float(i);
float n1=snoise(vec2(p.x*0.7+fi*2.7+tt,tt*0.6+fi*1.3));
float y=uv.y-(0.66+0.09*fi)-0.13*n1-0.06*(m.y-0.5)+0.03*(m.x-0.5)*(uv.x-0.5);
float band=exp(-y*y*(11.0+5.0*fi));
float rays=0.6+0.4*snoise(vec2(p.x*(3.0+fi*1.5)-tt*2.5+fi*5.0,uv.y*1.2+tt));
rays*=0.85+0.15*snoise(vec2(p.x*9.0+tt*4.0,fi*3.0));
float f=band*rays;vec3 c=mix(c1,c2,rays);if(i==0)c=mix(c,gr,0.38*rays);if(i==1)c=mix(c,mix(c3,gr,0.5),0.35);if(i==2)c=mix(c,g,0.5*rays);
col+=c*f*(0.95-0.22*fi);}
col*=0.3+0.7*smoothstep(0.05,0.6,uv.y);
gl_FragColor=vec4(col*k,1.0);}`;
  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';

  function aurora(host, k, active = () => true) {
    if (reduceMotion || !host) return null;
    const c = document.createElement('canvas'); c.className = 'aurora'; c.setAttribute('aria-hidden', 'true');
    host.prepend(c);
    const gl = c.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) { c.classList.add('aurora--css', 'is-on'); return null; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    let prog;
    try { prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); }
    catch (e) { c.classList.add('aurora--css', 'is-on'); return null; }
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const U = { r: gl.getUniformLocation(prog, 'r'), t: gl.getUniformLocation(prog, 't'), m: gl.getUniformLocation(prog, 'm'), k: gl.getUniformLocation(prog, 'k') };
    const state = { visible: false, w: 0, h: 0, mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, last: 0, t0: performance.now() };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5) * 0.6;          // рендерим в пониженном разрешении — сияние и так размытое
      state.w = Math.max(1, Math.floor(c.clientWidth * dpr)); state.h = Math.max(1, Math.floor(c.clientHeight * dpr));
      c.width = state.w; c.height = state.h; gl.viewport(0, 0, state.w, state.h);
    };
    resize(); addEventListener('resize', resize);
    new IntersectionObserver((en) => { state.visible = en[0].isIntersecting; }).observe(host);
    if (finePointer) host.addEventListener('mousemove', (e) => { const r = host.getBoundingClientRect(); state.tx = (e.clientX - r.left) / r.width; state.ty = 1 - (e.clientY - r.top) / r.height; });
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (!state.visible || document.hidden || !active() || now - state.last < 33) return;   // ~30 к/с достаточно
      state.last = now;
      state.mx += (state.tx - state.mx) * 0.04; state.my += (state.ty - state.my) * 0.04;
      gl.uniform2f(U.r, state.w, state.h); gl.uniform1f(U.t, (now - state.t0) / 1000); gl.uniform2f(U.m, state.mx, state.my); gl.uniform1f(U.k, k);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    requestAnimationFrame(frame);
    requestAnimationFrame(() => c.classList.add('is-on'));
    return c;
  }
  setTimeout(() => aurora(hero, 0.55, () => scrollY < innerHeight), 1200);   // после заставки; за занавесом не рендерим
  { const cta = $('.cta'); if (cta) new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { aurora(cta, 0.45); obs.disconnect(); } }, { rootMargin: '100%' }).observe(cta); }

  /* ---------- Наклон карточек с бликом ---------- */
  if (finePointer && !reduceMotion) {
    $$('.scard, .proj').forEach((el) => {
      el.classList.add('tilt');
      const glare = document.createElement('span'); glare.className = 'glare'; el.append(glare);
      const max = el.classList.contains('scard') ? 3.5 : 5;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`); el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(x * 100 + 50).toFixed(1)}%`); el.style.setProperty('--gy', `${(y * 100 + 50).toFixed(1)}%`);
      });
      el.addEventListener('mouseleave', () => { el.classList.remove('is-tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- Свет за курсором на тёмных секциях ---------- */
  if (finePointer && !reduceMotion) {
    $$('.hscroll__sticky, .roads, .footer, .geo').forEach((s) => {
      s.classList.add('spot');
      s.addEventListener('mousemove', (e) => { const r = s.getBoundingClientRect(); s.style.setProperty('--mx', `${e.clientX - r.left}px`); s.style.setProperty('--my', `${e.clientY - r.top}px`); });
    });
  }

  /* ---------- Заголовки собираются по словам ---------- */
  const splitWords = (el) => {
    let i = 0;
    const wrap = (node) => { const w = document.createElement('span'); w.className = 'wr'; w.style.setProperty('--i', i++); const inner = document.createElement('span'); inner.append(node); w.append(inner); return w; };
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) frag.append(document.createTextNode(' ')); else frag.append(wrap(document.createTextNode(p))); });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') { const ph = document.createComment(''); n.replaceWith(ph); ph.replaceWith(wrap(n)); }
    });
  };
  if (!reduceMotion) $$('.sec-head .display, .hpanel--intro .display, .roads .display, .cta .display, .career__title, .contacts .display, .geo .display').forEach(splitWords);

  /* ---------- Подписи разделов «расшифровываются» ---------- */
  if (!reduceMotion) {
    const POOL = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789';
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, text = el.textContent, t0 = performance.now(), dur = 900;
      el.classList.add('is-scrambling');
      const tick = (now) => {
        const p = clamp((now - t0) / dur);
        el.textContent = [...text].map((ch, i) => (/[\s()·]/.test(ch) || i / text.length < p) ? ch : POOL[Math.floor(Math.random() * POOL.length)]).join('');
        if (p < 1) requestAnimationFrame(tick); else { el.textContent = text; el.classList.remove('is-scrambling'); }
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.5 });
    $$('.label').forEach((l) => io.observe(l));
  }

  /* ---------- Карта объектов (Leaflet + OSM) ---------- */
  const geo = $('#geo');
  if (geo && typeof OBJECTS !== 'undefined') {
    const items = OBJECTS.filter((o) => o.geo && o.geo.lat);
    const list = $('#geoList');
    const coarse = matchMedia('(pointer: coarse)').matches;
    if (!items.length) geo.hidden = true;   // координаты ещё не заполнены — раздел скрыт
    else {
    list.innerHTML = items.map((o) => `
      <button class="geo__item ${o.status === 'building' ? 'is-building' : ''} ${o.geo.approx ? 'is-approx' : ''}" data-id="${o.id}">
        <i></i><span><b>${o.title}</b><small>${o.subtitle}${o.geo.approx ? ' · примерно' : ''}</small></span><span>${o.deadline ? 'сдача ' + o.deadline : o.year}</span>
      </button>`).join('');
    if (!window.L) {
      geo.classList.add('geo--nomap');
      list.addEventListener('click', (e) => {
        const button = e.target.closest('[data-id]');
        if (button) openModal(items.find((o) => o.id === button.dataset.id));
      });
    }
    let map, markers = {};
    const init = () => {
      map = L.map($('#geoMap'), { scrollWheelZoom: false, zoomControl: false, attributionControl: true, dragging: !coarse, touchZoom: coarse ? 'center' : true });
      map.attributionControl.setPrefix(false);
      L.control.zoom({ zoomInTitle: 'Приблизить', zoomOutTitle: 'Отдалить' }).addTo(map);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
      const bounds = [];
      items.forEach((o) => {
        const cls = `pin ${o.status === 'building' ? 'pin--building' : ''} ${o.geo.approx ? 'pin--approx' : ''}`;
        const mk = L.marker([o.geo.lat, o.geo.lon], { keyboard: false, icon: L.divIcon({ className: '', html: `<div class="pin-hit"><div class="${cls}" data-id="${o.id}"></div></div>`, iconSize: [32, 32], iconAnchor: [16, 16] }) }).addTo(map);
        bounds.push([o.geo.lat, o.geo.lon]);
        mk.bindTooltip(`${o.title}${o.geo.approx ? ' · примерно' : ''}`, { className: 'pin-tip', direction: 'top', offset: [0, -10] });
        mk.on('click', () => typeof openModal === 'function' && openModal(o));
        mk.on('mouseover', () => setActive(o.id)); mk.on('mouseout', () => setActive(null)); markers[o.id] = mk;
      });
      if (typeof OFFICE_GEO !== 'undefined') {
        L.marker([OFFICE_GEO.lat, OFFICE_GEO.lon], { keyboard: false, icon: L.divIcon({ className: '', html: '<div class="pin" style="background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.25)"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }) })
          .addTo(map).bindTooltip('Офис СЭТТЭ · Кирова 18', { className: 'pin-tip', direction: 'top', offset: [0, -10] });
      }
      const city = items.filter((o) => o.geo.lat > 61.9 && o.geo.lat < 62.2 && o.geo.lon > 129.5 && o.geo.lon < 129.9).map((o) => [o.geo.lat, o.geo.lon]);
      map.fitBounds(city.length ? city : bounds, { padding: [40, 40] });
      map.on('focus', () => map.scrollWheelZoom.enable()); map.on('blur', () => map.scrollWheelZoom.disable());
      $('#modal').addEventListener('close', () => { setActive(null); Object.values(markers).forEach((m) => m.closeTooltip()); });
    };
    const setActive = (id) => {
      $$('.geo__item', list).forEach((b) => b.classList.toggle('is-active', b.dataset.id === id));
      $$('.pin', geo).forEach((p) => p.classList.toggle('is-active', p.dataset.id === id));
    };
    list.addEventListener('mouseover', (e) => { const b = e.target.closest('.geo__item'); if (b) setActive(b.dataset.id); });
    list.addEventListener('click', (e) => {
      const b = e.target.closest('.geo__item'); if (!b || !map) return;
      const o = items.find((x) => x.id === b.dataset.id);
      map.flyTo([o.geo.lat, o.geo.lon], Math.max(map.getZoom(), 15), { duration: 1.2 });
      setActive(o.id);
      if (typeof openModal === 'function') openModal(o);
      else if (!isDesktop()) $('#geoMap').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
    if (window.L) new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { init(); obs.disconnect(); } }, { rootMargin: '300px' }).observe(geo);
    }
  }

  /* ---------- Кадровый цикл: прогресс, занавес, параллакс мыши ---------- */
  const title = $('.hero__title'), slides = $('.hero__slides');
  const mouse = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  if (finePointer) addEventListener('mousemove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });
  const loop = () => {
    requestAnimationFrame(loop);
    const y = scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (isDesktop() && !reduceMotion) {
      heroCover.style.opacity = clamp(y / (vh * 0.9)) * 0.75 + clamp((y - vh) / vh) * 0.25;
      if (y < vh && finePointer) {
        cur.x += (mouse.x - cur.x) * 0.06; cur.y += (mouse.y - cur.y) * 0.06;
        title.style.transform = `translate3d(${cur.x * 18}px, ${cur.y * 12}px, 0)`;
        slides.style.transform = `translate3d(${-cur.x * 22}px, ${-cur.y * 14}px, 0) scale(1.03)`;
      }
    } else heroCover.style.opacity = 0;
  };
  requestAnimationFrame(loop);
})();

/* ============================================================
   Эффекты по итогам дизайн-панели: стек сцен, «долли» в ленте проектов,
   дорога с фарой и одометром, силуэт построенного, кинолента превью.
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mqDesktop = matchMedia('(min-width: 901px)');
  const isDesktop = () => mqDesktop.matches;
  const fmtN = (n) => Math.round(n).toLocaleString('ru-RU');

  /* ---------- Блик оставляем только на карточках направлений (на проектах он третий слой) ---------- */
  $$('.proj .glare').forEach((g) => g.remove());

  /* ---------- Одометр вместо простого счётчика ---------- */
  function odometer(el) {
    const to = +el.dataset.to; if (Number.isNaN(to)) return;
    const str = fmtN(to);
    if (reduceMotion) { el.textContent = str; return; }
    el.classList.add('odm');
    el.innerHTML = `<span class="sr-only">${str}</span>` + [...str].map((ch) => /\d/.test(ch)
      ? `<span class="od" aria-hidden="true"><span class="od__col">${'0123456789'.split('').map((d) => `<i>${d}</i>`).join('')}</span></span>`
      : `<span class="od-sep" aria-hidden="true">${ch}</span>`).join('');
    const cols = $$('.od__col', el); let k = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      [...str].forEach((ch) => { if (!/\d/.test(ch)) return; const col = cols[k]; col.style.transitionDelay = `${k * 90}ms`; col.style.transform = `translateY(-${+ch * 10}%)`; k++; });
    }));
  }
  if (typeof countUp === 'function') countUp = odometer;   // app.js вызывает countUp по имени — подменяем глобально

  /* ---------- Стек сцен: предыдущая секция уходит вниз-в-глубину под следующую ---------- */
  const SEAMS = [['#about', '#projects'], ['#portfolio', '#geo'], ['#contacts', '.footer']]
    .map(([a, b]) => [$(a), $(b)]).filter(([a, b]) => a && b && !b.hidden);
  SEAMS.forEach(([prev, next]) => {
    prev.classList.add('scene');
    const line = document.createElement('i'); line.className = 'seam-line'; line.setAttribute('aria-hidden', 'true'); next.prepend(line);
  });

  /* ---------- «Долли»: слои ленты проектов едут с разной скоростью ---------- */
  const track = $('#hsTrack'), projs = $$('.proj').map((el) => ({ el, img: $('.proj__img img', el), frame: $('.proj__img', el), num: $('.proj__num', el), text: el.children[1] }));
  let skew = 0, lastX = null;
  const dolly = (mobile) => {
    const vw = innerWidth;
    projs.forEach(({ el, img, num, text }) => {
      const r = el.getBoundingClientRect();
      if (r.right < -100 || r.left > vw + 100) return;
      const n = clamp((r.left + r.width / 2 - vw / 2) / vw, -1, 1);
      img.style.transform = `translate3d(${(n * 9).toFixed(2)}%, 0, 0) scale(1.18)`;
      if (mobile) return;
      num.style.transform = `translate3d(${(-n * 80).toFixed(1)}px, 0, 0)`;
      text.style.transform = `translate3d(${(n * 36).toFixed(1)}px, 0, 0)`;
    });
  };
  if (track && !reduceMotion) track.addEventListener('scroll', () => { if (!isDesktop()) dolly(true); }, { passive: true });

  /* ---------- Дорога: SVG-трасса, фара, заливка ---------- */
  const road = $('#road'), roadLine = $('.road__line');
  let svg, path, fill, light, pathLen = 0, lastP = -1;
  if (road && roadLine) {
    roadLine.style.display = 'none';
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'road__svg'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs>
      <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7cff"/><stop offset="1" stop-color="#0c29ff"/></linearGradient>
      <radialGradient id="roadGlow"><stop offset="0" stop-color="#ffe898" stop-opacity=".95"/><stop offset=".45" stop-color="#ffe898" stop-opacity=".3"/><stop offset="1" stop-color="#ffe898" stop-opacity="0"/></radialGradient>
      <linearGradient id="roadBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe898" stop-opacity=".45"/><stop offset="1" stop-color="#ffe898" stop-opacity="0"/></linearGradient>
    </defs>
    <path class="road__asphalt"/><path class="road__fillpath" pathLength="1"/><path class="road__axis"/>
    <g class="road__light">
      <path class="road__beam" d="M-8,2 L-26,110 L26,110 L8,2 Z" fill="url(#roadBeam)"/>
      <rect class="road__car" x="-10" y="-30" width="20" height="32" rx="5"/>
      <rect class="road__glass" x="-7" y="-14" width="14" height="7" rx="2"/>
      <circle cx="-6" cy="1" r="17" fill="url(#roadGlow)"/><circle cx="6" cy="1" r="17" fill="url(#roadGlow)"/>
      <circle cx="-6" cy="1" r="3.4" fill="#ffe898"/><circle cx="6" cy="1" r="3.4" fill="#ffe898"/>
    </g>`;
    road.prepend(svg);
    path = $('.road__fillpath', svg); fill = path; light = $('.road__light', svg);
    const build = () => {
      const H = road.offsetHeight, W = isDesktop() ? 60 : 36, cx = W / 2, a = isDesktop() ? 9 : 5;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.style.width = `${W}px`; svg.style.height = `${H}px`;
      const d = `M${cx},0 C${cx},${H * .22} ${cx - a},${H * .3} ${cx},${H * .5} S${cx + a},${H * .78} ${cx},${H}`;
      $$('path', svg).forEach((p) => p.setAttribute('d', d));
      pathLen = path.getTotalLength(); lastP = -1;
    };
    build(); addEventListener('resize', build); addEventListener('load', build);
  }
  const roadFrame = (vh) => {
    if (!svg) return;
    const rr = road.getBoundingClientRect();
    const p = clamp((vh * 0.6 - rr.top) / rr.height);
    if (Math.abs(p - lastP) < 0.002) return;
    lastP = p;
    fill.style.strokeDashoffset = 1 - p;
    const pt = path.getPointAtLength(p * pathLen);
    const ahead = path.getPointAtLength(Math.min(pathLen, p * pathLen + 6));
    const ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI - 90;   // 0° = едет вниз
    light.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${isDesktop() ? 1.15 : 0.8})`);
  };

  /* ---------- Силуэт построенного: дома СЭТТЭ по этажности, окна зажигаются ---------- */
  const footer = $('.footer');
  if (footer && typeof OBJECTS !== 'undefined') {
    const yr = (o) => +((String(o.deadline || o.year || '').match(/\d{4}/) || [0])[0]);
    const parseFloors = (f) => String(f).split(/[–\-,]|\s+и\s+/).map((x) => parseInt(x, 10)).filter((n) => n > 0);
    const houses = OBJECTS.filter((o) => o.floors).map((o) => ({ o, floors: parseFloors(o.floors), n: o.buildings || 1 }))
      .sort((a, b) => yr(a.o) - yr(b.o));
    const FW = 26, GAP = 12, FH = 7, PAD = 8;
    let x = PAD, parts = [], i = 0, seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    houses.forEach(({ o, floors, n }) => {
      const cols = Math.min(Math.max(n, floors.length), 3), fl = floors.length > 1 ? floors : [floors[0]];
      const rd = o.readiness && o.readiness.pct != null ? o.readiness : null;
      const label = `${o.title} · ${o.floors} эт.${o.status === 'building' ? (rd ? ` · готовность ${rd.pct}%` : '') + ' · сдача ' + o.deadline : ''}`;
      let g = `<g class="bld ${o.status === 'building' ? 'bld--building' : ''}" style="--i:${i++}" data-cursor="Открыть" data-label="${label.replace(/"/g, '&quot;')}" data-id="${o.id}">`;
      for (let c = 0; c < cols; c++) {
        const f = fl[Math.min(c, fl.length - 1)], h = f * FH, y = 160 - h;
        g += `<rect class="bld__body" x="${x}" y="${y}" width="${FW}" height="${h}" rx="1"/>`;
        const litRows = rd ? Math.round(f * Math.min(100, Math.max(0, rd.pct)) / 100) : 0;   // этажи «с окнами» по проценту готовности
        for (let r = 0; r < f; r++) for (let w = 0; w < 3; w++) {
          const d = (0.3 + rnd() * 3).toFixed(2);
          const lit = o.status !== 'building' || (f - 1 - r) < litRows;   // r=0 — верхний этаж
          g += `<rect class="win ${lit ? '' : 'win--dark'}" x="${x + 4 + w * 7}" y="${y + 3 + r * FH}" width="3.5" height="3.5" style="--d:${d}s"/>`;
        }
        if (rd && c === 0) g += `<text class="bld__pct" x="${x + (FW * cols + 4 * (cols - 1)) / 2}" y="${y - 6}" text-anchor="middle">${rd.pct}%</text>`;
        x += FW + 4;
      }
      x += GAP;
      parts.push(g + '</g>');
    });
    const W = x + PAD;
    const wrap = document.createElement('div'); wrap.className = 'skyline'; wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-labelledby', 'skylineLabel');
    wrap.innerHTML = `<p class="skyline__label" id="skylineLabel">Наши дома · по этажности</p><svg viewBox="0 0 ${W} 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${parts.join('')}</svg>`;
    const bottom = $('.footer__legal') || $('.footer__bottom'); bottom.before(wrap);
    new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { wrap.classList.add('is-dusk'); setTimeout(() => wrap.classList.add('is-lit'), 5600); obs.disconnect(); } }, { threshold: 0.3 }).observe(wrap);
    const skyLabel = $('#skylineLabel', wrap);
    wrap.addEventListener('mouseover', (e) => { const g = e.target.closest('.bld'); if (g) skyLabel.textContent = g.dataset.label; });
    wrap.addEventListener('mouseleave', () => { skyLabel.textContent = 'Наши дома · по этажности'; });
    wrap.addEventListener('click', (e) => { const g = e.target.closest('.bld'); if (g && typeof openModal === 'function') openModal(OBJECTS.find((o) => o.id === g.dataset.id)); });
  }

  /* ---------- Кинолента превью портфолио ---------- */
  const preview = $('#worksPreview'), list = $('#worksList');
  if (preview && list && typeof OBJECTS !== 'undefined' && finePointer) {
    const done = OBJECTS.filter((o) => o.status === 'done');
    const reel = document.createElement('div'); reel.className = 'reel';
    let built = false;
    const build = () => { if (built) return; built = true; reel.innerHTML = done.map((o) => `<img src="${(o.cover.startsWith('http') ? o.cover : encodeURI(BASE + o.cover))}" alt="" decoding="async">`).join(''); preview.append(reel); };
    list.addEventListener('mouseover', build, { once: true });
    const idx = Object.fromEntries(done.map((o, k) => [o.id, k]));
    let cur = -1;
    list.addEventListener('mouseover', (e) => {
      const row = e.target.closest('.row'); if (!row) return;
      const k = idx[row.dataset.id]; if (k === undefined || k === cur) return;
      cur = k; reel.style.transform = `translate3d(0, ${-k * 100}%, 0)`;
      preview.classList.add('is-switching'); setTimeout(() => preview.classList.remove('is-switching'), 350);
    });
  }

  /* ---------- Бесконечные анимации крутятся только в зоне видимости ---------- */
  const inview = new IntersectionObserver((en) => en.forEach((e) => e.target.classList.toggle('is-inview', e.isIntersecting)), { rootMargin: '10%' });
  $$('#roads, #geo, #directions, .footer').forEach((s) => inview.observe(s));

  /* ---------- Кадровый цикл ---------- */
  const heroEl = $('.hero');
  const loop = () => {
    requestAnimationFrame(loop);
    const vh = innerHeight;
    roadFrame(vh);
    if (reduceMotion) return;
    // стек сцен
    if (isDesktop()) {
      SEAMS.forEach(([prev, next]) => {
        const nr = next.getBoundingClientRect();
        if (nr.top >= vh || nr.top <= -vh * 0.2) { if (prev.style.transform) { prev.style.transform = ''; prev.style.setProperty('--dim', 0); prev.classList.remove('is-sinking'); } return; }
        const p = clamp(1 - nr.top / vh);
        prev.classList.add('is-sinking');
        prev.style.transform = `translate3d(0, ${(p * vh * 0.28).toFixed(1)}px, 0) scale(${(1 - p * 0.05).toFixed(4)})`;
        prev.style.setProperty('--dim', (p * 0.45).toFixed(3));
      });
      // долли + лёгкий скос ленты по скорости
      if (track) {
        const hr = $('#projects').getBoundingClientRect();
        if (hr.top < vh && hr.bottom > 0) {
          const tx = typeof laneTx === 'number' ? laneTx : 0;
          const vel = lastX === null ? 0 : tx - lastX; lastX = tx;
          skew += (clamp(vel * 0.05, -4, 4) - skew) * 0.12;
          if (Math.abs(skew) > 0.02) track.style.transform = `translate3d(${tx}px,0,0) skewX(${skew.toFixed(2)}deg)`;
          dolly(false);
        }
      }
    }
  };
  requestAnimationFrame(loop);
})();

/* ============================================================
   Ход строительства: ежемесячные фотоотчёты застройщика из ЕИСЖС (data.js → progress[])
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = $('#progress');
  if (!sec || typeof OBJECTS === 'undefined') return;
  const items = OBJECTS.filter((o) => Array.isArray(o.progress) && o.progress.length);
  if (!items.length) { sec.hidden = true; return; }

  const tabs = $('#buildTabs'), img = $('#buildImg'), imgNext = $('#buildImgNext'), month = $('#buildMonth'), placed = $('#buildPlaced');
  const facts = $('#buildFacts'), timeline = $('#buildTimeline'), play = $('#buildPlay');
  let cur = null, idx = 0, timer = null, swapTimer = null;

  tabs.innerHTML = items.map((o, k) => `<button class="tab ${k ? '' : 'is-active'}" role="tab" aria-selected="${k ? 'false' : 'true'}" data-id="${o.id}">${o.title} <sup>${o.progress.length}</sup></button>`).join('');

  const preload = (i) => { const p = cur.progress[i]; if (p) { imgNext.src = MEDIA[p.url] || p.url; } };

  const show = (i, instant) => {
    if (!cur) return;
    clearTimeout(swapTimer);
    idx = (i + cur.progress.length) % cur.progress.length;
    const p = cur.progress[idx];
    if (instant || reduceMotion) { img.classList.remove('is-fading'); img.src = MEDIA[p.url] || p.url; }
    else {
      img.classList.add('is-fading');
      const swap = () => { img.onload = img.onerror = () => img.classList.remove('is-fading'); img.src = MEDIA[p.url] || p.url; };
      swapTimer = setTimeout(swap, 180);
    }
    img.alt = `${cur.title}: фотоотчёт, ${p.label}`;
    month.textContent = p.label;
    placed.textContent = `размещён ${p.placed} · ${p.n} фото в месяце`;
    $$('.build__tick', timeline).forEach((t, k) => { t.classList.toggle('is-active', k === idx); t.setAttribute('aria-pressed', k === idx); });
    const tick = $$('.build__tick', timeline)[idx];
    if (tick) timeline.scrollTo({ left: tick.offsetLeft - timeline.offsetLeft - timeline.clientWidth / 2 + tick.clientWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    preload(idx + 1);
  };

  const select = (id) => {
    stop();
    cur = items.find((o) => o.id === id) || items[0];
    $$('.tab', tabs).forEach((t) => { const on = t.dataset.id === cur.id; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    const rd = cur.readiness, plan = cur.eisgsPlan || {};
    facts.innerHTML = `
      ${rd ? `<div class="readiness"><div class="readiness__head"><span>Строительная готовность</span><b>${rd.pct}%</b></div><div class="readiness__bar"><i style="--w:${rd.pct}%"></i></div><div class="readiness__head" style="margin:6px 0 0"><span>${rd.src} · ${rd.date}</span></div></div>` : ''}
      <dl>
        <div><dt>Застройщик</dt><dd>${cur.developer || '—'}</dd></div>
        ${plan.commissioning ? `<div><dt>Плановый ввод</dt><dd>${plan.commissioning}<small>по данным ЕИСЖС</small></dd></div>` : ''}
        ${plan.keys ? `<div><dt>Передача ключей</dt><dd>${plan.keys}<small>по данным ЕИСЖС</small></dd></div>` : ''}
        ${plan.flats ? `<div><dt>Квартир в доме</dt><dd>${plan.flats}</dd></div>` : ''}
        ${cur.pd ? `<div><dt>Проектная декларация</dt><dd><a href="${cur.pd.url}" target="_blank" rel="noopener">№ ${cur.pd.number}</a><small>от ${cur.pd.date}</small></dd></div>` : ''}
        ${cur.eisgs ? `<div><dt>Карточка объекта</dt><dd><a href="${cur.eisgs}" target="_blank" rel="noopener">наш.дом.рф ↗</a></dd></div>` : ''}
      </dl>`;
    let lastYear = '';
    timeline.innerHTML = cur.progress.map((p, k) => {
      const y = p.ym.slice(0, 4), m = +p.ym.slice(5);
      const isYear = y !== lastYear; lastYear = y;
      return `<button type="button" class="build__tick ${isYear ? 'is-year' : ''}" data-i="${k}" aria-label="${p.label}"><i></i><span>${isYear ? y : ['', 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][m]}</span></button>`;
    }).join('');
    show(cur.progress.length - 1, true);   // по умолчанию — свежий месяц
  };

  const stop = () => { clearInterval(timer); timer = null; play.classList.remove('is-on'); play.textContent = '▶ Таймлапс'; play.setAttribute('aria-label', 'Запустить таймлапс'); };
  const start = () => {
    if (!cur || cur.progress.length < 2) return;
    show(0, true); play.classList.add('is-on'); play.textContent = '■ Стоп'; play.setAttribute('aria-label', 'Остановить таймлапс');
    timer = setInterval(() => { if (idx >= cur.progress.length - 1) { stop(); return; } show(idx + 1); }, reduceMotion ? 1500 : 900);
  };

  tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) select(t.dataset.id); });
  timeline.addEventListener('click', (e) => { const t = e.target.closest('.build__tick'); if (t) { stop(); show(+t.dataset.i); } });
  $('#buildPrev').addEventListener('click', () => { stop(); show(idx - 1); });
  $('#buildNext').addEventListener('click', () => { stop(); show(idx + 1); });
  play.addEventListener('click', () => (timer ? stop() : start()));
  sec.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { stop(); show(idx - 1); } if (e.key === 'ArrowRight') { stop(); show(idx + 1); } });
  // свайп по фото на телефоне
  let x0 = null;
  img.parentElement.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  img.parentElement.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) { stop(); show(idx + (dx < 0 ? 1 : -1)); } }, { passive: true });
  new IntersectionObserver((en) => { if (!en[0].isIntersecting) stop(); }).observe(sec);

  // отложенная инициализация: картинки с наш.дом.рф грузим, когда раздел близко
  new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { select(items[0].id); obs.disconnect(); } }, { rootMargin: '400px' }).observe(sec);
})();
