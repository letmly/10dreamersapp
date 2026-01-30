'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const HERO_BACKGROUNDS = [
  '/designassets/start1.png',
  '/designassets/start2.png',
  '/designassets/start3.png',
  '/designassets/start4.png',
  '/designassets/start5.png',
]

export default function HomePage() {
  const router = useRouter()
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  // Меняем фон каждые 4 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* Hero Section с органическими формами */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-hidden min-h-screen">
        {/* Animated Background - меняется плавно */}
        <div className="absolute inset-0">
          {HERO_BACKGROUNDS.map((bg, index) => (
            <div
              key={bg}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
          {/* Gradient overlay для читаемости */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-md w-full flex flex-col items-center justify-center flex-1">
          {/* Органическая форма с лого */}
          <div className="mb-8">
            <div className="relative">
              {/* Органическая капля с фото */}
              <div className="w-64 h-64 mx-auto mb-6 relative">
                <svg
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0"
                >
                  <defs>
                    <clipPath id="organic-shape">
                      <path
                        d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.3C64.8,55.4,53.8,67,40.4,74.3C27,81.6,11.2,84.6,-4.7,83.3C-20.6,82,-41.2,76.4,-56.3,66.1C-71.4,55.8,-81,40.8,-85.3,24.2C-89.6,7.6,-88.6,-10.6,-82.8,-26.3C-77,-42,-66.4,-55.2,-53.3,-62.8C-40.2,-70.4,-24.6,-72.4,-9.7,-75.9C5.2,-79.4,30.6,-83.6,44.7,-76.4Z"
                        transform="translate(100 100)"
                      />
                    </clipPath>
                  </defs>
                </svg>

                {/* Branding - KULTRTALK в центре */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md rounded-[40px] px-8 py-6 shadow-2xl">
                    <h1 className="text-4xl font-bold tracking-tight">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        KULTR
                      </span>
                      <span className="text-gray-800">TALK</span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-white text-lg font-medium mb-2 drop-shadow-lg">
              Культурная столица России
            </p>
            <p className="text-white/90 text-sm px-4 drop-shadow-md">
              Персональные маршруты с AI
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="w-full space-y-3 px-4">
            <button
              onClick={() => router.push('/personalize')}
              className="w-full px-6 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-2xl hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">✨</span>
              Создать маршрут
            </button>

            <Link
              href="/map"
              className="w-full px-6 py-3 bg-white/20 backdrop-blur-md border-2 border-white/50 text-white rounded-full font-semibold text-base hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🗺️</span>
              Открыть карту
            </Link>
          </div>

          {/* Dots indicator для фонов */}
          <div className="flex gap-2 mt-8">
            {HERO_BACKGROUNDS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBgIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentBgIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Background ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
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

      {/* Features */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Возможности
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <FeatureCard emoji="🎯" title="Квесты" description="Образовательные задания" />
            <FeatureCard emoji="🏆" title="Бейджи" description="Достижения и награды" />
            <FeatureCard emoji="📊" title="Рейтинг" description="Соревнуйтесь с друзьями" />
            <FeatureCard emoji="📸" title="Фото" description="Делитесь моментами" />
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-12 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Готовы начать?
          </h2>
          <p className="text-base mb-6 opacity-95">
            Создайте свой первый персонализированный маршрут
          </p>
          <button
            onClick={() => router.push('/personalize')}
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all"
          >
            ✨ Начать приключение
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-gray-400 text-center text-sm">
        <div className="max-w-md mx-auto">
          <p className="mb-2 font-semibold text-gray-300">KULTRTALK</p>
          <p className="text-xs opacity-75">
            Образовательный туризм по Санкт-Петербургу
          </p>
          <p className="text-xs opacity-50 mt-2">© 2024</p>
        </div>
      </footer>
    </main>
  )
}

// Step card
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
    <div className="flex items-start gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{emoji}</span>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// Feature card
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
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-5 text-center hover:border-blue-300 hover:shadow-lg transition-all active:scale-95">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  )
}
