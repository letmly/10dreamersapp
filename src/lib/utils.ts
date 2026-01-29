// Вычисление расстояния между двумя точками (формула Haversine)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Радиус Земли в км
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Проверка, находится ли пользователь рядом с местом (в пределах радиуса)
export function isNearby(
  userLat: number,
  userLng: number,
  placeLat: number,
  placeLng: number,
  radiusKm: number = 0.1 // 100 метров по умолчанию
): boolean {
  const distance = calculateDistance(userLat, userLng, placeLat, placeLng)
  return distance <= radiusKm
}

// Форматирование опыта
export function formatExperience(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M XP`
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K XP`
  return `${xp} XP`
}

// Вычисление уровня из опыта
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1
}

// Опыт до следующего уровня
export function experienceToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp)
  const xpForNextLevel = currentLevel * 1000
  return xpForNextLevel - currentXp
}

// Прогресс до следующего уровня в процентах
export function levelProgress(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp)
  const xpForCurrentLevel = (currentLevel - 1) * 1000
  const xpForNextLevel = currentLevel * 1000
  const progress = ((currentXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

// Получение цвета редкости
export function getRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  const colors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  }
  return colors[rarity]
}

// Форматирование времени
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`
}
