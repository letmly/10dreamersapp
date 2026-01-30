'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useGeolocation } from '@/hooks/useGeolocation'
import { mockPlaces } from '@/lib/mockData'
import type { Place } from '@/types'

// Динамический импорт карты 2GIS (работает только на клиенте)
const Map2GISView = dynamic(() => import('@/components/map/Map2GISView'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Загрузка карты...</p>
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
      <header className="bg-white/95 backdrop-blur-md shadow-sm z-10 safe-top border-b border-gray-200/50">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              KULTR
            </span>
            <span className="text-gray-800">TALK</span>
          </Link>

          <div className="flex items-center gap-2">
            {error && (
              <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full font-medium">
                📍 Недоступно
              </span>
            )}
            {!error && latitude && (
              <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                📍 Найдено
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <Map2GISView
          places={mockPlaces}
          userLocation={
            latitude && longitude ? { latitude, longitude } : null
          }
          onPlaceClick={setSelectedPlace}
        />
      </div>

      {/* Place Details Card */}
      {selectedPlace && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl safe-bottom z-20 animate-slide-up max-h-[70vh] overflow-y-auto">
          <div className="p-6">
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

            {/* Place Image */}
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl mb-5 overflow-hidden flex items-center justify-center">
              <div className="text-8xl">
                {getCategoryEmoji(selectedPlace.category)}
              </div>
            </div>

            {/* Place Info */}
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{selectedPlace.name}</h2>
            <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
              <span>📍</span>
              {selectedPlace.address}
            </p>
            <p className="text-gray-700 mb-5 leading-relaxed">{selectedPlace.description}</p>

            {/* Stats */}
            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-full">
                <span className="text-yellow-500">⭐</span>
                <span className="font-bold text-gray-900">{selectedPlace.rating}</span>
              </div>
              {selectedPlace.ticketPrice && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full">
                  <span>💰</span>
                  <span className="font-bold text-gray-900">{selectedPlace.ticketPrice} ₽</span>
                </div>
              )}
              {selectedPlace.openingHours && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
                  <span>🕐</span>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedPlace.openingHours.split(',')[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Facts */}
            {selectedPlace.facts && selectedPlace.facts.length > 0 && (
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4">
                <h3 className="font-bold mb-3 text-gray-900">💡 Интересные факты:</h3>
                <ul className="space-y-2">
                  {selectedPlace.facts.slice(0, 2).map((fact, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex">
                      <span className="mr-2 text-purple-500">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all">
                Начать квест
              </button>
              <button
                onClick={() => setSelectedPlace(null)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 active:scale-95 transition-all"
              >
                Закрыть
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
