import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Badge } from '@/types'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
  addBadge: (badge: Badge) => void
  addExperience: (xp: number) => void
  completeQuest: (questId: string) => void
  visitPlace: (placeId: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false }),

      addBadge: (badge) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                badges: [...state.user.badges, { ...badge, unlockedAt: new Date() }],
              }
            : null,
        })),

      addExperience: (xp) =>
        set((state) => {
          if (!state.user) return state
          const newXp = state.user.experience + xp
          const newLevel = Math.floor(newXp / 1000) + 1
          return {
            user: {
              ...state.user,
              experience: newXp,
              level: newLevel,
            },
          }
        }),

      completeQuest: (questId) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                completedQuests: [...state.user.completedQuests, questId],
              }
            : null,
        })),

      visitPlace: (placeId) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                visitedPlaces: [...state.user.visitedPlaces, placeId],
              }
            : null,
        })),
    }),
    {
      name: 'user-storage',
    }
  )
)
