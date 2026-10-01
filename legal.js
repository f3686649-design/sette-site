/* ============================================================
   Юридический слой: cookie-баннер, фиксация согласий, подключение аналитики
   только после согласия. Тексты и реквизиты — заполнить перед публикацией.
   ============================================================ */
const LEGAL = {
  operator: '[[ООО «Специализированный застройщик «…»]]',   // сокращённое наименование оператора ПД — как в ЕГРЮЛ
  consentVersion: '0.1',        // версия текста consent.html — менять при каждой правке текста
  adsConsentVersion: '0.1',     // версия текста consent-ads.html
  cookieTextVersion: '0.1',     // версия текста cookie-баннера
  metrikaId: window.SETTE_CONFIG?.metrikaId || '',                // номер счётчика Яндекс Метрики; пусто — счётчик не подключается
  storageKey: 'sette_consent',
  ttlDays: 365,
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const read = () => { try { const v = JSON.parse(localStorage.getItem(LEGAL.storageKey) || 'null'); return v && Date.now() - v.ts < LEGAL.ttlDays * 864e5 && v.v === LEGAL.cookieTextVersion ? v : null; } catch { return null; } };
  const write = (choice) => { try { localStorage.setItem(LEGAL.storageKey, JSON.stringify({ choice, ts: Date.now(), v: LEGAL.cookieTextVersion })); } catch { /* приватный режим — выбор не сохранится, баннер покажется снова */ } };

  /* ---------- Аналитика: только после «Принять» ---------- */
  let analyticsLoaded = false;
  function loadAnalytics() {
    if (analyticsLoaded || !LEGAL.metrikaId) return;
    analyticsLoaded = true;
    // Стандартный код Яндекс Метрики. Вебвизор выключен: с ним нужна маскировка полей формы и отдельное описание в политике.
    const id = Number(LEGAL.metrikaId);
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a); })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + id, 'ym');
    ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
  }

  // Отзыв согласия: выключаем счётчик и стираем его cookie (обещание п. 8.3 политики)
  const YM_COOKIES = ['_ym_uid', '_ym_d', '_ym_isad'];
  const dropAnalytics = () => {
    if (LEGAL.metrikaId) window['disableYaCounter' + Number(LEGAL.metrikaId)] = true;
    const host = location.hostname.replace(/^www\./, '');
    YM_COOKIES.forEach((n) => { document.cookie = `${n}=; Max-Age=0; path=/`; document.cookie = `${n}=; Max-Age=0; path=/; domain=.${host}`; });
  };

  /* ---------- Баннер ---------- */
  const banner = document.createElement('div');
  banner.className = 'cookie'; banner.setAttribute('role', 'region'); banner.setAttribute('aria-label', 'Использование cookie'); banner.setAttribute('aria-labelledby', 'cookieTitle'); banner.setAttribute('aria-describedby', 'cookieText'); banner.tabIndex = -1;
  banner.innerHTML = `
    <h2 id="cookieTitle">Мы используем cookie</h2>
    <p id="cookieText">Технически необходимые cookie работают всегда. Аналитические cookie «Яндекс Метрики» (обработка по поручению — ООО «Яндекс», Москва): идентификатор посетителя, IP-адрес, действия на сайте — ставятся только с вашего согласия. Нажимая «Разрешить аналитику», вы даёте его ${LEGAL.operator} на условиях <a href="privacy.html">Политики обработки персональных данных</a> (раздел 8). Выбор хранится 12 месяцев; изменить его можно в «Настройках cookie» внизу страницы.</p>
    <div class="cookie__btns">
      <button type="button" class="pill pill--accent" data-choice="all">Разрешить аналитику</button>
      <button type="button" class="pill pill--outline" data-choice="necessary">Только необходимые</button>
    </div>`;
  if (!LEGAL.metrikaId) {
    banner.querySelector('#cookieText').textContent = 'Аналитика отключена. Сайт сохраняет только выбранные вами настройки cookie в этом браузере.';
    banner.querySelector('[data-choice="all"]').hidden = true;
    banner.querySelector('[data-choice="necessary"]').textContent = 'Понятно';
  }
  document.body.append(banner);
  let lastTrigger = null;
  const open = (byUser) => { banner.classList.add('is-open'); if (byUser) requestAnimationFrame(() => banner.querySelector('[data-choice]').focus()); };
  const close = () => { banner.classList.remove('is-open'); if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; } };
  banner.addEventListener('click', (e) => {
    const b = e.target.closest('[data-choice]'); if (!b) return;
    const wasAll = (read() || {}).choice === 'all';
    write(b.dataset.choice); close();
    if (b.dataset.choice === 'all') loadAnalytics();
    else if (analyticsLoaded || wasAll) { dropAnalytics(); location.reload(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && banner.classList.contains('is-open') && read()) close(); });

  const saved = read();
  if (saved) { if (saved.choice === 'all') loadAnalytics(); }
  else if (LEGAL.metrikaId) setTimeout(open, 1600);   // после заставки

  // «Настройки cookie» в подвале — отзыв или изменение согласия
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cookie-settings]'); if (t) { e.preventDefault(); lastTrigger = t; open(true); }
  });

  /* ---------- Данные о согласии для заявки (читает app.js при отправке) ---------- */
  window.legalConsent = () => ({
    consent_version: LEGAL.consentVersion,
    ads_consent_version: LEGAL.adsConsentVersion,
    cookie_choice: (read() || {}).choice || 'none',
    page: location.href,
    ts: new Date().toISOString(),
  });
})();
