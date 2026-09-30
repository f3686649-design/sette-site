// readiness — строительная готовность: pct (%), date, src (источник), url — карточка объекта в ЕИСЖС (заполнить).
// Имена с .normalize('NFD'): на sette.su эти файлы лежат под «разложенными» именами (загружены с Mac).
// Контент перенесён с https://sette.su (сентябрь 2026). Фото пока берутся напрямую с sette.su —
// при переезде на новый хостинг скачать папку wp-content/uploads и заменить BASE на локальный путь.
const BASE = 'https://sette.su/wp-content/uploads/';

const OBJECTS = [
  // ---------- Строящиеся ----------
  {
    id: 'prime', geo: { lat: 62.010546, lon: 129.717443, approx: false }, readiness: { pct: 75, date: 'сентябрь 2026', src: 'данные компании' }, status: 'building', type: 'residential',
    developer: 'ООО СЗ «АРМА»', eisgs: 'https://xn--80az8a.xn--d1aqf.xn--p1ai/сервисы/каталог-новостроек/объект/70397',
    pd: { number: '14-000434', date: '16.09.2026', url: 'https://xn--80az8a.xn--d1aqf.xn--p1ai/api/ext/file/70726F6A6465636C2E646F63732E697A643AE29D9DE32298487EAFEC8BEF5E5BB498' },   // проектная декларация (ЕИСЖС, проверено 30.09.2026)
    eisgsPlan: { commissioning: '31.12.2027', keys: '31.03.2028', flats: 194 },   // плановый ввод и передача ключей по ЕИСЖС
    progress: [
      {"ym": "2026-03", "label": "март 2026", "placed": "02.03.2026", "n": 7, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AF106CAB1AE284DFD83950EC0BCA7E532%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-04", "label": "апрель 2026", "placed": "02.04.2026", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AEBB01163E33D4435AA1C0A6C5E0F6DEF%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-05", "label": "май 2026", "placed": "04.05.2026", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643ADBDF5353FA604B878A9D4DC1DFCCE66C%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-06", "label": "июнь 2026", "placed": "03.06.2026", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AFAD6C0E50EBD40C1A33191C03424295B%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-07", "label": "июль 2026", "placed": "03.07.2026", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A811CDE1BBC0843029451D430231CFBA3%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-08", "label": "август 2026", "placed": "04.09.2026", "n": 1, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A9C305A0FAD9E4D23818002DA64E99CA5%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-09", "label": "сентябрь 2026", "placed": "04.09.2026", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AEC610B5FC10D49059B1253E1A9E2E2D9%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}
    ],   // обложки ежемесячных фотоотчётов ЕИСЖС (resizer наш.дом.рф, 800px)
    title: 'ЖК «Прайм»', subtitle: 'Квартал 122, район Залог',
    deadline: '4 кв. 2027', floors: '16', buildings: 1, entrances: 1, material: 'Кирпично-монолитный',
    address: 'Пересечение улиц Гастелло и Матросова',
    text: 'Один 16-этажный дом в районе Залог с видом на Зелёный луг. Дом для тех, кому важны качество, продуманность и приватная изысканность: интерьеры созданы на основе философии спокойствия, порядка и гармонии. 10 минут езды до улицы Кирова.',
    infra: ['Школа', 'Детские сады', 'Аптека', 'ТРК «Азия»', 'Продуктовые магазины', 'Салоны красоты'],
    cover: '2026/05/Фасады_page-00131-scaled.jpg',
    gallery: ['2026/08/8-1-scaled.jpg', '2026/08/1-2-scaled.jpg', '2026/08/5-scaled.jpg', '2026/08/14-scaled.jpg', '2026/08/Игровая-комната-7.jpg'],
    url: 'https://sette.su/2026/08/14/prime/'
  },
  {
    id: 'gastello', geo: { lat: 62.011194, lon: 129.719062, approx: true }, readiness: { pct: 70, date: 'сентябрь 2026', src: 'данные компании' }, status: 'building', type: 'residential',
    developer: 'ООО СЗ «ДСО СЭТТЭ»', eisgs: 'https://xn--80az8a.xn--d1aqf.xn--p1ai/сервисы/каталог-новостроек/объект/64967',
    pd: { number: '14-000410', date: '16.09.2026', url: 'https://xn--80az8a.xn--d1aqf.xn--p1ai/api/ext/file/70726F6A6465636C2E646F63732E697A643A794CA7C1DAB84E3F9681FEE204EA0717' },   // проектная декларация (ЕИСЖС, проверено 30.09.2026)
    eisgsPlan: { commissioning: '31.12.2027', keys: '31.03.2028', flats: 118 },   // плановый ввод и передача ключей по ЕИСЖС
    progress: [
      {"ym": "2025-03", "label": "март 2025", "placed": "04.04.2025", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A2569F034FE464410819EFEC9228FEA29%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-04", "label": "апрель 2025", "placed": "04.04.2025", "n": 2, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A7F16CFDF41284A7AB32FAE1BBD3C97CD%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-05", "label": "май 2025", "placed": "05.05.2025", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AA7D5A8BC71754F1E823275F381BC711F%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-06", "label": "июнь 2025", "placed": "04.06.2025", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AB9D2100D3100415A800908454DA1D05F%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-07", "label": "июль 2025", "placed": "03.07.2025", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A1D77814863304BCFB118ED3C4A6A3A14%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-08", "label": "август 2025", "placed": "06.08.2025", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643ADBD9C0FD32A04459BA36539775FC0184%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-09", "label": "сентябрь 2025", "placed": "02.09.2025", "n": 2, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A5136A37FCE50432DB1AE7DC12DC95EED%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-10", "label": "октябрь 2025", "placed": "03.10.2025", "n": 5, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643ABFFA5FFD259748A3809EC466DC02FAFA%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-11", "label": "ноябрь 2025", "placed": "05.11.2025", "n": 13, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A586737135B7D4D538D61A39177759B28%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-12", "label": "декабрь 2025", "placed": "04.12.2025", "n": 5, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643ACD224761897242E7B941988C605A5294%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-01", "label": "январь 2026", "placed": "13.01.2026", "n": 9, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A821D1F99A641473D8DED77D225482EE5%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-02", "label": "февраль 2026", "placed": "03.02.2026", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A5921E818AC9B4FF1BE309F2E42D757C8%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-03", "label": "март 2026", "placed": "03.03.2026", "n": 6, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A938B1BA871D54450A58080FAF842458D%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-04", "label": "апрель 2026", "placed": "02.04.2026", "n": 5, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A30AF31DF55CC436A8C7741F5A4BE9801%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-05", "label": "май 2026", "placed": "04.05.2026", "n": 9, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A68A3FCCEBAD14693930E8407553D5A60%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-06", "label": "июнь 2026", "placed": "02.06.2026", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A73F657CCBA684D348CB66F584390C336%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-07", "label": "июль 2026", "placed": "03.07.2026", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A7FB5221CDE8B45569469675C9CB5D42B%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-09", "label": "сентябрь 2026", "placed": "02.09.2026", "n": 9, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A313CF61F3AD14DBB96934D029C3960A8%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}
    ],   // обложки ежемесячных фотоотчётов ЕИСЖС (resizer наш.дом.рф, 800px)
    title: 'ЖК на Гастелло', subtitle: '1 этап, район Залог',
    deadline: '4 кв. 2026', floors: '16', buildings: 2, entrances: 2, material: 'Кирпично-монолитный',
    address: 'ул. Гастелло, район Залог',
    text: 'Два современных 16-этажных дома с видом на Зелёный луг. Рядом магазины, школы, детские сады и остановки общественного транспорта. Архитектура с акцентом на эстетику и функциональность.',
    infra: ['Школа', 'Детские сады', 'Продуктовые магазины', 'Остановки транспорта'],
    cover: 'https://sette.su/wp-content/uploads/2025/04/%D0%97%E2%80%A0%C2%A7%E2%89%A0%C2%AE%C2%A9-%D0%B4%D0%93%CC%81%E2%89%A0-copy-scaled.jpg',
    gallery: ['2026/02/3-первый-этап-6-2-scaled.jpg'.normalize('NFD'), '2025/09/Lobbi_2_006_00001-scaled.jpg', '2025/04/D5_Image_20240411_143347-copy.jpg'],
    url: 'https://sette.su/2025/04/05/gastello/'
  },
  {
    id: 'sosnovy', geo: { lat: 62.032791, lon: 129.647930, approx: false }, readiness: { pct: 90, date: 'сентябрь 2026', src: 'данные компании' }, status: 'building', type: 'residential',
    developer: 'ООО СЗ «СИТИ»', eisgs: 'https://xn--80az8a.xn--d1aqf.xn--p1ai/сервисы/каталог-новостроек/объект/61727',
    pd: { number: '14-000395', date: '16.09.2026', url: 'https://xn--80az8a.xn--d1aqf.xn--p1ai/api/ext/file/70726F6A6465636C2E646F63732E697A643A54F83795369A4B84AF284DC27BE6C246' },   // проектная декларация (ЕИСЖС, проверено 30.09.2026)
    eisgsPlan: { commissioning: '31.12.2026', keys: '31.12.2026', flats: 454 },   // плановый ввод и передача ключей по ЕИСЖС
    progress: [
      {"ym": "2024-09", "label": "сентябрь 2024", "placed": "04.09.2024", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A41038043C94443D6ADDB19EB6855396D%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2024-10", "label": "октябрь 2024", "placed": "04.10.2024", "n": 8, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AB96CB2F096924754940527D49435FC78%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2024-11", "label": "ноябрь 2024", "placed": "02.11.2024", "n": 12, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AC3D770A5CEC54D00BC7C7D80A51DF95D%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2024-12", "label": "декабрь 2024", "placed": "05.12.2024", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643ABB5D008629484531A8FB10816B4C32D4%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-01", "label": "январь 2025", "placed": "19.02.2025", "n": 1, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A9319FF5C38074822817687B86C1DB162%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-02", "label": "февраль 2025", "placed": "04.02.2025", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A7FAD2EC04F7E4A0CA1C00BAB33AD6A0C%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-03", "label": "март 2025", "placed": "04.03.2025", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A74B28F2AB63C4D1B95E7A360171AFA44%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-04", "label": "апрель 2025", "placed": "04.04.2025", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A458AA42F7C734CE69CA6CB6A30E52632%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-05", "label": "май 2025", "placed": "05.05.2025", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AA71B6664C55447CE93021C3AF2869576%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-06", "label": "июнь 2025", "placed": "04.06.2025", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A1739D9DC5CE348598F1E42C7B0044475%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-07", "label": "июль 2025", "placed": "03.07.2025", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A9EFF5B0D00B14CDFB7D1B956899D8CA0%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-08", "label": "август 2025", "placed": "06.08.2025", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A4F1E5118B6EA43CFB1680092D1D330EC%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-09", "label": "сентябрь 2025", "placed": "02.09.2025", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A89B7C96DF055476492EC7A69CC0CB8EC%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-10", "label": "октябрь 2025", "placed": "03.10.2025", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A3BA25C65EAFF46669FA239DF623A2480%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-11", "label": "ноябрь 2025", "placed": "05.11.2025", "n": 10, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A9AE09C7DE30E416E908F7E6F1CEFAB07%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2025-12", "label": "декабрь 2025", "placed": "04.12.2025", "n": 3, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AD6CB9148ACD64A3BAA1F47108BC95368%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-01", "label": "январь 2026", "placed": "13.01.2026", "n": 10, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A4920F85ED7C24028A6EC99DA19956ED4%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-02", "label": "февраль 2026", "placed": "02.02.2026", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AA99B529A650341279B4BDA7A0AA59E89%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-03", "label": "март 2026", "placed": "03.03.2026", "n": 6, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A31CDD56A81194914BFB92C7A17504D7C%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-04", "label": "апрель 2026", "placed": "02.04.2026", "n": 5, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A585B5E43CFA14510A8153A219A3F03EC%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-05", "label": "май 2026", "placed": "04.05.2026", "n": 17, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A9966C4CD22EA4C389AD8B1A4FF6004B6%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-06", "label": "июнь 2026", "placed": "02.06.2026", "n": 4, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AEAB61D24814D42BA82B637512439D378%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-07", "label": "июль 2026", "placed": "03.07.2026", "n": 6, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643A9900415DC48C402494517CB8FD186929%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}, 
      {"ym": "2026-09", "label": "сентябрь 2026", "placed": "02.09.2026", "n": 15, "url": "https://xn--80az8a.xn--d1aqf.xn--p1ai/resizer/image?imageUrl=https%3A%2F%2Fxn--80az8a.xn--d1aqf.xn--p1ai%2Fapi%2Fext%2Ffile%2F70726F6A6465636C2E646F63732E697A643AD0A5254C318044D5ABE07D408E725B0B%3Ftype%3Dpng&systemClientId=portal-client&config=resize:fill:800:0"}
    ],   // обложки ежемесячных фотоотчётов ЕИСЖС (resizer наш.дом.рф, 800px)
    title: 'ЖК «Сосновый бор»', subtitle: 'ул. Три Сосны',
    deadline: '4 кв. 2026', floors: '5–16', buildings: 1, entrances: 7, material: 'Кирпично-монолитный',
    address: 'ул. Три Сосны',
    text: 'Одно здание переменной этажности (5, 6, 10, 13 и 16 этажей) на 7 подъездов в экологически чистом, развивающемся районе. Благоустроенная территория, зоны отдыха и близость к природе.',
    infra: ['Школа', 'Детский сад', 'Скверы', 'Продуктовые магазины'],
    cover: '2025/05/15.jpg',
    gallery: ['2025/05/19.jpg', '2025/05/17.jpg', '2025/05/14.jpg', '2025/05/12.jpg'],
    url: 'https://sette.su/2025/05/23/sosnovy-bor/'
  },

  // ---------- Введённые жилые ----------
  { id: 'chekhov', geo: { lat: 62.023820, lon: 129.687037, approx: false }, status: 'done', type: 'residential', title: 'ул. Чехова', subtitle: 'ООО СЗ «Феррис»', year: '1 кв. 2026', floors: '16', entrances: 2,
    text: '16-этажный дом в 15 минутах ходьбы от Студенческого городка. Рядом школы и лицей, детские сады, сквер Матери.',
    cover: '2024/08/Фасад-1-scaled.jpg', gallery: ['2024/08/Фасад-2-scaled.jpg', '2024/08/Фасад-4-scaled.jpg', '2024/08/Детская-площадка-scaled.jpg'], url: 'https://sette.su/2024/08/08/chekhov/' },
  { id: 'kv11', geo: { lat: 61.997696, lon: 129.690661, approx: true }, status: 'done', type: 'residential', title: 'Квартал 11', subtitle: 'Многоквартирный жилой дом', year: '1 кв. 2026', floors: '16', entrances: 2,
    text: '16-этажный дом в 15 минутах езды от центра. В шаговой доступности школа, детский сад, супермаркеты и остановки. Есть 3D-тур.',
    cover: '2024/10/1111-9-копия.jpg', gallery: ['2024/10/9.png', '2024/10/10.png', '2024/10/5.png'], url: 'https://sette.su/2024/10/27/kvartal11/' },
  { id: 'popova', geo: { lat: 62.043640, lon: 129.753223, approx: false }, status: 'done', type: 'residential', title: 'ул. Федора Попова', subtitle: 'ООО СЗ «Арма»', year: '3 кв. 2025', floors: '16', entrances: 1,
    text: '16-этажный дом в самом центре, за Крытым рынком. Рядом площадь Победы, школа, детские сады и магазины.',
    cover: '2024/08/5-1-scaled.jpg', gallery: ['2024/08/4-1-scaled.jpg', '2024/08/3-2-scaled.jpg', '2024/08/1-4-scaled.jpg'], url: 'https://sette.su/2024/08/08/fedora-popova/' },
  { id: 'ilmenskaya', geo: { lat: 62.031958, lon: 129.660726, approx: false }, status: 'done', type: 'residential', title: 'Квартал 76, Ильменская', subtitle: 'ООО СЗ «Айсар»', year: '4 кв. 2024', floors: '9', buildings: 5,
    text: 'Пять 9-этажных домов на пересечении Ильменской и Билибина. Видеонаблюдение, дизайнерские вестибюли, бесшумные лифты.',
    cover: '2024/08/76-SZ-AISAR-5-scaled.jpg', gallery: ['2024/08/76-SZ-AISAR-9-scaled.jpg', '2024/08/76-SZ-AISAR-3-1-scaled.jpg', '2024/08/76-SZ-AISAR-11-scaled.jpg'], url: 'https://sette.su/2024/07/20/ilmenskaya/' },
  { id: 'kv65', geo: { lat: 62.005770, lon: 129.691064, approx: false }, status: 'done', type: 'residential', title: 'Квартал 65, пр. М. Николаева 2/3', subtitle: 'ООО СЗ «Проф-Строй»', year: '2023–2024', floors: '16', buildings: 2, area: '5 905,23', flats: 123,
    text: 'Два 16-этажных дома в 10 минутах от центра. Рядом новая школа на 990 мест и парк-музей «Россия — моя история».',
    cover: '2024/08/21-scaled.jpg', gallery: ['2024/08/10-1-scaled.jpg', '2024/08/51-scaled.jpg', '2024/08/31-scaled.jpg'], url: 'https://sette.su/2024/08/08/kvartal65/' },
  { id: 'petra5', geo: { lat: 62.049148, lon: 129.715554, approx: false }, status: 'done', type: 'residential', title: 'ул. Петра Алексеева, дом 5', subtitle: 'ООО СЗ «Сэттэ»', year: '2023–2024', floors: '9 и 16', buildings: 2,
    text: 'Жилой комплекс в 16-м квартале за рынком «Манньыаттаах». На первом этаже — коммерческие помещения.',
    cover: '2024/08/2023.04.18-Эскизный-альбом-ЖД-№5-17-scaled.jpg', gallery: ['2024/08/2023.04.18-Эскизный-альбом-ЖД-№5-15-scaled.jpg', '2024/08/HALL-1_2.jpg', '2024/08/HALL-1_8.jpg'], url: 'https://sette.su/2024/08/08/petra-alekseeva/' },
  { id: 'petra68', geo: { lat: 62.048988, lon: 129.716402, approx: true }, status: 'done', type: 'residential', title: 'ул. Петра Алексеева 68-4', subtitle: 'Дом 3', year: '2023', area: '2 769,42', flats: 60,
    cover: '2024/08/2023.03.27-Эскизный-альбом-ЖД-№3-20.jpg'.normalize('NFD'), gallery: ['2024/08/2023.03.27-Эскизный-альбом-ЖД-№3-19.jpg'.normalize('NFD'), '2024/08/2023.03.27-Эскизный-альбом-ЖД-№3-17.jpg'], url: 'https://sette.su/2024/08/08/petra-alekseeva-vveden/' },
  { id: 'ridz', geo: { lat: 62.049073, lon: 129.721115, approx: false }, status: 'done', type: 'residential', title: 'ул. Рыдзинского 22А, 22Б, 22В', subtitle: 'Жилой комплекс в квартале 16', year: '2022', area: '21 870,63', flats: 429,
    cover: '2024/08/5ф-1-scaled.jpg', gallery: ['2024/08/4ф-1-scaled.jpg', '2024/08/3-2-1-scaled.jpg', '2024/08/9-2-1-scaled.jpg'], url: 'https://sette.su/2024/08/08/ridzinskogo/' },
  { id: 'gubina', geo: { lat: 62.041028, lon: 129.748343, approx: false }, status: 'done', type: 'residential', title: 'ул. Губина 11', subtitle: 'Жилой комплекс', year: '2019', area: '20 786,8', flats: 286,
    cover: '2024/08/Губина-1-scaled.jpg', gallery: ['2024/08/Губина-3-scaled.jpg', '2024/08/Губина-5-scaled.jpg', '2024/08/Губина-7-scaled.jpg'], url: 'https://sette.su/2024/08/14/gubina/' },

  // ---------- Социальные ----------
  { id: 'cardio', geo: { lat: 62.007419, lon: 129.663023, approx: true }, status: 'done', type: 'social', title: 'Кардиологический диспансер', subtitle: 'г. Якутск', year: '2022', area: '17 124,44',
    cover: '2024/08/разворот-127_1-topaz-high-compression-2x.png', gallery: ['2024/08/разворот-127_2-topaz-high-compression-2x.png'], url: 'https://sette.su/2024/08/14/cardio-center/' },
  { id: 'sergeleh', geo: { lat: 62.097667, lon: 126.690231, approx: true }, status: 'done', type: 'social', title: '«Сергелях»', subtitle: 'с. Бердигестях', year: '2021', area: '6 509',
    cover: '2024/08/Цветовой-баланс-1.png'.normalize('NFD'), gallery: ['2024/08/Яркость_Контрастность-1.png'], url: 'https://sette.su/2024/08/14/sergeleeh/' },
  { id: 'oktem', geo: { lat: 61.675286, lon: 129.423740, approx: true }, status: 'done', type: 'social', title: 'Школа-сад', subtitle: 'с. Октемцы', year: '2021', area: '5 325,50',
    cover: '2024/10/Школа-в-Октемсах.jpg', gallery: ['2024/08/октемцы-2.png', '2024/08/октемцы-3.png'], url: 'https://sette.su/2024/08/14/scool-octem/' },
  { id: 'petrovka', geo: { lat: 61.730222, lon: 130.269649, approx: true }, status: 'done', type: 'social', title: 'Школа', subtitle: 'с. Петровка', year: '2019', area: '4 063,83',
    cover: '2024/08/петровка-1-topaz-high-compression-2x.png', gallery: ['2024/08/Слой-1-1.png'.normalize('NFD')], url: 'https://sette.su/2024/08/14/scool-petrovka/' },
  { id: 'school5', geo: { lat: 62.033524, lon: 129.736064, approx: false }, status: 'done', type: 'social', title: 'Пристрой к школе №5', subtitle: 'г. Якутск', year: '2022', area: '2 772,56',
    cover: '2024/08/Слой-1.png'.normalize('NFD'), gallery: ['2024/08/Слой-2.png'.normalize('NFD'), '2024/08/Слой-3.png'.normalize('NFD')], url: 'https://sette.su/2024/08/14/scool5/' },

  // ---------- Коммерческие ----------
  { id: 'asia', geo: { lat: 62.005086, lon: 129.716085, approx: false }, status: 'done', type: 'commercial', title: 'ТРК «Азия»', subtitle: 'Покровский тракт', year: '2015', area: '14 000',
    text: 'Один из крупнейших торговых центров Якутии: более 60 магазинов, 5-зальный кинотеатр, фуд-корт, детские зоны и парковка, полностью закрывающая потребность посетителей.',
    cover: '2024/08/ТЦАзия-scaled.jpg', gallery: ['2024/08/ТЦАзия_44-scaled.jpg', '2024/08/ТЦАзия_2-scaled.jpg', '2024/08/BYW_2577-scaled.jpg'], url: 'https://sette.su/2024/08/15/asia/' }
];

// ООО ДРСУ «Сэттэ»: проложено дорог по годам, м (со страницы /2024/08/13/road/)
const ROADS = [
  { year: 2020, m: 1938, works: 'Реконструкция перекрёстков Пояркова — Курашова и Пояркова — П. Алексеева; кольцевая развязка П. Алексеева — Стадухина — Пирогова; ремонт ул. Губина' },
  { year: 2021, m: 3597, works: 'Ремонт ул. Луговая; дороги Сайсарского и Строительного округов (Шевченко, Широких-Полянского, Клары Цеткин, Рыдзинского, Кутузова); ул. Олега Кошевого в Мархе' },
  { year: 2022, m: 6499, works: 'Ремонт ул. Билибина (2-я очередь) и Очиченко; капремонт ул. Маяковского, Якова Потапова, Труда' },
  { year: 2023, m: 10319, works: 'Капремонт ул. Островского; сквер Газовиков с парковкой; подъезд к Онкологическому центру; участок а/д «Нам» км 44–54' }
];

// Офис: Якутск, ул. Кирова 18, блок В (OSM). Координаты объектов: консенсус трёх геокодеров
// (OSM Nominatim, Overpass, публичные карты) и 2ГИС-виджетов sette.su; approx: true — здание не подтверждено,
// показывается как «примерно». Уточнить у отдела продаж перед публикацией.
const OFFICE_GEO = { lat: 62.029537, lon: 129.728021 };
