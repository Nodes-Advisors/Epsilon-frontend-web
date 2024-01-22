import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '@auth0/auth0-react'
import { FieldSet, Record } from 'airtable'

type TUser = User & { 
  status: 'busy' | 'online' | 'offline' | 'not-login'
  position?: string
  company?: string
  website?: string
  location?: string
  stage?: string
  raised?: string
  lead?: string
  interested_investors?: string[]
  historical_logs?: string[]
}

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

type SavedFundsState = {
  savedFunds: Fund[],
  addSavedFund: (fund: Fund) => void
  deleteSavedFund: (fund: Fund) => void
  inSavedFunds: (fund: Fund) => boolean
}

export const useSavedFundsStore = create<SavedFundsState>()(
  devtools(
    persist(
      (set) => ({
        savedFunds: [],
        addSavedFund: (fund) => set((state) => {
          if (!state.savedFunds.some((f) => f._id === fund._id)) {
            return { savedFunds: [...state.savedFunds, fund] }
          }
          return state
        }),
        deleteSavedFund: (fund) => set((state) => ({ savedFunds: state.savedFunds.filter((f) => f._id !== fund._id) })),
      }),
      {
        name: 'savedFundsStore',
      },
    ),
  ),
)
