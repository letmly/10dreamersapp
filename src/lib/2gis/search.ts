/**
 * 2GIS Places API для поиска мест и получения реальных координат
 */

export interface Place2GISSearchResult {
  id: string
  name: string
  address?: string
  coordinates: {
    lat: number
    lon: number
  }
  type?: string
  building_name?: string
}

/**
 * Упрощение запроса для fallback поиска
 */
function simplifyQuery(query: string): string {
  // Убираем длинные описания и специфичные детали
  let simplified = query
    .replace(/архитектурный ансамбль/gi, '')
    .replace(/культурный центр/gi, '')
    .replace(/исторический/gi, '')
    .replace(/памятник архитектуры/gi, '')
    .replace(/здание/gi, '')
    .replace(/улица/gi, 'ул.')
    .replace(/\s+/g, ' ')
    .trim()

  // Если в запросе есть "Волжского/Волжский", попробуем убрать
  if (simplified.toLowerCase().includes('волжского') || simplified.toLowerCase().includes('волжский')) {
    simplified = simplified.replace(/волжского/gi, '').replace(/волжский/gi, '').trim()
  }

  return simplified
}

/**
 * Маппинг городов на region_id в 2GIS
 */
function getCityRegionId(city: string): string {
  const regionMap: Record<string, string> = {
    'saint-petersburg': '38',
    'moscow': '1',
    'volzhskiy': '117',
    'volgograd': '38',
    'kazan': '4416',
    'yekaterinburg': '4',
    'novosibirsk': '67',
    'chelyabinsk': '76',
    'samara': '86',
    'omsk': '20',
    'rostov': '93',
    'ufa': '63',
    'krasnoyarsk': '88',
    'voronezh': '473',
    'perm': '296',
    'nizhny-novgorod': '5181',
  }

  return regionMap[city] || '38' // По умолчанию СПб
}

/**
 * Поиск места по названию через 2GIS Catalog API
 */
export async function searchPlace(
  query: string,
  regionId: string = '38'
): Promise<Place2GISSearchResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_2GIS_API_KEY || ''

    if (!apiKey) {
      console.error('2GIS API key not configured')
      return null
    }

    // 2GIS Catalog API для поиска
    const url = 'https://catalog.api.2gis.com/3.0/items'

    const params = new URLSearchParams({
      q: query,
      region_id: regionId,
      type: 'branch,building,attraction',
      fields: 'items.point,items.address',
      key: apiKey,
      page_size: '1', // Берем только лучший результат
    })

    console.log('2GIS Places Search:', { query, regionId, url: `${url}?${params}` })

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('2GIS Places API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    console.log('2GIS Places response:', data)

    if (!data?.result?.items || data.result.items.length === 0) {
      console.warn(`❌ No place found for query: "${query}"`)

      // Fallback 1: попробуем упрощённый поиск (убираем длинные описания)
      const simplifiedQuery = simplifyQuery(query)
      if (simplifiedQuery !== query && simplifiedQuery.length > 3) {
        console.log(`🔄 Fallback: simplified search "${simplifiedQuery}"`)
        return await searchPlace(simplifiedQuery, regionId)
      }

      return null
    }

    const item = data.result.items[0]

    // Извлекаем координаты
    const lat = item.point?.lat
    const lon = item.point?.lon

    if (!lat || !lon) {
      console.warn('Place found but no coordinates:', item)
      return null
    }

    const result: Place2GISSearchResult = {
      id: item.id || '',
      name: item.name || query,
      address: item.address_name || item.full_address_name,
      coordinates: {
        lat,
        lon,
      },
      type: item.type,
      building_name: item.building_name,
    }

    console.log('2GIS place found:', result)
    return result
  } catch (error) {
    console.error('Error searching place in 2GIS:', error)
    return null
  }
}

/**
 * Поиск нескольких мест по названиям
 */
export async function searchPlaces(
  queries: string[],
  regionId: string = '38'
): Promise<(Place2GISSearchResult | null)[]> {
  const results: (Place2GISSearchResult | null)[] = []

  for (const query of queries) {
    const result = await searchPlace(query, regionId)
    results.push(result)

    // Небольшая задержка между запросами
    if (queries.indexOf(query) < queries.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  return results
}
