# Миграция с Leaflet на MapLibre GL

## Обзор изменений

Приложение мигрировано с React Leaflet на **MapLibre GL + React Map GL** для лучшей производительности и функциональности.

## Установленные пакеты

```bash
pnpm add maplibre-gl react-map-gl
```

**ВАЖНО:** Импортировать нужно из `react-map-gl/maplibre` (не из `react-map-gl`):
```typescript
import Map, { Marker, ... } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
```

## Новые компоненты

### 1. MapGLView (замена MapView)
**Путь:** `src/components/map/MapGLView.tsx`

Основной компонент карты с маркерами мест.

**Props:**
- `places: Place[]` - места для отображения
- `center?: [number, number]` - начальная позиция [lng, lat]
- `zoom?: number` - начальный зуум
- `onPlaceClick?: (place) => void` - обработчик клика на место
- `userLocation?: { latitude, longitude } | null` - позиция пользователя
- `showRoute?: boolean` - показывать линию маршрута
- `routeCoordinates?: Array<{ lat, lon }>` - координаты маршрута

**Особенности:**
- Встроенные NavigationControl и GeolocateControl
- Emoji маркеры по категориям мест
- Кнопка центрирования на пользователя
- Линии маршрута через GeoJSON Source + Layer

### 2. MapGLLocationPicker (замена MapLocationPicker)
**Путь:** `src/components/personalization/MapGLLocationPicker.tsx`

Интерактивная карта для выбора стартовой точки маршрута.

**Props:**
- `onLocationSelect: (lat, lng, address?) => void` - callback при выборе
- `initialLocation?: { lat, lng }` - начальная позиция маркера

**Особенности:**
- Draggable маркер для выбора точки
- Автоопределение текущей позиции пользователя
- Reverse geocoding через Nominatim для получения адреса
- Клик на карту для установки маркера

### 3. JourneyMapGL (замена JourneyMap)
**Путь:** `src/components/journey/JourneyMapGL.tsx`

Карта для активного путешествия с отслеживанием прогресса.

**Props:**
- `route: GeneratedRouteResponse['route']` - маршрут от Gemini
- `currentPointIndex: number` - текущая точка маршрута
- `visitedPoints: number[]` - посещенные точки
- `userLocation?: { lat, lng }` - GPS позиция пользователя

**Особенности:**
- Цветовая индикация точек (серый → синий → зеленый)
- Автоматическое центрирование на текущей точке
- Анимированный маркер позиции пользователя (pulse + ping)
- Линия маршрута через все точки

## Ключевые отличия от Leaflet

### Координаты
```typescript
// ❌ Leaflet: [lat, lng]
L.marker([59.9343, 30.3351])

// ✅ MapLibre GL: [lng, lat] - ОБРАТНЫЙ ПОРЯДОК!
<Marker longitude={30.3351} latitude={59.9343} />
```

### Маркеры
```typescript
// ❌ Leaflet: refs + divIcon + императивное управление
const marker = L.marker([lat, lng], { icon: L.divIcon(...) })
marker.addTo(map)

// ✅ MapLibre GL: декларативные React компоненты
<Marker longitude={lng} latitude={lat}>
  <div>🏛️</div>
</Marker>
```

### Линии маршрута
```typescript
// ❌ Leaflet: polyline с координатами
L.polyline([[lat1, lng1], [lat2, lng2]], { color: 'blue' })

// ✅ MapLibre GL: GeoJSON Source + Layer
<Source id="route" type="geojson" data={geoJSON}>
  <Layer id="route-line" type="line" paint={{ 'line-color': '#3b82f6' }} />
</Source>
```

### Управление картой
```typescript
// ❌ Leaflet: императивно через map instance
mapRef.current.setView([lat, lng], zoom)

// ✅ MapLibre GL: через MapRef
mapRef.current?.flyTo({ center: [lng, lat], zoom })
```

### Инициализация
```typescript
// ❌ Leaflet: L.map() с cleanup
useEffect(() => {
  const map = L.map(container, { center, zoom })
  return () => map.remove()
}, [])

// ✅ MapLibre GL: декларативный JSX
<Map
  initialViewState={{ longitude, latitude, zoom }}
  mapLib={import('maplibre-gl')}
/>
```

## Обновленные страницы

### /map - Карта мест
```typescript
// Было: MapView
import MapView from '@/components/map/MapView'

// Стало: MapGLView
const MapGLView = dynamic(() => import('@/components/map/MapGLView'), { ssr: false })
```

### /personalize - Выбор стартовой точки
```typescript
// Было: MapLocationPicker
const MapLocationPicker = dynamic(...)

// Стало: MapGLLocationPicker
const MapGLLocationPicker = dynamic(() => import('@/components/personalization/MapGLLocationPicker'), { ssr: false })
```

### /journey/[id] - Активное путешествие
```typescript
// Было: JourneyMap
const JourneyMap = dynamic(() => import('@/components/journey/JourneyMap'), { ssr: false })

// Стало: JourneyMapGL
const JourneyMapGL = dynamic(() => import('@/components/journey/JourneyMapGL'), { ssr: false })
```

## Стиль карты

Используется **CartoDB Voyager** (светлый, читаемый, красивый):

```typescript
mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
```

Альтернативы:
- `gl/dark-matter-gl-style/style.json` - темная тема
- `gl/positron-gl-style/style.json` - минималистичная светлая
- OpenStreetMap через OSRM tile server

## CSS

Всегда импортируй CSS для MapLibre GL:

```typescript
import 'maplibre-gl/dist/maplibre-gl.css'
```

## Координатная валидация

Все координаты от Gemini проходят валидацию через OSM Nominatim:

```typescript
// src/app/api/routes/generate/route.ts
const generatedRoute = await callGeminiAPI(systemPrompt, sessionId)

// Валидация координат через OSM
if (generatedRoute.route) {
  generatedRoute.route = await validateRouteCoordinates(generatedRoute.route)
}
```

**Что происходит:**
1. Для каждой точки маршрута → поиск в OSM по названию + город
2. Сравнение OSM координат с координатами от AI
3. **Замена координат на OSM** (всегда точнее)
4. Rate limit: 1.1 секунда между запросами
5. Логирование всех исправлений

## Производительность

MapLibre GL:
- ✅ WebGL рендеринг (быстрее на 60+ маркерах)
- ✅ Встроенная поддержка touch gestures
- ✅ Плавные анимации flyTo/panTo
- ✅ Легче настраивать стили карты
- ✅ Декларативный React API
- ✅ Лучше работает на мобильных

Leaflet:
- ❌ Canvas/SVG рендеринг (медленнее)
- ❌ Императивный API
- ❌ Нужны плагины для многих функций

## Очистка

Старые компоненты Leaflet **удалены** из проекта:
- ❌ `MapView.tsx`
- ❌ `MapLocationPicker.tsx`
- ❌ `JourneyMap.tsx`
- ❌ `RouteMapView.tsx`

Зависимости Leaflet **удалены** из package.json:
- ❌ `leaflet`
- ❌ `react-leaflet`
- ❌ `@types/leaflet`

Проект теперь использует **только MapLibre GL + React Map GL**.

## Полезные ссылки

- [React Map GL Docs](https://visgl.github.io/react-map-gl/)
- [MapLibre GL Docs](https://maplibre.org/maplibre-gl-js/docs/)
- [OSM Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/)
- [CartoDB Basemaps](https://github.com/CartoDB/basemap-styles)
