# Академія Віки — нотатки для програмістів

**Проєкт** навчального сайту (термінологія clay shooting для організаторів і перекладачів турів ClayAway).
Потім переноситься в ClayArena і доопрацьовується. Тут — що є і як працює.

## Структура

| Шлях | Що це |
|---|---|
| `index.html` | застосунок: мапа місій, історія, терміни, квіз, «Переклади тренера», глосарій, XP/рівні, UA/EN. Один файл, без фреймворку. |
| `data/<module>.js` | 5 місій (sporting, compak, guns, technique, organizer); формат `data/SCHEMA.md` |
| `data/check.mjs` | перевірка даних: дублікати id, биті `related`/`[[term]]`, мова (`cd data && bun check.mjs`) |
| `data/export.mjs` | збирає `glossary.json` — чернетку глосарію ClayArena |
| `glossary/` | статичні SEO-сторінки: список і сторінка на кожен термін (генерує `scripts/build_seo.mjs`) |
| `sitemap.xml`, `robots.txt` | генерує `scripts/build_seo.mjs` |
| `og-image.png`, іконки | превʼю для месенджерів (`scripts/make_og.py`) |

Перебудова після зміни даних: `cd data && bun check.mjs && bun export.mjs && cd .. && bun scripts/build_seo.mjs`.

## Логіка застосунку (`index.html`)
- `window.ACADEMY` — модулі з `data/*.js`; `TERMS` — усі терміни за id (перший модуль виграє; дублікати — у `glossary.json → also_in`).
- Історія: `[[term-id]]` / `[[term-id|label]]` у тексті → кнопки, що відкривають картку терміна.
- Прогрес у `localStorage` «vika-academy»: XP (сцена 10, термін 5, правильна відповідь 15, вправа 10), рівні Rookie → ClayAway Master.
- У ClayArena: прогрес — у профілі користувача; бейдж «Пройшов Академію» в профілі організатора/перекладача.

## Глосарій → ClayArena
- `glossary.json` / `glossary/<id>/` → таблиця `glossary_terms` і сторінки `/glossary/<term>/` на clayarena.com (індексуються, `DefinedTerm`).
- Терміни з `verify: true` (136) звірити з довідником правил FITASC (проєкт ClayAway, `docs/rules/`), наприклад:
  у Compak **немає** правила «низької рушниці» та мітки на жилеті (є лише в Sporting) — у модулі compak це треба виправити.
- 15 дублікатів id злити в один запис.

## Легальність
Терміни й тексти — власний контент ClayArena. Посилання на FITASC — `nofollow`; текст регламентів не копіюємо. Російську мову не використовуємо.
