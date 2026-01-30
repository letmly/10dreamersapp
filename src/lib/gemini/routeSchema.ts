import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Схема для вопроса квиза
const quizQuestionSchema = z.object({
  question: z.string().describe('Интересный вопрос о месте'),
  options: z.array(z.string()).length(3).describe('3 варианта ответа'),
  correct_answer: z.number().min(0).max(2).describe('Индекс правильного ответа (0-2)'),
  points: z.number().describe('Баллы за правильный ответ'),
  explanation: z.string().describe('Объяснение правильного ответа'),
})

// Схема для квиза места
const placeQuizSchema = z.object({
  questions: z.array(quizQuestionSchema).min(3).max(5).describe('3-5 вопросов о месте'),
  total_points: z.number().describe('Сумма всех баллов за квиз'),
})

// Схема для перехода между точками
const transitionSchema = z.object({
  method: z.enum(['walk', 'transit', 'taxi', 'cycling']).describe('Способ передвижения'),
  duration_minutes: z.number().describe('Время в пути в минутах'),
  distance_km: z.number().describe('Расстояние в километрах'),
  description: z.string().describe('Описание маршрута до следующей точки'),
  instructions: z.array(z.string()).optional().describe('Пошаговые инструкции'),
})

// Схема для координат
const coordinatesSchema = z.object({
  lat: z.number().describe('Широта'),
  lon: z.number().describe('Долгота'),
})

// Схема для точки маршрута
const routePointSchema = z.object({
  point_number: z.number().describe('Порядковый номер точки'),
  name: z.string().describe('Название места'),
  description: z.string().describe('Интересное описание (2-3 предложения)'),
  category: z
    .enum(['history', 'art', 'architecture', 'nature', 'food', 'culture', 'photography', 'science', 'music', 'sports'])
    .describe('Категория места'),
  coordinates: coordinatesSchema,
  visit_duration_minutes: z.number().describe('Время посещения в минутах'),
  price_level: z.enum(['free', 'budget', 'moderate', 'premium']).describe('Уровень цен'),
  quiz: placeQuizSchema.describe('Образовательный квиз для этой точки'),
  tips: z.array(z.string()).min(1).max(3).describe('1-3 полезных совета'),
  photo_url: z.string().optional().describe('URL фотографии места'),
  transition: transitionSchema.optional().describe('Переход к следующей точке (для всех кроме последней)'),
})

// Схема для статистики маршрута
const routeStatisticsSchema = z.object({
  total_walk_time: z.number().describe('Общее время ходьбы в минутах'),
  total_transit_time: z.number().optional().describe('Время на транспорте в минутах'),
  total_distance: z.number().describe('Общее расстояние в километрах'),
  total_points: z.number().describe('Количество точек маршрута (ДОЛЖНО совпадать с длиной массива points)'),
  estimated_cost: z.object({
    min: z.number().describe('Минимальная стоимость'),
    max: z.number().describe('Максимальная стоимость'),
    currency: z.string().default('RUB').describe('Валюта'),
  }),
  calories_burned: z.number().optional().describe('Сожженные калории'),
  carbon_footprint: z.number().optional().describe('Углеродный след в кг CO2'),
})

// Основная схема маршрута
const routeSchema = z.object({
  id: z.string().describe('Уникальный ID маршрута'),
  name: z.string().describe('Креативное название маршрута'),
  description: z.string().describe('Описание маршрута и почему он подходит пользователю'),
  points: z.array(routePointSchema).min(2).max(12).describe('Точки маршрута в порядке посещения'),
  statistics: routeStatisticsSchema,
  personalization_score: z.number().min(0).max(100).describe('Насколько маршрут соответствует предпочтениям (0-100)'),
  reasoning: z.string().describe('Объяснение почему выбран именно этот маршрут'),
})

// Схема ответа API
export const generatedRouteResponseSchema = z.object({
  route: routeSchema,
})

// Экспорт JSON Schema для Gemini
export const routeJsonSchema = zodToJsonSchema(generatedRouteResponseSchema as any, 'routeResponse')

// TypeScript типы из схемы
export type RoutePoint = z.infer<typeof routePointSchema>
export type RouteStatistics = z.infer<typeof routeStatisticsSchema>
export type GeneratedRoute = z.infer<typeof routeSchema>
export type GeneratedRouteResponse = z.infer<typeof generatedRouteResponseSchema>
