import type Peer from 'peerjs'
import type { DataConnection, PeerOptions } from 'peerjs'

export enum P2PEventType {
  MOVE,
  RESET,
}

export interface P2PMessage {
  type: P2PEventType
  payload?: any
}

export type MessageHandler = (msg: P2PMessage) => void
export type ConnectionHandler = () => void

export interface P2PNetworkOptions {
  onMessage: MessageHandler
  onConnect: ConnectionHandler
  onDisconnect: ConnectionHandler
}

export class P2PNetwork {
  private peer: Peer | null = null
  private connection: DataConnection | null = null
  private readonly onMessage: MessageHandler
  private readonly onConnect: ConnectionHandler
  private readonly onDisconnect: ConnectionHandler

  public myId: string = ''

  constructor({ onMessage, onConnect, onDisconnect }: P2PNetworkOptions) {
    this.onMessage = onMessage
    this.onConnect = onConnect
    this.onDisconnect = onDisconnect
  }

  async init(id?: string): Promise<string> {
    const { default: Peer } = await import('peerjs')

    return new Promise((resolve, reject) => {
      this.peer = id ? new Peer(id) : new Peer()

      this.peer.on('open', id => {
        this.myId = id
        resolve(id)
      })

      this.peer.on('connection', conn => {
        this.handleConnection(conn)
      })

      this.peer.on('error', err => {
        reject(err)
      })
    })
  }

  connect(peerId: string) {
    if (!this.peer) {
      return
    }

    const conn = this.peer.connect(peerId)
    this.handleConnection(conn)
  }

  private handleConnection(conn: DataConnection) {
    if (this.connection) {
      this.connection.close()
    }

    this.connection = conn

    this.connection.on('open', () => {
      this.onConnect()
    })

    this.connection.on('data', (data: any) => {
      this.onMessage(data as P2PMessage)
    })

    this.connection.on('close', () => {
      this.connection = null
      this.onDisconnect()
    })

    this.connection.on('error', err => {
      this.connection = null
      this.onDisconnect()
    })
  }

  send(type: P2PEventType, payload?: any) {
    this.connection?.send({ type, payload })
  }

  destroy() {
    this.connection?.close()
    this.peer?.destroy()
    this.peer = null
    this.connection = null
  }
}
