import type { Place, Quest, Badge, Route } from '@/types'

// Санкт-Петербург координаты для примера
export const SAINT_PETERSBURG_CENTER = {
  lat: 59.9343,
  lng: 30.3351,
}

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Государственный Эрмитаж',
    description: 'Один из крупнейших и наиболее значимых художественных и культурно-исторических музеев мира',
    address: 'Дворцовая площадь, 2',
    coordinates: { lat: 59.9398, lng: 30.3146 },
    category: 'museum',
    images: ['/images/places/hermitage.jpg'],
    facts: [
      'Основан в 1764 году Екатериной II',
      'Коллекция насчитывает более 3 миллионов экспонатов',
      'Эрмитажные коты охраняют музей от грызунов с 18 века',
    ],
    historicalPeriod: '1764',
    openingHours: '10:30-18:00 (вт, чт, сб, вс), 10:30-21:00 (ср, пт)',
    ticketPrice: 500,
    rating: 4.9,
    visitCount: 0,
  },
  {
    id: '2',
    name: 'Петропавловская крепость',
    description: 'Первое сооружение Санкт-Петербурга, с которого началась история города',
    address: 'о. Заячий',
    coordinates: { lat: 59.9504, lng: 30.3164 },
    category: 'monument',
    images: ['/images/places/fortress.jpg'],
    facts: [
      'Заложена 27 мая 1703 года',
      'Никогда не использовалась по прямому назначению',
      'Служила политической тюрьмой для государственных преступников',
    ],
    historicalPeriod: '1703',
    openingHours: '10:00-18:00',
    ticketPrice: 300,
    rating: 4.8,
    visitCount: 0,
  },
]

export const mockQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Секреты Эрмитажа',
    description: 'Раскрой тайны одного из величайших музеев мира',
    difficulty: 'medium',
    duration: 120,
    route: [mockPlaces[0]],
    tasks: [
      {
        id: 'task-1',
        placeId: '1',
        type: 'quiz',
        question: 'В каком году был основан Эрмитаж?',
        answers: ['1754', '1764', '1774', '1784'],
        correctAnswer: 1,
        description: 'Ответь на вопрос о истории музея',
        points: 50,
      },
      {
        id: 'task-2',
        placeId: '1',
        type: 'photo',
        description: 'Сделай фото с Атлантами у входа',
        points: 100,
      },
    ],
    reward: {
      experience: 500,
      badge: {
        id: 'badge-hermitage',
        name: 'Знаток Эрмитажа',
        description: 'Прошел квест "Секреты Эрмитажа"',
        icon: '🏛️',
        rarity: 'rare',
      },
    },
    requiredLevel: 1,
    image: '/images/quests/hermitage-quest.jpg',
    isActive: true,
  },
]

export const mockBadges: Badge[] = [
  {
    id: 'badge-newcomer',
    name: 'Новичок',
    description: 'Начало пути путешественника',
    icon: '🌟',
    rarity: 'common',
  },
  {
    id: 'badge-explorer',
    name: 'Исследователь',
    description: 'Посетил 10 мест',
    icon: '🧭',
    rarity: 'rare',
  },
  {
    id: 'badge-master',
    name: 'Мастер квестов',
    description: 'Завершил 5 квестов',
    icon: '🏆',
    rarity: 'epic',
  },
]

export const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'Классический маршрут',
    description: 'Основные достопримечательности центра города',
    places: mockPlaces,
    distance: 3.5,
    estimatedTime: 180,
    difficulty: 'easy',
  },
]
