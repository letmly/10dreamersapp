'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { GeneratedRouteResponse } from '@/types/personalization'

// Динамический импорт карты
const RouteMapView = dynamic(() => import('@/components/routes/RouteMapView'), { ssr: false })

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка маршрута...</p>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Маршрут не найден</h1>
          <p className="text-gray-600 mb-6">Похоже, маршрут был удален или не существует</p>
          <button
            onClick={() => router.push('/personalize')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 active:scale-95 transition-all"
          >
            Создать новый маршрут
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 safe-top">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Главная
            </button>
            <div className="text-sm font-medium text-gray-600">
              {route.statistics.total_points} точки · {route.statistics.total_distance.toFixed(1)} км
            </div>
          </div>
        </div>
      </header>

      {/* Hero секция */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            {/* Personalization Score */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="text-2xl">✨</span>
              <span className="font-medium">Персонализация: {route.personalization_score}%</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{route.name}</h1>
            <p className="text-lg text-blue-50 mb-6 max-w-2xl mx-auto">
              {route.description}
            </p>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-sm text-blue-100">Время</div>
                <div className="text-xl font-bold">
                  {Math.floor(route.statistics.total_walk_time / 60)}ч {route.statistics.total_walk_time % 60}м
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl mb-1">📍</div>
                <div className="text-sm text-blue-100">Точек</div>
                <div className="text-xl font-bold">{route.statistics.total_points}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-sm text-blue-100">Стоимость</div>
                <div className="text-xl font-bold">
                  {route.statistics.estimated_cost.min}-{route.statistics.estimated_cost.max}₽
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-sm text-blue-100">Калории</div>
                <div className="text-xl font-bold">{route.statistics.calories_burned}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      {route.reasoning && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <div className="font-medium text-blue-900 mb-1">Почему этот маршрут?</div>
                <p className="text-blue-800 text-sm">{route.reasoning}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Карта маршрута */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <RouteMapView route={route} />
        </div>
      </div>

      {/* Точки маршрута */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Точки маршрута</h2>

        <div className="space-y-6">
          {route.points.map((point, index) => (
            <div
              key={point.point_number}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Заголовок точки */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {point.point_number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{point.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{point.description}</p>

                      {/* Метаданные */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
                          ⏱️ {point.visit_duration_minutes} мин
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
                          💰 {point.price_level}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
                          {getCategoryEmoji(point.category)} {point.category}
                        </span>
                      </div>

                      {/* Советы */}
                      {point.tips && point.tips.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <div className="font-medium text-yellow-900 text-sm mb-2">💡 Советы:</div>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            {point.tips.map((tip, i) => (
                              <li key={i}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Квиз */}
                      {point.quiz && (
                        <details className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <summary className="font-medium text-purple-900 cursor-pointer mb-3">
                            🎯 Квиз ({point.quiz.total_points} баллов)
                          </summary>
                          <div className="space-y-4">
                            {point.quiz.questions.map((q, qIndex) => (
                              <div key={qIndex} className="bg-white rounded-lg p-3">
                                <div className="font-medium text-gray-900 mb-2">
                                  {qIndex + 1}. {q.question}
                                </div>
                                <div className="space-y-2">
                                  {q.options.map((option, oIndex) => (
                                    <div
                                      key={oIndex}
                                      className={`px-3 py-2 rounded-lg text-sm ${
                                        oIndex === q.correct_answer
                                          ? 'bg-green-100 border border-green-300 font-medium'
                                          : 'bg-gray-50 border border-gray-200'
                                      }`}
                                    >
                                      {option}
                                      {oIndex === q.correct_answer && ' ✓'}
                                    </div>
                                  ))}
                                </div>
                                {q.explanation && (
                                  <div className="mt-2 text-xs text-gray-600 italic">
                                    💬 {q.explanation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>

                {/* Переход к следующей точке */}
                {point.transition && index < route.points.length - 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="text-2xl">{getTransportEmoji(point.transition.method)}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{point.transition.description}</div>
                        <div className="text-xs">
                          {point.transition.distance_km.toFixed(1)} км · {point.transition.duration_minutes} мин
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка "Начать путешествие" */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t safe-bottom p-4 z-30">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push(`/journey/${route.id}`)}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 active:scale-95 transition-all shadow-lg"
          >
            🚀 Начать путешествие
          </button>
        </div>
      </div>
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    history: '🏛️',
    art: '🎨',
    architecture: '🏰',
    nature: '🌳',
    food: '🍽️',
    culture: '🎭',
    photography: '📸',
    science: '🔬',
    music: '🎵',
    sports: '⚽',
  }
  return map[category] || '📍'
}

function getTransportEmoji(method: string): string {
  const map: Record<string, string> = {
    walk: '🚶',
    transit: '🚌',
    taxi: '🚕',
    cycling: '🚴',
  }
  return map[method] || '🚶'
}
