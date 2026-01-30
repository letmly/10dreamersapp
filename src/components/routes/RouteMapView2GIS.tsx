'use client'

import { useRef, useEffect, useState } from 'react'
import { load } from '@2gis/mapgl'
import type { Map, Marker, Polyline, HtmlMarker } from '@2gis/mapgl/types'
import type { GeneratedRouteResponse } from '@/types/personalization'

interface RouteMapView2GISProps {
  route: GeneratedRouteResponse['route']
}

export default function RouteMapView2GIS({ route }: RouteMapView2GISProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<HtmlMarker[]>([])
  const polylineRef = useRef<Polyline | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    console.log('🗺️ RouteMapView: Initializing map')

    let map: Map

    const initialCenter =
      route.points && route.points.length > 0
        ? [route.points[0].coordinates.lon, route.points[0].coordinates.lat]
        : [30.3351, 59.9343]

    load().then((mapglAPI) => {
      if (!mapContainerRef.current || mapRef.current) return

      map = new mapglAPI.Map(mapContainerRef.current, {
        center: initialCenter as [number, number],
        zoom: 13,
        key: process.env.NEXT_PUBLIC_2GIS_API_KEY || '',
      })

      mapRef.current = map
      console.log('✅ RouteMapView: Map initialized')
    })

    return () => {
      if (map) {
        map.destroy()
      }
    }
  }, [route])

  // Draw route and markers
  useEffect(() => {
    if (!route) {
      console.log('⚠️ RouteMapView: No route to draw')
      return
    }

    // Ждем пока карта инициализируется
    const checkMapAndDraw = () => {
      if (!mapRef.current) {
        console.log('⏳ RouteMapView: Waiting for map...')
        setTimeout(checkMapAndDraw, 100)
        return
      }

      console.log('📍 RouteMapView: Drawing', route.points?.length, 'points')

      load().then((mapglAPI) => {
        if (!mapRef.current) return

      // Clear old markers
      markersRef.current.forEach((marker) => marker.destroy())
      markersRef.current = []

      // Remove old polyline
      if (polylineRef.current) {
        polylineRef.current.destroy()
        polylineRef.current = null
      }

      // Не рисуем линии - только точки маршрута
      if (route.points && route.points.length > 0) {
        console.log('Centering map and creating markers...')

        // Calculate bounds and fit
        const lats = route.points.map((p) => p.coordinates.lat)
        const lons = route.points.map((p) => p.coordinates.lon)

        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const minLon = Math.min(...lons)
        const maxLon = Math.max(...lons)

        // Calculate center and zoom to fit all points
        const centerLon = (minLon + maxLon) / 2
        const centerLat = (minLat + maxLat) / 2

        mapRef.current.setCenter([centerLon, centerLat])

        // Calculate appropriate zoom level based on bounds
        const lonDiff = maxLon - minLon
        const latDiff = maxLat - minLat
        const maxDiff = Math.max(lonDiff, latDiff)

        let zoom = 14
        if (maxDiff > 0.1) zoom = 11
        if (maxDiff > 0.2) zoom = 10
        if (maxDiff > 0.5) zoom = 9

        mapRef.current.setZoom(zoom)
      }

      // Draw markers
      route.points.forEach((point, index) => {
        const markerContainer = document.createElement('div')
        markerContainer.style.display = 'flex'
        markerContainer.style.flexDirection = 'column'
        markerContainer.style.alignItems = 'center'
        markerContainer.style.cursor = 'pointer'

        const markerCircle = document.createElement('div')
        markerCircle.style.width = '40px'
        markerCircle.style.height = '40px'
        markerCircle.style.borderRadius = '50%'
        markerCircle.style.backgroundColor = '#3b82f6'
        markerCircle.style.border = '4px solid white'
        markerCircle.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        markerCircle.style.display = 'flex'
        markerCircle.style.alignItems = 'center'
        markerCircle.style.justifyContent = 'center'
        markerCircle.style.fontSize = '18px'
        markerCircle.style.fontWeight = 'bold'
        markerCircle.style.color = 'white'
        markerCircle.innerHTML = String(point.point_number)

        const markerLabel = document.createElement('div')
        markerLabel.style.marginTop = '4px'
        markerLabel.style.padding = '4px 8px'
        markerLabel.style.backgroundColor = 'white'
        markerLabel.style.borderRadius = '8px'
        markerLabel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
        markerLabel.style.fontSize = '12px'
        markerLabel.style.fontWeight = '500'
        markerLabel.style.whiteSpace = 'nowrap'
        markerLabel.style.maxWidth = '120px'
        markerLabel.style.overflow = 'hidden'
        markerLabel.style.textOverflow = 'ellipsis'
        markerLabel.textContent = point.name

        markerContainer.appendChild(markerCircle)
        markerContainer.appendChild(markerLabel)

        markerContainer.addEventListener('mouseenter', () => {
          markerCircle.style.transform = 'scale(1.1)'
        })
        markerContainer.addEventListener('mouseleave', () => {
          markerCircle.style.transform = 'scale(1)'
        })
        markerContainer.addEventListener('click', () => {
          setSelectedPoint(index)
        })

        const marker = new mapglAPI.HtmlMarker(mapRef.current!, {
          coordinates: [point.coordinates.lon, point.coordinates.lat],
          html: markerContainer,
          anchor: [20, 20], // Привязка к центру круга (40px / 2 = 20px)
        })

        markersRef.current.push(marker)
      })
    })
    }

    checkMapAndDraw()
  }, [route])

  const selectedPointData = selectedPoint !== null ? route.points[selectedPoint] : null

  return (
    <div className="w-full h-[500px] relative">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Popup for selected point */}
      {selectedPointData && (
        <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-lg z-10 p-4">
          <button
            onClick={() => setSelectedPoint(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <div className="font-bold text-lg mb-1">
            {selectedPointData.point_number}. {selectedPointData.name}
          </div>
          <div className="text-sm text-gray-600 mb-2">{selectedPointData.description}</div>
          <div className="flex gap-2 text-xs flex-wrap">
            <span className="px-2 py-1 bg-gray-100 rounded">
              ⏱️ {selectedPointData.visit_duration_minutes} мин
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded">💰 {selectedPointData.price_level}</span>
          </div>
        </div>
      )}
    </div>
  )
}
