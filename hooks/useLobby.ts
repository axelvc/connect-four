import { P2PEventType, P2PMessage, P2PNetwork } from '@/lib/p2p'
import { useEffect, useRef, useState } from 'react'
import { Player } from './useGame'

export enum LobbyStatus {
  IDLE,
  WAITING,
  CONNECTED,
}

interface LobbyOptions {
  onConnect?: () => void
  onMessage?: (msg: P2PMessage) => void
  onDisconnect?: () => void
}

export default function useLobby({ onConnect, onMessage, onDisconnect }: LobbyOptions = {}) {
  const p2p = useRef<P2PNetwork | null>(null)
  const [status, setStatus] = useState<LobbyStatus>(LobbyStatus.IDLE)
  const [myTurn, setMyTurn] = useState<Player | null>(null)
  const [code, setCode] = useState('')

  function initializeP2P(): P2PNetwork {
    if (p2p.current) return p2p.current

    const network = new P2PNetwork({
      onConnect() {
        setStatus(LobbyStatus.CONNECTED)
        onConnect?.()
      },
      onMessage(msg) {
        onMessage?.(msg)
      },
      onDisconnect() {
        reset()
        onDisconnect?.()
      },
    })

    p2p.current = network
    return network
  }

  async function create() {
    const network = initializeP2P()
    const id = await network.init()

    setStatus(LobbyStatus.WAITING)
    setCode(id)
    setMyTurn(Player.PLAYER_1)
  }

  async function join(code: string) {
    const network = initializeP2P()
    const id = await network.init()

    network.connect(code)
    setCode(id)
    setMyTurn(Player.PLAYER_2)
  }

  function send(type: P2PEventType, payload?: any) {
    p2p.current?.send(type, payload)
  }

  function reset() {
    setStatus(LobbyStatus.IDLE)
    setMyTurn(null)
    setCode('')
    p2p.current = null
  }

  function disconnect() {
    p2p.current?.destroy()
    reset()
  }

  useEffect(() => disconnect, [])

  return {
    // props
    code,
    status,
    myTurn,
    // methods
    create,
    join,
    send,
    reset,
    disconnect,
  }
}
