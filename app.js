// Публичный адрес обработчика задаётся в site-config.js. Вебхук CRM хранится только на сервере.
const SUBMIT_URL = window.SETTE_CONFIG?.submitUrl || '';
const SALES_EMAIL = 'otdelprodazh-sette@mail.ru';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fmt = (n) => Math.round(n).toLocaleString('ru-RU');
const img = (p) => {
  const url = p.startsWith('http') ? p : BASE + p;
  return typeof MEDIA !== 'undefined' && MEDIA[url] ? MEDIA[url] : encodeURI(url);
};
const thumb = (p) => img(p).replace(/\.webp$/, '-thumb.webp');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mqDesktop = matchMedia('(min-width: 901px)');
const isDesktop = () => mqDesktop.matches;
const TYPE_LABEL = { residential: 'Жилой дом', social: 'Социальный объект', commercial: 'Коммерческий' };

// Часть файлов на sette.su загружена с Mac и названа в Unicode NFD («й» = «и» + знак).
// Если картинка не нашлась — пробуем NFD-вариант имени.
addEventListener('error', (e) => {
  const el = e.target;
  if (el.tagName !== 'IMG' || el.dataset.nfd) return;
  el.dataset.nfd = 1;
  el.src = encodeURI(decodeURI(el.src).normalize('NFD'));
}, true);

/* ================= Данные для блоков ================= */
const building = OBJECTS.filter((o) => o.status === 'building');
const doneRes = OBJECTS.filter((o) => o.status === 'done' && o.type === 'residential');
const resTotal = OBJECTS.filter((o) => o.type === 'residential').length;
const socialArea = OBJECTS.filter((o) => o.type === 'social')
  .reduce((s, o) => s + parseFloat(o.area.replace(/\s/g, '').replace(',', '.')), 0);
const roadsTotal = ROADS.reduce((s, r) => s + r.m, 0);

/* ================= Заставка ================= */
setTimeout(() => document.body.classList.remove('is-loading'), reduceMotion ? 0 : 1100);

/* ================= Hero-слайдер ================= */
const slidesBox = $('#heroSlides'), barsBox = $('#heroBars');
let slide = 0, slideTimer;
const SLATS = innerWidth > 900 ? 5 : 3;
building.forEach((o) => {
  const s = document.createElement('div');
  s.className = 'hero__slide';
  s.style.setProperty('--n', SLATS);
  // фото режется на наклонные ламели (угол фирменного шеврона) — смена кадра идёт «врезкой», а не растворением
  s.innerHTML = Array.from({ length: SLATS }, (_, i) => `<span class="slat" style="--i:${i}"><i style="background-image:url('${img(o.cover)}')"></i></span>`).join('');
  slidesBox.append(s);
  barsBox.append(document.createElement('i'));
});
// подпись слайда меняется как титр: старая строка уходит вверх, новая поднимается снизу
function roll(el, text) {
  const old = el.querySelector('.roll');
  const n = document.createElement('span'); n.className = 'roll roll--in'; n.textContent = text; el.append(n);
  if (!old) { n.classList.remove('roll--in'); return; }
  requestAnimationFrame(() => requestAnimationFrame(() => { n.classList.remove('roll--in'); old.setAttribute('aria-hidden', 'true'); old.classList.add('roll--out'); }));
  setTimeout(() => old.remove(), 800);
}
$('#heroTotal').textContent = String(building.length).padStart(2, '0');

function showSlide(i) {
  slide = i;
  const o = building[i];
  $$('.hero__slide').forEach((s, k) => {
    if (k === i) {
      s.classList.remove('is-leaving');
      s.classList.add('is-wiping'); void s.offsetWidth;          // ламели схлопнуты → раскрываются слева направо
      s.classList.add('is-active', 'is-sweeping'); s.classList.remove('is-wiping');
      setTimeout(() => s.classList.remove('is-sweeping'), 1400);
    } else if (s.classList.contains('is-active')) {
      s.classList.remove('is-active'); s.classList.add('is-leaving');
      setTimeout(() => s.classList.remove('is-leaving'), 1500);
    }
  });
  [...barsBox.children].forEach((b, k) => {
    b.className = k < i ? 'is-done' : '';
    if (k === i) { void b.offsetWidth; b.className = 'is-active'; }
  });
  $('#heroNum').textContent = String(i + 1).padStart(2, '0');
  roll($('#heroName'), o.title);
  roll($('#heroMeta'), `${o.subtitle} · сдача ${o.deadline}`);
  armSlides();
}
function armSlides() { clearTimeout(slideTimer); if (!reduceMotion) slideTimer = setTimeout(() => showSlide((slide + 1) % building.length), 6000); }
$('#heroInfo').addEventListener('mouseenter', () => clearTimeout(slideTimer));
$('#heroInfo').addEventListener('mouseleave', armSlides);
$('#hero').addEventListener('focusin', () => clearTimeout(slideTimer));
$('#hero').addEventListener('focusout', armSlides);
showSlide(0);
$('#heroInfo').addEventListener('click', () => openModal(building[slide]));

/* ================= Манифест: слова подсвечиваются при прокрутке ================= */
const manifest = $('#manifest');
let _mTop = null;   // абсолютная позиция манифеста: секция может быть сдвинута transform'ом «стека сцен»
const manifestTop = () => { if (_mTop === null) { let e = manifest, t = 0; while (e) { t += e.offsetTop; e = e.offsetParent; } _mTop = t; } return _mTop; };
addEventListener('resize', () => { _mTop = null; });
addEventListener('load', () => { _mTop = null; });
manifest.innerHTML = manifest.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
const words = $$('.w', manifest);

/* ================= Счётчики ================= */
$('#counters').innerHTML = [
  [building.length, '', 'жилых комплекса строится сейчас'],
  [doneRes.length, '', 'жилых объектов введено в эксплуатацию'],
  [socialArea, 'м²', 'школ, больниц и социальных объектов'],
  [roadsTotal, 'м', 'дорог построено и отремонтировано']
].map(([n, u, t]) => `<div class="counter reveal"><b><span data-to="${Math.round(n)}">${fmt(n)}</span>${u ? `<small>${u}</small>` : ''}</b><span>${t}</span></div>`).join('');

function countUp(el) {
  const to = +el.dataset.to, t0 = performance.now(), dur = reduceMotion ? 0 : 1800;
  const tick = (t) => {
    const p = dur ? clamp((t - t0) / dur) : 1;
    el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ================= Строящиеся ЖК: горизонтальная лента ================= */
const track = $('#hsTrack'), hsSection = $('#projects');
let laneTx = 0;   // текущий сдвиг ленты — читает fx.js (скос)
track.insertAdjacentHTML('beforeend', building.map((o, i) => `
  <a href="#projects" class="hpanel proj" data-id="${o.id}" data-cursor="Открыть">
    <div class="proj__img clip">
      <img src="${img(o.cover)}" alt="${o.title}" loading="lazy">
      <span class="proj__badge">Строится</span>
    </div>
    <div>
      <span class="proj__num">${String(i + 1).padStart(2, '0')}</span>
      <h3 class="proj__title">${o.title}</h3>
      <p class="proj__sub">${o.subtitle}</p>
      <dl class="proj__specs">
        <div><dt>Сдача</dt><dd>${o.deadline}</dd></div>
        <div><dt>Этажность</dt><dd>${o.floors}</dd></div>
        <div><dt>Корпусов</dt><dd>${o.buildings}</dd></div>
        <div><dt>Подъездов</dt><dd>${o.entrances}</dd></div>
      </dl>
      ${o.readiness && o.readiness.pct != null ? `<div class="readiness"><div class="readiness__head"><span>Строительная готовность</span><b>${o.readiness.pct}%</b></div><div class="readiness__bar"><i style="--w:${o.readiness.pct}%"></i></div><div class="readiness__head" style="margin:6px 0 0"><span>${o.readiness.src} · ${o.readiness.date}</span></div></div>` : ''}
      <span class="proj__decl">Застройщик: ${o.developer || '<span class="todo">[[ООО «СЗ «…»]]</span>'} · Проектная декларация на сайте наш.дом.рф</span>
      <span class="proj__more">Подробнее о проекте →</span>
    </div>
  </a>`).join(''));

track.addEventListener('focusin', (e) => {
  const el = e.target.closest('.proj'); if (!el || !isDesktop()) return;
  $('.hscroll__sticky').scrollLeft = 0;
  const max = track.scrollWidth - innerWidth;
  const tx = clamp((el.offsetLeft + el.offsetWidth / 2 - innerWidth / 2) / max);
  const y = hsSection.offsetTop + tx * (hsSection.offsetHeight - innerHeight);
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
});
function sizeHScroll() {
  hsSection.style.height = isDesktop() ? `${track.scrollWidth - innerWidth + innerHeight}px` : '';
  if (!isDesktop()) track.style.transform = '';
}

/* ================= Направления: стопка карточек ================= */
const DIRECTIONS = [
  { title: 'Жилые комплексы', text: 'Кирпично-монолитные дома от 9 до 16 этажей: Залог, 16-й и 65-й кварталы, Ильменская, центр города. Дизайнерские вестибюли, видеонаблюдение, бесшумные лифты.',
    big: resTotal, sub: 'жилых объектов в портфеле', img: '2024/08/76-SZ-AISAR-5-scaled.jpg', href: '#portfolio', filter: 'residential' },
  { title: 'Социальные объекты', text: 'Школы в сёлах Октемцы и Петровка, пристрой к школе № 5, «Сергелях» в Бердигестяхе и Кардиологический диспансер в Якутске.',
    big: `${fmt(socialArea)} м²`, sub: 'социальных площадей построено', img: '2024/10/Школа-в-Октемсах.jpg', href: '#portfolio', filter: 'social' },
  { title: 'Коммерческая недвижимость', text: 'ТРК «Азия» на Покровском тракте — один из крупнейших торговых центров Якутии: более 60 магазинов, 5-зальный кинотеатр, фуд-корт и большая парковка.',
    big: '14 000 м²', sub: 'ТРК «Азия», введён в 2015 году', img: '2024/08/ТЦАзия_44-scaled.jpg', href: '#portfolio', filter: 'commercial' },
  { title: 'Дороги', text: 'ООО ДРСУ «Сэттэ» с 2020 года строит и ремонтирует дороги Якутска: капитальный ремонт улиц, кольцевые развязки, подъезды к социальным объектам.',
    big: `${fmt(roadsTotal)} м`, sub: 'дорог за 2020–2023 годы', img: '2024/10/ДРСУ1.jpg', href: '#roads' }
];
$('#stack').innerHTML = DIRECTIONS.map((d, i) => `
  <a href="${d.href}" class="scard" style="--i:${i}" ${d.filter ? `data-filter="${d.filter}"` : ''} data-cursor="Смотреть">
    <div class="scard__body">
      <div class="scard__top"><span>${String(i + 1).padStart(2, '0')} / 04</span><span>↗</span></div>
      <div><h3>${d.title}</h3><p>${d.text}</p></div>
      <div class="scard__big"><span class="scard__num">${d.big}</span><small>${d.sub}</small></div>
    </div>
    <div class="scard__img"><img src="${img(d.img)}" alt="" loading="lazy"></div>
  </a>`).join('');
const scards = $$('.scard');

/* ================= Портфолио: список с превью ================= */
const list = $('#worksList'), preview = $('#worksPreview'), previewImg = $('#worksPreviewImg');
const doneAll = OBJECTS.filter((o) => o.status === 'done');
$('#cntAll').textContent = doneAll.length;

function renderWorks(filter) {
  const items = doneAll.filter((o) => filter === 'all' || o.type === filter);
  list.innerHTML = items.map((o, i) => `
    <li><a href="#portfolio" class="row" data-id="${o.id}" style="animation-delay:${i * 45}ms">
      <span class="row__n">${String(i + 1).padStart(2, '0')}</span>
      <span class="row__thumb"><img src="${thumb(o.cover)}" alt="" loading="lazy" width="400" height="300"></span>
      <span class="row__title"><span class="rw-line">${o.title.split(' ').map((w, k) => `<span class="rw" style="--k:${k}"><b>${w}</b><b aria-hidden="true">${w}</b></span>`).join(' ')}</span><small>${TYPE_LABEL[o.type]} · ${o.year}</small></span>
      <span class="row__sub">${o.subtitle}</span>
      <span class="row__year">${o.year}</span>
      <span class="row__area">${o.area ? `${o.area} м²` : o.floors ? `${o.floors} эт.` : ''}</span>
      <span class="row__arrow">→</span>
    </a></li>`).join('');
  $$('#tabs .tab').forEach((t) => {
    t.classList.toggle('is-active', t.dataset.filter === filter);
    t.setAttribute('aria-pressed', String(t.dataset.filter === filter));
  });
}
renderWorks('all');
$('#tabs').addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) renderWorks(t.dataset.filter); });

list.addEventListener('mouseover', (e) => {
  const row = e.target.closest('.row');
  if (!row || !finePointer) return;
  const object = OBJECTS.find((o) => o.id === row.dataset.id);
  previewImg.src = img(object.cover);
  previewImg.alt = object.title;
  previewImg.hidden = false;
  preview.classList.add('is-on');
});
list.addEventListener('mouseleave', () => preview.classList.remove('is-on'));

/* ================= Дороги ================= */
$('#roadSteps').innerHTML = ROADS.map((r) => `
  <div class="step">
    <div class="step__year">${r.year}</div>
    <div class="step__m"><span data-to="${r.m}">${fmt(r.m)}</span><small>м</small></div>
    <p>${r.works}</p>
  </div>`).join('');
$('#roadTotal').dataset.to = roadsTotal;
const road = $('#road'), roadFill = $('#roadFill'), steps = $$('.step');

/* ================= Карточка объекта ================= */
const modal = $('#modal'), modalBody = $('#modalBody');
modal.setAttribute('data-lenis-prevent', '');
function openModal(o) {
  const photos = [o.cover, ...(o.gallery || [])];
  const specs = [
    ['Срок сдачи', o.deadline], ['Год ввода', o.year], ['Этажность', o.floors], ['Корпусов', o.buildings],
    ['Подъездов', o.entrances], ['Площадь', o.area && `${o.area} м²`], ['Квартир', o.flats], ['Тип дома', o.material]
  ].filter(([, v]) => v);
  modalBody.innerHTML = `
    <div class="m-gallery">
      <div class="m-gallery__main"><img id="galMain" src="${img(photos[0])}" alt="${o.title}"></div>
      ${photos.length > 1 ? `<div class="m-gallery__thumbs">${photos.map((p, i) =>
        `<button type="button" aria-label="Фото ${i + 1} из ${photos.length}" ${i ? '' : 'aria-current="true"'} class="${i ? '' : 'is-active'}"><img src="${thumb(p)}" data-full="${img(p)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
    </div>
    <div class="m-body">
      <div>
        <span class="m-tag">${o.status === 'building' ? 'Строится' : TYPE_LABEL[o.type]}</span>
        <h3 id="modalTitle">${o.title}</h3>
        <p class="m-sub">${[o.subtitle, o.address].filter(Boolean).join(' · ')}</p>
        ${o.text ? `<p>${o.text}</p>` : ''}
        ${o.status === 'building' ? `<p class="m-decl">Застройщик: ${o.developer || '<span class="todo">[[ООО «СЗ «…»]]</span>'} · Проектная декларация, разрешение на строительство и документы объекта размещены в ЕИСЖС на сайте <a href="${o.eisgs || 'https://наш.дом.рф/'}" target="_blank" rel="noopener">наш.дом.рф</a>. Квартиры реализуются по ДДУ (214-ФЗ) с использованием счетов эскроу.</p>` : ''}
        ${o.infra ? `<ul class="m-infra">${o.infra.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}
      </div>
      <div>
        ${o.readiness && o.readiness.pct != null ? `<div class="readiness"><div class="readiness__head"><span>Строительная готовность</span><b>${o.readiness.pct}%</b></div><div class="readiness__bar"><i style="--w:${o.readiness.pct}%"></i></div><div class="readiness__head" style="margin:6px 0 0"><span>${o.readiness.src} · ${o.readiness.date}</span>${o.readiness.url ? `<a href="${o.readiness.url}" target="_blank" rel="noopener">Открыть ↗</a>` : ''}</div></div>` : ''}
        <dl class="m-specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="m-actions">
          ${o.status === 'building' ? `<a href="#pick" class="pill pill--accent" data-complex="${o.id}">Узнать о квартирах <span>→</span></a>` : ''}
          <a href="${o.url}" target="_blank" rel="noopener" class="pill pill--outline">Планировки и документы ↗</a>
        </div>
      </div>
    </div>`;
  modal.showModal();
  lenis?.stop();
}
modal.addEventListener('close', () => lenis?.start());
modalBody.addEventListener('click', (e) => {
  const t = e.target.closest('.m-gallery__thumbs button');
  if (t) {
    const main = $('#galMain');
    delete main.dataset.nfd;
    main.src = t.querySelector('img').dataset.full;
    $$('.m-gallery__thumbs button', modalBody).forEach((b) => { b.classList.toggle('is-active', b === t); b.toggleAttribute('aria-current', b === t); });
  }
  const cta = e.target.closest('[data-complex]');
  if (cta) {
    const map = { prime: 'Прайм', gastello: 'Гастелло', sosnovy: 'Сосновый бор' };
    const r = document.querySelector(`input[name="complex"][value="${map[cta.dataset.complex]}"]`);
    if (r) r.checked = true;
    modal.close();
  }
});
$('#modalClose').addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

document.addEventListener('click', (e) => {
  const el = e.target.closest('.proj, .row');
  if (el) { e.preventDefault(); openModal(OBJECTS.find((o) => o.id === el.dataset.id)); return; }
  const card = e.target.closest('.scard[data-filter]');
  if (card) renderWorks(card.dataset.filter);
});

/* ================= Форма ================= */
const form = $('#pickForm'), msg = $('#formMsg');
let formStarted = 0, submitting = false;
form.addEventListener('focusin', () => { formStarted ||= Date.now(); });
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (submitting) return;
  const fd = new FormData(form);
  const nameOk = (fd.get('name') || '').trim().length > 1;
  const digits = (fd.get('phone') || '').replace(/\D/g, '');
  const phoneOk = /^(?:[78]\d{10}|\d{10})$/.test(digits);
  form.elements.name.classList.toggle('is-invalid', !nameOk);
  form.elements.phone.classList.toggle('is-invalid', !phoneOk);
  const say = (text, ok) => { msg.className = `form__msg ${ok ? 'is-ok' : 'is-err'}`; msg.textContent = text; };
  form.elements.name.setAttribute('aria-invalid', String(!nameOk));
  form.elements.phone.setAttribute('aria-invalid', String(!phoneOk));
  if (!nameOk || !phoneOk) {
    say(!nameOk ? 'Укажите имя (не менее двух букв)' : 'Укажите телефон: +7 и 10 цифр номера');
    (!nameOk ? form.elements.name : form.elements.phone).focus();
    return;
  }
  if (!fd.get('consent')) return say('Нужно согласие на обработку данных');

  const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => k.startsWith('utm_')));
  const data = { name: fd.get('name'), phone: fd.get('phone'), rooms: fd.getAll('rooms').join(', ') || 'не указано', complex: fd.get('complex'),
    consent: true, ads: !!fd.get('ads'), hp_field: fd.get('hp_field') || '', elapsed_ms: formStarted ? Date.now() - formStarted : 0, ...(typeof legalConsent === 'function' ? legalConsent() : {}), ...utm };
  if (SUBMIT_URL) {
    const btn = form.querySelector('[type=submit]');
    submitting = true; btn.disabled = true; form.setAttribute('aria-busy', 'true');
    say('Отправляем заявку…', true);
    const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
    try {
      const r = await fetch(SUBMIT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: ctrl.signal });
      clearTimeout(tm);
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || String(r.status));
      say('Спасибо! Менеджер перезвонит в ближайшее рабочее время.', true);
      form.reset(); formStarted = 0;
    } catch (e) {
      say(e.message === 'validation' ? 'Проверьте имя и телефон' : e.message === 'rate' ? 'Слишком много попыток, попробуйте позже' : 'Не удалось отправить. Позвоните нам: +7 914 275-78-77');
    } finally { clearTimeout(tm); submitting = false; btn.disabled = false; form.removeAttribute('aria-busy'); }
  } else {
    const body = `Имя: ${data.name}\nТелефон: ${data.phone}\nКвартира: ${data.rooms}\nЖК: ${data.complex}\nСогласие на обработку ПД: да (версия ${data.consent_version || '—'})\nСогласие на рекламу: ${data.ads ? 'да' : 'нет'}`;
    location.href = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent('Заявка с сайта: подбор квартиры')}&body=${encodeURIComponent(body)}`;
    say('Открываем почту для отправки заявки…', true);
    setTimeout(() => say(`Если почта не открылась — позвоните +7 914 275-78-77 или напишите на ${SALES_EMAIL}`, true), 2500);
  }
});

/* ================= Меню, шапка, плавная прокрутка ================= */
let lenis = null;
if (!reduceMotion && window.Lenis) lenis = new Lenis({ lerp: 0.09, anchors: false });

const header = $('#header'), menu = $('#menu'), menuBtn = $('#menuBtn');
const setMenu = (open) => {
  menu.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menu.inert = !open;
  menu.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  document.body.style.overflow = open ? 'hidden' : '';
  open ? lenis?.stop() : lenis?.start();
};
menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
setMenu(false);
document.addEventListener('keydown', (e) => {
  if (!menu.classList.contains('is-open')) return;
  if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); }
  if (e.key === 'Tab') {
    const links = [...menu.querySelectorAll('a[href]')];
    const first = links[0], last = links.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); menuBtn.focus(); }
    else if (e.shiftKey && document.activeElement === menuBtn) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menuBtn.focus(); }
    else if (!e.shiftKey && document.activeElement === menuBtn) { e.preventDefault(); first.focus(); }
  }
});
mqDesktop.addEventListener('change', () => { if (isDesktop()) setMenu(false); });

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.closest('.proj, .row') || e.defaultPrevented) return;
  const target = a.getAttribute('href') === '#top' ? document.body : $(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  setMenu(false);
  if (lenis) lenis.scrollTo(target, { duration: 1.6, force: true });
  else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
});

/* ================= Курсор и «магнитные» кнопки ================= */
const cursor = $('#cursor'), cursorLabel = $('#cursorLabel');
const mouse = { x: innerWidth / 2, y: innerHeight / 2 }, cur = { ...mouse }, prev = { ...mouse };
if (finePointer && !reduceMotion) {
  addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; cursor.classList.add('is-ready'); });
  document.addEventListener('mouseover', (e) => {
    const lab = e.target.closest('[data-cursor]');
    const link = e.target.closest('a:not(.logo):not(.footer__brand), button, label, input');
    cursor.classList.toggle('is-label', !!lab);
    cursor.classList.toggle('is-link', !lab && !!link);
    cursorLabel.textContent = lab ? lab.dataset.cursor : '';
  });
  $$('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ================= Появление элементов ================= */
$$('.sec-head, .perk, .career__title, .career__mail, .contacts__grid > *, .cta__grid > *, .roads__side, .hpanel--intro, .road__total')
  .forEach((el) => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  en.target.classList.add('is-visible');
  $$('[data-to]', en.target).forEach(countUp);
  if (en.target.dataset.to !== undefined) countUp(en.target);
  io.unobserve(en.target);
}), { threshold: 0.2 });
$$('.reveal, .proj, .step').forEach((el) => io.observe(el));

/* ================= Главный цикл: всё, что зависит от прокрутки ================= */
let lastY = 0;
function frame(t) {
  lenis?.raf(t);
  const y = scrollY, vh = innerHeight;

  // шапка: фон после первого экрана, прячется при прокрутке вниз
  header.classList.toggle('is-solid', y > 60);
  if (!menu.classList.contains('is-open')) header.classList.toggle('is-hidden', y > vh * 0.8 && y > lastY + 2 ? true : y < lastY - 2 ? false : header.classList.contains('is-hidden'));
  lastY = y;

  // горизонтальная лента ЖК — позиция задаётся прокруткой, работает и при prefers-reduced-motion
  if (isDesktop()) {
    const r = hsSection.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    laneTx = -p * (track.scrollWidth - innerWidth);
    track.style.transform = `translate3d(${laneTx}px,0,0)`;
    $('#hsProgress').style.transform = `scaleX(${p})`;
  }

  if (!reduceMotion) {
    // hero: лёгкий уход вверх
    if (y < vh) $('.hero__inner').style.transform = `translateY(${y * 0.25}px)`;

    // манифест
    const mTop = manifestTop() - y;
    const mp = clamp((vh * 0.85 - mTop) / (manifest.offsetHeight + vh * 0.35));
    const lit = Math.floor(mp * words.length * 1.05);
    words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));

    // стопка карточек: нижние «уходят» под следующую
    scards.forEach((c, i) => {
      const next = scards[i + 1];
      if (!next) return;
      const p = clamp(1 - (next.getBoundingClientRect().top - c.getBoundingClientRect().top) / c.offsetHeight);
      c.style.setProperty('--s', (1 - p * 0.06).toFixed(4));
      c.style.setProperty('--dim', (p * 0.45).toFixed(3));
    });

    // параллакс
    $$('[data-parallax]').forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      el.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * -el.dataset.parallax}px)`;
    });
  }

  // дорога рисуется по мере прокрутки
  const rr = road.getBoundingClientRect();
  roadFill.style.transform = `scaleY(${clamp((vh * 0.6 - rr.top) / rr.height)})`;
  steps.forEach((s) => s.classList.toggle('is-on', s.getBoundingClientRect().top < vh * 0.6));

  // курсор и превью портфолио
  if (finePointer && !reduceMotion) {
    cur.x += (mouse.x - cur.x) * 0.18; cur.y += (mouse.y - cur.y) * 0.18;
    cursor.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
    const vx = clamp((mouse.x - prev.x) * 0.4, -12, 12);
    prev.x += (mouse.x - prev.x) * 0.1; prev.y += (mouse.y - prev.y) * 0.1;
    preview.style.transform = `translate(${prev.x}px, ${prev.y}px) rotate(${vx}deg) scale(${preview.classList.contains('is-on') ? 1 : 0.6})`;
  }
  requestAnimationFrame(frame);
}

sizeHScroll();
addEventListener('resize', sizeHScroll);
addEventListener('load', sizeHScroll);
requestAnimationFrame(frame);
const fab = $('.fab'), fabHide = new Set();
const fabIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => (en.isIntersecting ? fabHide.add(en.target) : fabHide.delete(en.target)));
  fab.classList.toggle('is-hidden', fabHide.size > 0);
});
[$('#pick'), $('.footer')].forEach((el) => fabIO.observe(el));
$('#year').textContent = new Date().getFullYear();
