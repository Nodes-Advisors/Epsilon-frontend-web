import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { FieldSet, Record } from 'airtable'

type TUser = { 
  status: 'busy' | 'online' | 'offline' | 'not-login'
  email: string
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
  // inSavedFunds: (fund: Fund) => boolean
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

type TokenState = {
  token: string | undefined
  setToken: (token: string | undefined) => void
}

export const useTokenStore = create<TokenState>()(
  devtools(
    persist(
      (set) => ({
        token: undefined,
        setToken: (token) => set({ token }),
      }),
      {
        name: 'tokenStore',
      },
    ),
  ),
)

type TClient = {
  [key: string]: string | number | boolean
}

type ClientsState = {
  clients: Client[],
  setClients: (clients: TClient[]) => void
  getClients: () => TClient[]
}

export const useClientsStore = create<ClientsState>()(
  devtools(
    persist(
      (set, get) => ({
        clients: [],
        setClients: (clients) => set({ clients }),
        getClients: () => get().clients,
      }),
      {
        name: 'clientsStore',
      },
    ),
  ),
)
