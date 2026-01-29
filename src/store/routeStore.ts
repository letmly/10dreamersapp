import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Route, ActiveRoute, Place, RouteOptions } from '@/types'
import { createRoute, calculateRouteProgress, findNearestPlaceOnRoute } from '@/lib/routing'

interface RouteState {
  // Доступные маршруты
  availableRoutes: Route[]

  // Активный маршрут
  activeRoute: ActiveRoute | null

  // Действия
  setAvailableRoutes: (routes: Route[]) => void
  startRoute: (route: Route, userLocation?: { lat: number; lng: number }) => void
  stopRoute: () => void
  visitPlace: (placeId: string) => void
  updateCurrentPlace: (index: number) => void
  completeRoute: () => void

  // Создание кастомного маршрута
  createCustomRoute: (places: Place[], options: RouteOptions) => Route

  // Утилиты
  getProgress: () => number
  isPlaceVisited: (placeId: string) => boolean
  getNextPlace: () => Place | null
  getCurrentPlace: () => Place | null
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      availableRoutes: [],
      activeRoute: null,

      setAvailableRoutes: (routes) => set({ availableRoutes: routes }),

      startRoute: (route, userLocation) => {
        // Определяем начальную точку
        let currentPlaceIndex = 0

        // Если есть позиция пользователя, находим ближайшую точку
        if (userLocation) {
          const nearest = findNearestPlaceOnRoute(
            userLocation.lat,
            userLocation.lng,
            route
          )
          if (nearest) {
            currentPlaceIndex = nearest.index
          }
        }

        set({
          activeRoute: {
            route,
            currentPlaceIndex,
            visitedPlaces: [],
            startedAt: new Date(),
            progress: 0,
          },
        })
      },

      stopRoute: () => set({ activeRoute: null }),

      visitPlace: (placeId) =>
        set((state) => {
          if (!state.activeRoute) return state

          const visitedPlaces = [...state.activeRoute.visitedPlaces]
          if (!visitedPlaces.includes(placeId)) {
            visitedPlaces.push(placeId)
          }

          // Обновляем прогресс
          const progress = calculateRouteProgress(
            state.activeRoute.route,
            state.activeRoute.currentPlaceIndex,
            visitedPlaces
          )

          // Проверяем, завершен ли маршрут
          const isCompleted = visitedPlaces.length === state.activeRoute.route.places.length

          return {
            activeRoute: {
              ...state.activeRoute,
              visitedPlaces,
              progress,
              completedAt: isCompleted ? new Date() : undefined,
            },
          }
        }),

      updateCurrentPlace: (index) =>
        set((state) => {
          if (!state.activeRoute) return state

          return {
            activeRoute: {
              ...state.activeRoute,
              currentPlaceIndex: index,
            },
          }
        }),

      completeRoute: () =>
        set((state) => {
          if (!state.activeRoute) return state

          return {
            activeRoute: {
              ...state.activeRoute,
              completedAt: new Date(),
              progress: 100,
            },
          }
        }),

      createCustomRoute: (places, options) => {
        return createRoute(places, options)
      },

      getProgress: () => {
        const state = get()
        return state.activeRoute?.progress || 0
      },

      isPlaceVisited: (placeId) => {
        const state = get()
        return state.activeRoute?.visitedPlaces.includes(placeId) || false
      },

      getNextPlace: () => {
        const state = get()
        if (!state.activeRoute) return null

        const currentIndex = state.activeRoute.currentPlaceIndex
        const nextIndex = currentIndex + 1

        if (nextIndex < state.activeRoute.route.places.length) {
          return state.activeRoute.route.places[nextIndex]
        }

        return null
      },

      getCurrentPlace: () => {
        const state = get()
        if (!state.activeRoute) return null

        const currentIndex = state.activeRoute.currentPlaceIndex
        return state.activeRoute.route.places[currentIndex] || null
      },
    }),
    {
      name: 'route-storage',
    }
  )
)
