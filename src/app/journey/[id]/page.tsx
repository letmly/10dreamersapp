'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useGeolocation } from '@/hooks/useGeolocation'
import { calculateDistance } from '@/lib/utils'
import type { GeneratedRouteResponse } from '@/types/personalization'

const JourneyMap = dynamic(() => import('@/components/journey/JourneyMap'), { ssr: false })

export default function JourneyPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string

  const [route, setRoute] = useState<GeneratedRouteResponse['route'] | null>(null)
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [visitedPoints, setVisitedPoints] = useState<number[]>([])
  const [isNearPoint, setIsNearPoint] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})

  const { latitude, longitude, error: geoError } = useGeolocation()

  // Загрузка маршрута
  useEffect(() => {
    const savedRoute = localStorage.getItem('generated-route')
    if (savedRoute) {
      try {
        const parsedRoute = JSON.parse(savedRoute)
        setRoute(parsedRoute)
      } catch (error) {
        console.error('Failed to parse route:', error)
      }
    }
  }, [routeId])

  // Проверка близости к текущей точке
  useEffect(() => {
    if (!route || !latitude || !longitude || visitedPoints.includes(currentPointIndex)) return

    const currentPoint = route.points[currentPointIndex]
    if (!currentPoint) return

    const distance = calculateDistance(
      latitude,
      longitude,
      currentPoint.coordinates.lat,
      currentPoint.coordinates.lon
    )

    // Если ближе 100 метров (0.1 км)
    const isClose = distance < 0.1
    setIsNearPoint(isClose)
  }, [latitude, longitude, route, currentPointIndex, visitedPoints])

  const handleCheckIn = () => {
    if (!route) return

    // Отмечаем точку как посещенную
    setVisitedPoints([...visitedPoints, currentPointIndex])

    // Показываем квиз если есть
    if (route.points[currentPointIndex].quiz) {
      setShowQuiz(true)
    } else {
      // Переходим к следующей точке
      moveToNextPoint()
    }
  }

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answerIndex,
    })
  }

  const handleQuizComplete = () => {
    setShowQuiz(false)
    moveToNextPoint()
  }

  const moveToNextPoint = () => {
    if (!route) return

    if (currentPointIndex < route.points.length - 1) {
      setCurrentPointIndex(currentPointIndex + 1)
    } else {
      // Маршрут завершен
      handleRouteComplete()
    }
  }

  const handleRouteComplete = () => {
    alert('🎉 Поздравляем! Вы завершили маршрут!')
    router.push(`/routes/${routeId}`)
  }

  const progress = route ? (visitedPoints.length / route.points.length) * 100 : 0

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка маршрута...</p>
        </div>
      </div>
    )
  }

  const currentPoint = route.points[currentPointIndex]

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header с прогрессом */}
      <header className="bg-white border-b safe-top z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.push(`/routes/${routeId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Выход
            </button>
            <div className="text-sm font-medium text-gray-600">
              {visitedPoints.length} / {route.points.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Карта */}
      <div className="flex-1 relative">
        <JourneyMap
          route={route}
          currentPointIndex={currentPointIndex}
          visitedPoints={visitedPoints}
          userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
        />

        {/* Статус близости */}
        {isNearPoint && !visitedPoints.includes(currentPointIndex) && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="bg-green-500 text-white rounded-xl p-4 shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div className="flex-1">
                  <div className="font-bold">Вы рядом!</div>
                  <div className="text-sm opacity-90">Нажмите "Отметиться" чтобы продолжить</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ошибка геолокации */}
        {geoError && (
          <div className="absolute bottom-24 left-4 right-4 z-10">
            <div className="bg-yellow-500 text-white rounded-xl p-3 shadow-lg text-sm">
              ⚠️ Геолокация недоступна. Включите GPS для отслеживания прогресса.
            </div>
          </div>
        )}
      </div>

      {/* Bottomsheet с текущей точкой */}
      <div className="bg-white border-t rounded-t-3xl shadow-2xl safe-bottom">
        <div className="px-4 py-6">
          {/* Индикатор */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

          {/* Заголовок точки */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {currentPoint.point_number}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{currentPoint.name}</h2>
              <p className="text-sm text-gray-600">{currentPoint.description}</p>
            </div>
          </div>

          {/* Метаданные */}
          <div className="flex gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
              ⏱️ {currentPoint.visit_duration_minutes} мин
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
              💰 {currentPoint.price_level}
            </span>
          </div>

          {/* Расстояние до точки */}
          {latitude && longitude && (
            <div className="mb-4 text-sm text-gray-600">
              📏 Расстояние:{' '}
              {(
                calculateDistance(
                  latitude,
                  longitude,
                  currentPoint.coordinates.lat,
                  currentPoint.coordinates.lon
                ) * 1000
              ).toFixed(0)}{' '}
              м
            </div>
          )}

          {/* Кнопка отметиться */}
          {!visitedPoints.includes(currentPointIndex) && (
            <button
              onClick={handleCheckIn}
              disabled={!isNearPoint}
              className={`w-full px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
                isNearPoint
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isNearPoint ? '✓ Отметиться' : '🚶 Идите к точке'}
            </button>
          )}

          {/* Кнопка следующая точка */}
          {visitedPoints.includes(currentPointIndex) && currentPointIndex < route.points.length - 1 && (
            <button
              onClick={moveToNextPoint}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl active:scale-95 transition-all"
            >
              Следующая точка →
            </button>
          )}

          {/* Кнопка завершить */}
          {visitedPoints.includes(currentPointIndex) && currentPointIndex === route.points.length - 1 && (
            <button
              onClick={handleRouteComplete}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl active:scale-95 transition-all"
            >
              🎉 Завершить маршрут
            </button>
          )}
        </div>
      </div>

      {/* Квиз modal */}
      {showQuiz && currentPoint.quiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">🎯 Квиз</h3>

              <div className="space-y-6">
                {currentPoint.quiz.questions.map((q, qIndex) => (
                  <div key={qIndex} className="border-b pb-4">
                    <div className="font-medium text-gray-900 mb-3">
                      {qIndex + 1}. {q.question}
                    </div>
                    <div className="space-y-2">
                      {q.options.map((option, oIndex) => (
                        <button
                          key={oIndex}
                          onClick={() => handleQuizAnswer(qIndex, oIndex)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                            quizAnswers[qIndex] === oIndex
                              ? 'bg-blue-500 text-white font-medium'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleQuizComplete}
                disabled={Object.keys(quizAnswers).length < currentPoint.quiz.questions.length}
                className={`w-full mt-6 px-6 py-4 rounded-2xl font-bold transition-all ${
                  Object.keys(quizAnswers).length === currentPoint.quiz.questions.length
                    ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
