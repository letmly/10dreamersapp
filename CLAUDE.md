# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

10Dreamers - веб-приложение для образовательного туризма по культурной столице России (Санкт-Петербург) с геймификацией.

**ВАЖНО: Приложение имеет МОБИЛЬНЫЙ ФОКУС и разработано как PWA.**
- Mobile-first подход ко всем компонентам
- Оптимизация для экранов 320px-428px (основные мобильные устройства)
- Touch-friendly элементы (минимум 44x44px)
- Safe-area поддержка для notch/dynamic island
- PWA с офлайн возможностями

**Tech Stack:**
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS для стилизации
- Zustand для state management
- **2GIS MapGL** для интерактивных карт и геолокации
- **2GIS Places API** для поиска реальных координат мест
- **2GIS Geocoder API** для обратного геокодирования
- Framer Motion для анимаций
- Google Gemini API для AI-генерации персонализированных маршрутов

**Design System:**
- Брендинг: KULTRTALK (KULTR с градиентом + TALK)
- Органические формы (blob shapes) для визуального интереса
- Градиенты: blue-600 → purple-600 → pink-600
- Фоновые изображения Санкт-Петербурга с чередованием
- Rounded-full кнопки с тенями
- Backdrop blur для glassmorphism эффектов

## Development Commands

**ВАЖНО: Проект использует pnpm, а не npm или yarn.**

### Core Commands
```bash
pnpm install            # Установка зависимостей
pnpm dev                # Запуск dev сервера (localhost:3000)
pnpm build              # Сборка production версии
pnpm start              # Запуск production версии
```

### Code Quality
```bash
pnpm lint               # Проверка кода с ESLint
pnpm type-check         # Проверка TypeScript типов без компиляции
pnpm format             # Форматирование кода с Prettier
```

## Architecture

### Directory Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout с метаданными для PWA
│   ├── globals.css   # Глобальные стили, утилиты для mobile (safe-area)
│   ├── page.tsx      # Главная страница
│   └── map/          # Страница карты (точка входа для путешествия)
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   └── map/
│       └── MapView.tsx  # Компонент интерактивной карты (Leaflet)
├── hooks/
│   └── useGeolocation.ts  # Hook для работы с геолокацией
├── lib/
│   ├── mockData.ts   # Mock данные для places, quests, badges
│   └── utils.ts      # Утилиты (расстояния, уровни, форматирование)
├── store/
│   └── userStore.ts  # Zustand store для пользователя (с persist)
└── types/
    └── index.ts      # TypeScript интерфейсы для всего приложения
```

### Key Architectural Patterns

**State Management:**
- Используется Zustand для глобального состояния
- `userStore.ts` управляет пользователем, достижениями, прогрессом
- Состояние персистится в localStorage через `zustand/middleware/persist`

**Mobile-First Approach:**
- Все стили в `globals.css` оптимизированы для touch устройств
- Safe-area утилиты для notch/dynamic island на iOS
- Touch events с `-webkit-tap-highlight-color: transparent`
- PWA манифест в `public/manifest.json`

**Data Types:**
- `User` - пользователь с уровнем, опытом, бейджами
- `Place` - достопримечательность с координатами, категорией, фактами
- `Quest` - квест с маршрутом, заданиями, наградами
- `QuestTask` - задание в квесте (quiz, photo, ar, exploration)
- `Badge` - достижение с редкостью (common, rare, epic, legendary)
- `Route` - туристический маршрут
- `ARObject` - AR объект для исторических мест (будущая функция)

**Gamification System:**
- Уровни рассчитываются как `Math.floor(xp / 1000) + 1`
- Опыт начисляется за квесты, посещения, выполнение заданий
- Бейджи имеют редкость и разблокируются за достижения
- Лидерборд для соревновательного элемента

**Geolocation:**
- `useGeolocation` hook отслеживает позицию пользователя
- `calculateDistance` использует формулу Haversine для точности
- `isNearby` проверяет, находится ли пользователь рядом с местом (100м)

**Map Integration (2GIS MapGL):**
- Используется **2GIS MapGL JS API** с динамическим импортом (`next/dynamic`) с `ssr: false`
- Компоненты: `Map2GISView`, `Map2GISLocationPicker`, `JourneyMap2GIS`, `RouteMapView2GIS`
- API ключ: `NEXT_PUBLIC_2GIS_API_KEY` в `.env`
- Карта показывает достопримечательности с emoji-иконками по категориям
- HtmlMarker для кастомных маркеров, Marker для базовых (включая draggable)
- Polyline для отрисовки линий маршрутов
- Geocoder API для обратного геокодирования (координаты → адрес)
- Все координаты от Gemini валидируются через OSM Nominatim API
- Карты оптимизированы для России и СНГ

**Routing System (src/lib/2gis/routing.ts):**

**ВАЖНО: Используем OSRM вместо 2GIS Directions API (у 2GIS только 50 запросов/день).**

Публичный OSRM endpoint: `https://router.project-osrm.org/route/v1/foot/{lon},{lat};{lon},{lat}`

Основные функции:
- `getWalkingRoute(from, to)` - построение пешеходного маршрута между двумя точками
  - Возвращает: coordinates (декодированный polyline), distance (метры), duration (секунды), instructions
  - Использует Google Polyline Algorithm для декодирования геометрии
  - Fallback на прямую линию если API недоступен

- `getMultiPointWalkingRoute(points[])` - построение маршрута через несколько точек
  - Вызывает getWalkingRoute для каждой пары точек последовательно
  - Задержка 500ms между запросами для уважения к бесплатному API

- `combineRoutes(routes[])` - объединение сегментов в единую линию
  - Возвращает: coordinates[], totalDistance, totalDuration

Декодирование polyline:
- OSRM возвращает геометрию в формате Google Polyline (encoded string)
- `decodePolyline(encoded)` декодирует в массив [lon, lat] координат
- Алгоритм: variable-length encoding с base-63 ASCII символами
   - `startedAt`, `completedAt` - временные метки

Основные функции:
- `createRoute(places, options, metadata)` - создает маршрут из мест
- `calculateSimpleRoute(places, options)` - строит полилинию (пока прямые линии)
- `optimizeRouteOrder(places, startLocation)` - оптимизирует порядок (жадный алгоритм)
- `isOnRoute(lat, lng, route)` - проверяет, на маршруте ли пользователь
- `findNearestPlaceOnRoute(lat, lng, route)` - находит ближайшую точку
- `calculateRouteProgress(route, index, visited)` - вычисляет прогресс

**Важно для продакшена:**
- Сейчас используются прямые линии между точками
- Для продакшена интегрировать реальный routing API:
  - OSRM (Open Source Routing Machine) - бесплатно
  - Google Directions API - платно, точнее
  - Mapbox Directions API - платно, хорошая документация
  - GraphHopper - open-source альтернатива

**Personalization Pipeline:**
- `/personalize` страница - квиз для персонализации маршрута
- Bubble-based UI для выбора опций (время, бюджет, vibe, еда, состояние)
- MapLocationPicker для выбора точки старта на карте
- POST /api/routes/generate - генерация через Gemini API
- Системный промпт в `src/lib/gemini/systemPrompt.ts`
- Типы персонализации в `src/types/personalization.ts`

Параметры персонализации:
- `timeAvailable` - сколько времени на прогулку (30min-fullday)
- `budget` - бюджет (free/budget/moderate/premium)
- `vibes` - интересы (history, art, nature, food и тд) - до 3-х
- `foodPreferences` - предпочтения в еде - до 3-х
- `mentalState` - текущее состояние (energetic/relaxed/curious/social/contemplative/adventurous)
- `openToEvents` - готов ли посетить мероприятие (yes/no/maybe)
- `startLocation` - точка старта с lat/lng

Gemini генерирует JSON с:
- Точками маршрута (name, description, coordinates, duration)
- Квизами для каждой точки (3-5 вопросов с вариантами ответов)
- Переходами между точками (метод, время, расстояние, инструкции)
- Статистикой (время, расстояние, стоимость, калории)
- Персонализацией (score, reasoning)

**Координатная валидация (КРИТИЧНО):**
- Все координаты от Gemini валидируются через OSM Nominatim API
- `validateRouteCoordinates()` в `src/lib/coordinatesValidator.ts`
- Для каждого места: поиск по названию + город в OSM
- **Координаты ВСЕГДА заменяются на OSM координаты** (точнее чем от AI)
- Rate limit: 1 запрос в 1.1 секунду (требование OSM)
- Reverse geocoding для определения города по координатам
- Логирование всех исправлений координат

## Important Notes

### Package Manager
- **Всегда используй pnpm** для установки зависимостей и запуска скриптов
- Не используй npm или yarn - это может привести к конфликтам
- Если нужно добавить зависимость: `pnpm add <package>`
- Для dev зависимостей: `pnpm add -D <package>`

### Code Style
- Используй TypeScript строго (strict mode включен)
- Все компоненты должны быть functional с hooks
- Для клиентских компонентов используй `'use client'` директиву
- Path aliases настроены: `@/` → `src/`, `@/components/`, `@/lib/` и т.д.

### Mobile Development (КРИТИЧНО - MOBILE FIRST!)

**Обязательные правила для мобильной разработки:**
- Всегда разрабатывай в первую очередь для мобильных (320px-428px)
- Тестируй на мобильных размерах ПЕРЕД десктопом
- Используй Tailwind mobile-first breakpoints: `sm:`, `md:`, `lg:`
- Максимальная ширина контейнеров: `max-w-md` (448px) для мобильного контента
- Safe areas: `safe-top`, `safe-bottom`, `safe-left`, `safe-right`

**Touch-friendly элементы:**
- Кнопки: минимум 44x44px, `active:scale-95` для feedback
- Input поля: минимум 44x44px height
- Отступы между элементами: минимум 8px
- Тексты: минимум 14px (лучше 16px) для читаемости
- Иконки: 24x24px минимум для tap targets

**Навигация и UI:**
- Bottomsheet для модальных окон (не обычные модалы)
- Fixed footer с safe-bottom для главных кнопок
- Sticky header с safe-top
- Анимации: `animate-slide-up` для bottomsheets
- Скроллинг: учитывать fixed элементы (pb-32 для footer)

### 2GIS MapGL Development
- **ВСЕГДА используй 2GIS MapGL** через `@2gis/mapgl` (не Leaflet, не MapLibre!)
- **Импорт:** `import { load } from '@2gis/mapgl'` + `import type { Map, HtmlMarker, Polyline } from '@2gis/mapgl/types'`
- Карты требуют динамического импорта с `ssr: false`
- **API ключ обязателен:** `NEXT_PUBLIC_2GIS_API_KEY` из `.env`
- Инициализация через `load()` промис
- Координаты в формате [longitude, latitude] (обратный порядок от обычного!)
- **HtmlMarker** для кастомных маркеров с HTML элементами
- **Marker** для базовых маркеров (поддерживает draggable через `as any`)
- **Polyline** для линий маршрутов
- Управление картой: `map.setCenter()`, `map.setZoom()`, `map.on('click')`
- Уничтожение: всегда `map.destroy()` и `marker.destroy()` в cleanup
- Z-index: карта = 0, UI элементы > 10, bottomsheet = 20
- TypeScript типы могут быть неполными - используй `as any` где необходимо

### State Management
- Для локального состояния используй `useState`/`useReducer`
- Для глобального состояния используй Zustand stores в `src/store/`
- Добавляй persist только если данные нужно сохранять между сессиями

### Styling
- Используй Tailwind CSS классы, избегай inline styles
- Используй pre-defined button/card классы из `globals.css`
- Цветовая палитра: primary (blue), gamification (bronze/silver/gold)
- Анимации через Framer Motion для сложных случаев

### Data Flow
- Mock данные в `src/lib/mockData.ts` для разработки
- В будущем будет добавлен API layer (fetch/axios)
- Типы всегда импортируй из `@/types`

## Future Backend Integration

Когда будет добавлен бэкенд:
- API endpoints пойдут в `src/lib/api/`
- Добавь `.env.local` для переменных окружения
- Используй Next.js API routes (`app/api/`) для serverless functions
- Добавь React Query/SWR для data fetching и caching

## PWA Features

Приложение настроено как PWA:
- Манифест в `public/manifest.json`
- Metadata в `layout.tsx` с темой и viewport
- Иконки должны быть добавлены в `public/icons/` (72px до 512px)
- Service Worker будет добавлен для offline support
