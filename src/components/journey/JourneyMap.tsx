'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeneratedRouteResponse } from '@/types/personalization'

interface JourneyMapProps {
  route: GeneratedRouteResponse['route']
  currentPointIndex: number
  visitedPoints: number[]
  userLocation?: { lat: number; lng: number }
}

export default function JourneyMap({
  route,
  currentPointIndex,
  visitedPoints,
  userLocation,
}: JourneyMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)

  // Инициализация карты
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [59.9343, 30.3351],
      zoom: 14,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Отрисовка маршрута
  useEffect(() => {
    if (!mapRef.current || !route) return

    // Удаляем старые маркеры
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Удаляем старую линию
    if (polylineRef.current) {
      polylineRef.current.remove()
    }

    // Линия маршрута
    const routeLine = route.points.map((point) => [point.coordinates.lat, point.coordinates.lon] as [
      number,
      number
    ])

    const polyline = L.polyline(routeLine, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7,
    }).addTo(mapRef.current)

    polylineRef.current = polyline

    // Маркеры точек
    route.points.forEach((point, index) => {
      const isVisited = visitedPoints.includes(index)
      const isCurrent = index === currentPointIndex
      const isNext = index === currentPointIndex && !isVisited

      let markerColor = '#9ca3af' // gray - будущая точка
      if (isVisited) markerColor = '#10b981' // green - посещенная
      if (isCurrent && !isVisited) markerColor = '#3b82f6' // blue - текущая

      const marker = L.marker([point.coordinates.lat, point.coordinates.lon], {
        icon: L.divIcon({
          className: 'route-marker',
          html: `
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center font-bold text-lg text-white"
                   style="background-color: ${markerColor}">
                ${isVisited ? '✓' : point.point_number}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
      }).addTo(mapRef.current!)

      markersRef.current.push(marker)
    })

    // Центрируем на текущей точке
    const currentPoint = route.points[currentPointIndex]
    if (currentPoint && mapRef.current) {
      mapRef.current.setView([currentPoint.coordinates.lat, currentPoint.coordinates.lon], 15)
    }
  }, [route, currentPointIndex, visitedPoints])

  // Отрисовка позиции пользователя
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
    } else {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="relative">
              <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full opacity-50 animate-ping"></div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(mapRef.current)

      userMarkerRef.current = userMarker
    }

    // Плавно двигаем карту к пользователю если он далеко от центра
    const center = mapRef.current.getCenter()
    const distance = Math.sqrt(
      Math.pow(center.lat - userLocation.lat, 2) + Math.pow(center.lng - userLocation.lng, 2)
    )

    if (distance > 0.01) {
      // ~1км
      mapRef.current.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 1 })
    }
  }, [userLocation])

  return <div ref={mapContainerRef} className="w-full h-full" />
}
