/**
 * OSRM Routing для построения пешеходных маршрутов
 * Используем бесплатный публичный OSRM API вместо 2GIS (50 запросов/день)
 */

interface RoutingPoint {
  lat: number
  lon: number
}

export interface WalkingRoute {
  coordinates: [number, number][]
  distance: number // meters
  duration: number // seconds
  instructions: string[]
}

/**
 * Декодирование polyline из OSRM (Google Polyline Algorithm Format)
 */
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b
    let shift = 0
    let result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    coordinates.push([lng / 1e5, lat / 1e5])
  }

  return coordinates
}

/**
 * Построение пешеходного маршрута через OSRM API (бесплатно)
 */
export async function getWalkingRoute(
  from: RoutingPoint,
  to: RoutingPoint
): Promise<WalkingRoute | null> {
  try {
    // OSRM Public API endpoint (foot-walking profile)
    const url = `https://router.project-osrm.org/route/v1/foot/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=polyline&steps=true`

    console.log('OSRM Routing API request:', url)

    const response = await fetch(url, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OSRM Routing API error:', response.status, errorText)
      // Fallback to simple straight line
      return {
        coordinates: [
          [from.lon, from.lat],
          [to.lon, to.lat],
        ],
        distance: calculateStraightLineDistance(from, to),
        duration: Math.round(calculateStraightLineDistance(from, to) / 1.4), // ~1.4 m/s walking speed
        instructions: ['Идите прямо к точке назначения'],
      }
    }

    const data = await response.json()
    console.log('OSRM Routing API response:', data)

    // Check for valid response
    if (!data?.routes?.[0]) {
      console.warn('No route found in OSRM response:', data)
      return {
        coordinates: [
          [from.lon, from.lat],
          [to.lon, to.lat],
        ],
        distance: calculateStraightLineDistance(from, to),
        duration: Math.round(calculateStraightLineDistance(from, to) / 1.4),
        instructions: ['Идите прямо к точке назначения'],
      }
    }

    const route = data.routes[0]

    // Decode polyline geometry
    let coordinates: [number, number][] = []
    if (route.geometry && typeof route.geometry === 'string') {
      coordinates = decodePolyline(route.geometry)
    }

    // Fallback to straight line if no geometry
    if (coordinates.length === 0) {
      coordinates = [
        [from.lon, from.lat],
        [to.lon, to.lat],
      ]
    }

    // Extract step instructions
    const instructions: string[] = []
    if (route.legs && route.legs[0] && route.legs[0].steps) {
      route.legs[0].steps.forEach((step: any) => {
        if (step.maneuver && step.maneuver.instruction) {
          instructions.push(step.maneuver.instruction)
        }
      })
    }

    console.log('OSRM parsed:', {
      coordinates: coordinates.length,
      distance: route.distance,
      duration: route.duration,
      instructions: instructions.length,
    })

    return {
      coordinates,
      distance: route.distance || calculateStraightLineDistance(from, to),
      duration: route.duration || Math.round(calculateStraightLineDistance(from, to) / 1.4),
      instructions: instructions.length > 0 ? instructions : ['Идите прямо к точке назначения'],
    }
  } catch (error) {
    console.error('Error getting walking route from OSRM:', error)

    // Fallback to simple straight line
    return {
      coordinates: [
        [from.lon, from.lat],
        [to.lon, to.lat],
      ],
      distance: calculateStraightLineDistance(from, to),
      duration: Math.round(calculateStraightLineDistance(from, to) / 1.4),
      instructions: ['Идите прямо к точке назначения'],
    }
  }
}

/**
 * Построение полного маршрута через несколько точек
 */
export async function getMultiPointWalkingRoute(
  points: RoutingPoint[]
): Promise<WalkingRoute[]> {
  const routes: WalkingRoute[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const route = await getWalkingRoute(points[i], points[i + 1])
    if (route) {
      routes.push(route)
    }

    // Small delay to be respectful to free OSRM API
    if (i < points.length - 2) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return routes
}

/**
 * Calculate straight line distance using Haversine formula
 */
function calculateStraightLineDistance(from: RoutingPoint, to: RoutingPoint): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLon = ((to.lon - from.lon) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Combine multiple routes into single polyline
 */
export function combineRoutes(routes: WalkingRoute[]): {
  coordinates: [number, number][]
  totalDistance: number
  totalDuration: number
} {
  const coordinates: [number, number][] = []
  let totalDistance = 0
  let totalDuration = 0

  routes.forEach((route) => {
    coordinates.push(...route.coordinates)
    totalDistance += route.distance
    totalDuration += route.duration
  })

  return {
    coordinates,
    totalDistance,
    totalDuration,
  }
}
