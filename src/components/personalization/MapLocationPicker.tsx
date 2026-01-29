'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '@/hooks/useGeolocation'

interface MapLocationPickerProps {
  value?: { lat: number; lng: number; address?: string }
  onChange: (location: { lat: number; lng: number; address?: string }) => void
}

export default function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const { latitude, longitude, error: geoError } = useGeolocation()
  const [selectedLocation, setSelectedLocation] = useState(value)

  // Инициализация карты
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Создаем карту
    const map = L.map(mapContainerRef.current, {
      center: [59.9343, 30.3351], // Санкт-Петербург по умолчанию
      zoom: 12,
      zoomControl: true,
    })

    // Добавляем тайлы
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    mapRef.current = map

    // Обработчик клика по карте
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng

      // Получаем адрес через Nominatim (опционально)
      let address = undefined
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        )
        const data = await response.json()
        address = data.display_name
      } catch (error) {
        console.error('Failed to get address:', error)
      }

      const location = { lat, lng, address }
      setSelectedLocation(location)
      onChange(location)

      // Обновляем или создаем маркер
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'user-marker',
            html: '<div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xl">📍</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map)

        markerRef.current = marker
      }
    })

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [onChange])

  // Центрирование на геолокации пользователя
  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return

    mapRef.current.setView([latitude, longitude], 14)

    // Добавляем маркер текущей позиции
    if (!selectedLocation) {
      const location = { lat: latitude, lng: longitude }
      setSelectedLocation(location)
      onChange(location)

      const marker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: 'user-marker',
          html: '<div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xl">📍</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(mapRef.current)

      markerRef.current = marker
    }
  }, [latitude, longitude, selectedLocation, onChange])

  // Кнопка "Моя позиция"
  const handleMyLocation = () => {
    if (latitude && longitude && mapRef.current) {
      mapRef.current.setView([latitude, longitude], 14)

      const location = { lat: latitude, lng: longitude }
      setSelectedLocation(location)
      onChange(location)

      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude])
      }
    }
  }

  return (
    <div className="space-y-3">
      {/* Инструкция */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
        <p className="font-medium mb-1">📍 Выберите точку старта</p>
        <p className="text-blue-700">
          {geoError
            ? '👆 Кликните на карте в нужном месте, чтобы выбрать точку старта'
            : 'Нажмите на карте, чтобы выбрать место, откуда хотите начать путешествие'
          }
        </p>
        {geoError && (
          <p className="text-yellow-700 mt-2 text-xs">
            ⚠️ Геолокация недоступна - выберите точку вручную
          </p>
        )}
      </div>

      {/* Выбранная локация */}
      {selectedLocation && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-2 text-sm">
          <div className="font-medium text-green-900 flex items-center gap-2">
            ✅ Точка старта выбрана:
          </div>
          <div className="text-green-700 mt-1">
            {selectedLocation.address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
          </div>
        </div>
      )}

      {/* Подсказка если не выбрана точка */}
      {!selectedLocation && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-2 text-sm text-gray-600 text-center">
          👆 Кликните на карте ниже, чтобы выбрать точку старта
        </div>
      )}

      {/* Карта */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full h-[50vh] min-h-[400px] max-h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-gray-200"
        />

        {/* Кнопка "Моя позиция" - показываем только если геолокация работает */}
        {latitude && longitude && !geoError && (
          <button
            onClick={handleMyLocation}
            className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 active:scale-95 transition-all text-sm font-medium z-[1000]"
          >
            📍 Моя позиция
          </button>
        )}

        {/* Подсказка поверх карты если точка не выбрана */}
        {!selectedLocation && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[500]">
            <div className="bg-black/70 text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl">
              👆 Кликните на карте
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
