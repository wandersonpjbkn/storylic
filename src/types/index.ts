import { SocketEvents } from '@/constants/socketEvents'

export type Category =
  | 'actions'
  | 'animals'
  | 'emotions'
  | 'nature'
  | 'objects'
  | 'personas'
  | 'places'

export type Card = {
  name: string
  category: Category
}

export type GameState =
  | SocketEvents.STATE_CONFIG
  | SocketEvents.STATE_SETUP
  | SocketEvents.STATE_LOBBY
  | SocketEvents.STATE_ROOMS
  | SocketEvents.STATE_PLAYING
  | SocketEvents.STATE_STORYTELLING
  | SocketEvents.STATE_WAITING
  | SocketEvents.STATE_ENDED

export interface Player {
  id: string
  name: string
}

export interface StoredSession {
  token: string
  gameId: string
  playerName?: string
}

export interface Notification {
  show?: boolean
  title?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  message: string
}

export interface RoomSnapshot {
  id: string
  playerCount: number
  gameState:
    | SocketEvents.STATE_SETUP
    | SocketEvents.STATE_LOBBY
    | SocketEvents.STATE_PLAYING
    | SocketEvents.STATE_WAITING
    | SocketEvents.STATE_ENDED
  players: string[]
}

export type UIcons =
  // used
  | 'alert'
  | 'checkmark'
  | 'error'
  | 'favicon'
  | 'info'
  | 'reload'
  | 'shuffle'
  | 'times'
  // unused
  | 'clock'
  | 'home'
  | 'success'
  | 'users'
