# Routing Quick Reference

## Ключевые параметры маршрутов

### Минимальный набор для построения маршрута

```typescript
// 1. Список мест для посещения
const places: Place[] = [hermitage, fortress, palace]

// 2. Настройки маршрута
const options: RouteOptions = {
  transportMode: 'walking',  // ОБЯЗАТЕЛЬНО
  startLocation: { lat: 59.9343, lng: 30.3351 },  // Рекомендуется
  optimize: true  // Оптимизировать порядок
}

// 3. Создать маршрут
const route = createRoute(places, options)
```

### Структура Route (что получаете)

```
Route
├── id: "route-123"
├── name: "Исторический центр"
├── places: Place[]              ← Точки в порядке посещения
├── distance: 3.5                ← Общая длина (км)
├── estimatedTime: 180           ← Время (минуты)
├── difficulty: "easy"           ← Сложность
├── transportMode: "walking"     ← Способ передвижения
├── color: "#10b981"            ← Цвет линии на карте
└── polyline: {                  ← Для отрисовки
      coordinates: [            ← Массив точек линии
        { lat: 59.94, lng: 30.31 },
        { lat: 59.95, lng: 30.32 },
      ],
      segments: [               ← Детали по участкам
        {
          startPlaceId: "1",
          endPlaceId: "2",
          distance: 1.5,
          duration: 60,
          polyline: [...]
        }
      ]
    }
```

### Отрисовка на карте (Leaflet)

```typescript
// 1. Рисуем линию маршрута
const polyline = L.polyline(
  route.polyline.coordinates.map(c => [c.lat, c.lng]),
  { color: route.color, weight: 4 }
).addTo(map)

// 2. Добавляем маркеры точек
route.places.forEach((place, i) => {
  L.marker([place.coordinates.lat, place.coordinates.lng])
    .bindPopup(`${i + 1}. ${place.name}`)
    .addTo(map)
})

// 3. Центрируем карту на маршруте
const bounds = L.latLngBounds(
  route.polyline.coordinates.map(c => [c.lat, c.lng])
)
map.fitBounds(bounds, { padding: [50, 50] })
```

### Запуск маршрута (Store)

```typescript
// 1. Начать маршрут
const { startRoute } = useRouteStore()
startRoute(route, userLocation)

// 2. Отметить посещение
const { visitPlace } = useRouteStore()
visitPlace(placeId)

// 3. Получить прогресс
const { activeRoute } = useRouteStore()
console.log(`${activeRoute.progress}% завершено`)
```

### Отслеживание прогресса

```typescript
const { activeRoute } = useRouteStore()
const { latitude, longitude } = useGeolocation()

// Проверяем близость к следующей точке
const nextPlace = activeRoute.route.places[activeRoute.currentPlaceIndex]
const distance = calculateDistance(
  latitude, longitude,
  nextPlace.coordinates.lat, nextPlace.coordinates.lng
)

if (distance < 0.1) { // Меньше 100м
  visitPlace(nextPlace.id)
  updateCurrentPlace(activeRoute.currentPlaceIndex + 1)
}
```

## Режимы передвижения

| Mode | Скорость | Emoji | Использование |
|------|----------|-------|---------------|
| `walking` | 5 км/ч | 🚶 | Пешие экскурсии, центр города |
| `cycling` | 15 км/ч | 🚴 | Велопрогулки, парки |
| `driving` | 40 км/ч | 🚗 | Удаленные места |
| `transit` | 25 км/ч | 🚌 | Общественный транспорт |

## Сложность маршрута

Автоматически определяется:

| Сложность | Расстояние | Время | Цвет |
|-----------|------------|-------|------|
| `easy` | < 3 км | < 60 мин | 🟢 #10b981 |
| `medium` | 3-10 км | 60-180 мин | 🟠 #f59e0b |
| `hard` | > 10 км | > 180 мин | 🔴 #ef4444 |

## Чек-лист для реализации маршрута

- [ ] Создать массив мест `Place[]`
- [ ] Настроить `RouteOptions` с transportMode
- [ ] Создать маршрут через `createRoute()`
- [ ] Отрисовать polyline на карте
- [ ] Добавить маркеры для точек
- [ ] Запустить через `startRoute()`
- [ ] Отслеживать геолокацию
- [ ] Обновлять прогресс через `visitPlace()`
- [ ] Показывать UI с прогрессом
- [ ] Обработать завершение маршрута

## API для продакшена

### OSRM (Open Source, бесплатно)
```
GET https://router.project-osrm.org/route/v1/walking/
  30.3146,59.9398;30.3164,59.9504
  ?overview=full&geometries=geojson
```

### Google Directions API (платно)
```javascript
const directionsService = new google.maps.DirectionsService()
directionsService.route({
  origin: start,
  destination: end,
  waypoints: waypoints,
  travelMode: 'WALKING',
  optimizeWaypoints: true
})
```

### Mapbox Directions API (платно)
```
GET https://api.mapbox.com/directions/v5/mapbox/walking/
  30.3146,59.9398;30.3164,59.9504
  ?access_token=YOUR_TOKEN
```

## Важные примечания

⚠️ **Сейчас:** Прямые линии между точками
✅ **Продакшен:** Интегрировать реальный routing API

⚠️ **Оптимизация:** Жадный алгоритм (хорош до ~10 точек)
✅ **Для больших маршрутов:** Использовать TSP solver или API оптимизацию

⚠️ **Геолокация:** Требует HTTPS и разрешение пользователя
✅ **Fallback:** Предложить выбор стартовой точки вручную
