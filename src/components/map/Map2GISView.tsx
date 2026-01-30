'use client'

import { useEffect, useRef, useState } from 'react'
import { load } from '@2gis/mapgl'
import type { Map, HtmlMarker } from '@2gis/mapgl/types'
import type { Place } from '@/types'

interface Map2GISViewProps {
  places: Place[]
  center?: [number, number]
  zoom?: number
  onPlaceClick?: (place: Place) => void
  userLocation?: { latitude: number; longitude: number } | null
}

const CATEGORY_COLORS: Record<string, string> = {
  history: '#8B4513',
  art: '#9B59B6',
  architecture: '#E67E22',
  nature: '#27AE60',
  food: '#E74C3C',
  culture: '#3498DB',
  photography: '#F39C12',
  science: '#1ABC9C',
  music: '#E91E63',
}

export default function Map2GISView({
  places,
  center = [30.3141, 59.9386], // Default: St. Petersburg [lng, lat]
  zoom = 12,
  onPlaceClick,
  userLocation,
}: Map2GISViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<HtmlMarker[]>([])
  const userMarkerRef = useRef<HtmlMarker | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    let map: Map

    load().then((mapglAPI) => {
      if (!mapContainerRef.current || mapRef.current) return

      map = new mapglAPI.Map(mapContainerRef.current, {
        center,
        zoom,
        key: process.env.NEXT_PUBLIC_2GIS_API_KEY || '',
      })

      mapRef.current = map
    })

    return () => {
      if (map) {
        map.destroy()
      }
    }
  }, [])

  // Update markers when places change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear old markers
    markersRef.current.forEach((marker) => marker.destroy())
    markersRef.current = []

    load().then((mapglAPI) => {
      if (!mapRef.current) return

      places.forEach((place) => {
        const markerElement = document.createElement('div')
        markerElement.style.width = '40px'
        markerElement.style.height = '40px'
        markerElement.style.borderRadius = '50%'
        markerElement.style.backgroundColor = CATEGORY_COLORS[place.category] || '#3B82F6'
        markerElement.style.border = '3px solid white'
        markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        markerElement.style.display = 'flex'
        markerElement.style.alignItems = 'center'
        markerElement.style.justifyContent = 'center'
        markerElement.style.fontSize = '20px'
        markerElement.style.cursor = 'pointer'
        markerElement.style.transition = 'transform 0.2s'
        markerElement.innerHTML = getCategoryEmoji(place.category)

        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.1)'
        })
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)'
        })
        markerElement.addEventListener('click', () => {
          onPlaceClick?.(place)
        })

        const marker = new mapglAPI.HtmlMarker(mapRef.current!, {
          coordinates: [place.coordinates.lng, place.coordinates.lat],
          html: markerElement,
        })

        markersRef.current.push(marker)
      })
    })
  }, [places, onPlaceClick])

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current) return

    load().then((mapglAPI) => {
      if (!mapRef.current) return

      // Remove old user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.destroy()
        userMarkerRef.current = null
      }

      if (userLocation) {
        const userElement = document.createElement('div')
        userElement.style.width = '16px'
        userElement.style.height = '16px'
        userElement.style.borderRadius = '50%'
        userElement.style.backgroundColor = '#3B82F6'
        userElement.style.border = '3px solid white'
        userElement.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.6)'

        const userMarker = new mapglAPI.HtmlMarker(mapRef.current!, {
          coordinates: [userLocation.longitude, userLocation.latitude],
          html: userElement,
        })

        userMarkerRef.current = userMarker

        // Center on user location
        mapRef.current.setCenter([userLocation.longitude, userLocation.latitude])
        mapRef.current.setZoom(14)
      }
    })
  }, [userLocation])

  // Center on user button
  const centerOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setCenter([userLocation.longitude, userLocation.latitude])
      mapRef.current.setZoom(16)
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Center on user button */}
      {userLocation && (
        <button
          onClick={centerOnUser}
          className="absolute bottom-6 right-6 bg-white text-blue-600 p-3 rounded-full shadow-lg z-10 hover:bg-blue-50 active:scale-95 transition-transform"
          aria-label="Center on my location"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    history: '🏛️',
    art: '🎨',
    architecture: '🏗️',
    nature: '🌳',
    food: '🍽️',
    culture: '🎭',
    photography: '📸',
    science: '🔬',
    music: '🎵',
  }
  return emojiMap[category] || '📍'
}
