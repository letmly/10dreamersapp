'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useGeolocation } from '@/hooks/useGeolocation'
import { mockPlaces } from '@/lib/mockData'
import type { Place } from '@/types'

// Динамический импорт карты (leaflet работает только на клиенте)
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка карты...</p>
      </div>
    </div>
  ),
})

export default function MapPage() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const { latitude, longitude, error } = useGeolocation()

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Карта</h1>
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-xs text-red-500">📍 Геолокация недоступна</span>
            )}
            {!error && latitude && (
              <span className="text-xs text-green-600">📍 Ваша позиция</span>
            )}
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          places={mockPlaces}
          userLocation={
            latitude && longitude ? { lat: latitude, lng: longitude } : undefined
          }
          selectedPlace={selectedPlace}
          onPlaceSelect={setSelectedPlace}
        />
      </div>

      {/* Place Details Card */}
      {selectedPlace && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl safe-bottom z-20 animate-slide-up">
          <div className="p-4">
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

            {/* Place Image */}
            <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {getCategoryEmoji(selectedPlace.category)}
              </div>
            </div>

            {/* Place Info */}
            <h2 className="text-2xl font-bold mb-2">{selectedPlace.name}</h2>
            <p className="text-gray-600 text-sm mb-3">{selectedPlace.address}</p>
            <p className="text-gray-700 mb-4">{selectedPlace.description}</p>

            {/* Stats */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{selectedPlace.rating}</span>
              </div>
              {selectedPlace.ticketPrice && (
                <div className="flex items-center gap-1">
                  <span>💰</span>
                  <span className="font-semibold">{selectedPlace.ticketPrice} ₽</span>
                </div>
              )}
              {selectedPlace.openingHours && (
                <div className="flex items-center gap-1">
                  <span>🕐</span>
                  <span className="text-sm text-gray-600">
                    {selectedPlace.openingHours.split(',')[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Facts */}
            {selectedPlace.facts && selectedPlace.facts.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Интересные факты:</h3>
                <ul className="space-y-1">
                  {selectedPlace.facts.slice(0, 2).map((fact, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex">
                      <span className="mr-2">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button className="btn-primary flex-1">
                Начать квест
              </button>
              <button className="btn-secondary">
                Подробнее
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    museum: '🏛️',
    monument: '🗿',
    theater: '🎭',
    park: '🌳',
    church: '⛪',
    palace: '🏰',
    bridge: '🌉',
    other: '📍',
  }
  return emojis[category] || '📍'
}
