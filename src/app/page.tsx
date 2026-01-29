'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary-500 to-primary-700 text-white safe-top">
        <div className="text-center max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            10Dreamers
          </h1>
          <p className="text-xl md:text-2xl mb-2 opacity-90">
            Открой культурную столицу России
          </p>
          <p className="text-base md:text-lg mb-8 opacity-80">
            Образовательные квесты, достижения и рейтинги
          </p>

          <div className="flex flex-col gap-4 mt-8">
            <Link href="/map" className="btn-primary bg-white text-primary-600 hover:bg-gray-50">
              Начать путешествие
            </Link>
            <Link href="/quests" className="btn-secondary border-white text-white hover:bg-white/10">
              Посмотреть квесты
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Возможности</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              emoji="🗺️"
              title="Интерактивная карта"
              description="Исследуй достопримечательности на карте города"
            />
            <FeatureCard
              emoji="🎯"
              title="Квесты и маршруты"
              description="Проходи увлекательные образовательные квесты"
            />
            <FeatureCard
              emoji="🏆"
              title="Достижения"
              description="Получай бейджи за посещение мест и выполнение заданий"
            />
            <FeatureCard
              emoji="📊"
              title="Рейтинг"
              description="Соревнуйся с другими путешественниками"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="card text-center hover:shadow-lg transition-shadow">
      <div className="text-5xl mb-3">{emoji}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
