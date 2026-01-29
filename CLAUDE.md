# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

10Dreamers - веб-приложение для образовательного туризма по культурной столице России (Санкт-Петербург) с геймификацией. Приложение имеет мобильный фокус и разработано как PWA.

**Tech Stack:**
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS для стилизации
- Zustand для state management
- React Leaflet для интерактивных карт
- Framer Motion для анимаций

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
│   └── page.tsx      # Главная страница
├── components/       # React компоненты (пока пусто, будут добавляться)
├── hooks/           # Custom hooks
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

### Mobile Development
- Всегда тестируй на мобильных размерах экрана
- Используй Tailwind утилиты: `safe-top`, `safe-bottom` для safe areas
- Кнопки должны иметь `active:scale-95` для touch feedback
- Input поля должны быть минимум 44x44px для touch targets

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
