'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeneratedRouteResponse } from '@/types/personalization'

interface RouteMapViewProps {
  route: GeneratedRouteResponse['route']
}

export default function RouteMapView({ route }: RouteMapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Создаем карту
    const map = L.map(mapContainerRef.current, {
      center: [59.9343, 30.3351],
      zoom: 13,
      zoomControl: true,
    })

    // Добавляем тайлы
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    mapRef.current = map

    // Отрисовываем маршрут
    if (route.points && route.points.length > 0) {
      // Линия маршрута
      const routeLine = route.points.map((point) => [point.coordinates.lat, point.coordinates.lon] as [number, number])

      const polyline = L.polyline(routeLine, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
      }).addTo(map)

      // Маркеры для точек
      route.points.forEach((point, index) => {
        const marker = L.marker([point.coordinates.lat, point.coordinates.lon], {
          icon: L.divIcon({
            className: 'route-marker',
            html: `
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 bg-blue-500 text-white rounded-full border-4 border-white shadow-lg flex items-center justify-center font-bold text-lg">
                  ${point.point_number}
                </div>
                <div class="mt-1 px-2 py-1 bg-white rounded-lg shadow-md text-xs font-medium whitespace-nowrap">
                  ${point.name}
                </div>
              </div>
            `,
            iconSize: [100, 60],
            iconAnchor: [50, 30],
          }),
        }).addTo(map)

        // Popup с деталями
        marker.bindPopup(`
          <div class="p-2">
            <div class="font-bold text-lg mb-1">${point.point_number}. ${point.name}</div>
            <div class="text-sm text-gray-600 mb-2">${point.description}</div>
            <div class="flex gap-2 text-xs">
              <span class="px-2 py-1 bg-gray-100 rounded">⏱️ ${point.visit_duration_minutes} мин</span>
              <span class="px-2 py-1 bg-gray-100 rounded">💰 ${point.price_level}</span>
            </div>
          </div>
        `)
      })

      // Центрируем карту на маршруте
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
    }

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [route])

  return <div ref={mapContainerRef} className="w-full h-[50vh] min-h-[300px] max-h-[500px]" />
}
