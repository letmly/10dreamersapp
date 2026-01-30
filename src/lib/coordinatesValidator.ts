/**
 * Валидация и исправление координат через 2GIS Places API (вместо OSM)
 */

import { searchPlace } from './2gis/search'

/**
 * Проверяет и исправляет координаты места через поиск в 2GIS
 * Поддерживает массив альтернативных названий (search_queries)
 */
export async function validateAndFixCoordinates(
  placeName: string,
  regionId: string,
  originalLat: number,
  originalLon: number,
  searchQueries?: string[]
): Promise<{ lat: number; lon: number; fixed: boolean; confidence: number; found: boolean; distance: number }> {
  try {
    // Собираем все варианты для поиска
    const queries = searchQueries && searchQueries.length > 0 ? searchQueries : [placeName]

    console.log(`🔍 Searching in 2GIS: "${placeName}" in region ${regionId}`)
    if (searchQueries && searchQueries.length > 0) {
      console.log(`   Alternative queries: ${searchQueries.join(', ')}`)
    }

    // Пробуем каждый вариант названия
    let result = null

    for (const query of queries) {
      result = await searchPlace(query, regionId)
      if (result) {
        if (query !== placeName) {
          console.log(`   ✓ Found using alternative query: "${query}"`)
        }
        break
      }
      // Небольшая задержка между попытками
      await new Promise((resolve) => setTimeout(resolve, 150))
    }

    if (!result) {
      console.warn(`❌ No 2GIS results for "${placeName}" (tried ${queries.length} queries)`)
      return { lat: originalLat, lon: originalLon, fixed: false, confidence: 0, found: false, distance: Infinity }
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

    // Определяем confidence на основе расстояния
    let confidence = 1.0
    if (distance > 5.0) confidence = 0.2 // Очень далеко
    else if (distance > 1.5) confidence = 0.5 // Далеко
    else if (distance > 0.5) confidence = 0.7 // Средне
    else if (distance > 0.1) confidence = 0.9 // Близко
    else confidence = 1.0 // Очень близко

    return {
      lat: gisLat,
      lon: gisLon,
      fixed: distance > 0.01,
      confidence,
      found: true,
      distance,
    }
  } catch (error) {
    console.error(`❌ Error validating coordinates for "${placeName}":`, error)
    return { lat: originalLat, lon: originalLon, fixed: false, confidence: 0, found: false, distance: Infinity }
  }
}

/**
 * Валидирует все точки маршрута и фильтрует точки с плохими координатами
 *
 * @param route - маршрут с точками
 * @param regionId - ID региона в 2GIS
 * @param maxDistance - максимальное расстояние смещения в км (по умолчанию 1.5км)
 * @param desiredPointsCount - желаемое количество точек (опционально)
 * @returns маршрут с отфильтрованными точками
 */
export async function validateRouteCoordinates(
  route: any,
  regionId: string = '38',
  maxDistance: number = 1.5,
  desiredPointsCount?: number
): Promise<any> {
  if (!route.points || route.points.length === 0) {
    return route
  }

  console.log(`\n🔍 Validating ${route.points.length} points through 2GIS with region_id=${regionId}...`)
  console.log(`   Max allowed distance: ${maxDistance}km`)
  if (desiredPointsCount) {
    console.log(`   Target points count: ${desiredPointsCount}`)
  }

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
      point.coordinates.lon,
      point.search_queries // Передаем альтернативные названия
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
        found: validated.found,
        distance: validated.distance,
      },
    })
  }

  // Фильтруем точки: оставляем только найденные и с расстоянием < maxDistance
  const goodPoints = validatedPoints.filter(
    (p) => p._validation.found && p._validation.distance < maxDistance
  )
  const badPoints = validatedPoints.filter(
    (p) => !p._validation.found || p._validation.distance >= maxDistance
  )

  console.log(`\n📊 Validation results:`)
  console.log(`   Total generated: ${route.points.length}`)
  console.log(`   Found in 2GIS: ${validatedPoints.filter((p) => p._validation.found).length}`)
  console.log(`   Good coordinates (< ${maxDistance}km): ${goodPoints.length}`)
  console.log(`   Bad coordinates (> ${maxDistance}km): ${badPoints.length}`)

  if (badPoints.length > 0) {
    console.log(`\n❌ Filtered out points:`)
    badPoints.forEach((p) => {
      const reason = !p._validation.found
        ? 'not found in 2GIS'
        : `too far (${p._validation.distance.toFixed(2)}km)`
      console.log(`   - ${p.name} (${reason})`)
    })
  }

  // Если указано желаемое количество точек, берем только его
  let finalPoints = goodPoints
  if (desiredPointsCount && goodPoints.length > desiredPointsCount) {
    console.log(`\n✂️ Trimming to ${desiredPointsCount} points (from ${goodPoints.length})`)
    finalPoints = goodPoints.slice(0, desiredPointsCount)
  }

  // Пересчитываем point_number
  finalPoints = finalPoints.map((point, index) => ({
    ...point,
    point_number: index + 1,
  }))

  console.log(`\n✅ Final route: ${finalPoints.length} points`)

  return {
    ...route,
    points: finalPoints,
    statistics: {
      ...route.statistics,
      total_points: finalPoints.length,
    },
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
