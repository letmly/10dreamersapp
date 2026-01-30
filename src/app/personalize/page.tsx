'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import BubbleSelector from '@/components/personalization/BubbleSelector'
import {
  personalizationQuiz,
  getStepProgress,
  validateAnswers,
} from '@/lib/personalizationQuiz'
import type { PersonalizationAnswers } from '@/types/personalization'

// Динамический импорт карты для выбора точки старта (2GIS)
const Map2GISLocationPicker = dynamic(
  () => import('@/components/personalization/Map2GISLocationPicker'),
  { ssr: false }
)

export default function PersonalizationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<PersonalizationAnswers>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const step = personalizationQuiz.steps[currentStep]
  const progress = getStepProgress(currentStep)
  const isLastStep = currentStep === personalizationQuiz.steps.length - 1

  // Обработка ответа на текущий шаг
  const handleAnswer = (value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [step.id]: value,
    }))
  }

  // Переход к следующему шагу
  const handleNext = () => {
    if (isLastStep) {
      // Генерация маршрута
      generateRoute()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Назад
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Генерация маршрута
  const generateRoute = async () => {
    setIsGenerating(true)

    try {
      // Преобразуем ответы в нужный формат
      const answersMap = answers as any
      const formattedAnswers: PersonalizationAnswers = {
        timeAvailable: answersMap.time,
        budget: answersMap.budget,
        vibes: answersMap.vibes,
        foodPreferences: answersMap.food || [],
        mentalState: answersMap.mentalState,
        openToEvents: answersMap.events,
        startLocation: answersMap.startLocation,
      }

      // Получаем region_id из startLocation (если пользователь выбрал на карте)
      console.log('📍 startLocation:', answersMap.startLocation)
      const regionId = answersMap.startLocation?.regionId || '38'

      console.log('🌍 Generating route for region_id:', regionId)

      // Вызов API
      const response = await fetch('/api/routes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          regionId: regionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate route')
      }

      const data = await response.json()

      // Сохраняем маршрут в localStorage для отображения
      localStorage.setItem('generated-route', JSON.stringify(data.route))

      // Переходим на страницу с результатом
      router.push(`/routes/${data.route.id}`)
    } catch (error) {
      console.error('Error generating route:', error)
      alert('Не удалось сгенерировать маршрут. Попробуйте еще раз.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Проверка, можно ли перейти дальше
  const canProceed = () => {
    const answersMap = answers as any
    const answer = answersMap[step.id]
    if (!answer) return false

    if (step.type === 'multiple' && Array.isArray(answer)) {
      return answer.length > 0
    }

    if (step.type === 'map') {
      return answer.lat && answer.lng
    }

    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 safe-top">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">Назад</span>
            </button>

            {/* Logo */}
            <div className="text-lg font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                KULTR
              </span>
              <span className="text-gray-800">TALK</span>
            </div>

            <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {currentStep + 1} / {personalizationQuiz.steps.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={`max-w-2xl mx-auto px-6 ${step.type === 'map' ? 'py-6 pb-24' : 'py-8 pb-32'}`}>
        {/* Заголовок шага */}
        <div className={`text-center ${step.type === 'map' ? 'mb-6' : 'mb-10'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{step.question}</h1>
          {step.description && (
            <p className="text-gray-600 text-lg">{step.description}</p>
          )}
        </div>

        {/* Контент шага */}
        <div className="mb-0">
          {step.type === 'single' && step.options && (
            <BubbleSelector
              options={step.options}
              selected={(answers as any)[step.id] || ''}
              onChange={handleAnswer}
              multiple={false}
            />
          )}

          {step.type === 'multiple' && step.options && (
            <BubbleSelector
              options={step.options}
              selected={((answers as any)[step.id] as string[]) || []}
              onChange={handleAnswer}
              multiple={true}
              maxSelections={step.maxSelections}
            />
          )}

          {step.type === 'map' && (
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 h-[400px]">
              <Map2GISLocationPicker
                onLocationSelect={(lat, lng, address, regionId) => {
                  handleAnswer({ lat, lng, address, regionId })
                }}
                initialLocation={
                  (answers as any)[step.id]
                    ? { lat: ((answers as any)[step.id] as any).lat, lng: ((answers as any)[step.id] as any).lng }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer с кнопками */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 safe-bottom">
        <div className="max-w-2xl mx-auto px-6 py-5 flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border-2 border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            >
              ← Назад
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed() || isGenerating}
            className={`
              flex-1 px-6 py-3 rounded-full font-bold transition-all shadow-lg
              ${
                canProceed() && !isGenerating
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-xl active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }
            `}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Создаем маршрут...
              </span>
            ) : isLastStep ? (
              '✨ Создать маршрут'
            ) : (
              'Далее →'
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}
