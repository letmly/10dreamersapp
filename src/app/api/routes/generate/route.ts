import { NextRequest, NextResponse } from 'next/server'
import type { GenerateRouteRequest, GeneratedRouteResponse } from '@/types/personalization'
import { buildSystemPrompt } from '@/lib/gemini/systemPrompt'
import { mockPlaces } from '@/lib/mockData'

/**
 * POST /api/routes/generate
 * Генерирует персонализированный маршрут на основе ответов пользователя
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRouteRequest = await request.json()

    // Валидация
    if (!body.answers) {
      return NextResponse.json({ error: 'Missing answers' }, { status: 400 })
    }

    // Подготовка контекста для Gemini
    const context = {
      answers: body.answers,
      available_places: mockPlaces, // В продакшене загрузить из БД
      current_events: [], // TODO: Загрузить текущие события
      weather: await getCurrentWeather(), // TODO: Интеграция с weather API
      time_of_day: getTimeOfDay(),
    }

    // Генерация промпта
    const systemPrompt = buildSystemPrompt(context)

    // Вызов Gemini API
    const generatedRoute = await callGeminiAPI(systemPrompt)

    // Возвращаем результат
    return NextResponse.json(generatedRoute, { status: 200 })
  } catch (error) {
    console.error('Error generating route:', error)
    return NextResponse.json(
      { error: 'Failed to generate route', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Вызов Gemini API для генерации маршрута
 */
async function callGeminiAPI(prompt: string): Promise<GeneratedRouteResponse> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()

  // Извлекаем текст ответа
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!generatedText) {
    throw new Error('No response from Gemini API')
  }

  // Парсим JSON из ответа
  // Gemini может вернуть markdown с ```json, нужно его убрать
  const cleanedText = generatedText
    .replace(/```json\n/g, '')
    .replace(/```\n/g, '')
    .replace(/```/g, '')
    .trim()

  try {
    const parsedRoute = JSON.parse(cleanedText)
    return parsedRoute
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', cleanedText)
    throw new Error('Invalid JSON response from Gemini')
  }
}

/**
 * Получить текущую погоду (заглушка)
 */
async function getCurrentWeather() {
  // TODO: Интеграция с OpenWeatherMap или другим API
  return {
    temperature: 15,
    condition: 'облачно',
    recommendation: 'Возьмите зонт на всякий случай',
  }
}

/**
 * Определить время суток
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}
