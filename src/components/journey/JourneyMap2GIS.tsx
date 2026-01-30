'use client'

import { useRef, useEffect, useState } from 'react'
import { load } from '@2gis/mapgl'
import type { Map, HtmlMarker, Polyline } from '@2gis/mapgl/types'
import type { GeneratedRouteResponse } from '@/types/personalization'

interface JourneyMap2GISProps {
  route: GeneratedRouteResponse['route']
  currentPointIndex: number
  visitedPoints: number[]
  userLocation?: { lat: number; lng: number }
}

export default function JourneyMap2GIS({
  route,
  currentPointIndex,
  visitedPoints,
  userLocation,
}: JourneyMap2GISProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<HtmlMarker[]>([])
  const userMarkerRef = useRef<HtmlMarker | null>(null)
  const polylineRef = useRef<Polyline | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !route || mapRef.current) return

    console.log('🗺️ Initializing map with route:', route.name)

    let map: Map

    const initialCenter =
      route.points && route.points.length > 0
        ? [route.points[0].coordinates.lon, route.points[0].coordinates.lat]
        : [30.3351, 59.9343]

    load().then((mapglAPI) => {
      if (!mapContainerRef.current || mapRef.current) return

      map = new mapglAPI.Map(mapContainerRef.current, {
        center: initialCenter as [number, number],
        zoom: 14,
        key: process.env.NEXT_PUBLIC_2GIS_API_KEY || '',
      })

      mapRef.current = map

      console.log('✅ Map initialized, will draw markers on next effect')
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
      console.log('⚠️ No route to draw')
      return
    }

    // Ждем пока карта инициализируется
    const checkMapAndDraw = () => {
      if (!mapRef.current) {
        console.log('⏳ Waiting for map to initialize...')
        setTimeout(checkMapAndDraw, 100)
        return
      }

      console.log('📍 Drawing markers for route:', route.name, route.points?.length, 'points')

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

      // Не рисуем линии - пользователь сам выбирает путь

      // Draw markers
      console.log('Creating', route.points.length, 'markers')
      route.points.forEach((point, index) => {
        console.log(`Marker ${index}:`, point.name, point.coordinates)
        const isVisited = visitedPoints.includes(index)
        const isCurrent = index === currentPointIndex

        let markerColor = '#9ca3af' // gray - будущая точка
        if (isVisited) markerColor = '#10b981' // green - посещенная
        if (isCurrent && !isVisited) markerColor = '#3b82f6' // blue - текущая

        const markerElement = document.createElement('div')
        markerElement.style.width = '40px'
        markerElement.style.height = '40px'
        markerElement.style.borderRadius = '50%'
        markerElement.style.backgroundColor = markerColor
        markerElement.style.border = '4px solid white'
        markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        markerElement.style.display = 'flex'
        markerElement.style.alignItems = 'center'
        markerElement.style.justifyContent = 'center'
        markerElement.style.fontSize = '18px'
        markerElement.style.fontWeight = 'bold'
        markerElement.style.color = 'white'
        markerElement.innerHTML = isVisited ? '✓' : String(point.point_number)

        const marker = new mapglAPI.HtmlMarker(mapRef.current!, {
          coordinates: [point.coordinates.lon, point.coordinates.lat],
          html: markerElement,
          anchor: [20, 20], // Привязка к центру круга (40px / 2 = 20px)
        })

        markersRef.current.push(marker)
        console.log('Created marker', index, 'at', [point.coordinates.lon, point.coordinates.lat])
      })

      // Center on current point
      const currentPoint = route.points[currentPointIndex]
      if (currentPoint && mapRef.current) {
        mapRef.current.setCenter([currentPoint.coordinates.lon, currentPoint.coordinates.lat])
        mapRef.current.setZoom(15)
      }
    })
    }

    checkMapAndDraw()
  }, [route, currentPointIndex, visitedPoints])

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
        userElement.className = 'relative'
        userElement.style.width = '16px'
        userElement.style.height = '16px'

        const pulseDiv = document.createElement('div')
        pulseDiv.style.width = '16px'
        pulseDiv.style.height = '16px'
        pulseDiv.style.borderRadius = '50%'
        pulseDiv.style.backgroundColor = '#3b82f6'
        pulseDiv.style.border = '2px solid white'
        pulseDiv.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.6)'
        pulseDiv.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'

        userElement.appendChild(pulseDiv)

        const userMarker = new mapglAPI.HtmlMarker(mapRef.current!, {
          coordinates: [userLocation.lng, userLocation.lat],
          html: userElement,
          anchor: [8, 8], // Привязка к центру точки пользователя (16px / 2 = 8px)
        })

        userMarkerRef.current = userMarker

        // Pan to user if they moved far
        const center = mapRef.current.getCenter()
        const distance = Math.sqrt(
          Math.pow(center[0] - userLocation.lng, 2) + Math.pow(center[1] - userLocation.lat, 2)
        )

        if (distance > 0.01) {
          mapRef.current.setCenter([userLocation.lng, userLocation.lat])
        }
      }
    })
  }, [userLocation])

  return <div ref={mapContainerRef} className="w-full h-full" />
}
