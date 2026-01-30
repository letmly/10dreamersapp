// Типы для персонализации маршрутов

export type TimePreference = '30min' | '1hour' | '2hours' | '3hours' | 'halfday' | 'fullday'

export type BudgetLevel = 'free' | 'budget' | 'moderate' | 'premium'

export type VibeCategory =
  | 'history'
  | 'art'
  | 'architecture'
  | 'nature'
  | 'food'
  | 'nightlife'
  | 'shopping'
  | 'sports'
  | 'culture'
  | 'photography'
  | 'science'
  | 'music'

export type FoodPreference =
  | 'russian'
  | 'european'
  | 'asian'
  | 'vegetarian'
  | 'vegan'
  | 'street_food'
  | 'fine_dining'
  | 'cafes'
  | 'no_preference'

export type MentalState =
  | 'energetic'      // Полон энергии, хочу активности
  | 'relaxed'        // Расслабленный, хочу спокойствия
  | 'curious'        // Любопытный, хочу узнать новое
  | 'social'         // Хочу общения и людей вокруг
  | 'contemplative'  // Задумчивый, хочу тишины
  | 'adventurous'    // Авантюрный, хочу приключений

export type EventPreference = 'yes' | 'no' | 'maybe'

// Ответы пользователя на квиз
export interface PersonalizationAnswers {
  timeAvailable: TimePreference
  budget: BudgetLevel
  vibes: VibeCategory[]           // Множественный выбор
  foodPreferences: FoodPreference[]
  mentalState: MentalState
  openToEvents: EventPreference
  startLocation: {
    lat: number
    lng: number
    address?: string
  }
  // Дополнительная информация
  previousVisits?: string[]        // ID мест, которые уже посещал
  dislikedPlaces?: string[]        // ID мест, которые не понравились
  favoritePlaces?: string[]        // ID любимых мест
}

// Опция в bubble выборе
export interface BubbleOption<T = string> {
  value: T
  label: string
  emoji?: string
  description?: string
  color?: string
}

// Шаг квиза
export interface QuizStep {
  id: string
  question: string
  description?: string
  type: 'single' | 'multiple' | 'map'
  options?: BubbleOption[]
  maxSelections?: number  // Для multiple
  required?: boolean
}

// Конфигурация квиза
export interface PersonalizationQuiz {
  steps: QuizStep[]
  title: string
  description: string
}

// Запрос к API для генерации маршрута
export interface GenerateRouteRequest {
  answers: PersonalizationAnswers
  regionId?: string  // 2GIS region_id (по умолчанию '38' - СПб)
}

// Ответ от API с сгенерированным маршрутом
export interface GeneratedRouteResponse {
  route: {
    id: string
    name: string
    description: string
    points: RoutePoint[]
    statistics: RouteStatistics
    personalization_score: number  // 0-100, насколько маршрут соответствует предпочтениям
    reasoning?: string  // Объяснение от AI, почему выбран этот маршрут
  }
}

// Точка маршрута с квизом
export interface RoutePoint {
  point_number: number
  name: string
  description: string
  category: VibeCategory
  coordinates: {
    lat: number
    lon: number
  }
  search_queries?: string[]  // Альтернативные названия для поиска в 2GIS
  visit_duration_minutes: number
  price_level: BudgetLevel
  quiz?: PlaceQuiz
  transition?: RouteTransition
  tips?: string[]
  photo_url?: string
}

// Переход между точками
export interface RouteTransition {
  method: 'walk' | 'transit' | 'taxi'
  duration_minutes: number
  distance_km: number
  description: string
  instructions?: string[]
}

// Квиз для места
export interface PlaceQuiz {
  questions: QuizQuestion[]
  total_points: number
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number  // Индекс правильного ответа
  points: number
  explanation?: string
}

// Статистика маршрута
export interface RouteStatistics {
  total_walk_time: number      // минуты
  total_transit_time?: number  // минуты
  total_distance: number        // км
  total_points: number          // места
  estimated_cost: {
    min: number
    max: number
    currency: string
  }
  calories_burned?: number
  carbon_footprint?: number     // кг CO2
}

// Промпт для Gemini API
export interface GeminiPromptContext {
  answers: PersonalizationAnswers
  current_events?: any[]   // Текущие события и мероприятия в городе пользователя
  weather?: {
    temperature: number
    condition: string
    recommendation?: string
  }
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night'
}
