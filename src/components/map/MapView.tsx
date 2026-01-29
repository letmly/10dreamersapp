'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Place } from '@/types'
import { SAINT_PETERSBURG_CENTER } from '@/lib/mockData'

interface MapViewProps {
  places: Place[]
  userLocation?: { lat: number; lng: number }
  selectedPlace: Place | null
  onPlaceSelect: (place: Place | null) => void
}

export default function MapView({
  places,
  userLocation,
  selectedPlace,
  onPlaceSelect,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)

  // Инициализация карты
  useEffect(() => {
    if (mapRef.current) return

    const map = L.map('map', {
      zoomControl: false, // Отключаем стандартные контролы
    }).setView([SAINT_PETERSBURG_CENTER.lat, SAINT_PETERSBURG_CENTER.lng], 13)

    // Добавляем тайлы OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Добавляем кастомные контролы зума
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Обновление маркеров мест
  useEffect(() => {
    if (!mapRef.current) return

    // Удаляем старые маркеры
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Создаем иконки для маркеров
    const createIcon = (emoji: string, isSelected: boolean) => {
      return L.divIcon({
        html: `
          <div style="
            font-size: ${isSelected ? '32px' : '24px'};
            transition: all 0.2s;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          ">
            ${emoji}
          </div>
        `,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })
    }

    const getCategoryEmoji = (category: string): string => {
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

    // Добавляем новые маркеры
    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id
      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
        icon: createIcon(getCategoryEmoji(place.category), isSelected),
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div style="text-align: center;">
            <strong>${place.name}</strong><br/>
            <small>${place.category}</small>
          </div>`
        )
        .on('click', () => {
          onPlaceSelect(place)
        })

      markersRef.current.push(marker)
    })
  }, [places, selectedPlace, onPlaceSelect])

  // Обновление маркера пользователя
  useEffect(() => {
    if (!mapRef.current) return

    // Удаляем старый маркер пользователя
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    // Добавляем новый маркер пользователя
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #0ea5e9;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        className: 'user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      })
        .addTo(mapRef.current)
        .bindPopup('Вы здесь')
    }
  }, [userLocation])

  // Центрирование на выбранном месте
  useEffect(() => {
    if (!mapRef.current || !selectedPlace) return

    mapRef.current.setView(
      [selectedPlace.coordinates.lat, selectedPlace.coordinates.lng],
      15,
      { animate: true }
    )
  }, [selectedPlace])

  return (
    <div id="map" className="w-full h-full">
      {/* Кнопка "Моя позиция" */}
      {userLocation && (
        <button
          onClick={() => {
            if (mapRef.current && userLocation) {
              mapRef.current.setView([userLocation.lat, userLocation.lng], 15, {
                animate: true,
              })
            }
          }}
          className="absolute top-4 right-4 z-[1000] bg-white rounded-full p-3 shadow-lg active:scale-95 transition-transform"
        >
          <span className="text-xl">📍</span>
        </button>
      )}
    </div>
  )
}
