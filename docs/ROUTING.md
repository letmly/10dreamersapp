# Система построения маршрутов

## Обзор

Система построения маршрутов позволяет создавать, оптимизировать и отслеживать туристические маршруты между достопримечательностями.

## Основные параметры

### 1. RouteOptions - Настройки маршрута

```typescript
interface RouteOptions {
  transportMode: TransportMode        // Способ передвижения *
  avoidTolls?: boolean               // Избегать платных дорог
  avoidHighways?: boolean            // Избегать магистралей
  optimize?: boolean                 // Оптимизировать порядок точек
  startLocation?: { lat, lng }       // Начальная точка
  endLocation?: { lat, lng }         // Конечная точка
}
```

**TransportMode:**
- `walking` - пешком (5 км/ч)
- `cycling` - на велосипеде (15 км/ч)
- `driving` - на автомобиле (40 км/ч)
- `transit` - общественный транспорт (25 км/ч)

### 2. Route - Маршрут

```typescript
interface Route {
  id: string                         // Уникальный ID
  name: string                       // Название маршрута
  description: string                // Описание
  places: Place[]                    // Точки в порядке посещения *
  distance: number                   // Общая длина (км) *
  estimatedTime: number              // Время прохождения (мин) *
  difficulty: 'easy' | 'medium' | 'hard'  // Сложность *
  polyline?: RoutePolyline          // Линия для отрисовки
  transportMode?: TransportMode      // Способ передвижения
  color?: string                     // Цвет линии (#hex)
  startPoint?: Place                 // Начальная точка
  endPoint?: Place                   // Конечная точка
  isActive?: boolean                 // Активен ли маршрут
}
```

### 3. RoutePolyline - Линия маршрута

```typescript
interface RoutePolyline {
  coordinates: Array<{ lat, lng }>   // Точки линии *
  segments?: RouteSegment[]          // Детализация по сегментам
}
```

**Как рисовать на карте (Leaflet):**
```typescript
const polyline = L.polyline(
  route.polyline.coordinates.map(c => [c.lat, c.lng]),
  {
    color: route.color || '#0ea5e9',
    weight: 4,
    opacity: 0.7,
  }
).addTo(map)
```

### 4. RouteSegment - Сегмент маршрута

Участок между двумя точками:

```typescript
interface RouteSegment {
  startPlaceId: string              // ID начальной точки *
  endPlaceId: string                // ID конечной точки *
  distance: number                  // Расстояние (км) *
  duration: number                  // Время (мин) *
  transportMode: TransportMode      // Способ передвижения *
  instructions?: string[]           // Пошаговая навигация
  polyline: Array<{ lat, lng }>    // Координаты сегмента *
}
```

### 5. ActiveRoute - Активный маршрут пользователя

```typescript
interface ActiveRoute {
  route: Route                      // Сам маршрут *
  currentPlaceIndex: number         // Текущая точка (индекс) *
  visitedPlaces: string[]           // ID посещенных мест *
  startedAt: Date                   // Время начала *
  completedAt?: Date                // Время завершения
  progress: number                  // Прогресс 0-100% *
}
```

## Основные функции

### createRoute()
Создает полный маршрут из списка мест:

```typescript
const route = createRoute(
  places: Place[],
  options: RouteOptions,
  metadata?: {
    name?: string
    description?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    color?: string
  }
)
```

**Пример:**
```typescript
const route = createRoute(
  [hermitage, fortress, winterPalace],
  {
    transportMode: 'walking',
    optimize: true,
    startLocation: { lat: 59.9343, lng: 30.3351 }
  },
  {
    name: 'Исторический центр',
    difficulty: 'easy',
    color: '#10b981'
  }
)
```

### optimizeRouteOrder()
Оптимизирует порядок точек (жадный алгоритм):

```typescript
const optimized = optimizeRouteOrder(
  places: Place[],
  startLocation?: { lat, lng }
)
```

### isOnRoute()
Проверяет, на маршруте ли пользователь:

```typescript
const onRoute = isOnRoute(
  userLat: number,
  userLng: number,
  route: Route,
  toleranceKm?: number  // по умолчанию 0.05 (50м)
)
```

### findNearestPlaceOnRoute()
Находит ближайшую точку маршрута:

```typescript
const nearest = findNearestPlaceOnRoute(
  userLat: number,
  userLng: number,
  route: Route
)
// Возвращает: { place, distance, index }
```

### calculateRouteProgress()
Вычисляет прогресс прохождения:

```typescript
const progress = calculateRouteProgress(
  route: Route,
  currentPlaceIndex: number,
  visitedPlaces: string[]
)
// Возвращает: 0-100
```

## Zustand Store (useRouteStore)

### Состояние
```typescript
availableRoutes: Route[]     // Доступные маршруты
activeRoute: ActiveRoute     // Активный маршрут
```

### Действия

**Управление маршрутом:**
```typescript
startRoute(route, userLocation?)  // Начать маршрут
stopRoute()                       // Остановить маршрут
completeRoute()                   // Завершить маршрут
visitPlace(placeId)               // Отметить место как посещенное
updateCurrentPlace(index)         // Обновить текущую точку
```

**Утилиты:**
```typescript
getProgress()                     // Получить прогресс
isPlaceVisited(placeId)          // Проверить посещение
getNextPlace()                    // Следующая точка
getCurrentPlace()                 // Текущая точка
createCustomRoute(places, opts)   // Создать кастомный маршрут
```

## Пример использования

### 1. Создание и запуск маршрута

```typescript
import { useRouteStore } from '@/store/routeStore'
import { useGeolocation } from '@/hooks/useGeolocation'

function StartRoute() {
  const { latitude, longitude } = useGeolocation()
  const { startRoute, createCustomRoute } = useRouteStore()

  const handleStart = () => {
    // Создаем маршрут
    const route = createCustomRoute(
      selectedPlaces,
      {
        transportMode: 'walking',
        optimize: true,
        startLocation: { lat: latitude, lng: longitude }
      }
    )

    // Запускаем
    startRoute(route, { lat: latitude, lng: longitude })
  }

  return <button onClick={handleStart}>Начать маршрут</button>
}
```

### 2. Отображение маршрута на карте

```typescript
function RouteMap({ route }) {
  useEffect(() => {
    if (!mapRef.current || !route.polyline) return

    // Рисуем линию маршрута
    const polyline = L.polyline(
      route.polyline.coordinates.map(c => [c.lat, c.lng]),
      {
        color: route.color,
        weight: 4,
        opacity: 0.7,
      }
    ).addTo(mapRef.current)

    // Рисуем маркеры точек
    route.places.forEach((place, index) => {
      L.marker([place.coordinates.lat, place.coordinates.lng])
        .bindPopup(`${index + 1}. ${place.name}`)
        .addTo(mapRef.current)
    })

    return () => polyline.remove()
  }, [route])
}
```

### 3. Отслеживание прогресса

```typescript
function RouteProgress() {
  const { activeRoute, visitPlace } = useRouteStore()
  const { latitude, longitude } = useGeolocation()

  useEffect(() => {
    if (!activeRoute || !latitude) return

    // Проверяем близость к точкам
    const nearest = findNearestPlaceOnRoute(
      latitude,
      longitude,
      activeRoute.route
    )

    // Если рядом с точкой (< 100м), отмечаем посещенной
    if (nearest && nearest.distance < 0.1) {
      visitPlace(nearest.place.id)
    }
  }, [latitude, longitude, activeRoute])

  return (
    <div>
      Прогресс: {activeRoute?.progress}%
      Посещено: {activeRoute?.visitedPlaces.length} / {activeRoute?.route.places.length}
    </div>
  )
}
```

## Будущие улучшения

### Интеграция реального Routing API

**OSRM (бесплатно, open-source):**
```typescript
async function getOSRMRoute(coordinates: [lng, lat][]) {
  const coords = coordinates.map(c => `${c[0]},${c[1]}`).join(';')
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/walking/${coords}?overview=full&geometries=geojson`
  )
  const data = await response.json()
  return data.routes[0]
}
```

**Google Directions API (платно):**
```typescript
const directionsService = new google.maps.DirectionsService()
directionsService.route({
  origin: startLocation,
  destination: endLocation,
  waypoints: waypoints,
  travelMode: google.maps.TravelMode.WALKING,
  optimizeWaypoints: true
})
```

### Дополнительные возможности

- [ ] Альтернативные маршруты
- [ ] Учет пробок в реальном времени
- [ ] Маршруты с учетом расписания работы мест
- [ ] Multimodal маршруты (пешком + транспорт)
- [ ] Сохранение истории маршрутов
- [ ] Sharing маршрутов с друзьями
- [ ] Голосовая навигация
- [ ] Оффлайн маршруты

## Примечания

- Сейчас используются **прямые линии** между точками
- Для продакшена нужна интеграция с **реальным routing API**
- Скорости передвижения - усредненные для города
- Оптимизация использует **жадный алгоритм** (не идеален для больших маршрутов)
