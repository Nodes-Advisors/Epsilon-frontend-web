import clsx, { ClassValue } from 'clsx'
import { useAuth0 } from '@auth0/auth0-react'
import { useUserStore } from '../store/store'

export function cx(...args: ClassValue[]) {
  return clsx(...args)
}



export function Logout() {
  const { logout } = useAuth0()
  const lastSlashIndex = window.location.href.lastIndexOf('/')
  const returnString = window.location.origin.substring(0, lastSlashIndex) + '/home'
  const setUser = useUserStore(state => state.setUser)
  setUser(undefined)
  return (
    <button onClick={() => logout({ logoutParams: { returnTo: returnString } })}>
      Log Out
    </button>
  )
}

