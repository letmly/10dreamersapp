/**
 * Валидация и исправление координат через 2GIS Places API (вместо OSM)
 */

import { searchPlace } from './2gis/search'

/**
 * Проверяет и исправляет координаты места через поиск в 2GIS
 */
export async function validateAndFixCoordinates(
  placeName: string,
  regionId: string,
  originalLat: number,
  originalLon: number
): Promise<{ lat: number; lon: number; fixed: boolean; confidence: number }> {
  try {
    console.log(`🔍 Searching in 2GIS: "${placeName}" in region ${regionId}`)

    // Поиск места через 2GIS Places API
    const result = await searchPlace(placeName, regionId)

    if (!result) {
      console.warn(`❌ No 2GIS results for "${placeName}" in region ${regionId}`)
      return { lat: originalLat, lon: originalLon, fixed: false, confidence: 0 }
    }

    const gisLat = result.coordinates.lat
    const gisLon = result.coordinates.lon

    // Вычисляем расстояние между оригиналом и 2GIS координатами
    const distance = calculateDistance(originalLat, originalLon, gisLat, gisLon)

    // ВСЕГДА используем координаты из 2GIS (они точнее для России)
    if (distance > 0.01) {
      // Логируем только если отличие больше 10 метров
      console.log(`✅ Fixed "${placeName}": moved ${distance.toFixed(2)}km`)
      console.log(`   Found: ${result.name}`)
      console.log(`   Address: ${result.address || 'N/A'}`)
    } else {
      console.log(`✓ "${placeName}" coordinates OK (${distance.toFixed(3)}km diff)`)
    }

    return {
      lat: gisLat,
      lon: gisLon,
      fixed: distance > 0.01,
      confidence: distance < 0.1 ? 1.0 : 0.8, // Высокая уверенность если близко
    }
  } catch (error) {
    console.error(`❌ Error validating coordinates for "${placeName}":`, error)
    return { lat: originalLat, lon: originalLon, fixed: false, confidence: 0 }
  }
}

/**
 * Валидирует все точки маршрута
 */
export async function validateRouteCoordinates(route: any, regionId: string = '38'): Promise<any> {
  if (!route.points || route.points.length === 0) {
    return route
  }

  console.log(`\n🔍 Validating ${route.points.length} points through 2GIS with region_id=${regionId}...`)

  // Валидируем каждую точку с задержкой (чтобы не перегружать 2GIS API)
  const validatedPoints = []

  for (let i = 0; i < route.points.length; i++) {
    const point = route.points[i]

    // Задержка между запросами (300ms для 2GIS)
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    console.log(`\n[${i + 1}/${route.points.length}] ${point.name}`)

    const validated = await validateAndFixCoordinates(
      point.name,
      regionId,
      point.coordinates.lat,
      point.coordinates.lon
    )

    validatedPoints.push({
      ...point,
      coordinates: {
        lat: validated.lat,
        lon: validated.lon,
      },
      _validation: {
        fixed: validated.fixed,
        confidence: validated.confidence,
      },
    })
  }

  const fixedCount = validatedPoints.filter((p) => p._validation.fixed).length

  console.log(`\n✅ Validation complete:`)
  console.log(`   Fixed: ${fixedCount}/${route.points.length}`)
  console.log(`   OK: ${route.points.length - fixedCount}/${route.points.length}`)

  return {
    ...route,
    points: validatedPoints,
  }
}

/**
 * Вычисление расстояния между координатами (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Радиус Земли в км
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
