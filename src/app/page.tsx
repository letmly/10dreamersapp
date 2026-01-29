'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section - Mobile First */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white safe-top">
        <div className="text-center max-w-md w-full">
          {/* Logo/Icon */}
          <div className="text-6xl mb-4">🗺️</div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            10Dreamers
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl mb-2 opacity-90">
            Культурная столица России
          </p>
          <p className="text-sm sm:text-base mb-8 opacity-80 px-4">
            Персональные маршруты с AI и образовательные квесты
          </p>

          {/* Main CTA - Генерация маршрута */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => router.push('/personalize')}
              className="w-full px-6 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="text-2xl">✨</span>
              Создать маршрут для меня
            </button>

            <Link
              href="/map"
              className="w-full px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white rounded-2xl font-medium text-base hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🗺️</span>
              Открыть карту
            </Link>
          </div>

          {/* Quick stats */}
          <div className="flex justify-center gap-4 text-xs sm:text-sm opacity-90">
            <div className="text-center">
              <div className="font-bold text-lg">50+</div>
              <div>мест</div>
            </div>
            <div className="w-px bg-white/30"></div>
            <div className="text-center">
              <div className="font-bold text-lg">20+</div>
              <div>квестов</div>
            </div>
            <div className="w-px bg-white/30"></div>
            <div className="text-center">
              <div className="font-bold text-lg">AI</div>
              <div>помощник</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Mobile optimized */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-900">
            Как это работает?
          </h2>

          <div className="space-y-4">
            <StepCard
              number="1"
              emoji="📝"
              title="Ответьте на вопросы"
              description="Расскажите о своих интересах и предпочтениях"
            />
            <StepCard
              number="2"
              emoji="🤖"
              title="AI создаст маршрут"
              description="Персональный план с квизами и советами"
            />
            <StepCard
              number="3"
              emoji="🚀"
              title="Начните путешествие"
              description="Следуйте маршруту и получайте бейджи"
            />
          </div>
        </div>
      </section>

      {/* Features - Compact Mobile */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-900">
            Возможности
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <FeatureCard emoji="🎯" title="Квесты" description="Образовательные задания" />
            <FeatureCard emoji="🏆" title="Бейджи" description="Достижения и награды" />
            <FeatureCard emoji="📊" title="Рейтинг" description="Соревнуйтесь с друзьями" />
            <FeatureCard emoji="📸" title="Фото" description="Делитесь моментами" />
          </div>
        </div>
      </section>

      {/* CTA Bottom - Mobile Sticky */}
      <section className="py-8 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Готовы начать?
          </h2>
          <p className="text-sm sm:text-base mb-6 opacity-90">
            Создайте свой первый персонализированный маршрут прямо сейчас
          </p>
          <button
            onClick={() => router.push('/personalize')}
            className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all"
          >
            ✨ Начать приключение
          </button>
        </div>
      </section>

      {/* Footer - Mobile friendly */}
      <footer className="py-6 px-4 bg-gray-900 text-gray-400 text-center text-sm safe-bottom">
        <div className="max-w-md mx-auto">
          <p className="mb-2">© 2024 10Dreamers</p>
          <p className="text-xs opacity-75">
            Образовательный туризм по Санкт-Петербургу
          </p>
        </div>
      </footer>
    </main>
  )
}

// Step card для "Как это работает"
function StepCard({
  number,
  emoji,
  title,
  description,
}: {
  number: string
  emoji: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{emoji}</span>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

// Compact feature card для мобильных
function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-4 text-center hover:border-blue-200 hover:shadow-md transition-all active:scale-95">
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  )
}
