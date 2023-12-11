import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '@auth0/auth0-react'

type TUser = User & { status: 'busy' | 'online' | 'offline' }

type UserState = {
  user: TUser | undefined
  setUser: (user: TUser | undefined) => void
  getUser: () => TUser | undefined
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: undefined,
        setUser: (user) => set({ user }),
        getUser: () => get().user,
      }),
      {
        name: 'userStore',
      },
    ),
  ),
)