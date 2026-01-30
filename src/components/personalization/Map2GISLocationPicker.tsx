'use client'

import { useState, useEffect, useRef } from 'react'
import { load } from '@2gis/mapgl'
import type { Map, Marker } from '@2gis/mapgl/types'

interface Map2GISLocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string, regionId?: string) => void
  initialLocation?: { lat: number; lng: number }
}

export default function Map2GISLocationPicker({
  onLocationSelect,
  initialLocation,
}: Map2GISLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  )
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState<string>('')
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [geolocationDenied, setGeolocationDenied] = useState(false)

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(loc)

          // If no initial location, set user location as default
          if (!initialLocation) {
            setSelectedLocation(loc)
            fetchAddress(loc.lat, loc.lng)
          }
        },
        (error) => {
          console.log('Geolocation not available, using default location')
          setGeolocationDenied(true)

          // If no initial location was provided, set default marker at map center
          if (!initialLocation) {
            const defaultLoc = {
              lat: 59.9386,
              lng: 30.3141,
            }
            setSelectedLocation(defaultLoc)
            fetchAddress(defaultLoc.lat, defaultLoc.lng)
          }
        }
      )
    }
  }, [initialLocation])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    let map: Map

    const initCenter = initialLocation
      ? [initialLocation.lng, initialLocation.lat]
      : [30.3141, 59.9386]

    load().then((mapglAPI) => {
      if (!mapContainerRef.current || mapRef.current) return

      map = new mapglAPI.Map(mapContainerRef.current, {
        center: initCenter as [number, number],
        zoom: 12,
        key: process.env.NEXT_PUBLIC_2GIS_API_KEY || '',
      })

      mapRef.current = map

      // Click to set location
      map.on('click', (e) => {
        const { lngLat } = e
        setSelectedLocation({ lat: lngLat[1], lng: lngLat[0] })
        fetchAddress(lngLat[1], lngLat[0])
      })
    })

    return () => {
      if (map) {
        map.destroy()
      }
    }
  }, [initialLocation])

  // Center on user location when it becomes available
  useEffect(() => {
    if (mapRef.current && userLocation && !initialLocation) {
      mapRef.current.setCenter([userLocation.lng, userLocation.lat])
      mapRef.current.setZoom(14)
    }
  }, [userLocation, initialLocation])

  // Update marker when location changes
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return

    load().then((mapglAPI) => {
      if (!mapRef.current) return

      // Remove old marker
      if (markerRef.current) {
        markerRef.current.destroy()
      }

      // Create simple marker
      const marker = new mapglAPI.Marker(mapRef.current, {
        coordinates: [selectedLocation.lng, selectedLocation.lat],
      })

      markerRef.current = marker
    })
  }, [selectedLocation])

  // Fetch address from coordinates using 2GIS Geocoder API
  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingAddress(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_2GIS_API_KEY || ''
      const response = await fetch(
        `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lng}&fields=items.address,items.region_id&key=${apiKey}`
      )

      if (response.ok) {
        const data = await response.json()
        const item = data.result?.items?.[0]
        const addr = item?.full_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

        // Берём region_id напрямую из ответа 2GIS и передаём его дальше!
        const regionId = item?.region_id || '38' // По умолчанию СПб

        console.log('📍 Location region_id:', regionId)
        console.log('📍 Address:', addr)

        setAddress(addr)
        onLocationSelect(lat, lng, addr, String(regionId))
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        onLocationSelect(lat, lng, undefined, '38') // Дефолтный region_id если API не ответил
      }
    } catch (error) {
      console.error('Error fetching address:', error)
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      onLocationSelect(lat, lng, undefined, '38') // Дефолтный region_id при ошибке
    } finally {
      setIsLoadingAddress(false)
    }
  }

  // Use current location
  const useCurrentLocation = () => {
    if (userLocation && mapRef.current) {
      setSelectedLocation(userLocation)
      mapRef.current.setCenter([userLocation.lng, userLocation.lat])
      mapRef.current.setZoom(16)
      fetchAddress(userLocation.lat, userLocation.lng)
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Address display */}
      <div className="p-4 bg-white border-t border-gray-200">
        {isLoadingAddress ? (
          <p className="text-sm text-gray-500">🔍 Определяем адрес...</p>
        ) : selectedLocation ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">📍 Выбранная точка:</p>
            <p className="text-xs text-gray-600">{address || 'Адрес не найден'}</p>
            {userLocation && (
              <button
                onClick={useCurrentLocation}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium active:scale-95 transition-transform"
              >
                📍 Использовать мое текущее местоположение
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              👆 Нажмите на карту, чтобы выбрать стартовую точку
            </p>
            {geolocationDenied && (
              <p className="text-xs text-amber-600">
                💡 Геолокация недоступна. Выберите точку вручную на карте.
              </p>
            )}
            {userLocation && (
              <button
                onClick={useCurrentLocation}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium active:scale-95 transition-transform"
              >
                📍 Использовать мое текущее местоположение
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
