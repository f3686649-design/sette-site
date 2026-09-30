/* ============================================================
   Юридический слой: cookie-баннер, фиксация согласий, подключение аналитики
   только после согласия. Тексты и реквизиты — заполнить перед публикацией.
   ============================================================ */
const LEGAL = {
  operator: '[[ООО «Специализированный застройщик «…»]]',   // сокращённое наименование оператора ПД — как в ЕГРЮЛ
  consentVersion: '0.1',        // версия текста consent.html — менять при каждой правке текста
  adsConsentVersion: '0.1',     // версия текста consent-ads.html
  cookieTextVersion: '0.1',     // версия текста cookie-баннера
  metrikaId: '',                // номер счётчика Яндекс Метрики; пусто — счётчик не подключается
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
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a); })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    ym(LEGAL.metrikaId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
  }

  /* ---------- Баннер ---------- */
  const banner = document.createElement('div');
  banner.className = 'cookie'; banner.setAttribute('role', 'dialog'); banner.setAttribute('aria-labelledby', 'cookieTitle'); banner.setAttribute('aria-describedby', 'cookieText');
  banner.innerHTML = `
    <h2 id="cookieTitle">Мы используем cookie</h2>
    <p id="cookieText">Технически необходимые cookie обеспечивают работу сайта и запоминают ваш выбор. Аналитические cookie сервиса «Яндекс Метрика» (ООО «Яндекс») — идентификатор посетителя, IP-адрес, сведения о браузере и действиях на сайте — устанавливаются только с вашего согласия и помогают нам улучшать сайт. Нажимая «Принять», вы даёте ${LEGAL.operator} согласие на их обработку на условиях <a href="privacy.html">Политики обработки персональных данных</a>. Изменить выбор можно в любой момент: ссылка «Настройки cookie» внизу страницы.</p>
    <div class="cookie__btns">
      <button type="button" class="pill pill--accent" data-choice="all">Принять</button>
      <button type="button" class="pill pill--outline" data-choice="necessary">Только необходимые</button>
    </div>`;
  document.body.append(banner);
  const open = () => banner.classList.add('is-open');
  const close = () => banner.classList.remove('is-open');
  banner.addEventListener('click', (e) => {
    const b = e.target.closest('[data-choice]'); if (!b) return;
    write(b.dataset.choice); close();
    if (b.dataset.choice === 'all') loadAnalytics();
  });

  const saved = read();
  if (saved) { if (saved.choice === 'all') loadAnalytics(); }
  else setTimeout(open, 1600);   // после заставки

  // «Настройки cookie» в подвале — отзыв или изменение согласия
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); open(); }
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
