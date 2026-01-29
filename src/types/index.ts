// Пользователь
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  level: number
  experience: number
  badges: Badge[]
  completedQuests: string[]
  visitedPlaces: string[]
  createdAt: Date
}

// Достопримечательность
export interface Place {
  id: string
  name: string
  description: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  category: PlaceCategory
  images: string[]
  audioGuide?: string
  facts: string[]
  historicalPeriod?: string
  openingHours?: string
  ticketPrice?: number
  rating: number
  visitCount: number
}

export type PlaceCategory =
  | 'museum'
  | 'monument'
  | 'theater'
  | 'park'
  | 'church'
  | 'palace'
  | 'bridge'
  | 'other'

// Квест
export interface Quest {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: number // в минутах
  route: Place[]
  tasks: QuestTask[]
  reward: Reward
  requiredLevel: number
  image: string
  isActive: boolean
}

// Задание в квесте
export interface QuestTask {
  id: string
  placeId: string
  type: 'quiz' | 'photo' | 'ar' | 'exploration'
  question?: string
  answers?: string[]
  correctAnswer?: number
  description: string
  points: number
}

// Награда
export interface Reward {
  experience: number
  badge?: Badge
  title?: string
}

// Бейдж/Достижение
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
}

// Прогресс квеста
export interface QuestProgress {
  questId: string
  userId: string
  startedAt: Date
  completedTasks: string[]
  isCompleted: boolean
  score: number
}

// Элемент лидерборда
export interface LeaderboardEntry {
  rank: number
  user: User
  score: number
  questsCompleted: number
  placesVisited: number
}

// AR объект
export interface ARObject {
  id: string
  placeId: string
  name: string
  model: string
  description: string
  coordinates: {
    lat: number
    lng: number
  }
}

// Маршрут
export interface Route {
  id: string
  name: string
  description: string
  places: Place[] // Точки маршрута в порядке посещения
  distance: number // в км (общая длина маршрута)
  estimatedTime: number // в минутах (время прохождения)
  difficulty: 'easy' | 'medium' | 'hard'
  polyline?: RoutePolyline // Линия маршрута для отрисовки
  transportMode?: TransportMode // Способ передвижения
  isActive?: boolean // Активен ли маршрут сейчас
  color?: string // Цвет линии маршрута на карте
  startPoint?: Place // Начальная точка (если не первая в places)
  endPoint?: Place // Конечная точка (если не последняя в places)
}

// Полилиния маршрута (координаты для отрисовки на карте)
export interface RoutePolyline {
  coordinates: Array<{ lat: number; lng: number }> // Точки линии маршрута
  segments?: RouteSegment[] // Сегменты между точками с детальной информацией
}

// Сегмент маршрута (участок между двумя точками)
export interface RouteSegment {
  startPlaceId: string
  endPlaceId: string
  distance: number // в км
  duration: number // в минутах
  transportMode: TransportMode
  instructions?: string[] // Пошаговые инструкции (повороты, улицы)
  polyline: Array<{ lat: number; lng: number }> // Координаты этого сегмента
}

// Способ передвижения
export type TransportMode = 'walking' | 'driving' | 'transit' | 'cycling'

// Настройки построения маршрута
export interface RouteOptions {
  transportMode: TransportMode
  avoidTolls?: boolean // Избегать платных дорог
  avoidHighways?: boolean // Избегать магистралей
  optimize?: boolean // Оптимизировать порядок точек
  startLocation?: { lat: number; lng: number } // Начальная точка (или текущая позиция)
  endLocation?: { lat: number; lng: number } // Конечная точка
}

// Запрос на построение маршрута
export interface RouteRequest {
  places: Place[] // Места для посещения
  options: RouteOptions
}

// Активный маршрут пользователя
export interface ActiveRoute {
  route: Route
  currentPlaceIndex: number // Текущая точка маршрута (индекс в route.places)
  visitedPlaces: string[] // ID посещенных мест
  startedAt: Date
  completedAt?: Date
  progress: number // Прогресс в процентах (0-100)
}
