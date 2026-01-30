'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { GeneratedRouteResponse } from '@/types/personalization'

// Динамический импорт карты (2GIS)
const RouteMapView2GIS = dynamic(() => import('@/components/routes/RouteMapView2GIS'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Загрузка карты...</p>
      </div>
    </div>
  ),
})

export default function RouteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string

  const [route, setRoute] = useState<GeneratedRouteResponse['route'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Загружаем маршрут из localStorage (временное решение)
    const savedRoute = localStorage.getItem('generated-route')
    if (savedRoute) {
      try {
        const parsedRoute = JSON.parse(savedRoute)
        setRoute(parsedRoute)
      } catch (error) {
        console.error('Failed to parse saved route:', error)
      }
    }
    setLoading(false)
  }, [routeId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-700 font-bold text-lg">Загрузка маршрута...</p>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-7xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Маршрут не найден</h1>
          <p className="text-gray-600 mb-6">Похоже, маршрут был удален или не существует</p>
          <button
            onClick={() => router.push('/personalize')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-xl active:scale-95 transition-all"
          >
            ✨ Создать новый маршрут
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 safe-top">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                KULTR
              </span>
              <span className="text-gray-800">TALK</span>
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              <span>{route.statistics.total_points} точки</span>
              <span>·</span>
              <span>{route.statistics.total_distance.toFixed(1)} км</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero секция */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            {/* Personalization Score */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
              <span className="text-2xl">✨</span>
              <span className="font-bold">Персонализация: {route.personalization_score}%</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{route.name}</h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {route.description}
            </p>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-sm text-white/80 mb-1">Время</div>
                <div className="text-xl font-bold">{Math.round(route.statistics.total_distance * 15)} мин</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5">
                <div className="text-3xl mb-2">📍</div>
                <div className="text-sm text-white/80 mb-1">Точки</div>
                <div className="text-xl font-bold">{route.statistics.total_points}</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5">
                <div className="text-3xl mb-2">🚶</div>
                <div className="text-sm text-white/80 mb-1">Дистанция</div>
                <div className="text-xl font-bold">{route.statistics.total_distance.toFixed(1)} км</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-sm text-white/80 mb-1">Бюджет</div>
                <div className="text-xl font-bold">{route.points.reduce((sum, p) => sum + (p.price_level.includes('бесплатно') || p.price_level.includes('free') ? 0 : 200), 0)} ₽</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Карта маршрута */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          <RouteMapView2GIS route={route} />
        </div>
      </div>

      {/* Список точек */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Точки маршрута</h2>
        <div className="space-y-4">
          {route.points.map((point, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            >
              <div className="flex gap-4">
                {/* Number badge */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  {point.point_number}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{point.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{point.description}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                      ⏱️ {point.visit_duration_minutes} мин
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      💰 {point.price_level}
                    </span>
                    {(point as any).best_time_to_visit && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        🕐 {(point as any).best_time_to_visit}
                      </span>
                    )}
                  </div>

                  {/* AI reasoning */}
                  {(point as any).ai_reasoning && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-purple-600">💡 Почему это место:</span>{' '}
                        {(point as any).ai_reasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Готовы начать путешествие?</h2>
          <p className="text-white/90 mb-6">Следуйте маршруту и открывайте для себя Санкт-Петербург</p>
          <button
            onClick={() => router.push(`/journey/${route.id}`)}
            className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all"
          >
            🚀 Начать путешествие
          </button>
        </div>
      </div>
    </div>
  )
}
