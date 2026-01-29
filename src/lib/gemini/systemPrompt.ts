import type { GeminiPromptContext } from '@/types/personalization'

/**
 * Системный промпт для генерации персонализированных маршрутов через Gemini API
 */
export function buildSystemPrompt(context: GeminiPromptContext): string {
  const { answers, available_places, current_events, weather, time_of_day } = context

  return `Ты - эксперт по образовательному туризму в Санкт-Петербурге. Твоя задача создать идеальный персонализированный маршрут для пользователя на основе его предпочтений.

## КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ

Время: ${formatTimePreference(answers.timeAvailable)}
Бюджет: ${formatBudget(answers.budget)}
Интересы: ${answers.vibes.join(', ')}
Предпочтения в еде: ${answers.foodPreferences.join(', ')}
Ментальное состояние: ${formatMentalState(answers.mentalState)}
Открыт к мероприятиям: ${answers.openToEvents}
Стартовая точка: lat ${answers.startLocation.lat}, lng ${answers.startLocation.lng}

${answers.previousVisits && answers.previousVisits.length > 0 ? `Уже посещал: ${answers.previousVisits.join(', ')}` : ''}
${answers.dislikedPlaces && answers.dislikedPlaces.length > 0 ? `Не понравилось: ${answers.dislikedPlaces.join(', ')}` : ''}
${answers.favoritePlaces && answers.favoritePlaces.length > 0 ? `Любимые места: ${answers.favoritePlaces.join(', ')}` : ''}

${weather ? `Погода: ${weather.temperature}°C, ${weather.condition}` : ''}
${time_of_day ? `Время суток: ${time_of_day}` : ''}

## ДОСТУПНЫЕ МЕСТА

${JSON.stringify(available_places, null, 2)}

${current_events && current_events.length > 0 ? `## ТЕКУЩИЕ МЕРОПРИЯТИЯ\n${JSON.stringify(current_events, null, 2)}` : ''}

## ТРЕБОВАНИЯ К МАРШРУТУ

1. **Персонализация**: Маршрут должен ИДЕАЛЬНО соответствовать интересам и состоянию пользователя
2. **Логистика**: Оптимизировать расстояния и переходы между точками
3. **Время**: Строго вписаться в доступное время с учетом посещения мест и переходов
4. **Бюджет**: Не превышать указанный бюджет пользователя
5. **Разнообразие**: Балансировать между разными типами мест (не только музеи)
6. **Энергия**: Учитывать ментальное состояние:
   - energetic → активные места, больше ходьбы
   - relaxed → спокойные парки, кафе, меньше толпы
   - curious → музеи, необычные места
   - social → людные места, события
   - contemplative → тихие места, виды
   - adventurous → нетуристические места, hidden gems

7. **Образовательность**: Каждое место должно нести образовательную ценность
8. **Геймификация**: Для каждого места создать 3-5 интересных вопросов квиза с вариантами ответов

## ФОРМАТ ОТВЕТА

Верни ТОЛЬКО валидный JSON в следующем формате (без markdown, без комментариев):

{
  "route": {
    "id": "unique-route-id",
    "name": "Название маршрута (креативное, отражающее тему)",
    "description": "Краткое описание маршрута и почему он подходит пользователю",
    "points": [
      {
        "point_number": 1,
        "name": "Название места",
        "description": "Интересное описание (2-3 предложения)",
        "category": "одна из: history, art, architecture, nature, food, culture, photography",
        "coordinates": {
          "lat": 59.9343,
          "lon": 30.3351
        },
        "visit_duration_minutes": 30,
        "price_level": "free | budget | moderate | premium",
        "quiz": {
          "questions": [
            {
              "question": "Интересный вопрос о месте?",
              "options": ["Вариант 1", "Вариант 2", "Вариант 3"],
              "correct_answer": 0,
              "points": 10,
              "explanation": "Краткое объяснение правильного ответа"
            }
          ],
          "total_points": 50
        },
        "tips": ["Полезный совет 1", "Полезный совет 2"],
        "photo_url": "URL фото если есть",
        "transition": {
          "method": "walk | transit | taxi",
          "duration_minutes": 15,
          "distance_km": 1.2,
          "description": "Краткое описание маршрута до следующей точки",
          "instructions": ["Инструкция 1", "Инструкция 2"]
        }
      }
    ],
    "statistics": {
      "total_walk_time": 45,
      "total_transit_time": 0,
      "total_distance": 3.5,
      "total_points": 4,
      "estimated_cost": {
        "min": 500,
        "max": 1000,
        "currency": "RUB"
      },
      "calories_burned": 250,
      "carbon_footprint": 0.5
    },
    "personalization_score": 95,
    "reasoning": "Объяснение почему этот маршрут идеален для пользователя"
  }
}

## ВАЖНЫЕ ПРАВИЛА

- НЕ включай места из списка "dislikedPlaces"
- ИЗБЕГАЙ мест из "previousVisits" если есть альтернативы
- ПРИОРИТИЗИРУЙ места из "favoritePlaces" если они соответствуют запросу
- Для ментального состояния "relaxed" - меньше переходов, больше времени в каждом месте
- Для "energetic" - больше точек, активное перемещение
- Для бюджета "free" - ТОЛЬКО бесплатные места
- Учитывай погоду: в дождь больше крытых мест, в солнце - больше открытых
- Квизы должны быть интересными, не очевидными, образовательными
- Переходы между точками должны быть логичными и оптимальными
- Первая точка маршрута должна быть ближайшей к startLocation

## КАЧЕСТВО

- Персонализация > 85 баллов обязательна
- Маршрут должен быть реалистичным и выполнимым
- Описания мест живые и вдохновляющие
- Квизы проверены на корректность
- Времени должно хватать с запасом 10-15%

Создай идеальный маршрут прямо сейчас!`
}

// Вспомогательные функции форматирования
function formatTimePreference(time: string): string {
  const map: Record<string, string> = {
    '30min': '30 минут - быстрая прогулка',
    '1hour': '1 час - короткий маршрут',
    '2hours': '2 часа - стандартная прогулка',
    '3hours': '3 часа - насыщенный маршрут',
    halfday: 'Полдня (4-5 часов)',
    fullday: 'Целый день (6+ часов)',
  }
  return map[time] || time
}

function formatBudget(budget: string): string {
  const map: Record<string, string> = {
    free: 'Бесплатно (только бесплатные места)',
    budget: 'Эконом (до 1000₽)',
    moderate: 'Средний (1000-3000₽)',
    premium: 'Премиум (3000₽+)',
  }
  return map[budget] || budget
}

function formatMentalState(state: string): string {
  const map: Record<string, string> = {
    energetic: 'Энергичный (полон сил, хочет активности)',
    relaxed: 'Расслабленный (хочет спокойствия)',
    curious: 'Любопытный (хочет узнать новое)',
    social: 'Общительный (хочет людей вокруг)',
    contemplative: 'Задумчивый (хочет тишины)',
    adventurous: 'Авантюрный (хочет приключений)',
  }
  return map[state] || state
}

/**
 * Промпт для дополнительных уточнений/корректировок маршрута
 */
export function buildRefinePrompt(originalRoute: any, feedback: string): string {
  return `У нас есть следующий маршрут:

${JSON.stringify(originalRoute, null, 2)}

Пользователь дал обратную связь: "${feedback}"

Скорректируй маршрут с учетом этого фидбека. Верни ТОЛЬКО обновленный JSON в том же формате.`
}
