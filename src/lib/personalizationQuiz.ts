import type { PersonalizationQuiz, BubbleOption } from '@/types/personalization'

// Опции для времени
export const timeOptions: BubbleOption[] = [
  { value: '30min', label: '30 минут', emoji: '⚡', description: 'Быстрая прогулка' },
  { value: '1hour', label: '1 час', emoji: '🚶', description: 'Короткий маршрут' },
  { value: '2hours', label: '2 часа', emoji: '🎯', description: 'Стандартная прогулка' },
  { value: '3hours', label: '3 часа', emoji: '🌟', description: 'Насыщенный день' },
  { value: 'halfday', label: 'Полдня', emoji: '☀️', description: '4-5 часов' },
  { value: 'fullday', label: 'Целый день', emoji: '🌅', description: '6+ часов' },
]

// Опции для бюджета
export const budgetOptions: BubbleOption[] = [
  {
    value: 'free',
    label: 'Бесплатно',
    emoji: '🎁',
    description: 'Только бесплатные места',
    color: '#10b981',
  },
  {
    value: 'budget',
    label: 'Эконом',
    emoji: '💵',
    description: 'До 1000₽',
    color: '#3b82f6',
  },
  {
    value: 'moderate',
    label: 'Средний',
    emoji: '💳',
    description: '1000-3000₽',
    color: '#f59e0b',
  },
  {
    value: 'premium',
    label: 'Премиум',
    emoji: '💎',
    description: '3000₽+',
    color: '#8b5cf6',
  },
]

// Опции для vibe (интересы)
export const vibeOptions: BubbleOption[] = [
  {
    value: 'history',
    label: 'История',
    emoji: '🏛️',
    description: 'Музеи, памятники, исторические места',
  },
  {
    value: 'art',
    label: 'Искусство',
    emoji: '🎨',
    description: 'Галереи, выставки, стрит-арт',
  },
  {
    value: 'architecture',
    label: 'Архитектура',
    emoji: '🏰',
    description: 'Здания, дворцы, мосты',
  },
  {
    value: 'nature',
    label: 'Природа',
    emoji: '🌳',
    description: 'Парки, сады, набережные',
  },
  {
    value: 'food',
    label: 'Гастрономия',
    emoji: '🍽️',
    description: 'Рестораны, кафе, локальная кухня',
  },
  {
    value: 'nightlife',
    label: 'Ночная жизнь',
    emoji: '🌃',
    description: 'Бары, клубы, вечерние места',
  },
  {
    value: 'shopping',
    label: 'Шопинг',
    emoji: '🛍️',
    description: 'Магазины, рынки, бутики',
  },
  {
    value: 'culture',
    label: 'Культура',
    emoji: '🎭',
    description: 'Театры, концерты, фестивали',
  },
  {
    value: 'photography',
    label: 'Фотография',
    emoji: '📸',
    description: 'Инстаграмные места, виды',
  },
  {
    value: 'science',
    label: 'Наука',
    emoji: '🔬',
    description: 'Музеи науки, планетарии',
  },
  {
    value: 'music',
    label: 'Музыка',
    emoji: '🎵',
    description: 'Концерты, музыкальные места',
  },
  {
    value: 'sports',
    label: 'Спорт',
    emoji: '⚽',
    description: 'Активности, стадионы, фитнес',
  },
]

// Опции для еды
export const foodOptions: BubbleOption[] = [
  { value: 'russian', label: 'Русская кухня', emoji: '🥟', description: 'Традиционные блюда' },
  { value: 'european', label: 'Европейская', emoji: '🍕', description: 'Итальянская, французская' },
  { value: 'asian', label: 'Азиатская', emoji: '🍜', description: 'Японская, китайская, тайская' },
  { value: 'vegetarian', label: 'Вегетарианская', emoji: '🥗', description: 'Без мяса' },
  { value: 'vegan', label: 'Веганская', emoji: '🌱', description: 'Растительная еда' },
  { value: 'street_food', label: 'Стрит-фуд', emoji: '🌭', description: 'Уличная еда' },
  { value: 'fine_dining', label: 'Fine Dining', emoji: '🍾', description: 'Высокая кухня' },
  { value: 'cafes', label: 'Кафе', emoji: '☕', description: 'Кофейни, десерты' },
  { value: 'no_preference', label: 'Без предпочтений', emoji: '🍴', description: 'Всё подходит' },
]

// Опции для ментального состояния
export const mentalStateOptions: BubbleOption[] = [
  {
    value: 'energetic',
    label: 'Энергичный',
    emoji: '⚡',
    description: 'Полон сил, хочу активности',
    color: '#ef4444',
  },
  {
    value: 'relaxed',
    label: 'Расслабленный',
    emoji: '🧘',
    description: 'Хочу спокойствия и тишины',
    color: '#3b82f6',
  },
  {
    value: 'curious',
    label: 'Любопытный',
    emoji: '🔍',
    description: 'Хочу узнать что-то новое',
    color: '#8b5cf6',
  },
  {
    value: 'social',
    label: 'Общительный',
    emoji: '👥',
    description: 'Хочу людей и общения',
    color: '#f59e0b',
  },
  {
    value: 'contemplative',
    label: 'Задумчивый',
    emoji: '🤔',
    description: 'Хочу подумать в одиночестве',
    color: '#6366f1',
  },
  {
    value: 'adventurous',
    label: 'Авантюрный',
    emoji: '🗺️',
    description: 'Хочу приключений',
    color: '#10b981',
  },
]

// Опции для событий
export const eventOptions: BubbleOption[] = [
  { value: 'yes', label: 'Да, интересно!', emoji: '✨', description: 'Хочу посетить мероприятия' },
  {
    value: 'maybe',
    label: 'Возможно',
    emoji: '🤷',
    description: 'Если будет подходящее',
  },
  { value: 'no', label: 'Нет, спасибо', emoji: '🚫', description: 'Только места без событий' },
]

// Полная конфигурация квиза
export const personalizationQuiz: PersonalizationQuiz = {
  title: 'Создайте идеальный маршрут',
  description: 'Ответьте на несколько вопросов, и мы создадим персональный маршрут специально для вас',
  steps: [
    {
      id: 'time',
      question: 'Сколько времени у вас есть на прогулку?',
      description: 'Мы построим маршрут под ваше время',
      type: 'single',
      options: timeOptions,
      required: true,
    },
    {
      id: 'budget',
      question: 'Какой у вас бюджет?',
      description: 'Учтем входные билеты и расходы на еду',
      type: 'single',
      options: budgetOptions,
      required: true,
    },
    {
      id: 'vibes',
      question: 'Что вас интересует?',
      description: 'Выберите до 3-х интересов',
      type: 'multiple',
      options: vibeOptions,
      maxSelections: 3,
      required: true,
    },
    {
      id: 'food',
      question: 'Какая еда вам нравится?',
      description: 'Добавим подходящие кафе и рестораны',
      type: 'multiple',
      options: foodOptions,
      maxSelections: 3,
      required: false,
    },
    {
      id: 'mentalState',
      question: 'Как вы себя чувствуете сегодня?',
      description: 'Это поможет подобрать подходящую атмосферу',
      type: 'single',
      options: mentalStateOptions,
      required: true,
    },
    {
      id: 'events',
      question: 'Готовы посетить мероприятие?',
      description: 'Концерт, выставка, фестиваль или экскурсия',
      type: 'single',
      options: eventOptions,
      required: true,
    },
    {
      id: 'startLocation',
      question: 'Откуда начнем?',
      description: 'Выберите точку старта на карте',
      type: 'map',
      required: true,
    },
  ],
}

// Утилиты для работы с ответами
export function validateAnswers(answers: Partial<any>): boolean {
  const requiredSteps = personalizationQuiz.steps.filter((s) => s.required)
  return requiredSteps.every((step) => {
    const answer = answers[step.id]
    if (!answer) return false
    if (step.type === 'multiple' && Array.isArray(answer)) {
      return answer.length > 0
    }
    if (step.type === 'map') {
      return answer.lat && answer.lng
    }
    return true
  })
}

export function getStepProgress(currentStep: number): number {
  return Math.round(((currentStep + 1) / personalizationQuiz.steps.length) * 100)
}
