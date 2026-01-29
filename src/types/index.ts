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
  places: Place[]
  distance: number // в км
  estimatedTime: number // в минутах
  difficulty: 'easy' | 'medium' | 'hard'
}
