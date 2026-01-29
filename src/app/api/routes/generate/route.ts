import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { GenerateRouteRequest } from '@/types/personalization'
import { buildSystemPrompt } from '@/lib/gemini/systemPrompt'
import { mockPlaces } from '@/lib/mockData'
import { logGeminiPrompt, logGeminiResponse, logGeminiError } from '@/lib/logger'
import { generatedRouteResponseSchema } from '@/lib/gemini/routeSchema'

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
      current_events: [], // TODO: Загрузить текущие события для конкретного города
      weather: await getCurrentWeather(), // TODO: Интеграция с weather API по координатам
      time_of_day: getTimeOfDay(),
    }

    // Генерация промпта
    const systemPrompt = buildSystemPrompt(context)

    // СРАЗУ логируем промпт (до запроса к API)
    const sessionId = logGeminiPrompt(systemPrompt)

    // Вызов Gemini API с structured output
    const generatedRoute = await callGeminiAPI(systemPrompt, sessionId)

    // Валидация и исправление
    if (generatedRoute.route) {
      const actualPoints = generatedRoute.route.points?.length || 0

      // Исправляем total_points если не совпадает
      if (generatedRoute.route.statistics && generatedRoute.route.statistics.total_points !== actualPoints) {
        console.warn(`⚠️ Fixing total_points: ${generatedRoute.route.statistics.total_points} -> ${actualPoints}`)
        generatedRoute.route.statistics.total_points = actualPoints
      }

      console.log(`✅ Route validated: ${actualPoints} points, ${generatedRoute.route.statistics?.total_distance}km`)
    }

    // Возвращаем результат
    return NextResponse.json(generatedRoute, { status: 200 })
  } catch (error) {
    console.error('Error generating route:', error)

    // Логируем ошибку если есть промпт
    try {
      const systemPrompt = buildSystemPrompt(context)
      logGeminiError(systemPrompt, error instanceof Error ? error : new Error(String(error)))
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

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

  // Инициализация Google Generative AI
  const genAI = new GoogleGenerativeAI(apiKey)

  // Получение модели
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  })

  try {
    // Генерация контента
    const result = await model.generateContent(prompt)
    const response = result.response
    const generatedText = response.text()

    if (!generatedText) {
      throw new Error('No response from Gemini API')
    }

    console.log('Gemini raw response:', generatedText.substring(0, 500))

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
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
