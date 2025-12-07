import { ConnectFour, GameStatus, Player } from '@/lib/connnect_four'
import { useState } from 'react'

export function useGame() {
  const [game, setGame] = useState(() => new ConnectFour())
  const [history, setHistory] = useState<Player[]>([])

  function move(col: number) {
    game.move(col)
    setGame(Object.assign(new ConnectFour(), game))
  }

  function reset(clearHistory = false) {
    if (clearHistory) {
      setHistory([])
    } else if (game.status !== GameStatus.IN_PROGRESS) {
      setHistory([...history, game.currentPlayer])
    }

    setGame(new ConnectFour())
  }

  return {
    // props
    status: game.status,
    board: game.board,
    player: game.currentPlayer,
    winMatch: game.winMatch,
    history,
    // methods
    move,
    reset,
  }
}
