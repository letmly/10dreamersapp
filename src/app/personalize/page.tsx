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

// Динамический импорт карты для выбора точки старта
const MapLocationPicker = dynamic(
  () => import('@/components/personalization/MapLocationPicker'),
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
      const formattedAnswers: PersonalizationAnswers = {
        timeAvailable: answers.time as any,
        budget: answers.budget as any,
        vibes: answers.vibes as any,
        foodPreferences: (answers.food as any) || [],
        mentalState: answers.mentalState as any,
        openToEvents: answers.events as any,
        startLocation: answers.startLocation as any,
      }

      // Вызов API
      const response = await fetch('/api/routes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          city: 'saint-petersburg',
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
    const answer = answers[step.id]
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Назад
            </button>
            <div className="text-sm font-medium text-gray-600">
              {currentStep + 1} / {personalizationQuiz.steps.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {/* Заголовок шага */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{step.question}</h1>
          {step.description && (
            <p className="text-gray-600">{step.description}</p>
          )}
        </div>

        {/* Контент шага */}
        <div className="mb-8">
          {step.type === 'single' && step.options && (
            <BubbleSelector
              options={step.options}
              selected={answers[step.id] || ''}
              onChange={handleAnswer}
              multiple={false}
            />
          )}

          {step.type === 'multiple' && step.options && (
            <BubbleSelector
              options={step.options}
              selected={(answers[step.id] as string[]) || []}
              onChange={handleAnswer}
              multiple={true}
              maxSelections={step.maxSelections}
            />
          )}

          {step.type === 'map' && (
            <MapLocationPicker
              value={answers[step.id] as any}
              onChange={handleAnswer}
            />
          )}
        </div>
      </main>

      {/* Footer с кнопками */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t safe-bottom">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-transform"
            >
              Назад
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed() || isGenerating}
            className={`
              flex-1 px-6 py-3 rounded-xl font-medium transition-all
              ${
                canProceed() && !isGenerating
                  ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
