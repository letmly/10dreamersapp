import type {
  Place,
  Route,
  RoutePolyline,
  RouteSegment,
  TransportMode,
  RouteOptions,
} from '@/types'
import { calculateDistance } from './utils'

/**
 * Вычисляет простой маршрут между точками (прямые линии)
 * Для продакшена нужно использовать реальный routing API (OSRM, Google Directions, etc.)
 */
export function calculateSimpleRoute(
  places: Place[],
  options: RouteOptions
): RoutePolyline {
  const coordinates: Array<{ lat: number; lng: number }> = []
  const segments: RouteSegment[] = []

  // Добавляем стартовую точку если есть
  if (options.startLocation) {
    coordinates.push(options.startLocation)
  }

  // Добавляем все точки маршрута
  places.forEach((place, index) => {
    coordinates.push(place.coordinates)

    // Создаем сегмент до следующей точки
    if (index < places.length - 1) {
      const nextPlace = places[index + 1]
      const distance = calculateDistance(
        place.coordinates.lat,
        place.coordinates.lng,
        nextPlace.coordinates.lat,
        nextPlace.coordinates.lng
      )

      segments.push({
        startPlaceId: place.id,
        endPlaceId: nextPlace.id,
        distance,
        duration: calculateDuration(distance, options.transportMode),
        transportMode: options.transportMode,
        polyline: [place.coordinates, nextPlace.coordinates],
      })
    }
  })

  // Добавляем конечную точку если есть
  if (options.endLocation && options.endLocation !== places[places.length - 1]?.coordinates) {
    coordinates.push(options.endLocation)
  }

  return { coordinates, segments }
}

/**
 * Вычисляет продолжительность в минутах на основе расстояния и способа передвижения
 */
export function calculateDuration(distanceKm: number, mode: TransportMode): number {
  // Средние скорости для разных способов передвижения
  const speeds: Record<TransportMode, number> = {
    walking: 5, // 5 км/ч
    cycling: 15, // 15 км/ч
    driving: 40, // 40 км/ч (с учетом городских условий)
    transit: 25, // 25 км/ч (общественный транспорт)
  }

  const speedKmH = speeds[mode]
  return Math.ceil((distanceKm / speedKmH) * 60) // в минутах
}

/**
 * Вычисляет общую длину маршрута
 */
export function calculateRouteDistance(polyline: RoutePolyline): number {
  if (!polyline.segments) return 0
  return polyline.segments.reduce((total, segment) => total + segment.distance, 0)
}

/**
 * Вычисляет общее время маршрута
 */
export function calculateRouteTime(polyline: RoutePolyline): number {
  if (!polyline.segments) return 0
  return polyline.segments.reduce((total, segment) => total + segment.duration, 0)
}

/**
 * Оптимизирует порядок точек маршрута (жадный алгоритм ближайшего соседа)
 * Для продакшена можно использовать TSP алгоритмы или API оптимизации
 */
export function optimizeRouteOrder(
  places: Place[],
  startLocation?: { lat: number; lng: number }
): Place[] {
  if (places.length <= 2) return places

  const unvisited = [...places]
  const optimized: Place[] = []

  // Начинаем с ближайшей точки к стартовой позиции
  let currentPos = startLocation || places[0].coordinates

  while (unvisited.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    // Находим ближайшую непосещенную точку
    unvisited.forEach((place, index) => {
      const distance = calculateDistance(
        currentPos.lat,
        currentPos.lng,
        place.coordinates.lat,
        place.coordinates.lng
      )

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    // Добавляем ближайшую точку в маршрут
    const nearestPlace = unvisited.splice(nearestIndex, 1)[0]
    optimized.push(nearestPlace)
    currentPos = nearestPlace.coordinates
  }

  return optimized
}

/**
 * Создает полный объект маршрута из списка мест
 */
export function createRoute(
  places: Place[],
  options: RouteOptions,
  metadata?: {
    name?: string
    description?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    color?: string
  }
): Route {
  // Оптимизируем порядок если нужно
  const orderedPlaces = options.optimize
    ? optimizeRouteOrder(places, options.startLocation)
    : places

  // Строим полилинию
  const polyline = calculateSimpleRoute(orderedPlaces, options)

  // Вычисляем параметры
  const distance = calculateRouteDistance(polyline)
  const estimatedTime = calculateRouteTime(polyline)

  // Определяем сложность на основе длины и времени
  let difficulty: 'easy' | 'medium' | 'hard' = metadata?.difficulty || 'medium'
  if (!metadata?.difficulty) {
    if (distance < 3 && estimatedTime < 60) difficulty = 'easy'
    else if (distance > 10 || estimatedTime > 180) difficulty = 'hard'
  }

  return {
    id: `route-${Date.now()}`,
    name: metadata?.name || `Маршрут по ${orderedPlaces.length} местам`,
    description: metadata?.description || `Посетите ${orderedPlaces.length} достопримечательностей`,
    places: orderedPlaces,
    distance: Number(distance.toFixed(2)),
    estimatedTime: Math.ceil(estimatedTime),
    difficulty,
    polyline,
    transportMode: options.transportMode,
    isActive: false,
    color: metadata?.color || '#0ea5e9',
    startPoint: orderedPlaces[0],
    endPoint: orderedPlaces[orderedPlaces.length - 1],
  }
}

/**
 * Проверяет, находится ли пользователь на маршруте (рядом с линией)
 */
export function isOnRoute(
  userLat: number,
  userLng: number,
  route: Route,
  toleranceKm: number = 0.05 // 50 метров
): boolean {
  if (!route.polyline?.coordinates) return false

  // Проверяем расстояние до каждой точки маршрута
  for (let i = 0; i < route.polyline.coordinates.length; i++) {
    const point = route.polyline.coordinates[i]
    const distance = calculateDistance(userLat, userLng, point.lat, point.lng)

    if (distance <= toleranceKm) return true
  }

  return false
}

/**
 * Находит ближайшую точку маршрута к пользователю
 */
export function findNearestPlaceOnRoute(
  userLat: number,
  userLng: number,
  route: Route
): { place: Place; distance: number; index: number } | null {
  if (!route.places || route.places.length === 0) return null

  let nearestPlace = route.places[0]
  let nearestDistance = calculateDistance(
    userLat,
    userLng,
    nearestPlace.coordinates.lat,
    nearestPlace.coordinates.lng
  )
  let nearestIndex = 0

  route.places.forEach((place, index) => {
    const distance = calculateDistance(
      userLat,
      userLng,
      place.coordinates.lat,
      place.coordinates.lng
    )

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestPlace = place
      nearestIndex = index
    }
  })

  return {
    place: nearestPlace,
    distance: nearestDistance,
    index: nearestIndex,
  }
}

/**
 * Вычисляет прогресс прохождения маршрута
 */
export function calculateRouteProgress(
  route: Route,
  currentPlaceIndex: number,
  visitedPlaces: string[]
): number {
  const totalPlaces = route.places.length
  const visitedCount = visitedPlaces.length

  // Базовый прогресс по количеству посещенных мест
  const baseProgress = (visitedCount / totalPlaces) * 100

  // Дополнительный прогресс за текущее движение к следующей точке
  const additionalProgress = (currentPlaceIndex / totalPlaces) * 10

  return Math.min(Math.round(baseProgress + additionalProgress), 100)
}

/**
 * Получает цвет для линии маршрута в зависимости от сложности
 */
export function getRouteColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  const colors = {
    easy: '#10b981', // green
    medium: '#f59e0b', // orange
    hard: '#ef4444', // red
  }
  return colors[difficulty]
}

/**
 * Форматирует инструкции для сегмента маршрута
 */
export function formatRouteInstructions(segment: RouteSegment): string[] {
  // Для простого маршрута генерируем базовые инструкции
  // В продакшене эти инструкции придут от routing API
  return [
    `Следуйте ${formatTransportMode(segment.transportMode)}`,
    `Расстояние: ${segment.distance.toFixed(2)} км`,
    `Время в пути: ${segment.duration} мин`,
  ]
}

/**
 * Форматирует способ передвижения для отображения
 */
export function formatTransportMode(mode: TransportMode): string {
  const modes: Record<TransportMode, string> = {
    walking: 'пешком',
    cycling: 'на велосипеде',
    driving: 'на автомобиле',
    transit: 'на общественном транспорте',
  }
  return modes[mode]
}
