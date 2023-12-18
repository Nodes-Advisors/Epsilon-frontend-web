import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '@auth0/auth0-react'
import { FieldSet, Record } from 'airtable'

type TUser = User & { status: 'busy' | 'online' | 'offline' | 'not-login' }

type UserState = {
  user: TUser | undefined
  setUser: (user: TUser | undefined) => void
  // getUser: () => TUser | undefined
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: undefined,
        setUser: (user) => set({ user }),
        // getUser: () => get().user,
      }),
      {
        name: 'userStore',
      },
    ),
  ),
)

type Fund = Record<FieldSet>

type FundsState = {
  funds: Fund[],
  setFunds: (funds: Fund[]) => void
}

export const useFundsStore = create<FundsState>()(
  devtools(
    persist(
      (set, get) => ({
        funds: [],
        setFunds: (funds) => set({ funds }),
        getFunds: () => get().funds,
      }),
      {
        name: 'fundsStore',
      },
    ),
  ),
)