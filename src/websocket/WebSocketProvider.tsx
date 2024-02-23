import { useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import WebSocketContext from './WebsocketContext'
import { useUserStore } from '../store/store'
import { SERVER_ADDRESS } from '../lib/utils'
function WebSocketProvider({ children } : { children: React.ReactNode }) {
  const user = useUserStore(state => state.user)
  const [socketUrl, setSocketUrl] = useState(`ws://${SERVER_ADDRESS}:5001/websocket/${ user?.email ? user?.email: ''}`)
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl)

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState]

  return (
    <WebSocketContext.Provider value={{ sendMessage, lastMessage, connectionStatus, setSocketUrl }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketProvider