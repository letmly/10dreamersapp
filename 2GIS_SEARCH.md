# 2GIS Places Search API - Получение реальных координат

## Зачем это нужно

Gemini AI генерирует названия мест, но координаты могут быть неточными. Используйте 2GIS Places API для поиска реальных координат по названию.

## Функция поиска

Создана утилита: `src/lib/2gis/search.ts`

### `searchPlace(query, city)`

Ищет место по названию и возвращает реальные координаты из 2GIS.

```typescript
import { searchPlace } from '@/lib/2gis/search'

const result = await searchPlace('Эрмитаж', 'saint-petersburg')

if (result) {
  console.log(result.name)         // "Государственный Эрмитаж"
  console.log(result.coordinates)  // { lat: 59.9398, lon: 30.3146 }
  console.log(result.address)      // "Дворцовая площадь, 2"
}
```

### `searchPlaces(queries[], city)`

Ищет несколько мест сразу с задержкой между запросами.

```typescript
const places = ['Эрмитаж', 'Петропавловская крепость', 'Исаакиевский собор']
const results = await searchPlaces(places, 'saint-petersburg')
```

## API Endpoint

**URL:** `https://catalog.api.2gis.com/3.0/items`

**Параметры:**
- `q` - поисковый запрос (название места)
- `region_id` - ID региона (38 = СПб, 1 = Москва)
- `type` - типы объектов (branch,building,attraction)
- `fields` - дополнительные поля (items.point,items.address)
- `key` - API ключ
- `page_size` - количество результатов (берем 1 - лучший)

## Пример ответа API

```json
{
  "result": {
    "items": [
      {
        "id": "141265769972127",
        "name": "Государственный Эрмитаж",
        "address_name": "Дворцовая площадь, 2",
        "point": {
          "lat": 59.9398245,
          "lon": 30.3146347
        },
        "type": "branch"
      }
    ]
  }
}
```

## Интеграция с генерацией маршрутов

### Вариант 1: После генерации Gemini

```typescript
// 1. Gemini генерирует маршрут с названиями мест
const geminiRoute = await generateRoute(answers)

// 2. Ищем реальные координаты для каждой точки
for (const point of geminiRoute.points) {
  const realPlace = await searchPlace(point.name, 'saint-petersburg')

  if (realPlace) {
    // Обновляем координаты на реальные
    point.coordinates = {
      lat: realPlace.coordinates.lat,
      lon: realPlace.coordinates.lon,
    }
    // Обновляем адрес если нужно
    if (realPlace.address) {
      point.address = realPlace.address
    }
  }
}
```

### Вариант 2: В systemPrompt для Gemini

Можно попросить Gemini возвращать только названия, а координаты получать через 2GIS:

```typescript
const systemPrompt = `
Верните маршрут в JSON формате:
{
  "points": [
    {
      "name": "Эрмитаж", // ТОЛЬКО название
      "description": "...",
      // НЕ ВКЛЮЧАЙТЕ coordinates - мы получим их через 2GIS
    }
  ]
}
`
```

Потом добавить координаты:

```typescript
const route = await gemini.generateRoute(...)
route.points = await Promise.all(
  route.points.map(async (point) => {
    const place = await searchPlace(point.name, 'saint-petersburg')
    return {
      ...point,
      coordinates: place?.coordinates || { lat: 59.9386, lon: 30.3141 }
    }
  })
)
```

## Лимиты API

**Бесплатный тариф:** Скорее всего есть лимит на количество запросов

**Рекомендации:**
- Используйте задержки между запросами (300ms)
- Кешируйте результаты для популярных мест
- Не делайте массовые запросы

## Логирование

Все запросы логируются в консоль:

```
2GIS Places Search: { query: 'Эрмитаж', url: '...' }
2GIS Places response: { result: {...} }
2GIS place found: { name: '...', coordinates: {...} }
```

## Fallback

Если место не найдено:
- Функция вернет `null`
- Используйте координаты от Gemini или координаты центра города
- Добавьте логирование для отладки

## Города

**Доступные region_id:**
- `38` - Санкт-Петербург
- `1` - Москва
- `4` - Екатеринбург
- `67` - Новосибирск
- И другие города России

Полный список: https://catalog.api.2gis.com/3.0/regions
